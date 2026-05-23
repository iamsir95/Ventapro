import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

const prisma = new PrismaClient();

// Connect to Redis (assuming a local instance or Docker container)
// Fallback to memory cache if Redis is not available for local dev
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null // Disable retries if it fails to connect to avoid hanging
});

redis.on("error", (err) => {
  // Catch Redis connection errors to prevent unhandled exceptions crashing the server
  console.warn("Redis connection warning:", err.message);
});

// A simple memory cache fallback if Redis isn't running
const memoryCache = new Map<string, { data: any, expiresAt: number }>();

async function getFromCache(key: string) {
  try {
    if (redis.status === "ready" || redis.status === "connecting") {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch (err) {
    console.warn("Redis not available, using fallback memory cache");
  }
  
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  return null;
}

async function setCache(key: string, data: any, ttlSeconds: number) {
  try {
    if (redis.status === "ready" || redis.status === "connecting") {
      await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
      return;
    }
  } catch (err) {
    // Ignore error
  }
  
  memoryCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export class ProductService {
  /**
   * Search Products using Full-Text Search and Redis Caching
   */
  static async searchProducts(query: string, page: number = 1, limit: number = 10) {
    const cacheKey = `products:search:${query.toLowerCase()}:${page}:${limit}`;
    
    // 1. Check Cache
    const cachedResult = await getFromCache(cacheKey);
    if (cachedResult) {
      console.log(`Cache HIT for query: ${query}`);
      return cachedResult;
    }

    console.log(`Cache MISS for query: ${query}, querying Database...`);
    const skip = (page - 1) * limit;

    // 2. Query Database (Advanced Filtering Example)
    // LƯU Ý TRÊN MÔI TRƯỜNG POSTGRESQL (Dành cho Senior Backend Engineer):
    // Thay vì dùng String.contains như SQLite, ta sẽ sử dụng cú pháp Full-text search thực thụ:
    // { name: { search: query } } hoặc query trên JSONB:
    // { specs: { path: ['switch'], string_contains: query } }
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { brand: { contains: query } },
        ]
      },
      include: {
        category: true,
        variants: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    const mappedProducts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      brand: p.brand,
      price: parseFloat(p.basePrice?.toString() || "0"),
      category: p.category?.name || 'General',
      isNew: p.isNew,
      isHot: p.isHot,
      discountPct: p.discountPct,
      image: "https://picsum.photos/seed/" + p.id + "/400/400",
      specs: p.specs ? JSON.parse(p.specs) : {}
    }));

    const total = await prisma.product.count({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { brand: { contains: query } },
        ]
      }
    });

    const result = {
      data: mappedProducts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    // 3. Set Cache
    await setCache(cacheKey, result, 300); // Cache for 5 minutes

    return result;
  }

  /**
   * Create Product with Dynamic Fields (EAV / JSON Specs)
   */
  static async createProduct(data: any) {
    // Expected dynamic fields are serialized into the `specs` string (for SQLite compatibility instead of JSONB)
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        brand: data.brand,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        isNew: data.isNew || false,
        isHot: data.isHot || false,
        discountPct: data.discountPct || 0,
        specs: JSON.stringify(data.specs || {}), // Dynamic Fields saved as stringified JSON
        variants: {
          create: data.variants?.map((v: any) => ({
            sku: v.sku,
            name: v.name,
            priceObj: v.priceObj,
            stock: v.stock,
            attributes: JSON.stringify(v.attributes || {})
          })) || []
        }
      },
      include: {
        variants: true
      }
    });

    await ProductService.invalidateCaches();
    return newProduct;
  }

  /**
   * List all products with pagination (admin)
   */
  static async listProducts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: { category: true, variants: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count()
    ]);

    return {
      data: products.map(ProductService.mapProduct),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true }
    });
    if (!product) return null;
    return ProductService.mapProduct(product);
  }

  static async updateProduct(id: string, data: any) {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.isNew !== undefined && { isNew: data.isNew }),
        ...(data.isHot !== undefined && { isHot: data.isHot }),
        ...(data.discountPct !== undefined && { discountPct: data.discountPct }),
        ...(data.specs !== undefined && { specs: JSON.stringify(data.specs) }),
      },
      include: { category: true, variants: true }
    });

    await ProductService.invalidateCaches();
    return ProductService.mapProduct(updated);
  }

  static async deleteProduct(id: string) {
    // Cascade-delete variants first since the relation lacks onDelete: Cascade
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    await ProductService.invalidateCaches();
    return { success: true };
  }

  private static mapProduct(p: any) {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      brand: p.brand,
      basePrice: parseFloat(p.basePrice?.toString() || "0"),
      price: parseFloat(p.basePrice?.toString() || "0"),
      categoryId: p.categoryId,
      category: p.category?.name || 'General',
      isNew: p.isNew,
      isHot: p.isHot,
      discountPct: p.discountPct,
      image: "https://picsum.photos/seed/" + p.id + "/600/600",
      specs: p.specs ? JSON.parse(p.specs) : {},
      variants: (p.variants || []).map((v: any) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        priceObj: v.priceObj ? parseFloat(v.priceObj.toString()) : null,
        stock: v.stock,
        attributes: v.attributes ? JSON.parse(v.attributes) : {}
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
  }

  private static async invalidateCaches() {
    memoryCache.clear();
    try {
      if (redis.status === "ready") {
        const keys = await redis.keys("products:search:*");
        if (keys.length > 0) await redis.del(...keys);
      }
    } catch {}
  }
}

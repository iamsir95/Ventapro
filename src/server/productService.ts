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

    // Invalidate search caches
    memoryCache.clear();
    try {
      if (redis.status === "ready") {
        const keys = await redis.keys("products:search:*");
        if (keys.length > 0) await redis.del(...keys);
      }
    } catch {}

    return newProduct;
  }
}

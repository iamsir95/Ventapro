import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AnalyticsService {
  static async getDashboard() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      totalUsers,
      totalOrders,
      completedOrders,
      recentOrders,
      lowStockVariants
    ] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: 'COMPLETED' },
        select: { totalAmount: true, createdAt: true }
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true }
      }),
      prisma.productVariant.findMany({
        where: { stock: { lt: 10 } },
        include: { product: true },
        orderBy: { stock: 'asc' },
        take: 10
      })
    ]);

    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount.toString()),
      0
    );

    // Revenue per day for last 7 days
    const revenueByDay: { date: string; revenue: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const dayOrders = completedOrders.filter(
        (o) => o.createdAt >= dayStart && o.createdAt < dayEnd
      );
      revenueByDay.push({
        date: dayStart.toISOString().slice(5, 10),
        revenue: dayOrders.reduce(
          (s, o) => s + parseFloat(o.totalAmount.toString()),
          0
        ),
        count: dayOrders.length
      });
    }

    // Top selling products by quantity in last 7 days
    const recentItems = await prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: sevenDaysAgo } } },
      include: { variant: { include: { product: true } } }
    });
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const item of recentItems) {
      const pid = item.variant.productId;
      const existing = productSales.get(pid) || {
        name: item.variant.product.name,
        quantity: 0,
        revenue: 0
      };
      existing.quantity += item.quantity;
      existing.revenue += item.quantity * parseFloat(item.price.toString());
      productSales.set(pid, existing);
    }
    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      summary: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        completedOrderCount: completedOrders.length
      },
      revenueByDay,
      topProducts,
      lowStock: lowStockVariants.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        stock: v.stock,
        productName: v.product.name
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        userId: o.userId,
        totalAmount: parseFloat(o.totalAmount.toString()),
        status: o.status,
        itemCount: o.items.length,
        createdAt: o.createdAt
      }))
    };
  }
}

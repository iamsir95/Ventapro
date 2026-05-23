import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
  static async listUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Aggregate order stats per user
    const userIds = users.map((u) => u.id);
    const orderStats = userIds.length
      ? await prisma.order.groupBy({
          by: ['userId'],
          where: { userId: { in: userIds } },
          _count: { _all: true },
          _sum: { totalAmount: true }
        })
      : [];

    const statsMap = new Map(
      orderStats.map((s) => [
        s.userId,
        {
          orderCount: s._count._all,
          totalSpent: parseFloat(s._sum.totalAmount?.toString() || "0")
        }
      ])
    );

    return {
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt,
        orderCount: statsMap.get(u.id)?.orderCount || 0,
        totalSpent: statsMap.get(u.id)?.totalSpent || 0,
        isAdmin: u.email === 'admin@pro-gaming.com'
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const orders = await prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      orders: orders.map((o) => ({
        id: o.id,
        totalAmount: parseFloat(o.totalAmount.toString()),
        status: o.status,
        createdAt: o.createdAt
      }))
    };
  }
}

import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { staffAuthMiddleware } from "../middleware/auth.js";

export const statsRouter = Router();

const paidStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.ASSEMBLED,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
];

statsRouter.get("/", async (_req, res) => {
  const [productCount, orderCount, reviewCount] = await Promise.all([
    prisma.product.count({ where: { inStock: true } }),
    prisma.order.count({
      where: {
        status: {
          in: [
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.ASSEMBLED,
            OrderStatus.DELIVERING,
            OrderStatus.COMPLETED,
          ],
        },
      },
    }),
    prisma.review.count({ where: { isPublished: true } }),
  ]);

  res.json({
    survivalRate: 98,
    yearsExperience: 15,
    treesPlanted: productCount * 120 + 5000,
    happyCustomers: Math.max(orderCount * 3, reviewCount * 10, 500),
  });
});

statsRouter.get("/dashboard", staffAuthMiddleware, async (_req, res) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(startOfDay);
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);

  const [todayAgg, weekAgg, monthAgg, orderCounts, topProducts, salePoints] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: paidStatuses }, updatedAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { status: { in: paidStatuses }, updatedAt: { gte: startOfWeek } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { status: { in: paidStatuses }, updatedAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.salePoint.findMany({
        where: { isActive: true },
        include: { products: true },
      }),
    ]);

  const countByStatus = Object.fromEntries(
    orderCounts.map((row) => [row.status, row._count._all])
  );

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  res.json({
    revenue: {
      today: Number(todayAgg._sum.totalAmount ?? 0),
      week: Number(weekAgg._sum.totalAmount ?? 0),
      month: Number(monthAgg._sum.totalAmount ?? 0),
    },
    orders: {
      new: countByStatus.PENDING ?? 0,
      paid: countByStatus.PAID ?? 0,
      processing: countByStatus.PROCESSING ?? 0,
      assembled: countByStatus.ASSEMBLED ?? 0,
      delivering: countByStatus.DELIVERING ?? 0,
    },
    topProducts: topProducts.map((row) => {
      const product = productMap.get(row.productId);
      const sold = row._sum.quantity ?? 0;
      const price = product ? Number(product.price) : 0;
      return {
        name: product?.name ?? "Неизвестный товар",
        sold,
        revenue: sold * price,
      };
    }),
    stockByPoint: salePoints.map((point) => ({
      salePointId: point.id,
      shortName: point.shortName,
      totalItems: point.products.reduce(
        (sum, p) => sum + (p.quantity - p.reserved),
        0
      ),
      totalValue: point.products.reduce(
        (sum, p) => sum + (p.quantity - p.reserved) * Number(p.price),
        0
      ),
    })),
  });
});

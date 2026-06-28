import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../db/prisma.js";
import { tochkaService } from "../services/tochka.js";
import { notifyNewOrder } from "../services/telegram.js";
import { notifyNewOrderMax } from "../services/max.js";
import { paramId } from "../utils/params.js";
import {
  adminAuthMiddleware,
  AuthRequest,
  getUserId,
  optionalUserAuthMiddleware,
  userAuthMiddleware,
} from "../middleware/auth.js";
import { getImagePublicUrl } from "../services/minio.js";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Корзина пуста"),
});

ordersRouter.post("/", optionalUserAuthMiddleware, async (req: AuthRequest, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalAmount = 0;
  const orderItems: { productId: string; quantity: number; price: number }[] =
    [];

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(400).json({ error: `Товар ${item.productId} не найден` });
      return;
    }
    if (!product.inStock || product.quantity < item.quantity) {
      res
        .status(400)
        .json({ error: `Товар «${product.name}» недоступен в нужном количестве` });
      return;
    }

    const price = Number(product.price);
    totalAmount += price * item.quantity;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price,
    });
  }

  const paymentLinkId = uuidv4();
  const userId = req.auth?.role === "user" ? req.auth.userId : null;

  const order = await prisma.order.create({
    data: {
      totalAmount,
      paymentLinkId,
      userId,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  try {
    const payment = await tochkaService.createPaymentLink({
      amount: totalAmount,
      purpose: `Оплата заказа ${order.id}`,
      paymentLinkId,
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentLink: payment.paymentLink,
        tochkaOperationId: payment.operationId,
      },
    });

    const notifyItems = order.items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
    }));

    await Promise.all([
      notifyNewOrder(order.id, totalAmount, notifyItems),
      notifyNewOrderMax(order.id, totalAmount, notifyItems),
    ]);

    res.status(201).json({
      orderId: updated.id,
      totalAmount,
      paymentLink: updated.paymentLink,
      status: updated.status,
    });
  } catch (error) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });

    const message =
      error instanceof Error ? error.message : "Ошибка создания платежа";
    res.status(502).json({ error: message });
  }
});

const statusLabels: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  FAILED: "Ошибка",
  CANCELLED: "Отменён",
};

ordersRouter.get("/my", userAuthMiddleware, async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      statusLabel: statusLabels[order.status],
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        productName: item.product.name,
        subtotal: Number(item.price) * item.quantity,
      })),
    }))
  );
});

ordersRouter.get("/history", adminAuthMiddleware, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      statusLabel: statusLabels[order.status],
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        productName: item.product.name,
        subtotal: Number(item.price) * item.quantity,
      })),
    }))
  );
});

ordersRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: true } } } },
    },
  });

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  res.json({
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      product: {
        ...item.product,
        price: Number(item.product.price),
        images: item.product.images
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((img) => ({ ...img, url: getImagePublicUrl(img.key) })),
      },
    })),
  });
});

ordersRouter.get("/:id/status", async (req, res) => {
  const id = paramId(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  res.json({ status: order.status });
});

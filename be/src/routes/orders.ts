import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { DeliveryType, OrderStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { tochkaService } from "../services/tochka.js";
import { notifyNewOrder } from "../services/telegram.js";
import { notifyNewOrderMax } from "../services/max.js";
import {
  cancelOrder,
  getCartReservedUntil,
  getPaymentExpiresAt,
  releaseOrderReservation,
  reserveProducts,
} from "../services/reservation.js";
import { paramId } from "../utils/params.js";
import {
  adminAuthMiddleware,
  AuthRequest,
  getUserId,
  optionalUserAuthMiddleware,
  staffAuthMiddleware,
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
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  salePointId: z.string().uuid().optional(),
  deliveryAddress: z.string().optional(),
  deliveryZoneId: z.string().uuid().optional(),
});

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  PROCESSING: "В обработке",
  ASSEMBLED: "Собран",
  DELIVERING: "Доставляется",
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
  FAILED: "Ошибка",
};

function serializeOrderListItem(order: {
  id: string;
  status: OrderStatus;
  totalAmount: { toString(): string };
  deliveryType: DeliveryType | null;
  deliveryCost: { toString(): string } | null;
  deliveryAddress: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  cancelReason: string | null;
  managerNote: string | null;
  paymentLink: string | null;
  cartReservedUntil: Date | null;
  paymentExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  salePoint: { id: string; shortName: string } | null;
  items: {
    id: string;
    quantity: number;
    price: { toString(): string };
    product: { name: string };
  }[];
}) {
  return {
    id: order.id,
    status: order.status,
    statusLabel: statusLabels[order.status],
    totalAmount: Number(order.totalAmount),
    deliveryType: order.deliveryType,
    deliveryCost: order.deliveryCost ? Number(order.deliveryCost) : null,
    deliveryAddress: order.deliveryAddress,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    salePoint: order.salePoint,
    cancelReason: order.cancelReason,
    managerNote: order.managerNote,
    paymentLink: order.paymentLink,
    cartReservedUntil: order.cartReservedUntil,
    paymentExpiresAt: order.paymentExpiresAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      productName: item.product.name,
      subtotal: Number(item.price) * item.quantity,
    })),
  };
}

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

  let itemsTotal = 0;
  const orderItems: { productId: string; quantity: number; price: number }[] =
    [];

  for (const item of parsed.data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(400).json({ error: `Товар ${item.productId} не найден` });
      return;
    }

    const available = product.quantity - product.reserved;
    if (!product.inStock || available < item.quantity) {
      res.status(400).json({
        error: `Товар «${product.name}» недоступен в нужном количестве`,
      });
      return;
    }

    const price = Number(product.price);
    itemsTotal += price * item.quantity;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price,
    });
  }

  let deliveryCost = 0;
  if (parsed.data.deliveryZoneId) {
    const zone = await prisma.deliveryZone.findUnique({
      where: { id: parsed.data.deliveryZoneId },
    });
    if (!zone) {
      res.status(400).json({ error: "Зона доставки не найдена" });
      return;
    }
    deliveryCost = Number(zone.basePrice);
  }

  if (parsed.data.deliveryType === DeliveryType.SELF_PICKUP && parsed.data.salePointId) {
    const point = await prisma.salePoint.findUnique({
      where: { id: parsed.data.salePointId },
    });
    if (!point) {
      res.status(400).json({ error: "Точка продаж не найдена" });
      return;
    }
  }

  const totalAmount = itemsTotal + deliveryCost;
  const paymentLinkId = uuidv4();
  const userId =
    req.auth && "userId" in req.auth ? req.auth.userId : null;
  const cartReservedUntil = getCartReservedUntil();
  const paymentExpiresAt = getPaymentExpiresAt();

  try {
    await reserveProducts(
      orderItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка резервирования";
    res.status(400).json({ error: message });
    return;
  }

  const order = await prisma.order.create({
    data: {
      totalAmount,
      paymentLinkId,
      userId,
      customerName: parsed.data.customerName ?? null,
      customerPhone: parsed.data.customerPhone ?? null,
      customerEmail: parsed.data.customerEmail ?? null,
      deliveryType: parsed.data.deliveryType ?? null,
      salePointId: parsed.data.salePointId ?? null,
      deliveryAddress: parsed.data.deliveryAddress ?? null,
      deliveryZoneId: parsed.data.deliveryZoneId ?? null,
      deliveryCost: deliveryCost > 0 ? deliveryCost : null,
      cartReservedUntil,
      paymentExpiresAt,
      items: { create: orderItems },
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
      deliveryCost: deliveryCost || null,
      paymentLink: updated.paymentLink,
      status: updated.status,
      cartReservedUntil,
      paymentExpiresAt,
    });
  } catch (error) {
    await releaseOrderReservation(order.id);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.FAILED },
    });

    const message =
      error instanceof Error ? error.message : "Ошибка создания платежа";
    res.status(502).json({ error: message });
  }
});

ordersRouter.get("/my", userAuthMiddleware, async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      salePoint: { select: { id: true, shortName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders.map(serializeOrderListItem));
});

ordersRouter.get("/history", staffAuthMiddleware, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
      salePoint: { select: { id: true, shortName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(orders.map(serializeOrderListItem));
});

ordersRouter.patch("/:id/status", staffAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = z
    .object({
      status: z.nativeEnum(OrderStatus),
      managerNote: z.string().optional(),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status: parsed.data.status,
      managerNote: parsed.data.managerNote ?? existing.managerNote,
    },
    include: {
      items: { include: { product: true } },
      salePoint: { select: { id: true, shortName: true } },
    },
  });

  res.json(serializeOrderListItem(order));
});

ordersRouter.post("/:id/cancel", staffAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = z.object({ reason: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  await cancelOrder(id, parsed.data.reason);
  const order = await prisma.order.findUniqueOrThrow({
    where: { id },
    include: {
      items: { include: { product: true } },
      salePoint: { select: { id: true, shortName: true } },
    },
  });

  res.json(serializeOrderListItem(order));
});

ordersRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { include: { images: true } } } },
      salePoint: { select: { id: true, shortName: true } },
    },
  });

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  res.json({
    ...serializeOrderListItem(order),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      productName: item.product.name,
      subtotal: Number(item.price) * item.quantity,
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
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  if (order.status === OrderStatus.PAID) {
    res.json({ status: order.status });
    return;
  }

  res.json({
    status: order.status,
    paymentExpiresAt: order.paymentExpiresAt,
    cartReservedUntil: order.cartReservedUntil,
  });
});

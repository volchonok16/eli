import { prisma } from "../db/prisma.js";
import { notifyCancellation } from "./telegram.js";
import { notifyCancellationMax } from "./max.js";

const CART_RESERVE_MINUTES = 20;
const PAYMENT_EXPIRE_MINUTES = 30;

export function getCartReservedUntil(): Date {
  return new Date(Date.now() + CART_RESERVE_MINUTES * 60 * 1000);
}

export function getPaymentExpiresAt(): Date {
  return new Date(Date.now() + PAYMENT_EXPIRE_MINUTES * 60 * 1000);
}

export async function reserveProducts(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const updated = await tx.$executeRaw`
        UPDATE "Product"
        SET reserved = reserved + ${item.quantity}
        WHERE id = ${item.productId}::uuid
          AND quantity - reserved >= ${item.quantity}
      `;

      if (updated === 0) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        throw new Error(
          product
            ? `Товар «${product.name}» недоступен в нужном количестве`
            : `Товар ${item.productId} не найден`
        );
      }
    }
  });
}

export async function releaseOrderReservation(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.status === "PAID" || order.status === "COMPLETED") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          reserved: { decrement: item.quantity },
        },
      });
    }
  });
}

export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return;
  if (
    order.status === "PAID" ||
    order.status === "COMPLETED" ||
    order.status === "CANCELLED"
  ) {
    return;
  }

  await releaseOrderReservation(orderId);

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED", cancelReason: reason },
  });

  await Promise.all([
    notifyCancellation(orderId, reason),
    notifyCancellationMax(orderId, reason),
  ]);
}

export async function processExpiredOrders(): Promise<void> {
  const now = new Date();

  const expired = await prisma.order.findMany({
    where: {
      status: "PENDING",
      OR: [
        { paymentExpiresAt: { lt: now } },
        { cartReservedUntil: { lt: now } },
      ],
    },
    select: { id: true },
  });

  for (const order of expired) {
    await cancelOrder(order.id, "Истекло время оплаты");
  }
}

export function startOrderExpiryScheduler(): void {
  void processExpiredOrders();
  setInterval(() => {
    void processExpiredOrders();
  }, 60_000);
}

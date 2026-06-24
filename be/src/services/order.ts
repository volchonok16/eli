import { prisma } from "../db/prisma.js";
import { notifyOrderPaid } from "./telegram.js";
import { notifyOrderPaidMax } from "./max.js";

export async function completeOrderPayment(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.status === "PAID") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });

      if (updated.quantity <= 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: false, quantity: 0 },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });
  });

  const total = Number(order.totalAmount);
  await Promise.all([
    notifyOrderPaid(orderId, total),
    notifyOrderPaidMax(orderId, total),
  ]);
}

export async function completeOrderByPaymentLinkId(
  paymentLinkId: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { paymentLinkId },
  });

  if (!order) return;
  await completeOrderPayment(order.id);
}

export async function completeOrderByTochkaOperationId(
  operationId: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { tochkaOperationId: operationId },
  });

  if (!order) return;
  await completeOrderPayment(order.id);
}

import { DeliveryType, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { isHvoyaTrackedSku } from "./hvoya-stock.js";
import { notifyOrderPaid, notifyCancellation } from "./telegram.js";
import { notifyOrderPaidMax, notifyCancellationMax } from "./max.js";
import { notifyOrderPaidMail, notifyOrderStatusMail } from "./order-mail.js";
import { cancelOrder } from "./reservation.js";
import { TochkaServiceError, tochkaService } from "./tochka.js";

const orderInclude = {
  items: { include: { product: true } },
  salePoint: { select: { id: true, shortName: true } },
} satisfies Prisma.OrderInclude;

type ShopOrder = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

const settledStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.ASSEMBLED,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

const refundableStatuses: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.ASSEMBLED,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PAID]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.ASSEMBLED,
  [OrderStatus.ASSEMBLED]: OrderStatus.DELIVERING,
  [OrderStatus.DELIVERING]: OrderStatus.COMPLETED,
};

export class OrderFlowError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "OrderFlowError";
  }
}

function money(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(value);
}

function deliveryLine(order: {
  deliveryType: DeliveryType | null;
  deliveryAddress: string | null;
  salePoint: { shortName: string } | null;
}): string | null {
  if (order.deliveryType === DeliveryType.SELF_PICKUP) {
    return order.salePoint ? `Самовывоз · ${order.salePoint.shortName}` : "Самовывоз";
  }
  if (order.deliveryAddress) return `Доставка · ${order.deliveryAddress}`;
  return null;
}

function statusLetter(
  order: ShopOrder,
  status: OrderStatus,
  refunded = false
): { subject: string; eyebrow: string; lead: string } | null {
  const place = deliveryLine(order);
  const pickup = order.deliveryType === DeliveryType.SELF_PICKUP;

  if (status === OrderStatus.PROCESSING) {
    return {
      subject: "Заказ в работе — Eli",
      eyebrow: "В работе",
      lead: "Мы взяли заказ в работу и готовим ёлку.",
    };
  }
  if (status === OrderStatus.ASSEMBLED) {
    return {
      subject: "Ёлка собрана — Eli",
      eyebrow: "Собран",
      lead: pickup
        ? "Ёлка собрана. Скоро её можно будет забрать."
        : "Ёлка собрана. Скоро передадим её в доставку.",
    };
  }
  if (status === OrderStatus.DELIVERING) {
    return pickup
      ? {
          subject: "Ёлка готова к выдаче — Eli",
          eyebrow: "Готов к выдаче",
          lead: place
            ? `Ёлка готова. Можно забирать: ${place}.`
            : "Ёлка готова. Можно забирать.",
        }
      : {
          subject: "Ёлка в пути — Eli",
          eyebrow: "В пути",
          lead: order.deliveryAddress
            ? `Ёлка в пути. Привезём по адресу: ${order.deliveryAddress}.`
            : "Ёлка в пути.",
        };
  }
  if (status === OrderStatus.COMPLETED) {
    return pickup
      ? {
          subject: "Заказ выдан — Eli",
          eyebrow: "Выдан",
          lead: "Заказ выдан. Спасибо, что выбрали Eli.",
        }
      : {
          subject: "Заказ доставлен — Eli",
          eyebrow: "Доставлен",
          lead: "Заказ доставлен. Спасибо, что выбрали Eli.",
        };
  }
  if (status === OrderStatus.CANCELLED) {
    return {
      subject: "Заказ отменён — Eli",
      eyebrow: "Отменён",
      lead: refunded
        ? `Заказ отменён. Мы оформили возврат ${money(Number(order.totalAmount))}. На карту деньги обычно приходят за 3–7 дней, по СБП — быстрее. Чек возврата Точка отправит отдельно.`
        : "Заказ отменён. Оплата не проводилась.",
    };
  }
  return null;
}

async function sendStatusLetter(order: ShopOrder, status: OrderStatus, refunded = false): Promise<void> {
  const letter = statusLetter(order, status, refunded);
  if (!letter || !order.customerEmail) return;
  const reason = status === OrderStatus.CANCELLED && order.cancelReason
    ? ` Причина: ${order.cancelReason}.`
    : "";
  await notifyOrderStatusMail({
    to: order.customerEmail,
    customerName: order.customerName,
    orderId: order.id,
    subject: letter.subject,
    eyebrow: letter.eyebrow,
    lead: `${letter.lead}${reason}`,
    createdAt: order.createdAt,
  });
}

export async function completeOrderPayment(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      salePoint: { select: { shortName: true } },
    },
  });

  if (!order || settledStatuses.includes(order.status)) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (isHvoyaTrackedSku(item.product.sku)) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reserved: { decrement: item.quantity } },
        });
        continue;
      }

      const updated = await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });

      if (updated.quantity <= 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: false, quantity: 0, reserved: 0 },
        });
      }
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });
  });

  const total = Number(order.totalAmount);
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const deliveryCost = order.deliveryCost ? Number(order.deliveryCost) : 0;
  const deliveryLabel = deliveryLine(order);

  await Promise.all([
    notifyOrderPaid(orderId, total),
    notifyOrderPaidMax(orderId, total),
    notifyOrderPaidMail({
      to: order.customerEmail ?? "",
      customerName: order.customerName,
      orderId,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      itemsTotal,
      deliveryCost,
      deliveryLabel,
      createdAt: order.createdAt,
    }),
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

export async function advanceOrderStatus(
  orderId: string,
  status: OrderStatus,
  managerNote?: string
): Promise<ShopOrder> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
  if (!order) {
    throw new OrderFlowError("Заказ не найден", 404);
  }
  if (status === OrderStatus.CANCELLED) {
    throw new OrderFlowError("Отмена заказа идёт отдельной кнопкой", 400);
  }

  const expected = nextStatus[order.status];
  if (order.status !== status && status !== expected) {
    throw new OrderFlowError("Такой переход статуса сейчас недоступен", 400);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      managerNote: managerNote ?? order.managerNote,
    },
    include: orderInclude,
  });

  if (updated.status !== order.status) {
    await sendStatusLetter(updated, updated.status);
  }
  return updated;
}

async function restorePaidStock(order: ShopOrder): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.product.sku) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: { increment: item.quantity },
          inStock: true,
        },
      });
    }
  });
}

export async function cancelShopOrder(orderId: string, reason: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
  if (!order) {
    throw new OrderFlowError("Заказ не найден", 404);
  }
  if (order.status === OrderStatus.CANCELLED) return;

  if (order.status === OrderStatus.PENDING || order.status === OrderStatus.FAILED) {
    await cancelOrder(orderId, reason);
    await sendStatusLetter({ ...order, cancelReason: reason }, OrderStatus.CANCELLED);
    return;
  }

  if (!refundableStatuses.includes(order.status)) {
    throw new OrderFlowError("Этот заказ нельзя отменить", 400);
  }
  if (!order.tochkaOperationId) {
    throw new TochkaServiceError(
      "У заказа нет платежа в Точке, вернуть деньги автоматически нельзя",
      409
    );
  }

  const locked = await prisma.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status: OrderStatus.CANCELLED, cancelReason: reason },
  });
  if (locked.count !== 1) {
    throw new OrderFlowError("Статус заказа уже изменился", 409);
  }

  try {
    await tochkaService.refundPayment(order.tochkaOperationId, Number(order.totalAmount));
  } catch (error) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: order.status, cancelReason: order.cancelReason },
    });
    throw error;
  }

  await restorePaidStock(order);
  const cancelled = { ...order, status: OrderStatus.CANCELLED, cancelReason: reason };
  await Promise.all([
    notifyCancellation(orderId, reason, true),
    notifyCancellationMax(orderId, reason, true),
    sendStatusLetter(cancelled, OrderStatus.CANCELLED, true),
  ]);
}

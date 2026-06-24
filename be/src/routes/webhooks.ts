import { Router } from "express";
import {
  completeOrderByPaymentLinkId,
  completeOrderByTochkaOperationId,
} from "../services/order.js";
import { tochkaService } from "../services/tochka.js";
import { prisma } from "../db/prisma.js";
import { paramId } from "../utils/params.js";

export const webhooksRouter = Router();

interface TochkaWebhookPayload {
  webhookType?: string;
  paymentLinkId?: string;
  operationId?: string;
  status?: string;
  Data?: {
    paymentLinkId?: string;
    operationId?: string;
    status?: string;
  };
}

webhooksRouter.post("/tochka", async (req, res) => {
  const payload = req.body as TochkaWebhookPayload;
  const paymentLinkId =
    payload.paymentLinkId ?? payload.Data?.paymentLinkId;
  const operationId = payload.operationId ?? payload.Data?.operationId;
  const status = (payload.status ?? payload.Data?.status ?? "").toLowerCase();

  const isPaid =
    status === "approved" ||
    status === "completed" ||
    status === "success" ||
    payload.webhookType === "acquiringInternetPayment";

  if (!isPaid) {
    res.json({ received: true });
    return;
  }

  try {
    if (paymentLinkId) {
      await completeOrderByPaymentLinkId(paymentLinkId);
    } else if (operationId) {
      await completeOrderByTochkaOperationId(operationId);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Tochka webhook error:", error);
    res.status(500).json({ error: "Ошибка обработки вебхука" });
  }
});

webhooksRouter.post("/tochka/confirm/:orderId", async (req, res) => {
  const orderId = paramId(req.params.orderId);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    res.status(404).json({ error: "Заказ не найден" });
    return;
  }

  if (order.status === "PAID") {
    res.json({ status: "PAID" });
    return;
  }

  if (!order.tochkaOperationId) {
    res.status(400).json({ error: "У заказа нет операции оплаты" });
    return;
  }

  try {
    const status = await tochkaService.getPaymentStatus(
      order.tochkaOperationId
    );

    if (
      status.toLowerCase() === "approved" ||
      status.toLowerCase() === "completed"
    ) {
      if (order.paymentLinkId) {
        await completeOrderByPaymentLinkId(order.paymentLinkId);
      } else {
        await completeOrderByTochkaOperationId(order.tochkaOperationId);
      }
      res.json({ status: "PAID" });
      return;
    }

    res.json({ status: order.status, tochkaStatus: status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка проверки оплаты";
    res.status(502).json({ error: message });
  }
});

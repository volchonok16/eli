import { config } from "../config.js";

/**
 * Интеграция с мессенджером MAX (VK Teams / MAX Bot API).
 * Токен и chat_id задаются в общем .env.
 */
export async function sendMaxMessage(text: string): Promise<void> {
  if (!config.max.botToken || !config.max.chatId) {
    return;
  }

  const response = await fetch("https://botapi.max.ru/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: config.max.botToken,
    },
    body: JSON.stringify({
      chat_id: config.max.chatId,
      text,
    }),
  });

  if (!response.ok) {
    console.error("MAX messenger send failed:", await response.text());
  }
}

export async function notifyNewOrderMax(
  orderId: string,
  totalAmount: number,
  items: { name: string; quantity: number }[]
): Promise<void> {
  const lines = items.map((i) => `• ${i.name} × ${i.quantity}`).join("\n");
  const text =
    `Новый заказ\n` +
    `ID: ${orderId}\n` +
    `Сумма: ${totalAmount.toFixed(2)} ₽\n\n` +
    lines;

  await sendMaxMessage(text);
}

export async function notifyOrderPaidMax(
  orderId: string,
  totalAmount: number
): Promise<void> {
  const text = `Заказ оплачен\nID: ${orderId}\nСумма: ${totalAmount.toFixed(2)} ₽`;
  await sendMaxMessage(text);
}

export async function notifyNewFeedbackMax(feedback: {
  id: string;
  name: string;
  contact: string;
  message: string;
}): Promise<void> {
  const text =
    `Новое обращение\n` +
    `ID: ${feedback.id}\n` +
    `Имя: ${feedback.name}\n` +
    `Контакт: ${feedback.contact}\n\n` +
    feedback.message;

  await sendMaxMessage(text);
}

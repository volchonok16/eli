import { config } from "../config.js";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramMessage(text: string): Promise<void> {
  if (!config.telegram.botToken || !config.telegram.chatId) {
    return;
  }

  const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: config.telegram.chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    console.error("Telegram send failed:", await response.text());
  }
}

export async function notifyNewOrder(
  orderId: string,
  totalAmount: number,
  items: { name: string; quantity: number }[]
): Promise<void> {
  const lines = items.map((i) => `• ${i.name} × ${i.quantity}`).join("\n");
  const text =
    `<b>Новый заказ</b>\n` +
    `ID: <code>${orderId}</code>\n` +
    `Сумма: ${totalAmount.toFixed(2)} ₽\n\n` +
    lines;

  await sendTelegramMessage(text);
}

export async function notifyOrderPaid(
  orderId: string,
  totalAmount: number
): Promise<void> {
  const text =
    `<b>Заказ оплачен</b>\n` +
    `ID: <code>${orderId}</code>\n` +
    `Сумма: ${totalAmount.toFixed(2)} ₽`;

  await sendTelegramMessage(text);
}

export async function notifyNewFeedback(feedback: {
  id: string;
  name: string;
  contact: string;
  message: string;
}): Promise<void> {
  const text =
    `<b>Новое обращение</b>\n` +
    `ID: <code>${feedback.id}</code>\n` +
    `Имя: ${escapeHtml(feedback.name)}\n` +
    `Контакт: ${escapeHtml(feedback.contact)}\n\n` +
    escapeHtml(feedback.message);

  await sendTelegramMessage(text);
}

export async function notifyCancellation(
  orderId: string,
  reason: string
): Promise<void> {
  const text =
    `<b>Заказ отменён</b>\n` +
    `ID: <code>${orderId}</code>\n` +
    `Причина: ${escapeHtml(reason)}`;

  await sendTelegramMessage(text);
}

export async function notifyCpRequest(request: {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
}): Promise<void> {
  const text =
    `<b>Запрос КП</b>\n` +
    `ID: <code>${request.id}</code>\n` +
    `Компания: ${escapeHtml(request.companyName)}\n` +
    `Контакт: ${escapeHtml(request.contactName)}\n` +
    `Телефон: ${escapeHtml(request.phone)}`;

  await sendTelegramMessage(text);
}

export async function notifyPartnerApplication(app: {
  id: string;
  contactName: string;
  phone: string;
  landAddress: string;
}): Promise<void> {
  const text =
    `<b>Заявка партнёра</b>\n` +
    `ID: <code>${app.id}</code>\n` +
    `Контакт: ${escapeHtml(app.contactName)}\n` +
    `Телефон: ${escapeHtml(app.phone)}\n` +
    `Адрес: ${escapeHtml(app.landAddress)}`;

  await sendTelegramMessage(text);
}

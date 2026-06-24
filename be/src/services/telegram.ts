import { config } from "../config.js";

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

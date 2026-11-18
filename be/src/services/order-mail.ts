import nodemailer from "nodemailer";
import { config } from "../config.js";

export interface OrderMailItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderFormedMail {
  to: string;
  customerName?: string | null;
  orderId: string;
  items: OrderMailItem[];
  itemsTotal: number;
  deliveryCost: number;
  deliveryLabel?: string | null;
  paymentLink?: string | null;
  createdAt?: Date;
  paid?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(value);
}

function orderNumber(orderId: string): string {
  return orderId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(date);
}

function renderOrderFormedEmail(mail: OrderFormedMail): { html: string; text: string } {
  const number = orderNumber(mail.orderId);
  const name = mail.customerName?.trim();
  const greeting = name ? `Здравствуйте, ${name}` : "Здравствуйте";
  const date = formatDate(mail.createdAt ?? new Date());
  const total = mail.itemsTotal + mail.deliveryCost;
  const shopUrl = config.feUrl.replace(/\/$/, "");

  const itemRows = mail.items
    .map((item) => {
      const subtotal = item.price * item.quantity;
      return `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #E7E5E4;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1C1917;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:14px 12px;border-bottom:1px solid #E7E5E4;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#78716C;text-align:right;white-space:nowrap;">
            ${item.quantity} × ${formatMoney(item.price)}
          </td>
          <td style="padding:14px 0 14px 12px;border-bottom:1px solid #E7E5E4;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1C1917;text-align:right;white-space:nowrap;">
            ${formatMoney(subtotal)}
          </td>
        </tr>`;
    })
    .join("");

  const deliveryRow = mail.deliveryCost
    ? `
        <tr>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#78716C;">Доставка</td>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1C1917;text-align:right;">${formatMoney(mail.deliveryCost)}</td>
        </tr>`
    : "";

  const deliveryNote = mail.deliveryLabel
    ? `<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#44403C;">${escapeHtml(mail.deliveryLabel)}</p>`
    : "";

  const payButton = mail.paymentLink
    ? `
      <tr>
        <td style="padding:8px 40px 36px;">
          <a href="${escapeHtml(mail.paymentLink)}" style="display:inline-block;background:#CA8A04;color:#FAFAF9;font-family:Arial,Helvetica,sans-serif;font-size:14px;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:16px 32px;">Перейти к оплате</a>
          <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#78716C;">Ссылка на оплату действует ограниченное время. Ёлки держим для вас, пока она не истечёт.</p>
        </td>
      </tr>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Ваш заказ сформирован</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F4;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#FAFAF9;">
          <tr>
            <td style="background:#1C1917;padding:36px 40px 28px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:36px;line-height:1;color:#FAFAF9;">Eli</p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CA8A04;">Живые новогодние ёлки</p>
            </td>
          </tr>
          <tr>
            <td style="background:#CA8A04;height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 40px 8px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CA8A04;">${mail.paid ? "Оплата получена" : "Заказ сформирован"}</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:32px;line-height:1.15;color:#1C1917;">${escapeHtml(greeting)}</h1>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#44403C;">${mail.paid ? "Оплата прошла. Сохраните номер заказа: по нему мы подготовим ёлку. Кассовый чек Точка отправит отдельным письмом." : "Мы приняли заказ и собрали его состав. Оплатите его, и мы начнём подготовку к выдаче или доставке."}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#78716C;">Номер</td>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#78716C;text-align:right;">Дата</td>
                </tr>
                <tr>
                  <td style="padding-top:6px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#1C1917;">№ ${number}</td>
                  <td style="padding-top:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#44403C;text-align:right;">${escapeHtml(date)}</td>
                </tr>
              </table>
              ${deliveryNote}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${itemRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 40px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${deliveryRow}
                <tr>
                  <td style="padding-top:12px;border-top:1px solid #1C1917;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#1C1917;">Итого</td>
                  <td style="padding-top:12px;border-top:1px solid #1C1917;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:#1C1917;text-align:right;">${formatMoney(total)}</td>
                </tr>
              </table>
            </td>
          </tr>
          ${payButton}
          <tr>
            <td style="background:#1C1917;padding:28px 40px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;color:#FAFAF9;">Eli</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#A8A29E;">
                <a href="${escapeHtml(shopUrl)}" style="color:#EAB308;text-decoration:none;">премиумель.рф</a><br>
                ${mail.paid ? "Письмо отправлено, потому что заказ оплачен." : "Письмо отправлено, потому что вы оформили заказ на сайте."}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    "Eli — живые новогодние ёлки",
    "",
    `${greeting}.`,
    mail.paid ? "Заказ оплачен." : "Ваш заказ сформирован.",
    `Номер: ${number}`,
    `Дата: ${date}`,
    mail.deliveryLabel ?? "",
    "",
    ...mail.items.map(
      (item) =>
        `${item.name} — ${item.quantity} × ${formatMoney(item.price)} = ${formatMoney(item.price * item.quantity)}`
    ),
    mail.deliveryCost ? `Доставка: ${formatMoney(mail.deliveryCost)}` : "",
    `Итого: ${formatMoney(total)}`,
    mail.paymentLink ? `Оплатить: ${mail.paymentLink}` : "",
    "",
    shopUrl,
  ].filter((line) => line !== "");

  return { html, text: textLines.join("\n") };
}

export interface OrderStatusMail {
  to: string;
  customerName?: string | null;
  orderId: string;
  subject: string;
  eyebrow: string;
  lead: string;
  createdAt?: Date;
}

function renderOrderStatusEmail(mail: OrderStatusMail): { html: string; text: string } {
  const number = orderNumber(mail.orderId);
  const name = mail.customerName?.trim();
  const greeting = name ? `Здравствуйте, ${name}` : "Здравствуйте";
  const date = formatDate(mail.createdAt ?? new Date());
  const shopUrl = config.feUrl.replace(/\/$/, "");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(mail.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F4;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#FAFAF9;">
          <tr>
            <td style="background:#1C1917;padding:36px 40px 28px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:36px;line-height:1;color:#FAFAF9;">Eli</p>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CA8A04;">Живые новогодние ёлки</p>
            </td>
          </tr>
          <tr>
            <td style="background:#CA8A04;height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 40px 12px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#CA8A04;">${escapeHtml(mail.eyebrow)}</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:32px;line-height:1.15;color:#1C1917;">${escapeHtml(greeting)}</h1>
              <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#44403C;">${escapeHtml(mail.lead)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 40px 36px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#78716C;">Номер заказа</p>
              <p style="margin:6px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;color:#1C1917;">№ ${number}</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#78716C;">${escapeHtml(date)}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#1C1917;padding:28px 40px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;color:#FAFAF9;">Eli</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#A8A29E;">
                <a href="${escapeHtml(shopUrl)}" style="color:#EAB308;text-decoration:none;">премиумель.рф</a><br>
                Письмо отправлено, потому что статус заказа изменился.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Eli — живые новогодние ёлки",
    "",
    `${greeting}.`,
    mail.lead,
    `Номер заказа: ${number}`,
    `Дата: ${date}`,
    "",
    shopUrl,
  ].join("\n");

  return { html, text };
}

async function sendShopMail(
  orderId: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const smtp = config.hvoyaSmtp;
  if (!to || !smtp.user || !smtp.pass) return;

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });

  try {
    await transporter.sendMail({
      from: `"Eli" <${smtp.user}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Заказ ${orderId}: не удалось отправить письмо (${message})`);
  }
}

export async function notifyOrderFormed(mail: OrderFormedMail): Promise<void> {
  const { html, text } = renderOrderFormedEmail(mail);
  await sendShopMail(
    mail.orderId,
    mail.to,
    mail.paid ? "Заказ оплачен — Eli" : "Ваш заказ сформирован — Eli",
    html,
    text
  );
}

export async function notifyOrderStatusMail(mail: OrderStatusMail): Promise<void> {
  const { html, text } = renderOrderStatusEmail(mail);
  await sendShopMail(mail.orderId, mail.to, mail.subject, html, text);
}

export function notifyOrderPaidMail(mail: Omit<OrderFormedMail, "paid" | "paymentLink">): Promise<void> {
  return notifyOrderFormed({ ...mail, paid: true });
}

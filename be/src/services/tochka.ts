import { existsSync, readFileSync } from "node:fs";
import https from "node:https";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

interface PaymentItem {
  name: string;
  price: number;
  quantity: number;
}

interface CreatePaymentParams {
  amount: number;
  purpose: string;
  paymentLinkId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  items: PaymentItem[];
  deliveryCost?: number;
  redirectUrl?: string;
  failRedirectUrl?: string;
}

interface PaymentOperationResponse {
  operationId: string;
  paymentLink: string;
}

export class TochkaServiceError extends Error {
  constructor(
    message: string,
    public status: number = 502
  ) {
    super(message);
    this.name = "TochkaServiceError";
  }
}

const certificateNames = [
  "russian-trusted-root-ca.pem",
  "russian-trusted-sub-ca.pem",
];

function certificatePath(name: string): string {
  const candidates = [
    path.resolve(process.cwd(), "certs", name),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../certs", name),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`Не найден сертификат ${name}`);
  }
  return found;
}

const tochkaAgent = new https.Agent({
  keepAlive: true,
  ca: [
    ...tls.rootCertificates,
    ...certificateNames.map((name) => readFileSync(certificatePath(name), "utf8")),
  ],
});

function tochkaRequest(
  url: string,
  init: { method?: string; headers?: Record<string, string>; body?: string }
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<unknown> }> {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: init.method ?? "GET",
        headers: init.headers,
        agent: tochkaAgent,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          const status = response.statusCode ?? 0;
          resolve({
            ok: status >= 200 && status < 300,
            status,
            text: async () => body,
            json: async () => JSON.parse(body) as unknown,
          });
        });
      }
    );
    request.on("error", reject);
    if (init.body) request.write(init.body);
    request.end();
  });
}

function formatNetworkError(error: unknown): string {
  const err = error as Error & { cause?: Error & { code?: string } };
  const cause = err.cause;
  const detail = [cause?.code, cause?.message || err.message]
    .filter(Boolean)
    .join(" ");
  return detail || "сеть недоступна";
}

function parseTochkaError(text: string): string {
  try {
    const json = JSON.parse(text) as {
      message?: string;
      error?: string;
      Errors?: { message?: string; error?: string }[];
      meta?: { response?: { errors?: { message?: string }[] } };
    };
    const nested =
      json.Errors?.[0]?.message ??
      json.Errors?.[0]?.error ??
      json.meta?.response?.errors?.[0]?.message;
    return nested || json.message || json.error || text;
  } catch {
    return text;
  }
}

export class TochkaService {
  private get isConfigured(): boolean {
    return Boolean(config.tochka.accessToken && config.tochka.customerCode);
  }

  async createPaymentLink(
    params: CreatePaymentParams
  ): Promise<PaymentOperationResponse> {
    if (!this.isConfigured) {
      throw new TochkaServiceError(
        "Точка Банк не настроен: укажите TOCHKA_ACCESS_TOKEN и TOCHKA_CUSTOMER_CODE в .env",
        502
      );
    }

    const email = params.customerEmail?.trim();
    if (!email) {
      throw new TochkaServiceError("Укажите email: на него Точка отправит кассовый чек", 400);
    }

    const money = (value: number) => value.toFixed(2);
    const receiptItems = params.items.map((item) => ({
      name: item.name.slice(0, 128),
      amount: money(item.price),
      quantity: item.quantity,
      vatType: config.tochka.vatType,
      paymentMethod: "full_prepayment",
      paymentObject: "goods",
      measure: "шт.",
    }));
    if (params.deliveryCost && params.deliveryCost > 0) {
      receiptItems.push({
        name: "Доставка",
        amount: money(params.deliveryCost),
        quantity: 1,
        vatType: config.tochka.vatType,
        paymentMethod: "full_prepayment",
        paymentObject: "service",
        measure: "шт.",
      });
    }

    const client: Record<string, string> = { email };
    if (params.customerName?.trim()) client.name = params.customerName.trim();
    if (params.customerPhone?.trim()) client.phone = params.customerPhone.trim();

    const payload: Record<string, unknown> = {
      customerCode: config.tochka.customerCode,
      amount: money(params.amount),
      purpose: params.purpose,
      paymentLinkId: params.paymentLinkId,
      paymentMode: config.tochka.paymentModes,
      redirectUrl: params.redirectUrl ?? `${config.feUrl}/payment/success`,
      failRedirectUrl:
        params.failRedirectUrl ?? `${config.feUrl}/payment/fail`,
      taxSystemCode: config.tochka.taxSystemCode,
      Client: client,
      Items: receiptItems,
    };

    if (config.tochka.merchantId) {
      payload.merchantId = config.tochka.merchantId;
    }

    let response: Awaited<ReturnType<typeof tochkaRequest>>;
    try {
      response = await tochkaRequest(
        `${config.tochka.baseUrl}/uapi/acquiring/v1.0/payments_with_receipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.tochka.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ Data: payload }),
        }
      );
    } catch (error) {
      throw new TochkaServiceError(
        `Не удалось связаться с Точка Банк: ${formatNetworkError(error)}`,
        502
      );
    }

    if (!response.ok) {
      const text = await response.text();
      console.warn(`Точка: платёж с чеком отклонён (${response.status}) ${text.slice(0, 500)}`);
      throw new TochkaServiceError(
        `Не удалось создать платёж: ${parseTochkaError(text)}`,
        response.status
      );
    }

    const data = (await response.json()) as {
      Data?: {
        operationId?: string;
        paymentLink?: string;
      };
    };

    const operationId = data.Data?.operationId;
    const paymentLink = data.Data?.paymentLink;

    if (!operationId || !paymentLink) {
      throw new TochkaServiceError("Точка Банк вернул неполный ответ", 502);
    }

    return { operationId, paymentLink };
  }

  async getPaymentStatus(operationId: string): Promise<string> {
    if (!this.isConfigured) {
      throw new TochkaServiceError("Точка Банк не настроен", 502);
    }

    let response: Awaited<ReturnType<typeof tochkaRequest>>;
    try {
      response = await tochkaRequest(
        `${config.tochka.baseUrl}/uapi/acquiring/v1.0/payments/${operationId}`,
        {
          headers: {
            Authorization: `Bearer ${config.tochka.accessToken}`,
            Accept: "application/json",
          },
        }
      );
    } catch (error) {
      throw new TochkaServiceError(
        `Не удалось связаться с Точка Банк: ${formatNetworkError(error)}`,
        502
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new TochkaServiceError(
        `Ошибка получения статуса: ${parseTochkaError(text)}`,
        response.status
      );
    }

    const data = (await response.json()) as {
      Data?: { status?: string };
    };

    return data.Data?.status ?? "unknown";
  }
}

export const tochkaService = new TochkaService();

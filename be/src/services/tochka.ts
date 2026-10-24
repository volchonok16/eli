import { config } from "../config.js";

interface CreatePaymentParams {
  amount: number;
  purpose: string;
  paymentLinkId: string;
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
    return json.message || json.error || nested || text;
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

    const payload: Record<string, unknown> = {
      customerCode: config.tochka.customerCode,
      amount: Number(params.amount.toFixed(2)),
      purpose: params.purpose,
      paymentLinkId: params.paymentLinkId,
      paymentMode: config.tochka.paymentModes,
      redirectUrl: params.redirectUrl ?? `${config.feUrl}/payment/success`,
      failRedirectUrl:
        params.failRedirectUrl ?? `${config.feUrl}/payment/fail`,
    };

    if (config.tochka.merchantId) {
      payload.merchantId = config.tochka.merchantId;
    }

    const response = await fetch(
      `${config.tochka.baseUrl}/uapi/acquiring/v1.0/payments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.tochka.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Data: payload }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
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

    const response = await fetch(
      `${config.tochka.baseUrl}/uapi/acquiring/v1.0/payments/${operationId}`,
      {
        headers: {
          Authorization: `Bearer ${config.tochka.accessToken}`,
        },
      }
    );

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

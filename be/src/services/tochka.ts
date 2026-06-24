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

export class TochkaService {
  private get isConfigured(): boolean {
    return Boolean(config.tochka.accessToken && config.tochka.customerCode);
  }

  async createPaymentLink(
    params: CreatePaymentParams
  ): Promise<PaymentOperationResponse> {
    if (!this.isConfigured) {
      throw new Error(
        "Точка Банк не настроен: укажите TOCHKA_ACCESS_TOKEN и TOCHKA_CUSTOMER_CODE в .env"
      );
    }

    const response = await fetch(
      `${config.tochka.baseUrl}/uapi/acquiring/v1.0/payments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.tochka.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Data: {
            customerCode: config.tochka.customerCode,
            amount: params.amount,
            purpose: params.purpose,
            paymentLinkId: params.paymentLinkId,
            paymentMode: ["card", "sbp"],
            redirectUrl: params.redirectUrl ?? `${config.feUrl}/payment/success`,
            failRedirectUrl:
              params.failRedirectUrl ?? `${config.feUrl}/payment/fail`,
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ошибка Точка Банк: ${response.status} ${text}`);
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
      throw new Error("Точка Банк вернул неполный ответ");
    }

    return { operationId, paymentLink };
  }

  async getPaymentStatus(operationId: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error("Точка Банк не настроен");
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
      throw new Error(`Ошибка получения статуса: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      Data?: { status?: string };
    };

    return data.Data?.status ?? "unknown";
  }
}

export const tochkaService = new TochkaService();

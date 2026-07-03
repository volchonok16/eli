import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as dotenvConfig } from "dotenv";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
dotenvConfig({ path: path.resolve(rootDir, ".env") });

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const config = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: parseInt(optional("PORT", "3000"), 10),
  apiUrl: optional("API_URL", "http://localhost:3000"),
  adminUrl: optional("ADMIN_URL", "http://localhost:5173"),
  feUrl: optional("FE_URL", "http://localhost:5173"),

  databaseUrl: optional(
    "DATABASE_URL",
    "postgresql://eli:eli_secret@localhost:5432/eli_shop"
  ),

  minio: {
    endPoint: optional("MINIO_ENDPOINT", "localhost"),
    port: parseInt(optional("MINIO_PORT", "9000"), 10),
    useSSL: optional("MINIO_USE_SSL", "false") === "true",
    accessKey: optional("MINIO_ROOT_USER", "minioadmin"),
    secretKey: optional("MINIO_ROOT_PASSWORD", "minioadmin"),
    bucket: optional("MINIO_BUCKET", "products"),
  },

  admin: {
    username: optional("ADMIN_USERNAME", "admin"),
    password: optional("ADMIN_PASSWORD", "change_me"),
  },

  jwt: {
    secret: optional("JWT_SECRET", "dev_jwt_secret"),
    expiresIn: "24h",
  },

  tochka: {
    baseUrl: optional("TOCHKA_BASE_URL", "https://enter.tochka.com"),
    accessToken: optional("TOCHKA_ACCESS_TOKEN"),
    customerCode: optional("TOCHKA_CUSTOMER_CODE"),
    webhookSecret: optional("TOCHKA_WEBHOOK_SECRET"),
  },

  telegram: {
    botToken: optional("TELEGRAM_BOT_TOKEN"),
    chatId: optional("TELEGRAM_CHAT_ID"),
  },

  max: {
    botToken: optional("MAX_BOT_TOKEN"),
    chatId: optional("MAX_CHAT_ID"),
  },
};

export function assertProductionSecrets(): void {
  if (config.nodeEnv !== "production") return;
  required("JWT_SECRET");
  required("ADMIN_PASSWORD");
}

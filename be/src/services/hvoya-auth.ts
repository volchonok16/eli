import crypto from "node:crypto";
import { config } from "../config.js";
import { prisma } from "../db/prisma.js";
import { HvoyaMailError, sendHvoyaCode } from "./hvoya-mail.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACCESS_ID = "current";
const MAX_ATTEMPTS = 5;

export class HvoyaAuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function hash(value: string): string {
  return crypto.createHash("sha256").update(`${config.jwt.secret}:${value}`).digest("hex");
}

function sameHash(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function getAccess() {
  return prisma.hvoyaAccess.upsert({
    where: { id: ACCESS_ID },
    update: {},
    create: { id: ACCESS_ID },
  });
}

function codeIsPending(row: { codeHash: string | null; codeSentAt: Date | null }, now: Date) {
  return Boolean(
    row.codeHash && row.codeSentAt && now.getTime() - row.codeSentAt.getTime() < DAY_MS
  );
}

function sessionIsActive(row: { tokenHash: string | null; expiresAt: Date | null }, now: Date) {
  return Boolean(row.tokenHash && row.expiresAt && row.expiresAt > now);
}

export function assertIntegrationKey(header: string | undefined): void {
  const expected = config.hvoyaIntegrationKey;
  if (!expected) {
    throw new HvoyaAuthError("Интеграция Хвои не настроена", 503);
  }
  const got = header ?? "";
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new HvoyaAuthError("Нет доступа", 401);
  }
}

export async function requestHvoyaCode() {
  const now = new Date();
  const row = await getAccess();

  if (sessionIsActive(row, now)) {
    return { status: "authorized" as const, expiresAt: row.expiresAt };
  }

  if (codeIsPending(row, now) && row.codeSentAt) {
    return {
      status: "code_already_sent" as const,
      retryAt: new Date(row.codeSentAt.getTime() + DAY_MS),
    };
  }

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  try {
    await sendHvoyaCode(code);
  } catch (error) {
    if (error instanceof HvoyaMailError) {
      throw new HvoyaAuthError(error.message, 503);
    }
    throw error;
  }

  await prisma.hvoyaAccess.update({
    where: { id: ACCESS_ID },
    data: { codeHash: hash(code), codeSentAt: now, attempts: 0 },
  });

  return {
    status: "code_sent" as const,
    retryAt: new Date(now.getTime() + DAY_MS),
  };
}

export async function confirmHvoyaCode(code: string) {
  const now = new Date();
  const row = await getAccess();

  if (!codeIsPending(row, now) || !row.codeHash) {
    throw new HvoyaAuthError("Код не запрошен или его сутки уже прошли", 400);
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    throw new HvoyaAuthError("Слишком много попыток. Новый код будет доступен через сутки", 429);
  }
  if (!sameHash(hash(code), row.codeHash)) {
    const attempts = row.attempts + 1;
    await prisma.hvoyaAccess.update({
      where: { id: ACCESS_ID },
      data: { attempts },
    });
    throw new HvoyaAuthError("Неверный код", 401);
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + DAY_MS);
  await prisma.hvoyaAccess.update({
    where: { id: ACCESS_ID },
    data: {
      tokenHash: hash(token),
      confirmedAt: now,
      expiresAt,
      attempts: 0,
    },
  });

  return { token, expiresAt };
}

export async function hvoyaAuthStatus() {
  const now = new Date();
  const row = await getAccess();
  return {
    authorized: sessionIsActive(row, now),
    expiresAt: sessionIsActive(row, now) ? row.expiresAt : null,
    codePending: codeIsPending(row, now),
    retryAt: row.codeSentAt ? new Date(row.codeSentAt.getTime() + DAY_MS) : null,
  };
}

export async function assertHvoyaToken(token: string | undefined): Promise<void> {
  token = token?.trim();
  if (!token) {
    throw new HvoyaAuthError("Нужно суточное подтверждение", 401);
  }

  const row = await getAccess();
  const now = new Date();
  if (!sessionIsActive(row, now) || !row.tokenHash || !sameHash(hash(token), row.tokenHash)) {
    throw new HvoyaAuthError("Подтверждение истекло или неверно", 401);
  }
}

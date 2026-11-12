import { Router } from "express";
import { z } from "zod";
import { HvoyaAuthError, assertHvoyaToken, assertIntegrationKey, confirmHvoyaCode, hvoyaAuthStatus, requestHvoyaCode } from "../services/hvoya-auth.js";
import {
  HvoyaSyncError,
  applyAggregateStock,
  applyOperation,
  locationCodes,
  operationTypes,
  readLocationStock,
  replaceLocationStock,
} from "../services/hvoya-sync.js";

export const hvoyaRouter = Router();

const itemSchema = z.object({
  sku: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(0),
  name: z.string().nullable().optional(),
  kind: z.string().nullable().optional(),
  variant: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
});

const locationCodeSchema = z.enum(locationCodes);

function integrationKey(req: { header(name: string): string | undefined }) {
  return req.header("x-hvoya-key") ?? req.header("X-Hvoya-Key");
}

hvoyaRouter.use((req, res, next) => {
  try {
    assertIntegrationKey(integrationKey(req));
    next();
  } catch (error) {
    sendError(res, error);
  }
});

function sessionToken(req: { header(name: string): string | undefined }): string | undefined {
  const direct = req.header("x-hvoya-token")?.trim();
  if (direct) return direct;

  const header = req.header("authorization")?.trim();
  if (!header) return undefined;
  return header.toLowerCase().startsWith("bearer ") ? header.slice("bearer ".length).trim() : header;
}

async function requireSession(req: { header(name: string): string | undefined }, res: { status(code: number): { json(body: unknown): void } }) {
  try {
    await assertHvoyaToken(sessionToken(req));
    return true;
  } catch (error) {
    sendError(res, error);
    return false;
  }
}

function sendError(res: { status(code: number): { json(body: unknown): void } }, error: unknown) {
  if (error instanceof HvoyaAuthError || error instanceof HvoyaSyncError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  throw error;
}

hvoyaRouter.post("/auth/request-code", async (_req, res) => {
  try {
    res.json(await requestHvoyaCode());
  } catch (error) {
    sendError(res, error);
  }
});

hvoyaRouter.post("/auth/confirm", async (req, res) => {
  const parsed = z.object({ code: z.string().regex(/^\d{6}$/, "Нужен шестизначный код") }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Нужен шестизначный код" });
    return;
  }
  try {
    res.json(await confirmHvoyaCode(parsed.data.code));
  } catch (error) {
    sendError(res, error);
  }
});

hvoyaRouter.get("/auth/status", async (_req, res) => {
  res.json(await hvoyaAuthStatus());
});

hvoyaRouter.put("/stock", async (req, res) => {
  if (!(await requireSession(req, res))) return;
  const parsed = z.object({ items: z.array(itemSchema) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.json(await applyAggregateStock(parsed.data.items));
});

hvoyaRouter.get("/locations/stock", async (req, res) => {
  if (!(await requireSession(req, res))) return;
  res.json(await readLocationStock());
});

hvoyaRouter.put("/locations/stock", async (req, res) => {
  if (!(await requireSession(req, res))) return;
  const parsed = z
    .object({
      locations: z
        .array(z.object({ code: locationCodeSchema, items: z.array(itemSchema) }))
        .min(1),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const codes = parsed.data.locations.map((location) => location.code);
  if (new Set(codes).size !== codes.length) {
    res.status(400).json({ error: "Точка указана дважды" });
    return;
  }
  try {
    res.json(await replaceLocationStock(parsed.data.locations));
  } catch (error) {
    sendError(res, error);
  }
});

hvoyaRouter.post("/operations", async (req, res) => {
  if (!(await requireSession(req, res))) return;
  const parsed = z
    .object({
      id: z.string().trim().min(1).max(120),
      type: z.enum(operationTypes),
      channel: z.enum(["offline", "online"]).nullable().optional(),
      payment: z.enum(["cash", "cashless"]).nullable().optional(),
      locationCode: locationCodeSchema.nullable().optional(),
      sourceLocationCode: locationCodeSchema.nullable().optional(),
      targetLocationCode: locationCodeSchema.nullable().optional(),
      previousLocationCode: locationCodeSchema.nullable().optional(),
      items: z.array(itemSchema).default([]),
      previousItems: z.array(itemSchema).optional(),
      occurredAt: z.string().nullable().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    res.json(await applyOperation(parsed.data));
  } catch (error) {
    sendError(res, error);
  }
});

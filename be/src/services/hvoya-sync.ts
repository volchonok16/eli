import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { bindHvoyaCatalog } from "./hvoya-catalog.js";
import { rememberHvoyaSkus } from "./hvoya-stock.js";

export const locationCodes = ["lapino", "vnukovo", "riga", "rogozino"] as const;
export type LocationCode = (typeof locationCodes)[number];

const locationNames: Record<LocationCode, string> = {
  lapino: "Лапино",
  vnukovo: "Внуково",
  riga: "Рига",
  rogozino: "Рогозино",
};

export const operationTypes = [
  "supply",
  "sale",
  "sale_cancel",
  "sale_correction",
  "transfer",
  "transfer_cancel",
  "adjustment",
] as const;

export type OperationType = (typeof operationTypes)[number];

export type StockItemInput = {
  sku: string;
  quantity: number;
  name?: string | null;
  kind?: string | null;
  variant?: string | null;
  grade?: string | null;
  unit?: string | null;
};

export type OperationInput = {
  id: string;
  type: OperationType;
  channel?: "offline" | "online" | null;
  payment?: "cash" | "cashless" | null;
  locationCode?: LocationCode | null;
  sourceLocationCode?: LocationCode | null;
  targetLocationCode?: LocationCode | null;
  previousLocationCode?: LocationCode | null;
  items: StockItemInput[];
  previousItems?: StockItemInput[];
  occurredAt?: string | null;
};

type Tx = Prisma.TransactionClient;

export class HvoyaSyncError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function normalizeKind(kind?: string | null): string | null {
  if (!kind) return null;
  const value = kind.trim().toLowerCase();
  if (value === "tree" || value === "ёлка" || value === "елка" || value === "ель") return "tree";
  if (value === "bough" || value === "branch" || value === "lapnik" || value === "лапник") {
    return "bough";
  }
  if (value === "stand" || value === "подставка") return "stand";
  return value;
}

function isTree(kind: string | null): boolean {
  return kind == null || kind === "tree";
}

async function ensurePoint(tx: Tx, code: LocationCode) {
  const name = locationNames[code];
  const byCode = await tx.salePoint.findUnique({ where: { code } });
  if (byCode) return byCode;

  const byName = await tx.salePoint.findFirst({
    where: { shortName: { equals: name, mode: "insensitive" } },
  });
  if (byName) {
    return tx.salePoint.update({ where: { id: byName.id }, data: { code } });
  }

  return tx.salePoint.create({
    data: { code, shortName: name, address: name, isActive: true, quantity: 0 },
  });
}

async function refreshPointQuantity(tx: Tx, salePointId: string) {
  const rows = await tx.salePointStock.findMany({
    where: { salePointId },
    select: { kind: true, quantity: true },
  });
  const quantity = rows.reduce(
    (sum, row) => (isTree(row.kind) ? sum + row.quantity : sum),
    0
  );
  await tx.salePoint.update({ where: { id: salePointId }, data: { quantity } });
  return quantity;
}

async function syncProducts(tx: Tx, skus: string[]) {
  const unique = [...new Set(skus.filter(Boolean))];
  const unmatched: string[] = [];

  for (const sku of unique) {
    const sum = await tx.salePointStock.aggregate({
      where: { sku },
      _sum: { quantity: true },
    });
    const quantity = sum._sum.quantity ?? 0;
    const product = await tx.product.findUnique({ where: { sku } });
    if (!product) {
      unmatched.push(sku);
      continue;
    }
    await tx.product.update({
      where: { id: product.id },
      data: { quantity, inStock: quantity > 0 },
    });
  }

  rememberHvoyaSkus(unique);
  return unmatched;
}

async function upsertItem(tx: Tx, salePointId: string, item: StockItemInput) {
  const kind = normalizeKind(item.kind);
  await tx.salePointStock.upsert({
    where: { salePointId_sku: { salePointId, sku: item.sku } },
    create: {
      salePointId,
      sku: item.sku,
      quantity: item.quantity,
      kind,
      name: item.name ?? null,
      variant: item.variant ?? null,
      grade: item.grade ?? null,
      unit: item.unit ?? null,
    },
    update: {
      quantity: item.quantity,
      kind,
      name: item.name ?? null,
      variant: item.variant ?? null,
      grade: item.grade ?? null,
      unit: item.unit ?? null,
    },
  });
}

async function addDelta(tx: Tx, code: LocationCode, items: StockItemInput[], sign: 1 | -1) {
  const point = await ensurePoint(tx, code);
  for (const item of items) {
    const existing = await tx.salePointStock.findUnique({
      where: { salePointId_sku: { salePointId: point.id, sku: item.sku } },
    });
    const next = Math.max(0, (existing?.quantity ?? 0) + sign * item.quantity);
    const kind = normalizeKind(item.kind) ?? existing?.kind ?? null;
    await tx.salePointStock.upsert({
      where: { salePointId_sku: { salePointId: point.id, sku: item.sku } },
      create: {
        salePointId: point.id,
        sku: item.sku,
        quantity: Math.max(0, sign * item.quantity),
        kind,
        name: item.name ?? null,
        variant: item.variant ?? null,
        grade: item.grade ?? null,
        unit: item.unit ?? null,
      },
      update: {
        quantity: next,
        kind,
        name: item.name ?? existing?.name ?? null,
        variant: item.variant ?? existing?.variant ?? null,
        grade: item.grade ?? existing?.grade ?? null,
        unit: item.unit ?? existing?.unit ?? null,
      },
    });
  }
  const quantity = await refreshPointQuantity(tx, point.id);
  return { code, shortName: point.shortName, quantity };
}

function saleLocation(input: OperationInput): LocationCode | null {
  if (input.channel === "online") return input.sourceLocationCode ?? null;
  return input.locationCode ?? input.sourceLocationCode ?? null;
}

function validateOperation(input: OperationInput): string | null {
  if (input.items.length === 0 && input.type !== "sale_correction") {
    return "Нужна хотя бы одна позиция";
  }
  if ((input.type === "supply" || input.type === "adjustment") && !input.locationCode) {
    return "Укажите точку";
  }
  if ((input.type === "sale" || input.type === "sale_cancel" || input.type === "sale_correction") && !saleLocation(input)) {
    return "Укажите точку, с которой списывается товар";
  }
  if (input.type === "sale_correction" && !input.previousItems?.length) {
    return "Для исправления нужен предыдущий состав чека";
  }
  if (input.type === "transfer" || input.type === "transfer_cancel") {
    if (!input.sourceLocationCode || !input.targetLocationCode) return "Укажите обе точки";
    if (input.sourceLocationCode === input.targetLocationCode) {
      return "Точки перемещения должны различаться";
    }
  }
  return null;
}

export async function applyAggregateStock(items: StockItemInput[]) {
  await bindHvoyaCatalog();
  const unmatched: { sku: string; name: string | null }[] = [];
  let updated = 0;

  for (const item of items) {
    const quantity = Math.max(0, item.quantity);
    const product = await prisma.product.findUnique({ where: { sku: item.sku } });
    if (!product) {
      unmatched.push({ sku: item.sku, name: item.name ?? null });
      continue;
    }
    if (product.quantity !== quantity || product.inStock !== quantity > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { quantity, inStock: quantity > 0 },
      });
      updated += 1;
    }
  }

  rememberHvoyaSkus(items.map((item) => item.sku));
  return { updated, unmatched };
}

export async function replaceLocationStock(
  locations: { code: LocationCode; items: StockItemInput[] }[]
) {
  await bindHvoyaCatalog();
  return prisma.$transaction(async (tx) => {
    const result: { code: LocationCode; shortName: string; quantity: number; items: number }[] = [];
    const skus: string[] = [];

    for (const location of locations) {
      const point = await ensurePoint(tx, location.code);
      const previous = await tx.salePointStock.findMany({
        where: { salePointId: point.id },
        select: { sku: true },
      });
      skus.push(...previous.map((row) => row.sku));

      const keep = location.items.map((item) => item.sku);
      await tx.salePointStock.deleteMany({
        where: {
          salePointId: point.id,
          ...(keep.length > 0 ? { sku: { notIn: keep } } : {}),
        },
      });

      for (const item of location.items) {
        await upsertItem(tx, point.id, item);
        skus.push(item.sku);
      }

      const quantity = await refreshPointQuantity(tx, point.id);
      result.push({
        code: location.code,
        shortName: locationNames[location.code],
        quantity,
        items: location.items.length,
      });
    }

    const unmatchedSkus = await syncProducts(tx, skus);
    return { locations: result, unmatchedSkus };
  });
}

export async function readLocationStock() {
  const points = await prisma.salePoint.findMany({
    where: { code: { in: [...locationCodes] } },
    include: { stocks: { orderBy: { sku: "asc" } } },
    orderBy: { shortName: "asc" },
  });

  return {
    locations: points.map((point) => ({
      code: point.code,
      shortName: point.shortName,
      quantity: point.quantity,
      items: point.stocks.map((row) => ({
        sku: row.sku,
        quantity: row.quantity,
        kind: row.kind,
        name: row.name,
        variant: row.variant,
        grade: row.grade,
        unit: row.unit,
      })),
    })),
  };
}

export async function applyOperation(input: OperationInput) {
  const validationError = validateOperation(input);
  if (validationError) throw new HvoyaSyncError(validationError, 400);
  await bindHvoyaCatalog();

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.hvoyaOperation.create({
        data: {
          id: input.id,
          type: input.type,
          payload: input as unknown as Prisma.InputJsonValue,
        },
      });

      const locations: { code: LocationCode; shortName: string; quantity: number }[] = [];
      const skus = [
        ...input.items.map((item) => item.sku),
        ...(input.previousItems ?? []).map((item) => item.sku),
      ];

      if (input.type === "supply") {
        locations.push(await addDelta(tx, input.locationCode as LocationCode, input.items, 1));
      } else if (input.type === "sale") {
        locations.push(await addDelta(tx, saleLocation(input) as LocationCode, input.items, -1));
      } else if (input.type === "sale_cancel") {
        locations.push(await addDelta(tx, saleLocation(input) as LocationCode, input.items, 1));
      } else if (input.type === "sale_correction") {
        const previousLocation = (input.previousLocationCode ?? saleLocation(input)) as LocationCode;
        locations.push(await addDelta(tx, previousLocation, input.previousItems ?? [], 1));
        locations.push(await addDelta(tx, saleLocation(input) as LocationCode, input.items, -1));
      } else if (input.type === "transfer") {
        locations.push(await addDelta(tx, input.sourceLocationCode as LocationCode, input.items, -1));
        locations.push(await addDelta(tx, input.targetLocationCode as LocationCode, input.items, 1));
      } else if (input.type === "transfer_cancel") {
        locations.push(await addDelta(tx, input.targetLocationCode as LocationCode, input.items, -1));
        locations.push(await addDelta(tx, input.sourceLocationCode as LocationCode, input.items, 1));
      } else {
        const point = await ensurePoint(tx, input.locationCode as LocationCode);
        for (const item of input.items) await upsertItem(tx, point.id, item);
        const quantity = await refreshPointQuantity(tx, point.id);
        locations.push({
          code: input.locationCode as LocationCode,
          shortName: locationNames[input.locationCode as LocationCode],
          quantity,
        });
      }

      const unmatchedSkus = await syncProducts(tx, skus);
      return {
        id: input.id,
        type: input.type,
        idempotent: false,
        locations,
        unmatchedSkus,
      };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { id: input.id, type: input.type, idempotent: true, locations: [], unmatchedSkus: [] };
    }
    throw error;
  }
}

import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db/prisma.js";
import { bindHvoyaCatalog } from "./hvoya-catalog.js";

const stockItemSchema = z.object({
  sku: z.string().min(1),
  quantity: z.number().int(),
  available: z.boolean(),
});

const stockResponseSchema = z.object({
  refreshAfterSeconds: z.number().positive().optional(),
  items: z.array(stockItemSchema),
});

const trackedSkus = new Set<string>();
let announced = false;
let syncing = false;
let timer: ReturnType<typeof setTimeout> | null = null;

export function isHvoyaTrackedSku(sku: string | null | undefined): boolean {
  return Boolean(sku && trackedSkus.has(sku));
}

export function rememberHvoyaSkus(skus: Iterable<string>): void {
  for (const sku of skus) {
    if (sku) trackedSkus.add(sku);
  }
}

function nextDelayMs(refreshAfterSeconds?: number): number {
  const seconds = refreshAfterSeconds ?? 30;
  return Math.min(300, Math.max(15, seconds)) * 1000;
}

async function applyStock(): Promise<number> {
  const response = await fetch(config.hvoyaStockUrl, {
    signal: AbortSignal.timeout(8000),
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const parsed = stockResponseSchema.parse(await response.json());
  const bySku = new Map<string, { quantity: number; available: boolean }>();

  for (const item of parsed.items) {
    bySku.set(item.sku, {
      quantity: Math.max(0, item.quantity),
      available: item.available,
    });
  }

  trackedSkus.clear();
  for (const sku of bySku.keys()) trackedSkus.add(sku);

  await bindHvoyaCatalog();

  const skus = [...bySku.keys()];
  const locationSums = await prisma.salePointStock.groupBy({
    by: ["sku"],
    where: { sku: { in: skus } },
    _sum: { quantity: true },
  });
  const quantityBySku = new Map(
    locationSums.map((row) => [row.sku, row._sum.quantity ?? 0])
  );

  const products = await prisma.product.findMany({
    where: { sku: { in: skus } },
    select: { id: true, sku: true, quantity: true, inStock: true },
  });

  let updated = 0;
  for (const product of products) {
    if (!product.sku) continue;
    const item = bySku.get(product.sku);
    if (!item) continue;

    const quantity = quantityBySku.has(product.sku)
      ? quantityBySku.get(product.sku) ?? 0
      : item.quantity;
    const inStock = quantity > 0;
    if (product.quantity === quantity && product.inStock === inStock) continue;

    await prisma.product.update({
      where: { id: product.id },
      data: { quantity, inStock },
    });
    updated += 1;
  }

  if (updated > 0 || !announced) {
    const sample = [...bySku.keys()].slice(0, 3).join(", ");
    console.log(
      `Остатки Хвои: совпало ${products.length} из ${bySku.size} артикулов, обновлено ${updated}` +
        (products.length === 0 ? `. В каталоге нет SKU бота (например ${sample})` : "")
    );
    announced = true;
  }

  return nextDelayMs(parsed.refreshAfterSeconds);
}

async function tick(): Promise<void> {
  if (syncing) return;
  syncing = true;
  let delay = nextDelayMs();
  try {
    delay = await applyStock();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Остатки Хвои: не удалось обновить (${message})`);
  } finally {
    syncing = false;
    timer = setTimeout(() => {
      void tick();
    }, delay);
  }
}

export function startHvoyaStockSync(): void {
  if (!config.hvoyaStockUrl || timer) return;
  void tick();
}

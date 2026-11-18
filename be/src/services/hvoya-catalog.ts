import { prisma } from "../db/prisma.js";

type Binding = {
  sku: string;
  names: string[];
  create?: {
    name: string;
    heightLabel?: string;
    sort: string;
    categorySlug: string;
    priceFromName: string;
    description?: string;
  };
};

const bindings: Binding[] = [
  { sku: "nordman:0", names: ["Пихта Нордмана Премиум 100-125 см"] },
  { sku: "nordman:1", names: ["Пихта Нордмана Премиум 125-150 см"] },
  { sku: "nordman:2", names: ["Пихта Нордмана Премиум 150-175 см"] },
  { sku: "nordman:3", names: ["Пихта Нордмана Премиум 175-200 см"] },
  { sku: "nordman:4", names: ["Пихта Нордмана Стандарт 200-225 см"] },
  { sku: "nordman:5", names: ["Пихта Нордмана Премиум 200-225 см"] },
  { sku: "nordman:6", names: ["Пихта Нордмана Премиум 225-250 см"] },
  { sku: "nordman:7", names: ["Пихта Нордмана Премиум 250-275 см"] },
  {
    sku: "fraser:0",
    names: ["Пихта Фразера Премиум 250-275 см", "Пихта Фразера 250-275 см"],
    create: {
      name: "Пихта Фразера Премиум 250-275 см",
      heightLabel: "250-275",
      sort: "Пихта Фразера",
      categorySlug: "pihta-fraizera",
      priceFromName: "Пихта Фразера Премиум 225-250 см",
    },
  },
  {
    sku: "russian:0",
    names: ["Русская ёлка", "Русская ёлка 150-250 см", "Русская ель 150-250 см"],
    create: {
      name: "Русская ёлка 150-250 см",
      heightLabel: "150-250",
      sort: "Русская ель",
      categorySlug: "russkaya-el",
      priceFromName: "Русская ель 200-250 см",
    },
  },
  { sku: "mini:0", names: ["Мини Елка", "Мини-ёлка", "Мини ёлка"] },
  {
    sku: "nobilis:0",
    names: ["Лапник Нобилис"],
    create: {
      name: "Лапник Нобилис",
      sort: "Лапник Нобилис",
      categorySlug: "lapniki-i-mini-elki",
      priceFromName: "Лапник хвойный",
      description: "Банч 5 кг",
    },
  },
  {
    sku: "altai:0",
    names: ["Лапник Алтай"],
    create: {
      name: "Лапник Алтай",
      sort: "Лапник Алтай",
      categorySlug: "lapniki-i-mini-elki",
      priceFromName: "Лапник хвойный",
    },
  },
  { sku: "stand:0", names: ["Подставка для елок от 150 см", "Подставка для ёлок от 150 см"] },
];

function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[–—−]/g, "-")
    .replace(/см\.?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

let linking = false;

export async function bindHvoyaCatalog(): Promise<void> {
  if (linking) return;
  linking = true;
  try {
    const products = await prisma.product.findMany({
      select: { id: true, sku: true, name: true, price: true },
    });
    const bySku = new Map(products.filter((item) => item.sku).map((item) => [item.sku as string, item]));
    const byName = new Map(products.map((item) => [norm(item.name), item]));
    const assigned: string[] = [];
    const created: string[] = [];
    const missing: string[] = [];

    for (const binding of bindings) {
      if (bySku.has(binding.sku)) continue;

      const match = binding.names
        .map((name) => byName.get(norm(name)))
        .find((item) => item && item.sku !== binding.sku);

      if (match) {
        await prisma.product.update({
          where: { id: match.id },
          data: { sku: binding.sku },
        });
        bySku.set(binding.sku, { ...match, sku: binding.sku });
        assigned.push(binding.sku);
        continue;
      }

      const spec = binding.create;
      if (!spec) {
        missing.push(binding.sku);
        continue;
      }

      const category = await prisma.category.findFirst({
        where: { slug: spec.categorySlug },
        select: { id: true },
      });
      const sibling = byName.get(norm(spec.priceFromName));
      if (!category || !sibling) {
        missing.push(binding.sku);
        continue;
      }

      const product = await prisma.product.create({
        data: {
          sku: binding.sku,
          name: spec.name,
          description: spec.description ?? null,
          heightLabel: spec.heightLabel ?? null,
          sort: spec.sort,
          price: sibling.price,
          quantity: 0,
          inStock: false,
          categoryId: category.id,
        },
        select: { id: true, sku: true, name: true, price: true },
      });
      bySku.set(binding.sku, product);
      byName.set(norm(spec.name), product);
      created.push(binding.sku);
    }

    if (assigned.length > 0 || created.length > 0 || missing.length > 0) {
      console.log(
        `Хвоя: артикулы привязаны ${assigned.length}, созданы карточки ${created.length}` +
          (missing.length > 0 ? `, без карточки ${missing.join(", ")}` : "")
      );
    }
  } finally {
    linking = false;
  }
}

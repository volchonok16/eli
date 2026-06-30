import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import { serializeCategory } from "../utils/serializers.js";
import { paramId } from "../utils/params.js";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

async function buildCategoryTree() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { parent: true },
  });

  const byParent = new Map<string | null, typeof categories>();
  for (const cat of categories) {
    const key = cat.parentId;
    const list = byParent.get(key) ?? [];
    list.push(cat);
    byParent.set(key, list);
  }

  function attachChildren(parentId: string | null): ReturnType<typeof serializeCategory>[] {
    return (byParent.get(parentId) ?? []).map((cat) => ({
      ...serializeCategory(cat),
      children: attachChildren(cat.id),
    }));
  }

  return attachChildren(null);
}

categoriesRouter.get("/", async (_req, res) => {
  res.json(await buildCategoryTree());
});

categoriesRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!category) {
    res.status(404).json({ error: "Категория не найдена" });
    return;
  }

  res.json(serializeCategory(category));
});

categoriesRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (parsed.data.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parsed.data.parentId },
    });
    if (!parent) {
      res.status(400).json({ error: "Родительская категория не найдена" });
      return;
    }
  }

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      parentId: parsed.data.parentId ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
    },
    include: { parent: true, children: true },
  });

  res.status(201).json(serializeCategory(category));
});

categoriesRouter.put("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Категория не найдена" });
    return;
  }

  if (parsed.data.parentId === id) {
    res.status(400).json({ error: "Категория не может быть родителем самой себе" });
    return;
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      parentId: parsed.data.parentId ?? null,
      sortOrder: parsed.data.sortOrder ?? existing.sortOrder,
    },
    include: { parent: true, children: true },
  });

  res.json(serializeCategory(category));
});

categoriesRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Категория не найдена" });
    return;
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
});

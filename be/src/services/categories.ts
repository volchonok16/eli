import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { serializeCategory } from "../utils/serializers.js";

export class CategoryServiceError extends Error {
  constructor(
    message: string,
    public status: number = 400
  ) {
    super(message);
    this.name = "CategoryServiceError";
  }
}

export type CategoryPayload = {
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder?: number;
};

const categoryInclude = {
  parent: true,
  children: { orderBy: { sortOrder: "asc" as const } },
};

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function assertParentExists(parentId: string | null | undefined) {
  if (!parentId) return;
  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { id: true },
  });
  if (!parent) {
    throw new CategoryServiceError("Родительская категория не найдена", 400);
  }
}

async function assertSlugAvailable(slug: string, excludeId?: string) {
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing && existing.id !== excludeId) {
    throw new CategoryServiceError("Категория с таким slug уже существует", 400);
  }
}

async function wouldCreateCycle(categoryId: string, parentId: string): Promise<boolean> {
  const links = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });
  const parentById = new Map<string, string | null>(
    links.map((item) => [item.id, item.parentId])
  );

  const seen = new Set<string>();
  let current: string | null = parentId;

  while (current) {
    if (current === categoryId || seen.has(current)) return true;
    seen.add(current);
    current = parentById.get(current) ?? null;
  }

  return false;
}

export async function listCategoryTree() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { parent: true },
  });

  const byParent = new Map<string | null, typeof categories>();
  for (const category of categories) {
    const list = byParent.get(category.parentId) ?? [];
    list.push(category);
    byParent.set(category.parentId, list);
  }

  function attachChildren(parentId: string | null): ReturnType<typeof serializeCategory>[] {
    return (byParent.get(parentId) ?? []).map((category) => ({
      ...serializeCategory(category),
      children: attachChildren(category.id),
    }));
  }

  return attachChildren(null);
}

export async function getCategory(idOrSlug: string) {
  const category = await prisma.category.findUnique({
    where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
    include: categoryInclude,
  });

  if (!category) {
    throw new CategoryServiceError("Категория не найдена", 404);
  }

  return serializeCategory(category);
}

export async function createCategory(data: CategoryPayload) {
  const slug = normalizeSlug(data.slug);
  if (!slug) {
    throw new CategoryServiceError("Slug обязателен", 400);
  }

  await assertParentExists(data.parentId);
  await assertSlugAvailable(slug);

  try {
    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
      include: categoryInclude,
    });
    return serializeCategory(category);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new CategoryServiceError("Категория с таким slug уже существует", 400);
    }
    throw error;
  }
}

export async function updateCategory(id: string, data: CategoryPayload) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new CategoryServiceError("Категория не найдена", 404);
  }

  const slug = normalizeSlug(data.slug);
  if (!slug) {
    throw new CategoryServiceError("Slug обязателен", 400);
  }

  if (data.parentId === id) {
    throw new CategoryServiceError("Категория не может быть родителем самой себе", 400);
  }

  await assertParentExists(data.parentId);
  await assertSlugAvailable(slug, id);

  if (data.parentId && (await wouldCreateCycle(id, data.parentId))) {
    throw new CategoryServiceError("Нельзя назначить потомка родительской категорией", 400);
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name.trim(),
        slug,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? existing.sortOrder,
      },
      include: categoryInclude,
    });
    return serializeCategory(category);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new CategoryServiceError("Категория с таким slug уже существует", 400);
    }
    throw error;
  }
}

export async function deleteCategory(id: string) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new CategoryServiceError("Категория не найдена", 404);
  }

  await prisma.category.delete({ where: { id } });
}

export async function assertCategoryExists(id: string | null | undefined) {
  if (!id) return;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!category) {
    throw new CategoryServiceError("Категория не найдена", 400);
  }
}

export async function resolveCategoryIds(idOrSlug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: isUuid(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug },
    select: { id: true },
  });

  if (!category) return [];

  const all = await prisma.category.findMany({
    select: { id: true, parentId: true },
  });

  const childrenByParent = new Map<string | null, string[]>();
  for (const item of all) {
    const list = childrenByParent.get(item.parentId) ?? [];
    list.push(item.id);
    childrenByParent.set(item.parentId, list);
  }

  const ids = [category.id];
  const stack = [category.id];
  while (stack.length) {
    const current = stack.pop()!;
    for (const childId of childrenByParent.get(current) ?? []) {
      ids.push(childId);
      stack.push(childId);
    }
  }

  return ids;
}

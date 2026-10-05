import { Router } from "express";
import { z } from "zod";
import { adminAuthMiddleware } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";
import {
  CategoryServiceError,
  createCategory,
  deleteCategory,
  getCategory,
  listCategoryTree,
  updateCategory,
} from "../services/categories.js";

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

function handleCategoryError(res: { status: (code: number) => { json: (body: unknown) => void } }, error: unknown) {
  if (error instanceof CategoryServiceError) {
    res.status(error.status).json({ error: error.message });
    return true;
  }
  return false;
}

categoriesRouter.get("/", async (_req, res) => {
  res.json(await listCategoryTree());
});

categoriesRouter.get("/:id", async (req, res) => {
  try {
    res.json(await getCategory(paramId(req.params.id)));
  } catch (error) {
    if (handleCategoryError(res, error)) return;
    throw error;
  }
});

categoriesRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  try {
    const category = await createCategory(parsed.data);
    res.status(201).json(category);
  } catch (error) {
    if (handleCategoryError(res, error)) return;
    throw error;
  }
});

categoriesRouter.put("/:id", adminAuthMiddleware, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  try {
    res.json(await updateCategory(paramId(req.params.id), parsed.data));
  } catch (error) {
    if (handleCategoryError(res, error)) return;
    throw error;
  }
});

categoriesRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  try {
    await deleteCategory(paramId(req.params.id));
    res.status(204).send();
  } catch (error) {
    if (handleCategoryError(res, error)) return;
    throw error;
  }
});

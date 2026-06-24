import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

export const reviewsRouter = Router();

const reviewSchema = z.object({
  authorName: z.string().min(1, "Имя автора обязательно"),
  text: z.string().min(1, "Текст отзыва обязателен"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isPublished: z.coerce.boolean().optional(),
});

reviewsRouter.get("/published", async (_req, res) => {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
});

reviewsRouter.get("/", authMiddleware, async (_req, res) => {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
});

reviewsRouter.get("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    res.status(404).json({ error: "Отзыв не найден" });
    return;
  }
  res.json(review);
});

reviewsRouter.post("/", authMiddleware, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { authorName, text, rating, isPublished } = parsed.data;
  const review = await prisma.review.create({
    data: {
      authorName,
      text,
      rating: rating ?? 5,
      isPublished: isPublished ?? false,
    },
  });
  res.status(201).json(review);
});

reviewsRouter.put("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Отзыв не найден" });
    return;
  }

  const { authorName, text, rating, isPublished } = parsed.data;
  const review = await prisma.review.update({
    where: { id },
    data: {
      authorName,
      text,
      rating: rating ?? 5,
      isPublished: isPublished ?? false,
    },
  });
  res.json(review);
});

reviewsRouter.patch("/:id/publish", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Отзыв не найден" });
    return;
  }

  const review = await prisma.review.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });
  res.json(review);
});

reviewsRouter.delete("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Отзыв не найден" });
    return;
  }
  await prisma.review.delete({ where: { id } });
  res.status(204).send();
});

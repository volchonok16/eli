import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

export const feedbackRouter = Router();

const createFeedbackSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  contact: z.string().min(1, "Контакт обязателен"),
  message: z.string().min(1, "Сообщение обязательно"),
});

const updateFeedbackSchema = z.object({
  isRead: z.boolean().optional(),
});

feedbackRouter.post("/", async (req, res) => {
  const parsed = createFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const feedback = await prisma.feedback.create({ data: parsed.data });
  res.status(201).json(feedback);
});

feedbackRouter.get("/", authMiddleware, async (_req, res) => {
  const items = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
});

feedbackRouter.patch("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = updateFeedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Обращение не найдено" });
    return;
  }

  const feedback = await prisma.feedback.update({
    where: { id },
    data: parsed.data,
  });
  res.json(feedback);
});

feedbackRouter.delete("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Обращение не найдено" });
    return;
  }
  await prisma.feedback.delete({ where: { id } });
  res.status(204).send();
});

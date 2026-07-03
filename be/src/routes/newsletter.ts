import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";

export const newsletterRouter = Router();

const subscribeSchema = z.object({
  email: z.string().email("Некорректный email"),
});

newsletterRouter.post("/subscribe", async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  await prisma.feedback.create({
    data: {
      name: "Подписка на рассылку",
      contact: parsed.data.email,
      message: "Запрос подписки на newsletter",
    },
  });

  res.status(201).json({ ok: true });
});

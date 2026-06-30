import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import {
  adminAuthMiddleware,
  AuthRequest,
  optionalUserAuthMiddleware,
  staffAuthMiddleware,
} from "../middleware/auth.js";
import { notifyCpRequest } from "../services/telegram.js";
import { notifyCpRequestMax } from "../services/max.js";
import { paramId } from "../utils/params.js";

export const cpRequestsRouter = Router();

const createSchema = z.object({
  companyName: z.string().min(1),
  inn: z.string().optional(),
  contactName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  requirements: z.string().optional(),
});

const updateSchema = z.object({
  isProcessed: z.boolean().optional(),
  managerNote: z.string().optional(),
});

cpRequestsRouter.post("/", optionalUserAuthMiddleware, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId =
    req.auth && "userId" in req.auth ? req.auth.userId : null;

  const request = await prisma.cpRequest.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  await Promise.all([
    notifyCpRequest(request),
    notifyCpRequestMax(request),
  ]);

  res.status(201).json(request);
});

cpRequestsRouter.get("/", staffAuthMiddleware, async (_req, res) => {
  const items = await prisma.cpRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
});

cpRequestsRouter.patch("/:id", staffAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.cpRequest.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Запрос не найден" });
    return;
  }

  const updated = await prisma.cpRequest.update({
    where: { id },
    data: parsed.data,
  });

  res.json(updated);
});

cpRequestsRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.cpRequest.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Запрос не найден" });
    return;
  }

  await prisma.cpRequest.delete({ where: { id } });
  res.status(204).send();
});

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

export const applicationsRouter = Router();

const createApplicationSchema = z.object({
  name: z.string().min(1, "Имя обязательно"),
  contact: z.string().min(1, "Контакт обязателен"),
  message: z.string().optional(),
  serviceId: z.string().uuid().optional(),
});

const updateApplicationSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
});

const statusLabels: Record<string, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Выполнена",
  CANCELLED: "Отменена",
};

applicationsRouter.post("/", async (req, res) => {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  if (parsed.data.serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: parsed.data.serviceId },
    });
    if (!service) {
      res.status(400).json({ error: "Услуга не найдена" });
      return;
    }
  }

  const application = await prisma.application.create({
    data: parsed.data,
    include: { service: true },
  });

  res.status(201).json({
    ...application,
    service: application.service
      ? { ...application.service, price: application.service.price ? Number(application.service.price) : null }
      : null,
  });
});

applicationsRouter.get("/", adminAuthMiddleware, async (_req, res) => {
  const items = await prisma.application.findMany({
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(
    items.map((item) => ({
      ...item,
      statusLabel: statusLabels[item.status],
      service: item.service
        ? { ...item.service, price: item.service.price ? Number(item.service.price) : null }
        : null,
    }))
  );
});

applicationsRouter.patch("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = updateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Заявка не найдена" });
    return;
  }

  const application = await prisma.application.update({
    where: { id },
    data: parsed.data,
    include: { service: true },
  });

  res.json({
    ...application,
    statusLabel: statusLabels[application.status],
    service: application.service
      ? { ...application.service, price: application.service.price ? Number(application.service.price) : null }
      : null,
  });
});

applicationsRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Заявка не найдена" });
    return;
  }
  await prisma.application.delete({ where: { id } });
  res.status(204).send();
});

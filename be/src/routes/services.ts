import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

export const servicesRouter = Router();

const serviceSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
});

function serializeService(service: {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string } | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...service,
    price: service.price ? Number(service.price) : null,
  };
}

servicesRouter.get("/", async (_req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(services.map(serializeService));
});

servicesRouter.get("/active", async (_req, res) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  res.json(services.map(serializeService));
});

servicesRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    res.status(404).json({ error: "Услуга не найдена" });
    return;
  }
  res.json(serializeService(service));
});

servicesRouter.post("/", authMiddleware, async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, description, price, isActive } = parsed.data;
  const service = await prisma.service.create({
    data: { name, description, price: price ?? null, isActive: isActive ?? true },
  });
  res.status(201).json(serializeService(service));
});

servicesRouter.put("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Услуга не найдена" });
    return;
  }

  const { name, description, price, isActive } = parsed.data;
  const service = await prisma.service.update({
    where: { id },
    data: { name, description, price: price ?? null, isActive: isActive ?? true },
  });
  res.json(serializeService(service));
});

servicesRouter.delete("/:id", authMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Услуга не найдена" });
    return;
  }
  await prisma.service.delete({ where: { id } });
  res.status(204).send();
});

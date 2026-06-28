import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import { paramId } from "../utils/params.js";
import { pointInPolygon } from "../utils/polygon.js";

export const deliveryZonesRouter = Router();

const zoneSchema = z.object({
  name: z.string().min(1),
  basePrice: z.coerce.number().min(0),
  perKmPrice: z.coerce.number().min(0),
  polygon: z.array(z.tuple([z.number(), z.number()])).min(3),
  isActive: z.coerce.boolean().optional(),
});

function serializeZone(zone: {
  id: string;
  name: string;
  basePrice: { toString(): string };
  perKmPrice: { toString(): string };
  polygon: unknown;
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: zone.id,
    name: zone.name,
    basePrice: Number(zone.basePrice),
    perKmPrice: Number(zone.perKmPrice),
    polygon: zone.polygon as [number, number][],
    isActive: zone.isActive,
    createdAt: zone.createdAt,
  };
}

deliveryZonesRouter.get("/check", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    res.status(400).json({ error: "Укажите lat и lng" });
    return;
  }

  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
  });

  for (const zone of zones) {
    const polygon = zone.polygon as [number, number][];
    if (pointInPolygon(lat, lng, polygon)) {
      res.json({
        zoneId: zone.id,
        zoneName: zone.name,
        deliveryCost: Number(zone.basePrice),
        isDeliverable: true,
      });
      return;
    }
  }

  res.json({ isDeliverable: false });
});

deliveryZonesRouter.get("/", async (_req, res) => {
  const zones = await prisma.deliveryZone.findMany({
    orderBy: { name: "asc" },
  });
  res.json(zones.map(serializeZone));
});

deliveryZonesRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const zone = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!zone) {
    res.status(404).json({ error: "Зона доставки не найдена" });
    return;
  }
  res.json(serializeZone(zone));
});

deliveryZonesRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const zone = await prisma.deliveryZone.create({
    data: {
      name: parsed.data.name,
      basePrice: parsed.data.basePrice,
      perKmPrice: parsed.data.perKmPrice,
      polygon: parsed.data.polygon,
      isActive: parsed.data.isActive ?? true,
    },
  });

  res.status(201).json(serializeZone(zone));
});

deliveryZonesRouter.put("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = zoneSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Зона доставки не найдена" });
    return;
  }

  const zone = await prisma.deliveryZone.update({
    where: { id },
    data: {
      name: parsed.data.name,
      basePrice: parsed.data.basePrice,
      perKmPrice: parsed.data.perKmPrice,
      polygon: parsed.data.polygon,
      isActive: parsed.data.isActive ?? existing.isActive,
    },
  });

  res.json(serializeZone(zone));
});

deliveryZonesRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Зона доставки не найдена" });
    return;
  }

  await prisma.deliveryZone.delete({ where: { id } });
  res.status(204).send();
});

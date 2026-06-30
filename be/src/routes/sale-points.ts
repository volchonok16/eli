import { Router } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import {
  uploadImage,
  deleteImage,
  getImagePublicUrl,
} from "../services/minio.js";
import { paramId } from "../utils/params.js";

export const salePointsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Допустимы только изображения"));
    }
  },
});

const salePointSchema = z.object({
  shortName: z.string().min(1, "Короткое название обязательно"),
  address: z.string().min(1, "Адрес обязателен"),
  lat: z.coerce.number().nullable().optional(),
  lng: z.coerce.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  workingHours: z.record(z.unknown()).nullable().optional(),
  isActive: z.coerce.boolean().optional(),
});

function serializeSalePoint(point: {
  id: string;
  shortName: string;
  address: string;
  lat: { toString(): string } | null;
  lng: { toString(): string } | null;
  phone: string | null;
  description: string | null;
  workingHours: unknown;
  imageKey: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: point.id,
    shortName: point.shortName,
    address: point.address,
    lat: point.lat ? Number(point.lat) : null,
    lng: point.lng ? Number(point.lng) : null,
    phone: point.phone,
    description: point.description,
    workingHours: point.workingHours,
    imageKey: point.imageKey,
    imageUrl: point.imageKey ? getImagePublicUrl(point.imageKey) : null,
    isActive: point.isActive,
    createdAt: point.createdAt,
    updatedAt: point.updatedAt,
  };
}

salePointsRouter.get("/", async (req, res) => {
  const onlyActive = req.query.isActive === "true";
  const points = await prisma.salePoint.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { shortName: "asc" },
  });
  res.json(points.map(serializeSalePoint));
});

salePointsRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const point = await prisma.salePoint.findUnique({ where: { id } });
  if (!point) {
    res.status(404).json({ error: "Точка продаж не найдена" });
    return;
  }
  res.json(serializeSalePoint(point));
});

salePointsRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const parsed = salePointSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const point = await prisma.salePoint.create({
    data: {
      shortName: parsed.data.shortName,
      address: parsed.data.address,
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      phone: parsed.data.phone ?? null,
      description: parsed.data.description ?? null,
      workingHours: (parsed.data.workingHours ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      isActive: parsed.data.isActive ?? true,
    },
  });
  res.status(201).json(serializeSalePoint(point));
});

salePointsRouter.put("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = salePointSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.salePoint.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Точка продаж не найдена" });
    return;
  }

  const point = await prisma.salePoint.update({
    where: { id },
    data: {
      shortName: parsed.data.shortName,
      address: parsed.data.address,
      lat: parsed.data.lat ?? null,
      lng: parsed.data.lng ?? null,
      phone: parsed.data.phone ?? null,
      description: parsed.data.description ?? null,
      workingHours: (parsed.data.workingHours ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
      isActive: parsed.data.isActive ?? existing.isActive,
    },
  });
  res.json(serializeSalePoint(point));
});

salePointsRouter.post(
  "/:id/image",
  adminAuthMiddleware,
  upload.single("image"),
  async (req, res) => {
    const id = paramId(req.params.id);
    const point = await prisma.salePoint.findUnique({ where: { id } });
    if (!point) {
      res.status(404).json({ error: "Точка продаж не найдена" });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "Не передано изображение" });
      return;
    }

    if (point.imageKey) {
      await deleteImage(point.imageKey).catch(() => undefined);
    }

    const { key } = await uploadImage(file, "sale-points");
    const updated = await prisma.salePoint.update({
      where: { id },
      data: { imageKey: key },
    });

    res.json(serializeSalePoint(updated));
  }
);

salePointsRouter.delete("/:id/image", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const point = await prisma.salePoint.findUnique({ where: { id } });
  if (!point) {
    res.status(404).json({ error: "Точка продаж не найдена" });
    return;
  }

  if (point.imageKey) {
    await deleteImage(point.imageKey).catch(() => undefined);
    await prisma.salePoint.update({
      where: { id },
      data: { imageKey: null },
    });
  }

  res.status(204).send();
});

salePointsRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const point = await prisma.salePoint.findUnique({ where: { id } });
  if (!point) {
    res.status(404).json({ error: "Точка продаж не найдена" });
    return;
  }

  if (point.imageKey) {
    await deleteImage(point.imageKey).catch(() => undefined);
  }

  await prisma.salePoint.delete({ where: { id } });
  res.status(204).send();
});

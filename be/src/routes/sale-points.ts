import { Router } from "express";
import multer from "multer";
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
});

function serializeSalePoint(point: {
  id: string;
  shortName: string;
  address: string;
  imageKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...point,
    imageUrl: point.imageKey ? getImagePublicUrl(point.imageKey) : null,
  };
}

salePointsRouter.get("/", async (_req, res) => {
  const points = await prisma.salePoint.findMany({
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

  const point = await prisma.salePoint.create({ data: parsed.data });
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
    data: parsed.data,
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

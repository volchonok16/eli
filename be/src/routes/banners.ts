import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import {
  deleteImage,
  getImagePublicUrl,
  uploadBannerImage,
} from "../services/minio.js";
import { paramId } from "../utils/params.js";

export const bannersRouter = Router();

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

const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  linkUrl: z.string().nullable().optional(),
  isActive: z.coerce.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
});

function serializeBanner(banner: {
  id: string;
  title: string;
  subtitle: string | null;
  imageKey: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}) {
  return {
    ...banner,
    imageUrl: banner.imageKey ? getImagePublicUrl(banner.imageKey) : null,
  };
}

bannersRouter.get("/active", async (_req, res) => {
  const now = new Date();
  const banners = await prisma.promoBanner.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
  res.json(banners.map(serializeBanner));
});

bannersRouter.get("/", adminAuthMiddleware, async (_req, res) => {
  const banners = await prisma.promoBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  res.json(banners.map(serializeBanner));
});

bannersRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const parsed = bannerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const banner = await prisma.promoBanner.create({
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      linkUrl: parsed.data.linkUrl ?? null,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
      startDate: parsed.data.startDate ?? null,
      endDate: parsed.data.endDate ?? null,
    },
  });

  res.status(201).json(serializeBanner(banner));
});

bannersRouter.put("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = bannerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.promoBanner.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Баннер не найден" });
    return;
  }

  const banner = await prisma.promoBanner.update({
    where: { id },
    data: {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle ?? null,
      linkUrl: parsed.data.linkUrl ?? null,
      isActive: parsed.data.isActive ?? existing.isActive,
      sortOrder: parsed.data.sortOrder ?? existing.sortOrder,
      startDate: parsed.data.startDate ?? null,
      endDate: parsed.data.endDate ?? null,
    },
  });

  res.json(serializeBanner(banner));
});

bannersRouter.post(
  "/:id/image",
  adminAuthMiddleware,
  upload.single("image"),
  async (req, res) => {
    const id = paramId(req.params.id);
    const banner = await prisma.promoBanner.findUnique({ where: { id } });
    if (!banner) {
      res.status(404).json({ error: "Баннер не найден" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Не передано изображение" });
      return;
    }

    if (banner.imageKey) {
      await deleteImage(banner.imageKey).catch(() => undefined);
    }

    const { key } = await uploadBannerImage(req.file);
    const updated = await prisma.promoBanner.update({
      where: { id },
      data: { imageKey: key },
    });

    res.json(serializeBanner(updated));
  }
);

bannersRouter.delete("/:id/image", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const banner = await prisma.promoBanner.findUnique({ where: { id } });
  if (!banner) {
    res.status(404).json({ error: "Баннер не найден" });
    return;
  }

  if (banner.imageKey) {
    await deleteImage(banner.imageKey).catch(() => undefined);
    await prisma.promoBanner.update({
      where: { id },
      data: { imageKey: null },
    });
  }

  res.status(204).send();
});

bannersRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const banner = await prisma.promoBanner.findUnique({ where: { id } });
  if (!banner) {
    res.status(404).json({ error: "Баннер не найден" });
    return;
  }

  if (banner.imageKey) {
    await deleteImage(banner.imageKey).catch(() => undefined);
  }

  await prisma.promoBanner.delete({ where: { id } });
  res.status(204).send();
});

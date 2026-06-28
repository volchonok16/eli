import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import {
  uploadProductImage,
  deleteProductImage,
  getImagePublicUrl,
} from "../services/minio.js";
import { paramId } from "../utils/params.js";

export const productsRouter = Router();

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

const productSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  quantity: z.coerce.number().int().min(0),
  inStock: z.coerce.boolean().optional(),
  isHit: z.coerce.boolean().optional(),
  salePointId: z.string().uuid().nullable().optional(),
});

function serializeSalePointRef(point: {
  id: string;
  shortName: string;
  address: string;
  imageKey: string | null;
} | null) {
  if (!point) return null;
  return {
    id: point.id,
    shortName: point.shortName,
    address: point.address,
    imageUrl: point.imageKey ? getImagePublicUrl(point.imageKey) : null,
  };
}

function serializeProduct(product: {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string };
  quantity: number;
  inStock: boolean;
  isHit: boolean;
  salePointId: string | null;
  salePoint: {
    id: string;
    shortName: string;
    address: string;
    imageKey: string | null;
  } | null;
  images: { id: string; key: string; url: string; sortOrder: number }[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...product,
    price: Number(product.price),
    available: product.inStock && product.quantity > 0,
    salePoint: serializeSalePointRef(product.salePoint),
    images: product.images.map((img) => ({
      ...img,
      url: getImagePublicUrl(img.key),
    })),
  };
}

productsRouter.get("/", async (_req, res) => {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      salePoint: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(products.map(serializeProduct));
});

productsRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      salePoint: true,
    },
  });

  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  res.json(serializeProduct(product));
});

productsRouter.post("/", adminAuthMiddleware, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, description, price, quantity, inStock, isHit, salePointId } =
    parsed.data;

  if (salePointId) {
    const point = await prisma.salePoint.findUnique({
      where: { id: salePointId },
    });
    if (!point) {
      res.status(400).json({ error: "Точка продаж не найдена" });
      return;
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      quantity,
      inStock: inStock ?? quantity > 0,
      isHit: isHit ?? false,
      salePointId: salePointId ?? null,
    },
    include: { images: true, salePoint: true },
  });

  res.status(201).json(serializeProduct(product));
});

productsRouter.put("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.product.findUnique({
    where: { id },
  });

  if (!existing) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  const { name, description, price, quantity, inStock, isHit, salePointId } =
    parsed.data;

  if (salePointId) {
    const point = await prisma.salePoint.findUnique({
      where: { id: salePointId },
    });
    if (!point) {
      res.status(400).json({ error: "Точка продаж не найдена" });
      return;
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      quantity,
      inStock: inStock ?? quantity > 0,
      isHit: isHit ?? false,
      salePointId: salePointId ?? null,
    },
    include: { images: { orderBy: { sortOrder: "asc" } }, salePoint: true },
  });

  res.json(serializeProduct(product));
});

productsRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  for (const image of product.images) {
    await deleteProductImage(image.key).catch(() => undefined);
  }

  await prisma.product.delete({ where: { id } });
  res.status(204).send();
});

productsRouter.post(
  "/:id/images",
  adminAuthMiddleware,
  upload.array("images", 10),
  async (req, res) => {
    const id = paramId(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ error: "Товар не найден" });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      res.status(400).json({ error: "Не переданы изображения" });
      return;
    }

    const existingCount = await prisma.productImage.count({
      where: { productId: id },
    });

    const images = await Promise.all(
      files.map(async (file, index) => {
        const { key, url } = await uploadProductImage(file);
        return prisma.productImage.create({
          data: {
            productId: id,
            key,
            url,
            sortOrder: existingCount + index,
          },
        });
      })
    );

    res.status(201).json(images.map((img) => ({
      ...img,
      url: getImagePublicUrl(img.key),
    })));
  }
);

productsRouter.put(
  "/:id/images/order",
  adminAuthMiddleware,
  async (req, res) => {
    const id = paramId(req.params.id);
    const parsed = z
      .object({
        imageIds: z.array(z.string().uuid()).min(1),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      res.status(404).json({ error: "Товар не найден" });
      return;
    }

    const existingIds = new Set(product.images.map((img) => img.id));
    if (
      parsed.data.imageIds.length !== product.images.length ||
      !parsed.data.imageIds.every((imageId) => existingIds.has(imageId))
    ) {
      res.status(400).json({ error: "Некорректный список изображений" });
      return;
    }

    const images = await prisma.$transaction(
      parsed.data.imageIds.map((imageId, index) =>
        prisma.productImage.update({
          where: { id: imageId },
          data: { sortOrder: index },
        })
      )
    );

    res.json(
      images
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({ ...img, url: getImagePublicUrl(img.key) }))
    );
  }
);

productsRouter.delete(
  "/:id/images/:imageId",
  adminAuthMiddleware,
  async (req, res) => {
    const id = paramId(req.params.id);
    const imageId = paramId(req.params.imageId);
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId: id },
    });

    if (!image) {
      res.status(404).json({ error: "Изображение не найдено" });
      return;
    }

    await deleteProductImage(image.key).catch(() => undefined);
    await prisma.productImage.delete({ where: { id: image.id } });
    res.status(204).send();
  }
);

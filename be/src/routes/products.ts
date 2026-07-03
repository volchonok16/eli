import { Router } from "express";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { adminAuthMiddleware } from "../middleware/auth.js";
import {
  uploadProductImage,
  deleteProductImage,
  getImagePublicUrl,
} from "../services/minio.js";
import { serializeProduct } from "../utils/serializers.js";
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
  sku: z.string().nullable().optional(),
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  careGuide: z.string().optional(),
  height: z.coerce.number().int().positive().nullable().optional(),
  heightLabel: z.string().nullable().optional(),
  sort: z.string().nullable().optional(),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  costPrice: z.coerce.number().positive().nullable().optional(),
  quantity: z.coerce.number().int().min(0),
  inStock: z.coerce.boolean().optional(),
  isHit: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  salePointId: z.string().uuid().nullable().optional(),
});

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  salePoint: true,
  category: { select: { id: true, name: true } },
};

productsRouter.get("/", async (req, res) => {
  const where: Prisma.ProductWhereInput = {};

  const categoryId = req.query.categoryId ?? req.query.category;
  if (categoryId) {
    where.categoryId = String(categoryId);
  }
  if (req.query.salePointId) {
    where.salePointId = String(req.query.salePointId);
  }
  if (req.query.inStock === "true") {
    where.inStock = true;
  }
  if (req.query.heightMin) {
    where.height = {
      ...(where.height as object),
      gte: Number(req.query.heightMin),
    };
  }
  if (req.query.heightMax) {
    where.height = {
      ...(where.height as object),
      lte: Number(req.query.heightMax),
    };
  }
  if (req.query.priceMin || req.query.priceMax) {
    where.price = {};
    if (req.query.priceMin) {
      (where.price as Prisma.DecimalFilter).gte = Number(req.query.priceMin);
    }
    if (req.query.priceMax) {
      (where.price as Prisma.DecimalFilter).lte = Number(req.query.priceMax);
    }
  }
  if (req.query.search) {
    const search = String(req.query.search);
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const sort = String(req.query.sort ?? "newest");
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "popularity" || sort === "popular") orderBy = { isHit: "desc" };

  if (!req.query.page) {
    const take = req.query.limit
      ? Math.min(100, Math.max(1, Number(req.query.limit)))
      : undefined;

    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      take,
    });
    res.json(products.map(serializeProduct));
    return;
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    items: products.map(serializeProduct),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

productsRouter.get("/:id/related", async (req, res) => {
  const id = paramId(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  const related = await prisma.product.findMany({
    where: {
      id: { not: id },
      OR: [
        { categoryId: product.categoryId ?? undefined },
        { isHit: true },
      ],
    },
    include: productInclude,
    take: 4,
  });

  res.json(related.map(serializeProduct));
});

productsRouter.get("/:id", async (req, res) => {
  const id = paramId(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
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

  const data = parsed.data;
  if (data.salePointId) {
    const point = await prisma.salePoint.findUnique({
      where: { id: data.salePointId },
    });
    if (!point) {
      res.status(400).json({ error: "Точка продаж не найдена" });
      return;
    }
  }

  const product = await prisma.product.create({
    data: {
      sku: data.sku ?? null,
      name: data.name,
      description: data.description,
      careGuide: data.careGuide,
      height: data.height ?? null,
      heightLabel: data.heightLabel ?? null,
      sort: data.sort ?? null,
      price: data.price,
      costPrice: data.costPrice ?? null,
      quantity: data.quantity,
      inStock: data.inStock ?? data.quantity > 0,
      isHit: data.isHit ?? false,
      isNew: data.isNew ?? false,
      categoryId: data.categoryId ?? null,
      salePointId: data.salePointId ?? null,
    },
    include: productInclude,
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

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  const data = parsed.data;
  const product = await prisma.product.update({
    where: { id },
    data: {
      sku: data.sku ?? null,
      name: data.name,
      description: data.description,
      careGuide: data.careGuide,
      height: data.height ?? null,
      heightLabel: data.heightLabel ?? null,
      sort: data.sort ?? null,
      price: data.price,
      costPrice: data.costPrice ?? null,
      quantity: data.quantity,
      inStock: data.inStock ?? data.quantity > 0,
      isHit: data.isHit ?? false,
      isNew: data.isNew ?? false,
      categoryId: data.categoryId ?? null,
      salePointId: data.salePointId ?? null,
    },
    include: productInclude,
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
    const product = await prisma.product.findUnique({ where: { id } });
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

    res.status(201).json(
      images.map((img) => ({
        ...img,
        url: getImagePublicUrl(img.key),
      }))
    );
  }
);

productsRouter.put(
  "/:id/images/order",
  adminAuthMiddleware,
  async (req, res) => {
    const id = paramId(req.params.id);
    const parsed = z
      .object({ imageIds: z.array(z.string().uuid()).min(1) })
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

    res.json(images);
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

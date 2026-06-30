import { Router } from "express";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import {
  adminAuthMiddleware,
  AuthRequest,
  userAuthMiddleware,
} from "../middleware/auth.js";
import { paramId } from "../utils/params.js";

export const wholesaleRouter = Router();

const priceSchema = z.object({
  productId: z.string().uuid(),
  minQuantity: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
});

function serializeWholesalePrice(row: {
  id: string;
  productId: string;
  minQuantity: number;
  price: { toString(): string };
  product: { name: string };
}) {
  return {
    id: row.id,
    productId: row.productId,
    productName: row.product.name,
    minQuantity: row.minQuantity,
    price: Number(row.price),
  };
}

wholesaleRouter.get("/prices/public", async (_req, res) => {
  const prices = await prisma.wholesalePrice.findMany({
    include: { product: { select: { name: true } } },
    orderBy: [{ productId: "asc" }, { minQuantity: "asc" }],
  });
  res.json(prices.map(serializeWholesalePrice));
});

wholesaleRouter.get("/prices", adminAuthMiddleware, async (_req, res) => {
  const prices = await prisma.wholesalePrice.findMany({
    include: { product: { select: { name: true } } },
    orderBy: [{ productId: "asc" }, { minQuantity: "asc" }],
  });
  res.json(prices.map(serializeWholesalePrice));
});

wholesaleRouter.get(
  "/prices/my",
  userAuthMiddleware,
  async (req: AuthRequest, res) => {
    if (
      !req.auth ||
      !("userId" in req.auth) ||
      (req.auth.role !== UserRole.WHOLESALE && req.auth.role !== UserRole.ADMIN)
    ) {
      res.status(403).json({ error: "Доступно только оптовым покупателям" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
    });

    if (
      req.auth.role === UserRole.WHOLESALE &&
      !user?.wholesaleApproved
    ) {
      res.status(403).json({ error: "Оптовый аккаунт не одобрен" });
      return;
    }

    const prices = await prisma.wholesalePrice.findMany({
      include: { product: { select: { name: true } } },
      orderBy: [{ productId: "asc" }, { minQuantity: "asc" }],
    });
    res.json(prices.map(serializeWholesalePrice));
  }
);

wholesaleRouter.post("/prices", adminAuthMiddleware, async (req, res) => {
  const parsed = priceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    res.status(400).json({ error: "Товар не найден" });
    return;
  }

  const price = await prisma.wholesalePrice.create({
    data: parsed.data,
    include: { product: { select: { name: true } } },
  });

  res.status(201).json(serializeWholesalePrice(price));
});

wholesaleRouter.put("/prices/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const parsed = priceSchema
    .omit({ productId: true })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.wholesalePrice.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Оптовая цена не найдена" });
    return;
  }

  const price = await prisma.wholesalePrice.update({
    where: { id },
    data: parsed.data,
    include: { product: { select: { name: true } } },
  });

  res.json(serializeWholesalePrice(price));
});

wholesaleRouter.delete("/prices/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const existing = await prisma.wholesalePrice.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Оптовая цена не найдена" });
    return;
  }

  await prisma.wholesalePrice.delete({ where: { id } });
  res.status(204).send();
});

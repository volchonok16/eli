import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import {
  AuthRequest,
  getUserId,
  userAuthMiddleware,
} from "../middleware/auth.js";
import {
  getOrCreateCart,
  serializeCart,
} from "../services/cart.js";
import { paramId } from "../utils/params.js";

export const cartRouter = Router();

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

cartRouter.use(userAuthMiddleware);

cartRouter.get("/", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const cart = await getOrCreateCart(userId);
  res.json(serializeCart(cart));
});

cartRouter.post("/items", async (req: AuthRequest, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = getUserId(req);
  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });

  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  if (!product.inStock || product.quantity < 1) {
    res.status(400).json({ error: `Товар «${product.name}» недоступен` });
    return;
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find(
    (item) => item.productId === parsed.data.productId
  );
  const newQuantity = (existingItem?.quantity ?? 0) + parsed.data.quantity;

  if (newQuantity > product.quantity) {
    res.status(400).json({
      error: `Доступно только ${product.quantity} шт. товара «${product.name}»`,
    });
    return;
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.data.productId,
        quantity: parsed.data.quantity,
      },
    });
  }

  const updated = await getOrCreateCart(userId);
  res.status(existingItem ? 200 : 201).json(serializeCart(updated));
});

cartRouter.put("/items/:productId", async (req: AuthRequest, res) => {
  const productId = paramId(req.params.productId);
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const userId = getUserId(req);
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => entry.productId === productId);

  if (!item) {
    res.status(404).json({ error: "Товар не найден в корзине" });
    return;
  }

  if (!item.product.inStock || item.product.quantity < parsed.data.quantity) {
    res.status(400).json({
      error: `Доступно только ${item.product.quantity} шт. товара «${item.product.name}»`,
    });
    return;
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
  });

  const updated = await getOrCreateCart(userId);
  res.json(serializeCart(updated));
});

cartRouter.delete("/items/:productId", async (req: AuthRequest, res) => {
  const productId = paramId(req.params.productId);
  const userId = getUserId(req);
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => entry.productId === productId);

  if (!item) {
    res.status(404).json({ error: "Товар не найден в корзине" });
    return;
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  const updated = await getOrCreateCart(userId);
  res.json(serializeCart(updated));
});

cartRouter.delete("/", async (req: AuthRequest, res) => {
  const userId = getUserId(req);
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  const updated = await getOrCreateCart(userId);
  res.json(serializeCart(updated));
});

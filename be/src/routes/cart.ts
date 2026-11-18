import { Router } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../db/prisma.js";
import { AuthRequest, softUserAuthMiddleware } from "../middleware/auth.js";
import {
  getOrCreateGuestCart,
  getOrCreateUserCart,
  serializeCart,
} from "../services/cart.js";
import { paramId } from "../utils/params.js";
import {
  GUEST_CART_COOKIE,
  clearGuestCartCookie,
  readCookie,
  setGuestCartCookie,
} from "../utils/cookies.js";

export const cartRouter = Router();

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

cartRouter.use(softUserAuthMiddleware);

async function resolveCart(req: AuthRequest, res: { append: (name: string, value: string) => unknown }) {
  if (req.auth && "userId" in req.auth) {
    return getOrCreateUserCart(req.auth.userId);
  }

  const existingKey = readCookie(req, GUEST_CART_COOKIE);
  const guestKey = existingKey || uuidv4();
  if (!existingKey) {
    setGuestCartCookie(res as Parameters<typeof setGuestCartCookie>[0], guestKey);
  }
  return getOrCreateGuestCart(guestKey);
}

cartRouter.get("/", async (req: AuthRequest, res) => {
  const cart = await resolveCart(req, res);
  res.json(serializeCart(cart));
});

cartRouter.post("/items", async (req: AuthRequest, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });

  if (!product) {
    res.status(404).json({ error: "Товар не найден" });
    return;
  }

  if (!product.inStock || product.quantity - product.reserved < 1) {
    res.status(400).json({ error: `Товар «${product.name}» недоступен` });
    return;
  }

  const cart = await resolveCart(req, res);
  const existingItem = cart.items.find(
    (item) => item.productId === parsed.data.productId
  );
  const newQuantity = (existingItem?.quantity ?? 0) + parsed.data.quantity;

  if (newQuantity > product.quantity - product.reserved) {
    const available = product.quantity - product.reserved;
    res.status(400).json({
      error: `Доступно только ${available} шт. товара «${product.name}»`,
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

  const updated = await resolveCart(req, res);
  res.status(existingItem ? 200 : 201).json(serializeCart(updated));
});

cartRouter.put("/items/:productId", async (req: AuthRequest, res) => {
  const productId = paramId(req.params.productId);
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const cart = await resolveCart(req, res);
  const item = cart.items.find((entry) => entry.productId === productId);

  if (!item) {
    res.status(404).json({ error: "Товар не найден в корзине" });
    return;
  }

  if (!item.product.inStock || item.product.quantity - item.product.reserved < parsed.data.quantity) {
    const available = item.product.quantity - item.product.reserved;
    res.status(400).json({
      error: `Доступно только ${available} шт. товара «${item.product.name}»`,
    });
    return;
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsed.data.quantity },
  });

  const updated = await resolveCart(req, res);
  res.json(serializeCart(updated));
});

cartRouter.delete("/items/:productId", async (req: AuthRequest, res) => {
  const productId = paramId(req.params.productId);
  const cart = await resolveCart(req, res);
  const item = cart.items.find((entry) => entry.productId === productId);

  if (!item) {
    res.status(404).json({ error: "Товар не найден в корзине" });
    return;
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  const updated = await resolveCart(req, res);
  res.json(serializeCart(updated));
});

cartRouter.delete("/", async (req: AuthRequest, res) => {
  const cart = await resolveCart(req, res);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  if (!req.auth || !("userId" in req.auth)) {
    clearGuestCartCookie(res);
  }

  const updated = await resolveCart(req, res);
  res.json(serializeCart(updated));
});

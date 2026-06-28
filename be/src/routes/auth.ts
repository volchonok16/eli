import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db/prisma.js";
import {
  authMiddleware,
  AuthRequest,
  getUserId,
  userAuthMiddleware,
} from "../middleware/auth.js";
import {
  deleteImage,
  getImagePublicUrl,
  uploadUserAvatar,
} from "../services/minio.js";
import { isValidPhone, normalizePhone } from "../utils/phone.js";

export const authRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Допустимы только изображения"));
    }
  },
});

const registerSchema = z.object({
  phone: z.string().min(10, "Укажите номер телефона"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
  name: z.string().min(1, "Укажите имя").max(100),
});

const userLoginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

function serializeUser(user: {
  id: string;
  phone: string;
  name: string;
  avatarKey: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    avatarUrl: user.avatarKey ? getImagePublicUrl(user.avatarKey) : null,
    createdAt: user.createdAt,
  };
}

function signUserToken(userId: string): string {
  return jwt.sign({ role: "user", userId }, config.jwt.secret, {
    expiresIn: "24h",
  });
}

authRouter.post(
  "/register",
  upload.single("avatar"),
  async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    if (!isValidPhone(parsed.data.phone)) {
      res.status(400).json({ error: "Некорректный номер телефона" });
      return;
    }

    const phone = normalizePhone(parsed.data.phone);
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      res.status(409).json({ error: "Пользователь с таким телефоном уже существует" });
      return;
    }

    let avatarKey: string | null = null;
    if (req.file) {
      const uploaded = await uploadUserAvatar(req.file);
      avatarKey = uploaded.key;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          phone,
          passwordHash,
          name: parsed.data.name.trim(),
          avatarKey,
        },
      });

      const token = signUserToken(user.id);
      res.status(201).json({
        token,
        user: serializeUser(user),
      });
    } catch (error) {
      if (avatarKey) {
        await deleteImage(avatarKey).catch(() => undefined);
      }
      throw error;
    }
  }
);

authRouter.post("/login", async (req, res) => {
  const { username, password, phone } = req.body as {
    username?: string;
    password?: string;
    phone?: string;
  };

  if (!password) {
    res.status(400).json({ error: "Укажите пароль" });
    return;
  }

  if (phone) {
    const parsed = userLoginSchema.safeParse({ phone, password });
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    if (!isValidPhone(parsed.data.phone)) {
      res.status(400).json({ error: "Некорректный номер телефона" });
      return;
    }

    const normalizedPhone = normalizePhone(parsed.data.phone);
    const user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      res.status(401).json({ error: "Неверный телефон или пароль" });
      return;
    }

    const token = signUserToken(user.id);
    res.json({
      token,
      user: serializeUser(user),
    });
    return;
  }

  if (
    username !== config.admin.username ||
    password !== config.admin.password
  ) {
    res.status(401).json({ error: "Неверный логин или пароль" });
    return;
  }

  const token = jwt.sign({ role: "admin" }, config.jwt.secret, {
    expiresIn: "24h",
  });

  res.json({ token, role: "admin" });
});

authRouter.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  if (req.auth?.role === "admin") {
    res.json({ role: "admin" });
    return;
  }

  if (req.auth?.role === "user") {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
    });

    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    res.json({
      role: "user",
      user: serializeUser(user),
    });
    return;
  }

  res.status(401).json({ error: "Недействительный токен" });
});

authRouter.patch(
  "/profile",
  userAuthMiddleware,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    const userId = getUserId(req);
    const profileSchema = z.object({
      name: z.string().min(1).max(100).optional(),
      password: z.string().min(6).optional(),
    });

    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    let avatarKey = user.avatarKey;
    if (req.file) {
      const uploaded = await uploadUserAvatar(req.file);
      avatarKey = uploaded.key;
      if (user.avatarKey) {
        await deleteImage(user.avatarKey).catch(() => undefined);
      }
    }

    const data: {
      name?: string;
      passwordHash?: string;
      avatarKey?: string | null;
    } = {};

    if (parsed.data.name) {
      data.name = parsed.data.name.trim();
    }
    if (parsed.data.password) {
      data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
    }
    if (req.file) {
      data.avatarKey = avatarKey;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    res.json({ user: serializeUser(updated) });
  }
);

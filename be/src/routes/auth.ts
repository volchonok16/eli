import { Router } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
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
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
  name: z.string().min(1, "Укажите имя").max(100),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(1),
});

const profileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  companyName: z.string().optional(),
  inn: z.string().optional(),
});

function serializeUser(user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarKey: string | null;
  role: UserRole;
  wholesaleApproved: boolean;
  companyName: string | null;
  inn: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatarUrl: user.avatarKey ? getImagePublicUrl(user.avatarKey) : null,
    role: user.role,
    wholesaleApproved: user.wholesaleApproved,
    companyName: user.companyName,
    inn: user.inn,
    createdAt: user.createdAt,
  };
}

function signUserToken(userId: string, role: UserRole): string {
  return jwt.sign({ role, userId }, config.jwt.secret, {
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

    let phone: string | null = null;
    if (parsed.data.phone) {
      if (!isValidPhone(parsed.data.phone)) {
        res.status(400).json({ error: "Некорректный номер телефона" });
        return;
      }
      phone = normalizePhone(parsed.data.phone);
    }

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      res.status(409).json({ error: "Пользователь уже существует" });
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
          email,
          passwordHash,
          name: parsed.data.name.trim(),
          phone,
          avatarKey,
          role: UserRole.CUSTOMER,
        },
      });

      const token = signUserToken(user.id, user.role);
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
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, phone, username, password } = parsed.data;

  if (username) {
    if (
      username !== config.admin.username ||
      password !== config.admin.password
    ) {
      res.status(401).json({ error: "Неверный логин или пароль" });
      return;
    }

    const token = jwt.sign({ role: "ADMIN", source: "env" }, config.jwt.secret, {
      expiresIn: "24h",
    });
    res.json({ token, role: "ADMIN" });
    return;
  }

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }

    const token = signUserToken(user.id, user.role);
    res.json({ token, user: serializeUser(user) });
    return;
  }

  if (phone) {
    if (!isValidPhone(phone)) {
      res.status(400).json({ error: "Некорректный номер телефона" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { phone: normalizePhone(phone) },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Неверный телефон или пароль" });
      return;
    }

    const token = signUserToken(user.id, user.role);
    res.json({ token, user: serializeUser(user) });
    return;
  }

  res.status(400).json({ error: "Укажите email, телефон или username" });
});

authRouter.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  if (req.auth && "source" in req.auth) {
    res.json({ role: "ADMIN" });
    return;
  }

  if (req.auth && "userId" in req.auth) {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
    });

    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }

    res.json({
      role: user.role,
      user: serializeUser(user),
    });
    return;
  }

  res.status(401).json({ error: "Недействительный токен" });
});

authRouter.put(
  "/me",
  userAuthMiddleware,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    const userId = getUserId(req);
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

    let phone = user.phone;
    if (parsed.data.phone !== undefined) {
      if (parsed.data.phone === "") {
        phone = null;
      } else if (!isValidPhone(parsed.data.phone)) {
        res.status(400).json({ error: "Некорректный номер телефона" });
        return;
      } else {
        phone = normalizePhone(parsed.data.phone);
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: parsed.data.name?.trim() ?? user.name,
        phone,
        companyName: parsed.data.companyName ?? user.companyName,
        inn: parsed.data.inn ?? user.inn,
        avatarKey: req.file ? avatarKey : user.avatarKey,
        passwordHash: parsed.data.password
          ? await bcrypt.hash(parsed.data.password, 10)
          : undefined,
      },
    });

    res.json({ user: serializeUser(updated) });
  }
);

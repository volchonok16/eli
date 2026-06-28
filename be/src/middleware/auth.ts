import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export interface AdminAuthPayload {
  role: "admin";
}

export interface UserAuthPayload {
  role: "user";
  userId: string;
}

export type AuthPayload = AdminAuthPayload | UserAuthPayload;

export interface AuthRequest extends Request {
  auth?: AuthPayload;
}

function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwt.secret) as AuthPayload;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Требуется авторизация" });
    return;
  }

  try {
    req.auth = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
  }
}

export function adminAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  authMiddleware(req, res, () => {
    if (req.auth?.role !== "admin") {
      res.status(403).json({ error: "Недостаточно прав" });
      return;
    }
    next();
  });
}

export function userAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  authMiddleware(req, res, () => {
    if (req.auth?.role !== "user") {
      res.status(403).json({ error: "Требуется авторизация пользователя" });
      return;
    }
    next();
  });
}

export function optionalUserAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    if (payload.role === "user") {
      req.auth = payload;
    }
    next();
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
  }
}

export function getUserId(req: AuthRequest): string {
  if (req.auth?.role !== "user") {
    throw new Error("Требуется авторизация пользователя");
  }
  return req.auth.userId;
}

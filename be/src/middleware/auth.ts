import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { config } from "../config.js";

export interface EnvAdminAuthPayload {
  role: "ADMIN";
  source: "env";
}

export interface DbUserAuthPayload {
  role: UserRole;
  userId: string;
}

export type AuthPayload = EnvAdminAuthPayload | DbUserAuthPayload;

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

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    authMiddleware(req, res, () => {
      if (!req.auth) return;

      if ("source" in req.auth && req.auth.role === "ADMIN") {
        if (roles.includes(UserRole.ADMIN)) {
          next();
          return;
        }
        res.status(403).json({ error: "Недостаточно прав" });
        return;
      }

      if ("userId" in req.auth && roles.includes(req.auth.role)) {
        next();
        return;
      }

      res.status(403).json({ error: "Недостаточно прав" });
    });
  };
}

export const adminAuthMiddleware = requireRole(UserRole.ADMIN);

export const staffAuthMiddleware = requireRole(
  UserRole.ADMIN,
  UserRole.MANAGER
);

export function userAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  authMiddleware(req, res, () => {
    if (!req.auth || !("userId" in req.auth)) {
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
    if ("userId" in payload) {
      req.auth = payload;
    }
    next();
  } catch {
    res.status(401).json({ error: "Недействительный токен" });
  }
}

export function getUserId(req: AuthRequest): string {
  if (!req.auth || !("userId" in req.auth)) {
    throw new Error("Требуется авторизация пользователя");
  }
  return req.auth.userId;
}

export function isEnvAdmin(auth?: AuthPayload): boolean {
  return !!auth && "source" in auth && auth.role === "ADMIN";
}

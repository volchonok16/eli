import type { Request, Response } from "express";
import { config } from "../config.js";

export const GUEST_CART_COOKIE = "eli_guest_key";

export function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;

  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
}

export function setGuestCartCookie(res: Response, value: string) {
  const secure = config.nodeEnv === "production" ? "; Secure" : "";
  res.append(
    "Set-Cookie",
    `${GUEST_CART_COOKIE}=${encodeURIComponent(value)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`
  );
}

export function clearGuestCartCookie(res: Response) {
  const secure = config.nodeEnv === "production" ? "; Secure" : "";
  res.append(
    "Set-Cookie",
    `${GUEST_CART_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
  );
}

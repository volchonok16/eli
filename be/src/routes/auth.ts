import { Router } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const { username, password } = req.body as {
    username?: string;
    password?: string;
  };

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

  res.json({ token });
});

authRouter.get("/me", (_req, res) => {
  res.json({ role: "admin" });
});

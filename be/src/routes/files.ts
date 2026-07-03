import { Router } from "express";
import {
  getProductImage,
  getProductImageStat,
} from "../services/minio.js";

export const filesRouter = Router();

filesRouter.get(/.+/, async (req, res) => {
  const key = req.path.replace(/^\//, "");

  if (!key) {
    res.status(400).json({ error: "Не указан файл" });
    return;
  }

  try {
    const stat = await getProductImageStat(key);
    const contentType =
      stat.metaData?.["content-type"] ??
      stat.metaData?.["Content-Type"] ??
      "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await getProductImage(key);
    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(404).json({ error: "Файл не найден" });
      }
    });
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: "Файл не найден" });
  }
});

import { Router } from "express";
import {
  getProductImage,
  getProductImageStat,
} from "../services/minio.js";

export const filesRouter = Router();

function guessContentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return types[ext ?? ""] ?? "application/octet-stream";
}

function extractKey(pathParam: string | string[] | undefined): string {
  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }
  return pathParam ?? "";
}

filesRouter.get("/{*path}", async (req, res) => {
  const key = extractKey(req.params.path);

  if (!key) {
    res.status(400).json({ error: "Не указан файл" });
    return;
  }

  try {
    const stat = await getProductImageStat(key);
    const contentType =
      stat.metaData?.["content-type"] ??
      stat.metaData?.["Content-Type"] ??
      guessContentType(key);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await getProductImage(key);
    stream.on("error", (error) => {
      console.error("MinIO stream error:", key, error);
      if (!res.headersSent) {
        res.status(404).json({ error: "Файл не найден" });
      } else {
        res.end();
      }
    });
    stream.pipe(res);
  } catch (error) {
    console.error("File not found:", key, error);
    res.status(404).json({ error: "Файл не найден" });
  }
});

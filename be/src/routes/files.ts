import type { Express, Request, Response } from "express";
import {
  getProductImage,
  getProductImageStat,
} from "../services/minio.js";

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

function extractFileKey(req: Request): string {
  const param = req.params.filepath;
  if (Array.isArray(param)) {
    return param.map(decodeURIComponent).join("/");
  }
  if (typeof param === "string" && param.length > 0) {
    return decodeURIComponent(param);
  }

  const prefix = "/api/files/";
  if (req.originalUrl.startsWith(prefix)) {
    return decodeURIComponent(req.originalUrl.slice(prefix.length).split("?")[0]);
  }

  return "";
}

async function serveFile(req: Request, res: Response): Promise<void> {
  const key = extractFileKey(req);

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
}

export function registerFilesRoute(app: Express): void {
  app.get("/api/files/*filepath", (req, res) => {
    void serveFile(req, res);
  });
}

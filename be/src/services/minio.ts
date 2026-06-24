import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";

let client: Minio.Client | null = null;
let bucketReady = false;

function getClient(): Minio.Client {
  if (!client) {
    client = new Minio.Client({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }
  return client;
}

async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  const minio = getClient();
  const exists = await minio.bucketExists(config.minio.bucket);
  if (!exists) {
    await minio.makeBucket(config.minio.bucket);
  }
  bucketReady = true;
}

/** Публичный URL через API — MinIO bucket по умолчанию закрыт */
export function getImagePublicUrl(key: string): string {
  return `${config.apiUrl}/api/files/${key}`;
}

export async function uploadProductImage(
  file: Express.Multer.File
): Promise<{ key: string; url: string }> {
  await ensureBucket();
  const minio = getClient();
  const ext = file.originalname.split(".").pop() ?? "jpg";
  const key = `products/${uuidv4()}.${ext}`;

  await minio.putObject(config.minio.bucket, key, file.buffer, file.size, {
    "Content-Type": file.mimetype,
  });

  return { key, url: getImagePublicUrl(key) };
}

export async function deleteProductImage(key: string): Promise<void> {
  await ensureBucket();
  const minio = getClient();
  await minio.removeObject(config.minio.bucket, key);
}

export async function getProductImage(key: string) {
  await ensureBucket();
  const minio = getClient();
  return minio.getObject(config.minio.bucket, key);
}

export async function getProductImageStat(key: string) {
  await ensureBucket();
  const minio = getClient();
  return minio.statObject(config.minio.bucket, key);
}

export async function initMinio(): Promise<void> {
  await ensureBucket();
}

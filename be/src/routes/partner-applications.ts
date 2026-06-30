import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { PartnerDocumentType, PartnerStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import {
  adminAuthMiddleware,
  AuthRequest,
  optionalUserAuthMiddleware,
  staffAuthMiddleware,
  userAuthMiddleware,
} from "../middleware/auth.js";
import {
  deleteImage,
  getImagePublicUrl,
  getProductImage,
  uploadPartnerDocument,
} from "../services/minio.js";
import { notifyPartnerApplication } from "../services/telegram.js";
import { notifyPartnerApplicationMax } from "../services/max.js";
import { paramId } from "../utils/params.js";

export const partnerApplicationsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const statusLabels: Record<PartnerStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  APPROVED: "Одобрена",
  REJECTED: "Отклонена",
};

const createSchema = z.object({
  organizationName: z.string().optional(),
  contactName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  landAddress: z.string().min(1),
  landArea: z.coerce.number().positive().optional(),
  description: z.string().optional(),
});

function serializeDocument(doc: {
  id: string;
  key: string;
  type: PartnerDocumentType;
  originalName: string | null;
  createdAt: Date;
}) {
  return {
    id: doc.id,
    key: doc.key,
    type: doc.type,
    originalName: doc.originalName,
    url: getImagePublicUrl(doc.key),
    createdAt: doc.createdAt,
  };
}

function serializeApplication(app: {
  id: string;
  organizationName: string | null;
  contactName: string;
  phone: string;
  email: string | null;
  landAddress: string;
  landArea: { toString(): string } | null;
  description: string | null;
  status: PartnerStatus;
  statusNote: string | null;
  documents: {
    id: string;
    key: string;
    type: PartnerDocumentType;
    originalName: string | null;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: app.id,
    organizationName: app.organizationName,
    contactName: app.contactName,
    phone: app.phone,
    email: app.email,
    landAddress: app.landAddress,
    landArea: app.landArea ? Number(app.landArea) : null,
    description: app.description,
    status: app.status,
    statusLabel: statusLabels[app.status],
    statusNote: app.statusNote,
    documents: app.documents.map(serializeDocument),
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

partnerApplicationsRouter.post(
  "/",
  optionalUserAuthMiddleware,
  upload.array("photos", 10),
  async (req: AuthRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const userId =
      req.auth && "userId" in req.auth ? req.auth.userId : null;

    const application = await prisma.partnerApplication.create({
      data: {
        ...parsed.data,
        landArea: parsed.data.landArea ?? null,
        userId,
      },
      include: { documents: true },
    });

    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length) {
      await Promise.all(
        files.map(async (file) => {
          const { key } = await uploadPartnerDocument(file);
          await prisma.partnerDocument.create({
            data: {
              partnerApplicationId: application.id,
              key,
              type: PartnerDocumentType.PHOTO,
              originalName: file.originalname,
            },
          });
        })
      );
    }

    const full = await prisma.partnerApplication.findUniqueOrThrow({
      where: { id: application.id },
      include: { documents: true },
    });

    await Promise.all([
      notifyPartnerApplication(full),
      notifyPartnerApplicationMax(full),
    ]);

    res.status(201).json(serializeApplication(full));
  }
);

partnerApplicationsRouter.get(
  "/my",
  userAuthMiddleware,
  async (req: AuthRequest, res) => {
    const userId = req.auth && "userId" in req.auth ? req.auth.userId : "";
    const items = await prisma.partnerApplication.findMany({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(items.map(serializeApplication));
  }
);

partnerApplicationsRouter.get("/", staffAuthMiddleware, async (_req, res) => {
  const items = await prisma.partnerApplication.findMany({
    include: { documents: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(items.map(serializeApplication));
});

partnerApplicationsRouter.get("/:id", async (req: AuthRequest, res) => {
  const id = paramId(req.params.id);
  const app = await prisma.partnerApplication.findUnique({
    where: { id },
    include: { documents: true },
  });

  if (!app) {
    res.status(404).json({ error: "Заявка не найдена" });
    return;
  }

  res.json(serializeApplication(app));
});

partnerApplicationsRouter.patch(
  "/:id/status",
  staffAuthMiddleware,
  async (req, res) => {
    const id = paramId(req.params.id);
    const parsed = z
      .object({
        status: z.nativeEnum(PartnerStatus),
        statusNote: z.string().optional(),
      })
      .safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const existing = await prisma.partnerApplication.findUnique({
      where: { id },
    });
    if (!existing) {
      res.status(404).json({ error: "Заявка не найдена" });
      return;
    }

    const updated = await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: parsed.data.status,
        statusNote: parsed.data.statusNote ?? null,
      },
      include: { documents: true },
    });

    res.json(serializeApplication(updated));
  }
);

partnerApplicationsRouter.post(
  "/:id/documents",
  staffAuthMiddleware,
  upload.single("file"),
  async (req, res) => {
    const id = paramId(req.params.id);
    const app = await prisma.partnerApplication.findUnique({ where: { id } });
    if (!app) {
      res.status(404).json({ error: "Заявка не найдена" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Не передан файл" });
      return;
    }

    const type = (req.body.type as PartnerDocumentType) ?? PartnerDocumentType.CONTRACT;
    const { key } = await uploadPartnerDocument(req.file);

    const doc = await prisma.partnerDocument.create({
      data: {
        partnerApplicationId: id,
        key,
        type,
        originalName: req.file.originalname,
      },
    });

    res.status(201).json(serializeDocument(doc));
  }
);

partnerApplicationsRouter.get(
  "/:id/documents/:docId/download",
  async (req, res) => {
    const id = paramId(req.params.id);
    const docId = paramId(req.params.docId);

    const doc = await prisma.partnerDocument.findFirst({
      where: { id: docId, partnerApplicationId: id },
    });

    if (!doc) {
      res.status(404).json({ error: "Документ не найден" });
      return;
    }

    const stream = await getProductImage(doc.key);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${doc.originalName ?? "document"}"`
    );
    stream.pipe(res);
  }
);

partnerApplicationsRouter.delete(
  "/:id/documents/:docId",
  adminAuthMiddleware,
  async (req, res) => {
    const id = paramId(req.params.id);
    const docId = paramId(req.params.docId);

    const doc = await prisma.partnerDocument.findFirst({
      where: { id: docId, partnerApplicationId: id },
    });

    if (!doc) {
      res.status(404).json({ error: "Документ не найден" });
      return;
    }

    await deleteImage(doc.key).catch(() => undefined);
    await prisma.partnerDocument.delete({ where: { id: doc.id } });
    res.status(204).send();
  }
);

partnerApplicationsRouter.delete("/:id", adminAuthMiddleware, async (req, res) => {
  const id = paramId(req.params.id);
  const app = await prisma.partnerApplication.findUnique({
    where: { id },
    include: { documents: true },
  });

  if (!app) {
    res.status(404).json({ error: "Заявка не найдена" });
    return;
  }

  for (const doc of app.documents) {
    await deleteImage(doc.key).catch(() => undefined);
  }

  await prisma.partnerApplication.delete({ where: { id } });
  res.status(204).send();
});

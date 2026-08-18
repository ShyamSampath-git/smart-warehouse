import type { Express, Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { createWarehouseDocument } from "./db";
import { storagePut } from "./storage";

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "text/csv", "text/plain", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);

function safeFileName(name: string) { return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180) || "warehouse-document"; }

export function registerWarehouseUploadRoutes(app: Express) {
  app.post("/api/warehouse/documents", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req).catch(() => null);
      if (!user) return res.status(401).json({ message: "Sign in before uploading to private warehouse storage." });
      const { fileName, mimeType, contentBase64, orderId } = req.body as { fileName?: string; mimeType?: string; contentBase64?: string; orderId?: number };
      if (!fileName || !mimeType || !contentBase64) return res.status(400).json({ message: "File name, type, and content are required." });
      if (!ALLOWED_DOCUMENT_TYPES.has(mimeType)) return res.status(415).json({ message: "Upload a PDF, image, CSV, text file, or spreadsheet." });
      const data = Buffer.from(contentBase64, "base64");
      if (!data.length || data.length > MAX_DOCUMENT_BYTES) return res.status(413).json({ message: "Documents must be smaller than 10 MB." });
      const saved = await storagePut(`warehouse/${user.id}/documents/${safeFileName(fileName)}`, data, mimeType);
      const document = await createWarehouseDocument({ userId: user.id, orderId: Number.isInteger(orderId) ? orderId : null, fileName: safeFileName(fileName), mimeType, sizeBytes: data.length, storageKey: saved.key, storageUrl: saved.url });
      return res.status(201).json(document);
    } catch (error) {
      console.error("[Warehouse upload]", error);
      return res.status(500).json({ message: "Document upload could not be completed." });
    }
  });
}

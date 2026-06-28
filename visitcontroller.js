import sql from '../config/db.js';
import multer from "multer";
import { randomUUID } from "crypto";
import upload from "../middleware/upload.js";
import { uploadToSupabase } from "../utils/uploadToSupabase.js";
import {
  getScheduleByDealId,
  getScheduleByInventoryUnitId,
} from '../services/project_developer/milestoneService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DOCUMENT_TYPE_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

const parseDealDocumentUpload = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

const parseMultipartUpload = (req, res) => new Promise((resolve, reject) => {
  if (!req.is("multipart/form-data") || req.file || req.files) return resolve();

  parseDealDocumentUpload(req, res, (err) => {
    if (err) return reject(err);
    resolve();
  });
});

const getUploadedFile = (req) => (
  req.file ||
  req.files?.file?.[0] ||
  req.files?.document?.[0] ||
  null
);

const sanitizeFileName = (fileName) => String(fileName || "document")
  .replace(/[\\/]/g, "-")
  .replace(/[^a-zA-Z0-9._-]/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 120) || "document";

const toDocumentResponse = (document) => ({
  id: document.id,
  dealId: document.deal_id,
  name: document.name,
  type: document.type,
  url: document.url,
  uploadedBy: document.uploaded_by,
  uploadedAt: document.uploaded_at,
});

export const getInventoryDealPaymentSchedule = async (req, res, next) => {
  const { dealId } = req.params;
  try {
    const schedule = await getScheduleByDealId(dealId);
    return res.json({
      success: true,
      message: "Payment schedule fetched successfully",
      data: schedule,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

export const getInventoryUnitPaymentSchedule = async (req, res, next) => {
  const { unitId } = req.params;
  try {
    const schedule = await getScheduleByInventoryUnitId(unitId);
    return res.json({
      success: true,
      message: "Payment schedule fetched successfully",
      data: schedule,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

export const getMyDeals = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const deals = await sql`
      SELECT 
        d.id, d.status, d.total_value, d.paid_so_far, d.current_stage_index,
        p.title as property_title, p.city, p.area
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      WHERE d.user_id = ${userId}
      ORDER BY d.created_at DESC
    `;
    const stats = deals.reduce((acc, deal) => {
      if (deal.status === 'active') acc.active += 1;
      if (deal.status === 'pending') acc.pending += 1;
      acc.totalValue += Number(deal.total_value);
      return acc;
    }, { active: 0, pending: 0, totalValue: 0 });

    res.json({ success: true, data: { stats, deals } });
  } catch (err) {
    next(err);
  }
};

export const getDealById = async (req, res, next) => {
  const { dealId } = req.params;
  const userId = req.user.id;
  try {
    const [deal] = await sql`
      SELECT d.*, p.title as property_title, p.city, p.area 
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      WHERE d.id = ${dealId} AND d.user_id = ${userId}
    `;
    if (!deal) return res.status(404).json({ success: false, message: "Deal not found" });
    const [timeline, payments, documents] = await Promise.all([
      sql`SELECT * FROM deal_timeline WHERE deal_id = ${dealId} ORDER BY created_at ASC`,
      sql`SELECT * FROM deal_payments WHERE deal_id = ${dealId} ORDER BY due_date ASC NULLS LAST`,
      sql`SELECT * FROM deal_documents WHERE deal_id = ${dealId} ORDER BY uploaded_at DESC`
    ]);
    res.json({ success: true, data: { ...deal, timeline, payments, documents } });
  } catch (err) {
    next(err);
  }
};

export const uploadUserDocument = async (req, res, next) => {
  const { dealId } = req.params;
  const userId = req.user.id;
  try {
    if (!UUID_REGEX.test(dealId)) {
      return res.status(400).json({ success: false, message: "Invalid deal id" });
    }

    await parseMultipartUpload(req, res);

    const name = String(req.body?.name || "").trim();
    const type = String(req.body?.type || "kyc").trim();
    const file = getUploadedFile(req);

    if (!name) return res.status(400).json({ success: false, message: "Document name required" });
    if (/[\\/]/.test(name) || /[\u0000-\u001f]/.test(name)) {
      return res.status(400).json({ success: false, message: "Invalid document name" });
    }
    if (!DOCUMENT_TYPE_REGEX.test(type)) {
      return res.status(400).json({ success: false, message: "Invalid document type" });
    }
    if (!file) return res.status(400).json({ success: false, message: "File upload is required" });

    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(403).json({ success: false, message: "Unauthorized" });

    const storagePath = await uploadToSupabase({
      file,
      folder: `deal-documents/${dealId}/${userId}`,
      fileName: `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.originalname)}`,
    });

    if (!storagePath) {
      return res.status(400).json({ success: false, message: "File upload is required" });
    }

    const [document] = await sql`
      INSERT INTO deal_documents (deal_id, name, type, url, uploaded_by, uploaded_at)
      VALUES (${dealId}, ${name}, ${type}, ${storagePath}, ${userId}, NOW())
      RETURNING *
    `;
    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: { document: toDocumentResponse(document) },
    });
  } catch (err) {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ success: false, message: "File too large" });
    }
    if (err.message === "Invalid file type") {
      return res.status(400).json({ success: false, message: "Unsupported document type" });
    }
    next(err);
  }
};

export const submitPaymentProof = async (req, res, next) => {
  const { dealId, paymentId } = req.params;
  const { transaction_id } = req.body;
  const userId = req.user.id;
  try {
    if (!transaction_id) {
      return res.status(400).json({ success: false, message: "Transaction ID is required" });
    }
    const [deal] = await sql`SELECT id FROM deals WHERE id = ${dealId} AND user_id = ${userId}`;
    if (!deal) return res.status(403).json({ success: false, message: "Unauthorized" });
    const [updatedPayment] = await sql`
      UPDATE deal_payments 
      SET status = 'pending_verification', transaction_id = ${transaction_id}
      WHERE id = ${paymentId} AND deal_id = ${dealId}
      RETURNING *
    `;
    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment milestone not found" });
    }
    res.json({ 
      success: true, 
      message: "Payment submitted for admin verification", 
      data: updatedPayment 
    });
  } catch (err) {
    next(err);
  }
};
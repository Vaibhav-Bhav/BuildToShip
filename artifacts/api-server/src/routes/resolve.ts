import { Router, type IRouter } from "express";
import multer from "multer";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import {
  db,
  usersTable,
  ordersTable,
  casesTable,
  caseEventsTable,
  messagesTable,
  attachmentsTable,
  type Case as DbCase,
  type Order as DbOrder,
} from "@workspace/db";
import {
  AddCaseMessageBody,
  AddCaseMessageParams,
  AddCaseMessageResponse,
  AssignCaseBody,
  AssignCaseParams,
  AssignCaseResponse,
  CreateCaseBody,
  CreateCaseResponse,
  GetAnalyticsSummaryResponse,
  GetCaseParams,
  GetCaseResponse,
  GetCasesQueryParams,
  GetCasesResponse,
  GetMyCasesResponse,
  GetMyOrdersResponse,
  GenerateReplyBody,
  GenerateReplyParams,
  GenerateReplyResponse,
  LoginResponse,
  OverrideCaseBody,
  OverrideCaseParams,
  OverrideCaseResponse,
  SendReplyBody,
  SendReplyParams,
  SendReplyResponse,
  UpdateCaseStatusBody,
  UpdateCaseStatusParams,
  UpdateCaseStatusResponse,
  UploadAttachmentBody,
  UploadAttachmentParams,
  UploadAttachmentResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { analyzeIssue, generateReply, generateResolutionPlan } from "../services/aiService";

const router: IRouter = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-")}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};
const bool = (value: number | null | undefined) => value === 1;
const idFrom = (value: string | string[] | undefined) => Number(Array.isArray(value) ? value[0] : value);
const userCanAccess = (req: Parameters<Parameters<typeof router.get>[1]>[0], userId: number) => req.user?.role === "agent" || req.user?.id === userId;

async function orderView(orderId: number | null): Promise<ReturnType<typeof toOrder> | null> {
  if (!orderId) return null;
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  return order ? toOrder(order) : null;
}
function toOrder(order: DbOrder) {
  return { id: order.id, order_code: order.orderCode, user_id: order.userId, product_name: order.productName, price: order.price, order_date: order.orderDate, delivery_date: order.deliveryDate, status: order.status };
}
function toCase(row: DbCase, order: ReturnType<typeof toOrder> | null, customerName: string | null) {
  return {
    id: row.id,
    case_code: row.caseCode,
    user_id: row.userId,
    order_id: row.orderId,
    status: row.status,
    category: row.category,
    priority: row.priority,
    sentiment: row.sentiment,
    customer_intent: row.customerIntent,
    summary: row.summary,
    recommended_action: row.recommendedAction,
    next_step: row.nextStep,
    escalation_required: bool(row.escalationRequired),
    escalation_reason: row.escalationReason,
    missing_information: parseJson<string[]>(row.missingInformation, []),
    resolution_plan: parseJson<string[]>(row.resolutionPlan, []),
    assigned_agent_id: row.assignedAgentId,
    ai_failed: bool(row.aiFailed),
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    due_at: row.dueAt,
    customer_name: customerName,
    order,
  };
}
async function caseView(row: DbCase) {
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, row.userId));
  return toCase(row, await orderView(row.orderId), customer?.name ?? null);
}
async function detailView(row: DbCase) {
  const base = await caseView(row);
  const timelineRows = await db.select().from(caseEventsTable).where(eq(caseEventsTable.caseId, row.id)).orderBy(caseEventsTable.createdAt);
  const messageRows = await db.select().from(messagesTable).where(eq(messagesTable.caseId, row.id)).orderBy(messagesTable.createdAt);
  const attachmentRows = await db.select().from(attachmentsTable).where(eq(attachmentsTable.caseId, row.id)).orderBy(attachmentsTable.uploadedAt);
  return {
    ...base,
    timeline: timelineRows.map((event) => ({ id: event.id, case_id: event.caseId, event_type: event.eventType, description: event.description, actor_type: event.actorType, created_at: event.createdAt, metadata: parseJson<Record<string, unknown>>(event.metadata, {}) })),
    messages: messageRows.map((message) => ({ id: message.id, case_id: message.caseId, sender_type: message.senderType, body: message.body, created_at: message.createdAt })),
    attachments: attachmentRows.map((attachment) => ({ id: attachment.id, case_id: attachment.caseId, file_name: attachment.fileName, file_path: attachment.filePath, uploaded_at: attachment.uploadedAt })),
  };
}
async function findCase(id: number) {
  const [row] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  return row;
}
async function addEvent(caseId: number, eventType: string, description: string, actorType: string, actorId?: number, metadata: Record<string, unknown> = {}) {
  await db.insert(caseEventsTable).values({ caseId, eventType, description, actorType, actorId, metadata: JSON.stringify(metadata), createdAt: new Date().toISOString() });
}

router.get("/orders/mine", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.user!.id));
  res.json(GetMyOrdersResponse.parse(rows.map(toOrder)));
});

router.get("/cases/mine", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const rows = await db.select().from(casesTable).where(eq(casesTable.userId, req.user!.id)).orderBy(desc(casesTable.updatedAt));
  const response = await Promise.all(rows.map(caseView));
  res.json(GetMyCasesResponse.parse(response));
});

router.get("/cases", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const parsed = GetCasesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const filters = [];
  if (parsed.data.status) filters.push(eq(casesTable.status, parsed.data.status));
  if (parsed.data.priority) filters.push(eq(casesTable.priority, parsed.data.priority));
  if (parsed.data.category) filters.push(eq(casesTable.category, parsed.data.category));
  if (parsed.data.escalated !== undefined) filters.push(eq(casesTable.escalationRequired, parsed.data.escalated ? 1 : 0));
  const rows = await db.select().from(casesTable).where(filters.length ? and(...filters) : undefined).orderBy(desc(casesTable.updatedAt));
  const response = await Promise.all(rows.map(caseView));
  res.json(GetCasesResponse.parse(response));
});

router.post("/cases", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let order: DbOrder | null = null;
  if (parsed.data.order_id) {
    const [selected] = await db.select().from(ordersTable).where(and(eq(ordersTable.id, parsed.data.order_id), eq(ordersTable.userId, req.user!.id)));
    if (!selected) {
      res.status(400).json({ error: "That order is not available on your account" });
      return;
    }
    order = selected;
  }
  const historyRows = await db.select().from(casesTable).where(eq(casesTable.userId, req.user!.id)).orderBy(desc(casesTable.createdAt));
  const history = historyRows.slice(0, 8).map((item) => `${item.caseCode}: ${item.category} / ${item.status} / ${item.summary}`).join("\n");
  const { analysis, failed } = await analyzeIssue(parsed.data.message, order, history);
  const now = new Date().toISOString();
  const dueAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const customerCases30 = historyRows.filter((item) => Date.now() - new Date(item.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000).length;
  const sameOrderOpen = order ? historyRows.find((item) => item.orderId === order.id && !["Resolved", "Rejected"].includes(item.status) && Date.now() - new Date(item.createdAt).getTime() > 24 * 60 * 60 * 1000) : undefined;
  const reasons = [];
  if (sameOrderOpen) reasons.push("Customer contacted us more than 1 day ago with no agent reply.");
  if (["Frustrated", "Angry"].includes(analysis.sentiment)) reasons.push(`Customer sentiment is ${analysis.sentiment.toLowerCase()}.`);
  if (customerCases30 >= 3) reasons.push("Customer has contacted support 3 or more times in the last 30 days.");
  if (order && order.price > 50000) reasons.push("Order value is above the high-value review limit.");
  if (analysis.escalation_required) reasons.push("AI flagged this case for escalation.");
  const escalationReason = reasons[0] ?? null;
  const [created] = await db.insert(casesTable).values({
    caseCode: `RF${String(Date.now()).slice(-4)}`,
    userId: req.user!.id,
    orderId: order?.id ?? null,
    status: "New",
    category: analysis.issue_category,
    priority: analysis.priority,
    sentiment: analysis.sentiment,
    customerIntent: analysis.customer_intent,
    summary: analysis.summary,
    recommendedAction: analysis.recommended_action,
    nextStep: analysis.next_step,
    escalationRequired: escalationReason ? 1 : 0,
    escalationReason,
    missingInformation: JSON.stringify(analysis.missing_information),
    resolutionPlan: "[]",
    assignedAgentId: null,
    aiFailed: failed ? 1 : 0,
    createdAt: now,
    updatedAt: now,
    dueAt,
  }).returning();
  await db.insert(messagesTable).values({ caseId: created.id, senderType: "customer", body: parsed.data.message, createdAt: now });
  await addEvent(created.id, "CASE_CREATED", "Case created from customer message", "customer", req.user!.id);
  if (failed) await addEvent(created.id, "AI_CLASSIFIED", "AI analysis was unavailable; needs manual review", "system", undefined, { ai_failed: true });
  else await addEvent(created.id, "AI_CLASSIFIED", `AI suggested ${analysis.issue_category} with ${analysis.priority} priority`, "ai");
  if (escalationReason) await addEvent(created.id, "ESCALATED", escalationReason, "system", undefined, { reasons });
  const plan = await generateResolutionPlan(created);
  await db.update(casesTable).set({ resolutionPlan: JSON.stringify(plan), updatedAt: new Date().toISOString() }).where(eq(casesTable.id, created.id));
  const finalRow = await findCase(created.id);
  res.status(201).json(CreateCaseResponse.parse(await detailView(finalRow!)));
});

router.get("/cases/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetCaseParams.safeParse({ id: idFrom(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  if (!userCanAccess(req, row.userId)) {
    res.status(403).json({ error: "You can only access your own cases" });
    return;
  }
  res.json(GetCaseResponse.parse(await detailView(row)));
});

router.post("/cases/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const params = AddCaseMessageParams.safeParse({ id: idFrom(req.params.id) });
  const body = AddCaseMessageBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) { res.status(404).json({ error: "Case not found" }); return; }
  if (!userCanAccess(req, row.userId)) { res.status(403).json({ error: "You can only access your own cases" }); return; }
  const senderType = req.user!.role === "agent" ? "agent" : "customer";
  const now = new Date().toISOString();
  const [message] = await db.insert(messagesTable).values({ caseId: row.id, senderType, body: body.data.body, createdAt: now }).returning();
  await db.update(casesTable).set({ updatedAt: now }).where(eq(casesTable.id, row.id));
  await addEvent(row.id, senderType === "agent" ? "AGENT_REVIEW" : "EVIDENCE_SUBMITTED", senderType === "agent" ? "Agent added a review note" : "Customer added a message", senderType, req.user!.id);
  res.status(201).json(AddCaseMessageResponse.parse({ id: message.id, case_id: message.caseId, sender_type: message.senderType, body: message.body, created_at: message.createdAt }));
});

router.post("/cases/:id/attachments", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  const params = UploadAttachmentParams.safeParse({ id: idFrom(req.params.id) });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const row = await findCase(params.data.id);
  if (!row) { res.status(404).json({ error: "Case not found" }); return; }
  if (!userCanAccess(req, row.userId)) { res.status(403).json({ error: "You can only access your own cases" }); return; }
  const file = req.file;
  const body = UploadAttachmentBody.safeParse(req.body);
  if (!file && !body.success) { res.status(400).json({ error: "An image is required" }); return; }
  const fileName = file?.originalname ?? (body.success ? body.data.file_name : "evidence.jpg");
  const filePath = file ? `/uploads/${file.filename}` : `data:image/*;base64,${body.success ? body.data.file_data : ""}`;
  const now = new Date().toISOString();
  const [attachment] = await db.insert(attachmentsTable).values({ caseId: row.id, fileName, filePath, uploadedAt: now }).returning();
  await addEvent(row.id, "EVIDENCE_SUBMITTED", `Evidence uploaded: ${fileName}`, req.user!.role, req.user!.id);
  res.status(201).json(UploadAttachmentResponse.parse({ id: attachment.id, case_id: attachment.caseId, file_name: attachment.fileName, file_path: attachment.filePath, uploaded_at: attachment.uploadedAt }));
});

router.post("/cases/:id/generate-reply", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = GenerateReplyParams.safeParse({ id: idFrom(req.params.id) });
  const body = GenerateReplyBody.safeParse(req.body ?? {});
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const row = await findCase(params.data.id);
  if (!row) { res.status(404).json({ error: "Case not found" }); return; }
  const detail = await detailView(row);
  const draft = await generateReply(row, detail.timeline.map((event) => event.description), body.data.tone);
  res.json(GenerateReplyResponse.parse({ draft }));
});

router.post("/cases/:id/send-reply", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = SendReplyParams.safeParse({ id: idFrom(req.params.id) });
  const body = SendReplyBody.safeParse(req.body);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const row = await findCase(params.data.id);
  if (!row) { res.status(404).json({ error: "Case not found" }); return; }
  const now = new Date().toISOString();
  const [message] = await db.insert(messagesTable).values({ caseId: row.id, senderType: "agent", body: body.data.body, createdAt: now }).returning();
  await db.update(casesTable).set({ status: "Awaiting Customer", updatedAt: now }).where(eq(casesTable.id, row.id));
  await addEvent(row.id, "REPLY_SENT", "Agent sent a reply", "agent", req.user!.id);
  res.status(201).json(SendReplyResponse.parse({ id: message.id, case_id: message.caseId, sender_type: message.senderType, body: message.body, created_at: message.createdAt }));
});

router.patch("/cases/:id/status", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = UpdateCaseStatusParams.safeParse({ id: idFrom(req.params.id) });
  const body = UpdateCaseStatusBody.safeParse(req.body);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const row = await findCase(params.data.id);
  if (!row) { res.status(404).json({ error: "Case not found" }); return; }
  const now = new Date().toISOString();
  const [updated] = await db.update(casesTable).set({ status: body.data.status, updatedAt: now }).where(eq(casesTable.id, row.id)).returning();
  await addEvent(row.id, body.data.status === "Resolved" ? "RESOLVED" : "STATUS_CHANGED", `Status changed to ${body.data.status}`, "agent", req.user!.id, { old: row.status, new: body.data.status });
  res.json(UpdateCaseStatusResponse.parse(await caseView(updated)));
});

router.patch("/cases/:id/override", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = OverrideCaseParams.safeParse({ id: idFrom(req.params.id) });
  const body = OverrideCaseBody.safeParse(req.body);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const row = await findCase(params.data.id);
  if (!row) { res.status(404).json({ error: "Case not found" }); return; }
  const fields: Record<string, keyof DbCase> = { category: "category", priority: "priority", sentiment: "sentiment", customer_intent: "customerIntent", summary: "summary", recommended_action: "recommendedAction", next_step: "nextStep" };
  const column = fields[body.data.field];
  if (!column) { res.status(400).json({ error: "That field cannot be overridden" }); return; }
  const oldValue = String(row[column] ?? "");
  const [updated] = await db.update(casesTable).set({ [column]: body.data.value, updatedAt: new Date().toISOString() }).where(eq(casesTable.id, row.id)).returning();
  await addEvent(row.id, "AI_OVERRIDDEN", `Agent changed ${body.data.field}`, "agent", req.user!.id, { field: body.data.field, old: oldValue, new: body.data.value });
  res.json(OverrideCaseResponse.parse(await caseView(updated)));
});

router.post("/cases/:id/assign", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = AssignCaseParams.safeParse({ id: idFrom(req.params.id) });
  const body = AssignCaseBody.safeParse(req.body);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }
  const [agent] = await db.select().from(usersTable).where(and(eq(usersTable.id, body.data.agent_id), eq(usersTable.role, "agent")));
  const row = await findCase(params.data.id);
  if (!agent || !row) { res.status(404).json({ error: "Agent or case not found" }); return; }
  const [updated] = await db.update(casesTable).set({ assignedAgentId: agent.id, updatedAt: new Date().toISOString() }).where(eq(casesTable.id, row.id)).returning();
  await addEvent(row.id, "AGENT_ASSIGNED", `Assigned to ${agent.name}`, "agent", req.user!.id);
  res.json(AssignCaseResponse.parse(await caseView(updated)));
});

router.get("/analytics/summary", requireAuth, requireRole("agent"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(casesTable);
  const today = new Date().toISOString().slice(0, 10);
  const open = rows.filter((row) => !["Resolved", "Rejected"].includes(row.status));
  const byCategory = new Map<string, number>();
  const byStatus = new Map<string, number>();
  const perDay = new Map<string, number>();
  for (const row of rows) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1);
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
    const day = row.createdAt.slice(5, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  const uniqueUsers = new Set(rows.map((row) => row.userId));
  const repeatUsers = [...uniqueUsers].filter((userId) => rows.filter((row) => row.userId === userId).length > 1).length;
  const toPoints = (map: Map<string, number>) => [...map.entries()].map(([label, value]) => ({ label, value }));
  const response = { open_cases: open.length, high_priority: rows.filter((row) => ["High", "Critical"].includes(row.priority) && !["Resolved", "Rejected"].includes(row.status)).length, at_risk: rows.filter((row) => bool(row.escalationRequired)).length, resolved_today: rows.filter((row) => row.status === "Resolved" && row.updatedAt.slice(0, 10) === today).length, repeat_contact_rate: uniqueUsers.size ? Math.round((repeatUsers / uniqueUsers.size) * 100) : 0, by_category: toPoints(byCategory), by_status: toPoints(byStatus), per_day: toPoints(perDay) };
  res.json(GetAnalyticsSummaryResponse.parse(response));
});

export default router;

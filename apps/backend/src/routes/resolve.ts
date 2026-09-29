import { Router, type IRouter } from "express";
import multer from "multer";
import { and, desc, asc, eq, sql, inArray } from "drizzle-orm";
import {
  db,
  usersTable,
  ordersTable,
  casesTable,
  caseEventsTable,
  messagesTable,
  attachmentsTable,
  promisesTable,
  type Case as DbCase,
  type Order as DbOrder,
  type PromiseItem as DbPromise,
} from "@workspace/db";
import {
  AddCaseMessageBody,
  AddCaseMessageParams,
  AddCaseMessageResponse,
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
  OverrideCaseBody,
  OverrideCaseParams,
  OverrideCaseResponse,
  SendReplyBody,
  SendReplyParams,
  SendReplyResponse,
  UpdateCaseStatusBody,
  UpdateCaseStatusParams,
  UpdateCaseStatusResponse,
  GetAttachmentUrlResponse,
  UploadAttachmentBody,
  UploadAttachmentParams,
  UploadAttachmentResponse,
  ArchiveCaseParams,
  ArchiveCaseResponse,
  GenerateResolutionPlanParams,
  GenerateResolutionPlanResponse,
  GetCasePromisesParams,
  GetCasePromisesResponse,
  UpdateCasePromiseParams,
  UpdateCasePromiseBody,
  UpdateCasePromiseResponse,
  UpdatePromiseStatusParams,
  UpdatePromiseStatusBody,
  UpdatePromiseStatusResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/auth";
import { analyzeIssue, generateReply, generateResolutionPlan } from "../services/aiService";
import { uploadEvidenceFile, createAttachmentSignedUrl } from "../lib/storage";

const router: IRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are permitted"));
    }
  },
});

const parseJson = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};
const bool = (value: number | boolean | null | undefined) => value === 1 || value === true;
const idFrom = (value: string | string[] | undefined) => Number(Array.isArray(value) ? value[0] : value);
const userCanAccess = (req: Parameters<Parameters<typeof router.get>[1]>[0], userId: number) =>
  req.user?.role === "agent" || req.user?.id === userId;

async function orderView(orderId: number | null): Promise<ReturnType<typeof toOrder> | null> {
  if (!orderId) return null;
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  return order ? toOrder(order) : null;
}

function toOrder(order: DbOrder) {
  return {
    id: order.id,
    order_code: order.orderCode,
    user_id: order.userId,
    product_name: order.productName,
    price: order.price,
    order_date: order.orderDate,
    delivery_date: order.deliveryDate,
    status: order.status,
  };
}

function toPromiseItem(p: DbPromise) {
  return {
    id: p.id,
    case_id: p.caseId,
    text: p.text,
    due_at: p.dueAt,
    status: p.status as "pending" | "kept" | "broken",
    created_at: p.createdAt,
  };
}

function toCustomerCase(row: DbCase, order: ReturnType<typeof toOrder> | null) {
  return {
    id: row.id,
    case_code: row.caseCode,
    status: row.status,
    category: row.category,
    summary: row.summary,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    due_at: row.dueAt,
    order_id: row.orderId,
    order,
  };
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
    ai_source: (row.aiSource ?? "fallback") as "groq" | "fallback",
    archived: Boolean(row.archived),
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

async function customerDetailView(row: DbCase) {
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, row.userId));
  const order = await orderView(row.orderId);
  const timelineRows = await db
    .select()
    .from(caseEventsTable)
    .where(and(eq(caseEventsTable.caseId, row.id), eq(caseEventsTable.visibleToCustomer, true)))
    .orderBy(caseEventsTable.createdAt);
  const messageRows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.caseId, row.id))
    .orderBy(messagesTable.createdAt);
  const attachmentRows = await db
    .select()
    .from(attachmentsTable)
    .where(eq(attachmentsTable.caseId, row.id))
    .orderBy(attachmentsTable.uploadedAt);
  const promiseRows = await db
    .select()
    .from(promisesTable)
    .where(eq(promisesTable.caseId, row.id))
    .orderBy(promisesTable.createdAt);

  return {
    id: row.id,
    case_code: row.caseCode,
    user_id: row.userId,
    order_id: row.orderId,
    status: row.status,
    category: row.category,
    summary: row.summary,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    due_at: row.dueAt,
    customer_name: customer?.name ?? null,
    order,
    timeline: timelineRows.map((event) => ({
      id: event.id,
      case_id: event.caseId,
      event_type: event.eventType,
      description: event.description,
      actor_type: event.actorType,
      actor_id: event.actorId,
      created_at: event.createdAt,
      metadata: parseJson<Record<string, unknown>>(event.metadata, {}),
      visible_to_customer: true,
    })),
    messages: messageRows.map((message) => ({
      id: message.id,
      case_id: message.caseId,
      sender_type: message.senderType as "customer" | "agent",
      body: message.body,
      created_at: message.createdAt,
    })),
    attachments: attachmentRows.map((attachment) => ({
      id: attachment.id,
      case_id: attachment.caseId,
      file_name: attachment.fileName,
      file_path: attachment.filePath,
      storage_path: attachment.storagePath ?? undefined,
      mime_type: attachment.mimeType ?? undefined,
      size_bytes: attachment.sizeBytes ?? undefined,
      uploaded_at: attachment.uploadedAt,
    })),
    promises: promiseRows.map(toPromiseItem),
  };
}

async function agentDetailView(row: DbCase) {
  const base = await caseView(row);
  const timelineRows = await db
    .select()
    .from(caseEventsTable)
    .where(eq(caseEventsTable.caseId, row.id))
    .orderBy(caseEventsTable.createdAt);
  const messageRows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.caseId, row.id))
    .orderBy(messagesTable.createdAt);
  const attachmentRows = await db
    .select()
    .from(attachmentsTable)
    .where(eq(attachmentsTable.caseId, row.id))
    .orderBy(attachmentsTable.uploadedAt);
  const promiseRows = await db
    .select()
    .from(promisesTable)
    .where(eq(promisesTable.caseId, row.id))
    .orderBy(promisesTable.createdAt);

  return {
    ...base,
    timeline: timelineRows.map((event) => ({
      id: event.id,
      case_id: event.caseId,
      event_type: event.eventType,
      description: event.description,
      actor_type: event.actorType,
      actor_id: event.actorId,
      created_at: event.createdAt,
      metadata: parseJson<Record<string, unknown>>(event.metadata, {}),
      visible_to_customer: Boolean(event.visibleToCustomer),
    })),
    messages: messageRows.map((message) => ({
      id: message.id,
      case_id: message.caseId,
      sender_type: message.senderType as "customer" | "agent",
      body: message.body,
      created_at: message.createdAt,
    })),
    attachments: attachmentRows.map((attachment) => ({
      id: attachment.id,
      case_id: attachment.caseId,
      file_name: attachment.fileName,
      file_path: attachment.filePath,
      storage_path: attachment.storagePath ?? undefined,
      mime_type: attachment.mimeType ?? undefined,
      size_bytes: attachment.sizeBytes ?? undefined,
      uploaded_at: attachment.uploadedAt,
    })),
    promises: promiseRows.map(toPromiseItem),
  };
}

async function findCase(id: number) {
  const [row] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  return row;
}

async function addEvent(
  caseId: number,
  eventType: string,
  description: string,
  actorType: string,
  actorId?: number,
  metadata: Record<string, unknown> = {},
  visibleToCustomer: boolean = false
) {
  await db.insert(caseEventsTable).values({
    caseId,
    eventType,
    description,
    actorType,
    actorId,
    metadata: JSON.stringify(metadata),
    visibleToCustomer,
    createdAt: new Date().toISOString(),
  });
}

// GET /orders/mine
router.get("/orders/mine", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, req.user!.id));
  res.json(GetMyOrdersResponse.parse(rows.map(toOrder)));
});

// GET /cases/mine (customer-safe fields only)
router.get("/cases/mine", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.userId, req.user!.id))
    .orderBy(desc(casesTable.updatedAt));
  const response = await Promise.all(rows.map(async (row) => toCustomerCase(row, await orderView(row.orderId))));
  res.json(GetMyCasesResponse.parse(response));
});

// GET /cases (agent query with search, filters, pagination, sort)
router.get("/cases", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const parsed = GetCasesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    search,
    status,
    priority,
    category,
    escalated,
    includeArchived,
    sort,
    page = 1,
    limit = 20,
  } = parsed.data;

  const filters = [];

  if (status) filters.push(eq(casesTable.status, status));
  if (priority) filters.push(eq(casesTable.priority, priority));
  if (category) filters.push(eq(casesTable.category, category));
  if (escalated !== undefined) {
    filters.push(eq(casesTable.escalationRequired, escalated ? 1 : 0));
  }
  if (!includeArchived) {
    filters.push(eq(casesTable.archived, false));
  }

  // Handle search by matching caseCode, summary, or user name
  if (search && search.trim().length > 0) {
    const q = `%${search.trim().toLowerCase()}%`;
    const matchingUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(sql`LOWER(${usersTable.name}) LIKE ${q} OR LOWER(${usersTable.email}) LIKE ${q}`);
    const userIds = matchingUsers.map((u) => u.id);

    if (userIds.length > 0) {
      filters.push(
        sql`(LOWER(${casesTable.caseCode}) LIKE ${q} OR LOWER(${casesTable.summary}) LIKE ${q} OR ${inArray(casesTable.userId, userIds)})`
      );
    } else {
      filters.push(
        sql`(LOWER(${casesTable.caseCode}) LIKE ${q} OR LOWER(${casesTable.summary}) LIKE ${q})`
      );
    }
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  // Sorting
  let orderByClause;
  if (sort === "newest") {
    orderByClause = desc(casesTable.createdAt);
  } else if (sort === "oldest") {
    orderByClause = asc(casesTable.createdAt);
  } else if (sort === "priority") {
    orderByClause = sql`CASE ${casesTable.priority}
      WHEN 'Critical' THEN 1
      WHEN 'High' THEN 2
      WHEN 'Medium' THEN 3
      ELSE 4 END ASC`;
  } else if (sort === "due_soonest") {
    orderByClause = asc(casesTable.dueAt);
  } else {
    orderByClause = desc(casesTable.updatedAt);
  }

  const allFiltered = await db
    .select()
    .from(casesTable)
    .where(whereClause)
    .orderBy(orderByClause);

  const total = allFiltered.length;
  const offset = (page - 1) * limit;
  const pagedRows = allFiltered.slice(offset, offset + limit);
  const responseCases = await Promise.all(pagedRows.map(caseView));

  res.json(
    GetCasesResponse.parse({
      cases: responseCases,
      total,
      page,
      limit,
    })
  );
});

// POST /cases (customer create issue)
router.post("/cases", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let order: DbOrder | null = null;
  if (parsed.data.order_id) {
    const [selected] = await db
      .select()
      .from(ordersTable)
      .where(and(eq(ordersTable.id, parsed.data.order_id), eq(ordersTable.userId, req.user!.id)));
    if (!selected) {
      res.status(400).json({ error: "That order is not available on your account" });
      return;
    }
    order = selected;
  }
  const historyRows = await db
    .select()
    .from(casesTable)
    .where(eq(casesTable.userId, req.user!.id))
    .orderBy(desc(casesTable.createdAt));
  const history = historyRows
    .slice(0, 8)
    .map((item) => `${item.caseCode}: ${item.category} / ${item.status} / ${item.summary}`)
    .join("\n");
  const { analysis, failed } = await analyzeIssue(parsed.data.message, order, history);
  const now = new Date().toISOString();
  const dueAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const customerCases30 = historyRows.filter(
    (item) => Date.now() - new Date(item.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
  ).length;
  const sameOrderOpen = order
    ? historyRows.find(
        (item) =>
          item.orderId === order.id &&
          !["Resolved", "Rejected"].includes(item.status) &&
          Date.now() - new Date(item.createdAt).getTime() > 24 * 60 * 60 * 1000
      )
    : undefined;
  const reasons: string[] = [];
  if (sameOrderOpen) reasons.push("Customer contacted us more than 1 day ago with no agent reply.");
  if (["Frustrated", "Angry"].includes(analysis.sentiment))
    reasons.push(`Customer sentiment is ${analysis.sentiment.toLowerCase()}.`);
  if (customerCases30 >= 3) reasons.push("Customer has contacted support 3 or more times in the last 30 days.");
  if (order && order.price > 50000) reasons.push("Order value is above the high-value review limit.");
  if (analysis.escalation_required) reasons.push("AI flagged this case for escalation.");
  const escalationReason = reasons[0] ?? null;

  const [created] = await db
    .insert(casesTable)
    .values({
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
      aiSource: failed ? "fallback" : "groq",
      archived: false,
      createdAt: now,
      updatedAt: now,
      dueAt,
    })
    .returning();

  await db.insert(messagesTable).values({
    caseId: created.id,
    senderType: "customer",
    body: parsed.data.message,
    createdAt: now,
  });

  // CASE_CREATED is visible to customer
  await addEvent(
    created.id,
    "CASE_CREATED",
    "Case created from customer message",
    "customer",
    req.user!.id,
    {},
    true
  );

  // Internal AI and escalation events are NOT visible to customer
  if (failed) {
    await addEvent(
      created.id,
      "AI_CLASSIFIED",
      "AI analysis was unavailable; needs manual review",
      "system",
      undefined,
      { ai_failed: true },
      false
    );
  } else {
    await addEvent(
      created.id,
      "AI_CLASSIFIED",
      `AI suggested ${analysis.issue_category} with ${analysis.priority} priority`,
      "ai",
      undefined,
      {},
      false
    );
  }

  if (escalationReason) {
    await addEvent(
      created.id,
      "ESCALATED",
      escalationReason,
      "system",
      undefined,
      { reasons },
      false
    );
  }

  const plan = await generateResolutionPlan(created);
  await db
    .update(casesTable)
    .set({ resolutionPlan: JSON.stringify(plan), updatedAt: new Date().toISOString() })
    .where(eq(casesTable.id, created.id));

  const finalRow = await findCase(created.id);
  const detail = await customerDetailView(finalRow!);
  res.status(201).json(CreateCaseResponse.parse(detail));
});

// GET /cases/:id (customer gets safe view, agent gets full workspace view)
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

  if (req.user!.role === "agent") {
    const detail = await agentDetailView(row);
    res.json(GetCaseResponse.parse(detail));
  } else {
    const safeDetail = await customerDetailView(row);
    res.json(GetCaseResponse.parse(safeDetail));
  }
});

// POST /cases/:id/messages
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
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  if (!userCanAccess(req, row.userId)) {
    res.status(403).json({ error: "You can only access your own cases" });
    return;
  }
  const senderType = req.user!.role === "agent" ? "agent" : "customer";
  const now = new Date().toISOString();
  const [message] = await db
    .insert(messagesTable)
    .values({ caseId: row.id, senderType, body: body.data.body, createdAt: now })
    .returning();
  await db.update(casesTable).set({ updatedAt: now }).where(eq(casesTable.id, row.id));

  await addEvent(
    row.id,
    senderType === "agent" ? "AGENT_REVIEW" : "EVIDENCE_SUBMITTED",
    senderType === "agent" ? "Agent added a review note" : "Customer added a message",
    senderType,
    req.user!.id,
    {},
    true
  );

  res.status(201).json(
    AddCaseMessageResponse.parse({
      id: message.id,
      case_id: message.caseId,
      sender_type: message.senderType,
      body: message.body,
      created_at: message.createdAt,
    })
  );
});

// POST /cases/:id/attachments
router.post("/cases/:id/attachments", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  const params = UploadAttachmentParams.safeParse({ id: idFrom(req.params.id) });
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

  const file = req.file;
  const body = UploadAttachmentBody.safeParse(req.body);
  if (!file && !body.success) {
    res.status(400).json({ error: "An image is required" });
    return;
  }

  const fileName = file?.originalname ?? (body.success ? body.data.file_name : "evidence.jpg");
  const buffer = file?.buffer ?? (body.success ? Buffer.from(body.data.file_data, "base64") : Buffer.alloc(0));

  try {
    const { storagePath, mimeType, sizeBytes } = await uploadEvidenceFile(row.id, buffer, fileName);
    const now = new Date().toISOString();
    const [attachment] = await db
      .insert(attachmentsTable)
      .values({
        caseId: row.id,
        fileName,
        filePath: storagePath,
        storagePath,
        mimeType,
        sizeBytes,
        uploadedAt: now,
      })
      .returning();

    await addEvent(
      row.id,
      "EVIDENCE_SUBMITTED",
      `Evidence uploaded: ${fileName}`,
      req.user!.role,
      req.user!.id,
      {},
      true
    );

    res.status(201).json(
      UploadAttachmentResponse.parse({
        id: attachment.id,
        case_id: attachment.caseId,
        file_name: attachment.fileName,
        file_path: attachment.filePath,
        storage_path: attachment.storagePath ?? undefined,
        mime_type: attachment.mimeType ?? undefined,
        size_bytes: attachment.sizeBytes ?? undefined,
        uploaded_at: attachment.uploadedAt,
      })
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    res.status(400).json({ error: message });
  }
});

// GET /attachments/:id/url
router.get("/attachments/:id/url", requireAuth, async (req, res): Promise<void> => {
  const attachmentId = idFrom(req.params.id);
  if (Number.isNaN(attachmentId) || attachmentId <= 0) {
    res.status(400).json({ error: "Invalid attachment id" });
    return;
  }

  const [attachment] = await db
    .select()
    .from(attachmentsTable)
    .where(eq(attachmentsTable.id, attachmentId));

  if (!attachment) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }

  const caseRow = await findCase(attachment.caseId);
  if (!caseRow) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  if (!userCanAccess(req, caseRow.userId)) {
    res.status(403).json({ error: "You do not have permission to view this attachment" });
    return;
  }

  try {
    const targetPath = attachment.storagePath || attachment.filePath;
    const signedData = await createAttachmentSignedUrl(targetPath, 60);
    res.json(GetAttachmentUrlResponse.parse(signedData));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate signed URL";
    res.status(500).json({ error: message });
  }
});

// POST /cases/:id/generate-reply -> { draft, policy_cited, warnings[] }
router.post("/cases/:id/generate-reply", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = GenerateReplyParams.safeParse({ id: idFrom(req.params.id) });
  const body = GenerateReplyBody.safeParse(req.body ?? {});
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const detail = await agentDetailView(row);
  const draft = await generateReply(
    row,
    detail.timeline.map((event) => event.description),
    body.data.tone
  );

  const warnings: string[] = [];
  if (row.escalationRequired) {
    warnings.push("Case is flagged for escalation; confirm resolution terms with supervisor.");
  }
  if (["Angry", "Frustrated"].includes(row.sentiment)) {
    warnings.push("Customer has expressed high frustration; keep tone empathetic and de-escalating.");
  }
  if (row.orderId) {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, row.orderId));
    if (order && order.price > 50000) {
      warnings.push("High-value item ($500+). Ensure proof of dispatch or return receipt is documented.");
    }
  }

  const policyCited = row.category === "Damaged Product"
    ? "Warranty & Transit Damage Policy §3.2"
    : row.category === "Refund" || row.category === "Return"
    ? "Standard 30-Day Return & Reimbursement Guideline §4.1"
    : "ResolveAI Customer Satisfaction Policy §2.0";

  res.json(
    GenerateReplyResponse.parse({
      draft,
      policy_cited: policyCited,
      warnings,
    })
  );
});

// POST /cases/:id/send-reply
router.post("/cases/:id/send-reply", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = SendReplyParams.safeParse({ id: idFrom(req.params.id) });
  const body = SendReplyBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const now = new Date().toISOString();
  const [message] = await db
    .insert(messagesTable)
    .values({ caseId: row.id, senderType: "agent", body: body.data.body, createdAt: now })
    .returning();

  await db
    .update(casesTable)
    .set({ status: "Awaiting Customer", updatedAt: now })
    .where(eq(casesTable.id, row.id));

  await addEvent(
    row.id,
    "REPLY_SENT",
    "Agent sent a reply to customer",
    "agent",
    req.user!.id,
    {},
    true
  );

  res.status(201).json(
    SendReplyResponse.parse({
      id: message.id,
      case_id: message.caseId,
      sender_type: message.senderType,
      body: message.body,
      created_at: message.createdAt,
    })
  );
});

// POST /cases/:id/resolution-plan
router.post("/cases/:id/resolution-plan", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = GenerateResolutionPlanParams.safeParse({ id: idFrom(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const plan = await generateResolutionPlan(row);
  const now = new Date().toISOString();
  await db
    .update(casesTable)
    .set({ resolutionPlan: JSON.stringify(plan), updatedAt: now })
    .where(eq(casesTable.id, row.id));

  await addEvent(
    row.id,
    "PLAN_GENERATED",
    `AI generated ${plan.length}-step resolution plan`,
    "ai",
    undefined,
    { steps_count: plan.length },
    false
  );

  res.json(GenerateResolutionPlanResponse.parse({ plan }));
});

// PATCH /cases/:id/status
router.patch("/cases/:id/status", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = UpdateCaseStatusParams.safeParse({ id: idFrom(req.params.id) });
  const body = UpdateCaseStatusBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  const now = new Date().toISOString();
  const [updated] = await db
    .update(casesTable)
    .set({ status: body.data.status, updatedAt: now })
    .where(eq(casesTable.id, row.id))
    .returning();

  await addEvent(
    row.id,
    body.data.status === "Resolved" ? "RESOLVED" : "STATUS_CHANGED",
    `Status changed to ${body.data.status}`,
    "agent",
    req.user!.id,
    { old: row.status, new: body.data.status },
    true
  );

  res.json(UpdateCaseStatusResponse.parse(await caseView(updated)));
});

// PATCH /cases/:id/override (field, value, reason)
router.patch("/cases/:id/override", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = OverrideCaseParams.safeParse({ id: idFrom(req.params.id) });
  const body = OverrideCaseBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const fields: Record<string, keyof DbCase> = {
    category: "category",
    priority: "priority",
    sentiment: "sentiment",
    customer_intent: "customerIntent",
    summary: "summary",
    recommended_action: "recommendedAction",
    next_step: "nextStep",
  };

  const column = fields[body.data.field];
  if (!column) {
    res.status(400).json({ error: "That field cannot be overridden" });
    return;
  }

  const oldValue = String(row[column] ?? "");
  const [updated] = await db
    .update(casesTable)
    .set({ [column]: body.data.value, updatedAt: new Date().toISOString() })
    .where(eq(casesTable.id, row.id))
    .returning();

  await addEvent(
    row.id,
    "AI_OVERRIDDEN",
    `Agent changed ${body.data.field}: ${body.data.reason}`,
    "agent",
    req.user!.id,
    { field: body.data.field, old: oldValue, new: body.data.value, reason: body.data.reason },
    false
  );

  res.json(OverrideCaseResponse.parse(await caseView(updated)));
});

// POST /cases/:id/assign (uses the logged-in agent, no agent_id from the client)
router.post("/cases/:id/assign", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = AssignCaseParams.safeParse({ id: idFrom(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const agentId = req.user!.id;
  const agentName = req.user!.name;

  const [updated] = await db
    .update(casesTable)
    .set({ assignedAgentId: agentId, updatedAt: new Date().toISOString() })
    .where(eq(casesTable.id, row.id))
    .returning();

  await addEvent(
    row.id,
    "AGENT_ASSIGNED",
    `Assigned to ${agentName}`,
    "agent",
    agentId,
    {},
    false
  );

  res.json(AssignCaseResponse.parse(await caseView(updated)));
});

// POST /cases/:id/archive
router.post("/cases/:id/archive", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = ArchiveCaseParams.safeParse({ id: idFrom(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const [updated] = await db
    .update(casesTable)
    .set({ archived: true, updatedAt: new Date().toISOString() })
    .where(eq(casesTable.id, row.id))
    .returning();

  await addEvent(
    row.id,
    "CASE_ARCHIVED",
    "Case archived by agent",
    "agent",
    req.user!.id,
    {},
    false
  );

  res.json(ArchiveCaseResponse.parse(await caseView(updated)));
});

// GET /cases/:id/promises
router.get("/cases/:id/promises", requireAuth, async (req, res): Promise<void> => {
  const params = GetCasePromisesParams.safeParse({ id: idFrom(req.params.id) });
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
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const items = await db
    .select()
    .from(promisesTable)
    .where(eq(promisesTable.caseId, row.id))
    .orderBy(promisesTable.createdAt);

  res.json(GetCasePromisesResponse.parse(items.map(toPromiseItem)));
});

// PUT /cases/:id/promises
router.put("/cases/:id/promises", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = UpdateCasePromiseParams.safeParse({ id: idFrom(req.params.id) });
  const body = UpdateCasePromiseBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const row = await findCase(params.data.id);
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const [created] = await db
    .insert(promisesTable)
    .values({
      caseId: row.id,
      text: body.data.text,
      dueAt: body.data.due_at,
      status: "pending",
      createdAt: new Date().toISOString(),
    })
    .returning();

  await addEvent(
    row.id,
    "PROMISE_MADE",
    `Promise made: ${body.data.text}`,
    "agent",
    req.user!.id,
    { promise_id: created.id, due_at: body.data.due_at },
    true
  );

  res.json(UpdateCasePromiseResponse.parse(toPromiseItem(created)));
});

// PATCH /promises/:id
router.patch("/promises/:id", requireAuth, requireRole("agent"), async (req, res): Promise<void> => {
  const params = UpdatePromiseStatusParams.safeParse({ id: idFrom(req.params.id) });
  const body = UpdatePromiseStatusBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db.select().from(promisesTable).where(eq(promisesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Promise not found" });
    return;
  }

  const [updated] = await db
    .update(promisesTable)
    .set({ status: body.data.status })
    .where(eq(promisesTable.id, existing.id))
    .returning();

  await addEvent(
    existing.caseId,
    body.data.status === "kept" ? "PROMISE_KEPT" : "PROMISE_BROKEN",
    `Promise marked as ${body.data.status}: "${existing.text}"`,
    "agent",
    req.user!.id,
    { promise_id: existing.id, status: body.data.status },
    true
  );

  res.json(UpdatePromiseStatusResponse.parse(toPromiseItem(updated)));
});

// GET /analytics/summary: open_cases, high_priority, at_risk, resolved_today, repeat_contact_rate, avg_resolution_hours, by_category, by_status, resolved_per_day (last 14 days, zero-filled, chronological)
router.get("/analytics/summary", requireAuth, requireRole("agent"), async (_req, res): Promise<void> => {
  const rows = await db.select().from(casesTable);
  const todayStr = new Date().toISOString().slice(0, 10);
  const openCases = rows.filter((row) => !["Resolved", "Rejected"].includes(row.status));
  const highPriorityCases = rows.filter(
    (row) => ["High", "Critical"].includes(row.priority) && !["Resolved", "Rejected"].includes(row.status)
  );
  const atRiskCases = rows.filter((row) => bool(row.escalationRequired));
  const resolvedTodayCases = rows.filter(
    (row) => row.status === "Resolved" && row.updatedAt.slice(0, 10) === todayStr
  );

  // Repeat contact rate
  const uniqueUsers = new Set(rows.map((row) => row.userId));
  const repeatUsers = [...uniqueUsers].filter(
    (userId) => rows.filter((row) => row.userId === userId).length > 1
  ).length;
  const repeatContactRate = uniqueUsers.size ? Math.round((repeatUsers / uniqueUsers.size) * 100) : 0;

  // Average resolution hours
  const resolvedCases = rows.filter((row) => row.status === "Resolved");
  let avgResolutionHours = 0;
  if (resolvedCases.length > 0) {
    const totalHours = resolvedCases.reduce((sum, row) => {
      const diffMs = Math.max(0, new Date(row.updatedAt).getTime() - new Date(row.createdAt).getTime());
      return sum + diffMs / (1000 * 60 * 60);
    }, 0);
    avgResolutionHours = Math.round((totalHours / resolvedCases.length) * 10) / 10;
  }

  // by_category and by_status
  const byCategoryMap = new Map<string, number>();
  const byStatusMap = new Map<string, number>();
  for (const row of rows) {
    byCategoryMap.set(row.category, (byCategoryMap.get(row.category) ?? 0) + 1);
    byStatusMap.set(row.status, (byStatusMap.get(row.status) ?? 0) + 1);
  }
  const toPoints = (map: Map<string, number>) =>
    [...map.entries()].map(([label, value]) => ({ label, value }));

  // resolved_per_day: last 14 days, zero-filled, chronological
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const resolvedPerDay: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const label = `${d.getUTCDate()} ${monthNames[d.getUTCMonth()]}`;
    const count = resolvedCases.filter((c) => c.updatedAt.slice(0, 10) === dateKey).length;
    resolvedPerDay.push({ label, value: count });
  }

  // broken_promise_rate
  const allPromises = await db.select().from(promisesTable);
  const brokenPromises = allPromises.filter((p) => p.status === "broken");
  const brokenPromiseRate = allPromises.length > 0
    ? Math.round((brokenPromises.length / allPromises.length) * 100)
    : null;

  const response = {
    open_cases: openCases.length,
    high_priority: highPriorityCases.length,
    at_risk: atRiskCases.length,
    resolved_today: resolvedTodayCases.length,
    repeat_contact_rate: repeatContactRate,
    avg_resolution_hours: avgResolutionHours,
    broken_promise_rate: brokenPromiseRate,
    by_category: toPoints(byCategoryMap),
    by_status: toPoints(byStatusMap),
    resolved_per_day: resolvedPerDay,
    per_day: resolvedPerDay,
  };

  res.json(GetAnalyticsSummaryResponse.parse(response));
});

export default router;

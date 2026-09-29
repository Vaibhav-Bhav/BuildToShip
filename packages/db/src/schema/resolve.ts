import { integer, pgTable, serial, text, real } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"),
  createdAt: text("created_at").notNull(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  userId: integer("user_id").notNull(),
  productName: text("product_name").notNull(),
  price: real("price").notNull(),
  orderDate: text("order_date").notNull(),
  deliveryDate: text("delivery_date").notNull(),
  status: text("status").notNull(),
});

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  caseCode: text("case_code").notNull().unique(),
  userId: integer("user_id").notNull(),
  orderId: integer("order_id"),
  status: text("status").notNull().default("New"),
  category: text("category").notNull().default("Other"),
  priority: text("priority").notNull().default("Medium"),
  sentiment: text("sentiment").notNull().default("Neutral"),
  customerIntent: text("customer_intent").notNull().default("Request help"),
  summary: text("summary").notNull().default(""),
  recommendedAction: text("recommended_action").notNull().default("Review the customer request"),
  nextStep: text("next_step").notNull().default("An agent will review your request"),
  escalationRequired: integer("escalation_required").notNull().default(0),
  escalationReason: text("escalation_reason"),
  missingInformation: text("missing_information").notNull().default("[]"),
  resolutionPlan: text("resolution_plan").notNull().default("[]"),
  assignedAgentId: integer("assigned_agent_id"),
  aiFailed: integer("ai_failed").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  dueAt: text("due_at").notNull(),
});

export const caseEventsTable = pgTable("case_events", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  actorType: text("actor_type").notNull(),
  actorId: integer("actor_id"),
  metadata: text("metadata").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  senderType: text("sender_type").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

export const attachmentsTable = pgTable("attachments", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type Case = typeof casesTable.$inferSelect;
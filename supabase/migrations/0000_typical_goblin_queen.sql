CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"storage_path" text,
	"mime_type" text,
	"size_bytes" integer,
	"uploaded_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"description" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" integer,
	"metadata" text DEFAULT '{}' NOT NULL,
	"visible_to_customer" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_code" text NOT NULL,
	"user_id" integer NOT NULL,
	"order_id" integer,
	"status" text DEFAULT 'New' NOT NULL,
	"category" text DEFAULT 'Other' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"sentiment" text DEFAULT 'Neutral' NOT NULL,
	"customer_intent" text DEFAULT 'Request help' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"recommended_action" text DEFAULT 'Review the customer request' NOT NULL,
	"next_step" text DEFAULT 'An agent will review your request' NOT NULL,
	"escalation_required" integer DEFAULT 0 NOT NULL,
	"escalation_reason" text,
	"missing_information" text DEFAULT '[]' NOT NULL,
	"resolution_plan" text DEFAULT '[]' NOT NULL,
	"assigned_agent_id" integer,
	"ai_failed" integer DEFAULT 0 NOT NULL,
	"ai_source" text DEFAULT 'groq' NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"due_at" text NOT NULL,
	CONSTRAINT "cases_case_code_unique" UNIQUE("case_code")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"sender_type" text NOT NULL,
	"body" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_code" text NOT NULL,
	"user_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"price" real NOT NULL,
	"order_date" text NOT NULL,
	"delivery_date" text NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promises" (
	"id" serial PRIMARY KEY NOT NULL,
	"case_id" integer NOT NULL,
	"text" text NOT NULL,
	"due_at" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cases_case_code_idx" ON "cases" USING btree ("case_code");
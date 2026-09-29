import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { LoginBody, LoginResponse, RegisterBody, RegisterResponse, GetMeResponse, UpdateMeBody, UpdateMeResponse } from "@workspace/api-zod";
import { createToken, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email.toLowerCase()));
  if (existing[0]) {
    res.status(400).json({ error: "An account with that email already exists" });
    return;
  }
  const [user] = await db.insert(usersTable).values({ name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 10), role: "customer", createdAt: new Date().toISOString() }).returning();
  const response = { token: createToken({ id: user.id, name: user.name, email: user.email, role: "customer" }), user: { id: user.id, name: user.name, email: user.email, role: "customer" as const } };
  res.status(201).json(RegisterResponse.parse(response));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email.toLowerCase()));
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Email or password is incorrect" });
    return;
  }
  const role = user.role === "agent" ? "agent" : "customer";
  const response = { token: createToken({ id: user.id, name: user.name, email: user.email, role }), user: { id: user.id, name: user.name, email: user.email, role } };
  res.json(LoginResponse.parse(response));
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  res.json(GetMeResponse.parse(user));
});

router.put("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db.update(usersTable).set({ name: parsed.data.name }).where(eq(usersTable.id, req.user!.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const role = updated.role === "agent" ? "agent" as const : "customer" as const;
  res.json(UpdateMeResponse.parse({ id: updated.id, name: updated.name, email: updated.email, role }));
});

export default router;

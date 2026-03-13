import { Router, type IRouter } from "express";
import { db, systemUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  try {
    const users = await db.select({
      id: systemUsersTable.id,
      name: systemUsersTable.name,
      email: systemUsersTable.email,
      role: systemUsersTable.role,
      createdAt: systemUsersTable.createdAt,
    }).from(systemUsersTable).orderBy(systemUsersTable.id);
    return res.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password required" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(systemUsersTable).values({ name, email, passwordHash, role: role || "user" }).returning();
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, password, role } = req.body;
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.update(systemUsersTable).set(updateData).where(eq(systemUsersTable.id, id)).returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(systemUsersTable).where(eq(systemUsersTable.id, id));
    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

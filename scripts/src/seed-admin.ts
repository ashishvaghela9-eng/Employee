import { db, systemUsersTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const users = [
  { name: "Ashish Vaghela", email: "ashish.vaghela@lightfinance.com", password: "admin@123", role: "admin" },
  { name: "Admin", email: "admin@lightfinance.com", password: "Admin@1234", role: "admin" },
];

for (const u of users) {
  const hash = await bcrypt.hash(u.password, 10);
  await db.insert(systemUsersTable).values({
    name: u.name,
    email: u.email,
    passwordHash: hash,
    role: u.role,
  }).onConflictDoNothing();
  console.log(`✅ User created: ${u.email} / ${u.password}`);
}

process.exit(0);

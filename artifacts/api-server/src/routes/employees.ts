import { Router, type IRouter } from "express";
import { db, employeesTable } from "@workspace/db";
import { eq, ilike, and, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { status, department, branch, search } = req.query as Record<string, string>;
    let query = db.select().from(employeesTable);
    const conditions: any[] = [];
    if (status) conditions.push(eq(employeesTable.status, status));
    if (department) conditions.push(eq(employeesTable.department, department));
    if (branch) conditions.push(eq(employeesTable.branch, branch));
    if (search) {
      conditions.push(or(
        ilike(employeesTable.name, `%${search}%`),
        ilike(employeesTable.employeeCode, `%${search}%`),
        ilike(employeesTable.email, `%${search}%`)
      ));
    }
    const employees = conditions.length > 0
      ? await db.select().from(employeesTable).where(and(...conditions)).orderBy(employeesTable.id)
      : await db.select().from(employeesTable).orderBy(employeesTable.id);
    return res.json(employees.map(formatEmployee));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/import", async (req, res) => {
  try {
    const { employees, updateOnDuplicate } = req.body;
    let imported = 0, updated = 0, failed = 0;
    const errors: { row: number; error: string }[] = [];
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      try {
        if (!emp.employeeCode || !emp.name) {
          errors.push({ row: i + 1, error: "Employee code and name are required" });
          failed++;
          continue;
        }
        const existing = await db.select().from(employeesTable).where(eq(employeesTable.employeeCode, emp.employeeCode));
        if (existing.length > 0) {
          if (updateOnDuplicate) {
            await db.update(employeesTable)
              .set({ ...emp, updatedAt: new Date() })
              .where(eq(employeesTable.employeeCode, emp.employeeCode));
            updated++;
          } else {
            errors.push({ row: i + 1, error: `Duplicate employee code: ${emp.employeeCode}` });
            failed++;
          }
        } else {
          await db.insert(employeesTable).values({ ...emp, access: {} });
          imported++;
        }
      } catch (e: any) {
        errors.push({ row: i + 1, error: e.message || "Unknown error" });
        failed++;
      }
    }
    return res.json({ imported, updated, failed, errors });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    if (!data.employeeCode || !data.name) {
      return res.status(400).json({ error: "Employee code and name are required" });
    }
    const [emp] = await db.insert(employeesTable).values({ ...data, access: data.access || {} }).returning();
    return res.status(201).json(formatEmployee(emp));
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Employee code already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, id));
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    return res.json(formatEmployee(emp));
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    
    // If exit status becomes 'Yes', mark as inactive and disable access
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.userExitStatus === "Yes") {
      updateData.status = "Inactive";
      updateData.access = {};
    }
    
    const [emp] = await db.update(employeesTable).set(updateData).where(eq(employeesTable.id, id)).returning();
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    return res.json(formatEmployee(emp));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(employeesTable).where(eq(employeesTable.id, id));
    return res.json({ success: true, message: "Employee deleted" });
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id/access", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { access } = req.body;
    const [emp] = await db.update(employeesTable).set({ access, updatedAt: new Date() }).where(eq(employeesTable.id, id)).returning();
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    return res.json(formatEmployee(emp));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

function formatEmployee(emp: any) {
  return {
    id: emp.id,
    serialNumber: emp.serialNumber,
    employeeCode: emp.employeeCode,
    name: emp.name,
    status: emp.status,
    department: emp.department,
    designation: emp.designation,
    contactNumber: emp.contactNumber,
    state: emp.state,
    branch: emp.branch,
    joiningDate: emp.joiningDate,
    email: emp.email,
    requester: emp.requester,
    approver: emp.approver,
    creator: emp.creator,
    exitInitiator: emp.exitInitiator,
    exitDate: emp.exitDate,
    userExitStatus: emp.userExitStatus,
    access: emp.access || {},
    createdAt: emp.createdAt?.toISOString?.() || emp.createdAt,
    updatedAt: emp.updatedAt?.toISOString?.() || emp.updatedAt,
  };
}

export default router;

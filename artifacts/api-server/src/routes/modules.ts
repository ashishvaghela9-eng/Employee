import { Router, type IRouter } from "express";
import { db, branchFileStationTable, assetCuezTable, vpnTable, jiraTable, mailvaultTable, ftpTable, acronisTable, tataTeleTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function makeModuleRoutes(table: any, formatFn?: (r: any) => any) {
  const r: IRouter = Router();
  const fmt = formatFn || ((row: any) => ({
    ...row,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt,
  }));

  r.get("/", async (_req, res) => {
    try {
      const rows = await db.select().from(table).orderBy(table.id);
      return res.json(rows.map(fmt));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  r.post("/", async (req, res) => {
    try {
      const [row] = await db.insert(table).values(req.body).returning();
      return res.status(201).json(fmt(row));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  r.put("/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [row] = await db.update(table).set({ ...req.body, updatedAt: new Date() }).where(eq(table.id, id)).returning();
      if (!row) return res.status(404).json({ error: "Record not found" });
      return res.json(fmt(row));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  r.delete("/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(table).where(eq(table.id, id));
      return res.json({ success: true, message: "Deleted" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return r;
}

router.use("/branch-file-station", makeModuleRoutes(branchFileStationTable));
router.use("/assetcuez", makeModuleRoutes(assetCuezTable));
router.use("/vpn", makeModuleRoutes(vpnTable));
router.use("/jira", makeModuleRoutes(jiraTable));
router.use("/mailvault", makeModuleRoutes(mailvaultTable));
router.use("/ftp", makeModuleRoutes(ftpTable));
router.use("/acronis", makeModuleRoutes(acronisTable));
router.use("/tata-tele", makeModuleRoutes(tataTeleTable));

export default router;

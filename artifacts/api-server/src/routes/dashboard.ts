import { Router, type IRouter } from "express";
import { db, employeesTable, systemUsersTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res) => {
  try {
    const allEmployees = await db.select().from(employeesTable);
    const totalEmployees = allEmployees.length;
    const activeEmployees = allEmployees.filter(e => e.status === "Active").length;
    const exitedEmployees = allEmployees.filter(e => e.userExitStatus === "Yes" || e.status === "Inactive").length;
    const pendingExitRequests = allEmployees.filter(e => e.userExitStatus === "In Service").length;
    const systemUsers = await db.select().from(systemUsersTable);
    const accessSystemUsers = systemUsers.length;

    // Department distribution
    const deptMap: Record<string, number> = {};
    for (const e of allEmployees) {
      const dept = e.department || "Unknown";
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    }
    const byDepartment = Object.entries(deptMap).map(([department, count]) => ({ department, count }));

    // Branch distribution
    const branchMap: Record<string, number> = {};
    for (const e of allEmployees) {
      const branch = e.branch || "Unknown";
      branchMap[branch] = (branchMap[branch] || 0) + 1;
    }
    const byBranch = Object.entries(branchMap).map(([branch, count]) => ({ branch, count }));

    // Access distribution
    const accessKeys = [
      "zohoEmail", "microsoftEmail", "microsoftOffice", "finfluxBmDashboard",
      "mobiliteField", "mobiliteCredit", "hoDashboard", "lightMoney",
      "zohoProjects", "jira", "bitbucket", "adobeAcrobat", "assetcuez",
      "exotel", "godaddy", "bluehost", "hostinger", "emailHosting",
      "awsConsole", "msg91", "dmsAlfresco",
    ];
    const accessLabels: Record<string, string> = {
      zohoEmail: "Zoho Email", microsoftEmail: "Microsoft Email", microsoftOffice: "MS Office",
      finfluxBmDashboard: "Finflux BM", mobiliteField: "Mobilite Field", mobiliteCredit: "Mobilite Credit",
      hoDashboard: "HO Dashboard", lightMoney: "Light Money", zohoProjects: "Zoho Projects",
      jira: "Jira", bitbucket: "Bitbucket", adobeAcrobat: "Adobe Acrobat",
      assetcuez: "AssetCuez", exotel: "Exotel", godaddy: "GoDaddy",
      bluehost: "Bluehost", hostinger: "Hostinger", emailHosting: "Email Hosting",
      awsConsole: "AWS Console", msg91: "MSG91", dmsAlfresco: "DMS/Alfresco",
    };
    const accessMap: Record<string, number> = {};
    for (const e of allEmployees) {
      const access = (e.access as any) || {};
      for (const key of accessKeys) {
        if (access[key]) {
          accessMap[key] = (accessMap[key] || 0) + 1;
        }
      }
    }
    const accessDistribution = Object.entries(accessMap)
      .map(([key, count]) => ({ name: accessLabels[key] || key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return res.json({
      totalEmployees,
      activeEmployees,
      exitedEmployees,
      pendingExitRequests,
      accessSystemUsers,
      byDepartment,
      byBranch,
      accessDistribution,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const branchFileStationTable = pgTable("branch_file_station", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password"),
  groupEmail: text("group_email"),
  branchName: text("branch_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assetCuezTable = pgTable("assetcuez", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  contactNumber: text("contact_number"),
  activationStatus: text("activation_status").default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vpnTable = pgTable("vpn_users", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  username: text("username").notNull(),
  department: text("department"),
  designation: text("designation"),
  userId: text("user_id"),
  password: text("password"),
  status: text("status").default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jiraTable = pgTable("jira_users", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  username: text("username").notNull(),
  email: text("email"),
  userStatus: text("user_status").default("Active"),
  addedToOrganization: text("added_to_organization"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mailvaultTable = pgTable("mailvault_users", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  username: text("username").notNull(),
  userId: text("user_id"),
  userRole: text("user_role"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ftpTable = pgTable("ftp_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password"),
  port: text("port"),
  hostname: text("hostname"),
  path: text("path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const acronisTable = pgTable("acronis_records", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  employeeName: text("employee_name").notNull(),
  department: text("department"),
  designation: text("designation"),
  email: text("email"),
  hostname: text("hostname"),
  backupPlan: text("backup_plan"),
  monthlyFullBackupDate: text("monthly_full_backup_date"),
  backupPlanName: text("backup_plan_name"),
  backupTime: text("backup_time"),
  incrementalBackup: text("incremental_backup"),
  cpuPriority: text("cpu_priority"),
  installationStatus: text("installation_status"),
  policyAssign: text("policy_assign"),
  backupStatus: text("backup_status"),
  leftEncryptionPassword: text("left_encryption_password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tataTeleTable = pgTable("tata_tele_records", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull(),
  employeeName: text("employee_name").notNull(),
  department: text("department"),
  designation: text("designation"),
  mobileNumber: text("mobile_number"),
  simNumber: text("sim_number"),
  plan: text("plan"),
  status: text("status").default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBranchFileStationSchema = createInsertSchema(branchFileStationTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssetCuezSchema = createInsertSchema(assetCuezTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVpnSchema = createInsertSchema(vpnTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJiraSchema = createInsertSchema(jiraTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMailvaultSchema = createInsertSchema(mailvaultTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFtpSchema = createInsertSchema(ftpTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAcronisSchema = createInsertSchema(acronisTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTataTeleSchema = createInsertSchema(tataTeleTable).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertBranchFileStation = z.infer<typeof insertBranchFileStationSchema>;
export type BranchFileStation = typeof branchFileStationTable.$inferSelect;
export type InsertAssetCuez = z.infer<typeof insertAssetCuezSchema>;
export type AssetCuez = typeof assetCuezTable.$inferSelect;
export type InsertVpn = z.infer<typeof insertVpnSchema>;
export type VpnUser = typeof vpnTable.$inferSelect;
export type InsertJira = z.infer<typeof insertJiraSchema>;
export type JiraUser = typeof jiraTable.$inferSelect;
export type InsertMailvault = z.infer<typeof insertMailvaultSchema>;
export type MailvaultUser = typeof mailvaultTable.$inferSelect;
export type InsertFtp = z.infer<typeof insertFtpSchema>;
export type FtpUser = typeof ftpTable.$inferSelect;
export type InsertAcronis = z.infer<typeof insertAcronisSchema>;
export type AcronisRecord = typeof acronisTable.$inferSelect;
export type InsertTataTele = z.infer<typeof insertTataTeleSchema>;
export type TataTeleRecord = typeof tataTeleTable.$inferSelect;

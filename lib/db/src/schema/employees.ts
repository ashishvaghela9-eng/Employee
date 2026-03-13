import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  serialNumber: integer("serial_number"),
  employeeCode: text("employee_code").notNull().unique(),
  name: text("name").notNull(),
  status: text("status").notNull().default("Active"),
  department: text("department"),
  designation: text("designation"),
  contactNumber: text("contact_number"),
  state: text("state"),
  branch: text("branch"),
  joiningDate: text("joining_date"),
  email: text("email"),
  requester: text("requester"),
  approver: text("approver"),
  creator: text("creator"),
  exitInitiator: text("exit_initiator"),
  exitDate: text("exit_date"),
  userExitStatus: text("user_exit_status").default("No"),
  access: jsonb("access").default({
    zohoEmail: false,
    microsoftEmail: false,
    microsoftOffice: false,
    finfluxBmDashboard: false,
    mobiliteField: false,
    mobiliteCredit: false,
    hoDashboard: false,
    lightMoney: false,
    zohoProjects: false,
    jira: false,
    bitbucket: false,
    adobeAcrobat: false,
    assetcuez: false,
    exotel: false,
    godaddy: false,
    bluehost: false,
    hostinger: false,
    emailHosting: false,
    awsConsole: false,
    msg91: false,
    dmsAlfresco: false,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;

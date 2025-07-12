import { pgTable, uuid, varchar, text, timestamp, json, integer } from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  position: text("position").notNull(),
  phone: varchar("phone", { length: 100 }).notNull(),
  dailySalary: integer("daily_salary").notNull(),
  attendance: json("attendance").$type<Record<string, boolean>>(),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
});

export const tokens = pgTable("tokens", {
    token: varchar("token", { length: 500 }).primaryKey(),
});

export type Employee = typeof employees;
export type Token = typeof tokens;
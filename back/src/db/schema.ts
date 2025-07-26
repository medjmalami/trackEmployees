import { pgTable, uuid, varchar, text, timestamp, json, integer } from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  position: text("position").notNull(),
  phone: varchar("phone", { length: 100 }).notNull(),
  dailySalary: integer("daily_salary").notNull(),
  attendance: json("attendance").$type<Record<string, boolean>>(),
  advances: json("advances").$type<Record<string, number>>(),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
});

export const tokens = pgTable("tokens", {
  token: varchar("token", { length: 500 }).primaryKey(),
});

// Type exports
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Token = typeof tokens.$inferSelect;
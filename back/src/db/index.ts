import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js"; 
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

// Initialize Drizzle
export const db = drizzle(sql);

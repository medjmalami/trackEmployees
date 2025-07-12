import { addEmployeeController } from "../controller/admin.controller/addEmployee.controller";
import { Hono } from "hono";
import { auth } from "../utils/auth";

export const adminRoutes = new Hono();

adminRoutes.post("/addEmployee", auth, addEmployeeController);
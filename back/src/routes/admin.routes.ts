import { addEmployeeController } from "../controller/admin.controller/addEmployee.controller";
import { Hono } from "hono";
import { auth } from "../utils/auth";
import { adminAuth } from "../utils/adminAuth";
import { removeEmployeeController } from "../controller/admin.controller/removeEmployee.controller";
import { getEmployeesController } from "../controller/admin.controller/getEmployees.controller";
import { editEmployeeController } from "../controller/admin.controller/editEmployee.controller";
import { deleteAdvanceController } from "../controller/admin.controller/advances.controller.ts/deleteAdvance.controller";
import { modifyAdvanceController } from "../controller/admin.controller/advances.controller.ts/modifyAdvance.controller";

export const adminRoutes = new Hono();

adminRoutes.post("/addEmployee", auth, adminAuth, addEmployeeController);
adminRoutes.post("/removeEmployee", auth, adminAuth, removeEmployeeController);
adminRoutes.get("/getEmployees/admin", auth, adminAuth, getEmployeesController);
adminRoutes.post("/editEmployee", auth, adminAuth, editEmployeeController);
adminRoutes.post("/deleteAdvance", auth, adminAuth, deleteAdvanceController);
adminRoutes.post("/modifyAdvance", auth, adminAuth, modifyAdvanceController);
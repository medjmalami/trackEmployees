import { getEmployeesController } from "../controller/chef.controller/getEmployees.controller";
import { Hono } from "hono";
import { auth } from "../utils/auth";

export const chefRoutes = new Hono();

chefRoutes.get("/getEmployees", auth, getEmployeesController);
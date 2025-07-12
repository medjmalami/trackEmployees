import { logoutController } from "../controller/logout.controller";
import { auth } from "../utils/auth";
import { Hono } from "hono";

export const logoutRoutes = new Hono();

logoutRoutes.post("/logout", logoutController);
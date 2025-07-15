import changePresenceController from "../controller/chnagePresence.controller";
import { Hono } from "hono";
import { auth } from "../utils/auth";

export const commonRoutes = new Hono();

commonRoutes.post("/changePresence", auth, changePresenceController);
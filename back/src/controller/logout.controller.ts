import type { Context } from "hono";
import { config } from "dotenv";
import { errorHelper } from "../utils/errorHelper";
import { db } from "../db/index";
import { eq } from "drizzle-orm";
import { tokens } from "../db/schema";
import { logoutReqSchema } from "../utils/logoutType";

config();

const logoutController = async (c: Context) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorHelper.error(400, 'Authorization header missing or malformed'));
    }

    const oldToken = authHeader.split(' ')[1];

    const validation = logoutReqSchema.safeParse({ token: oldToken });

    if (!validation.success) {
      return c.json(errorHelper.error(400, 'Token validation failed'));
    }

    await db.delete(tokens).where(eq(tokens.token, oldToken));

    return c.json(
      { message: 'Logged out successfully' },
      200
    );
  } catch (error: any) {
    return c.json(errorHelper.error(401, 'Invalid token'));
  }
};

export { logoutController };

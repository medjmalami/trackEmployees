import type { Context } from "hono";
import { config } from "dotenv";
import { errorHelper } from "../utils/errorHelper";
import { db } from "../db/index";
import { eq } from "drizzle-orm";
import { tokens } from "../db/schema";
import { logoutReqSchema } from "../utils/logoutType";

config();

const logoutController = async (c: Context) => {
  // Parse the request body using Hono's context
  let body;
  try {
    body = await c.req.json();
  

  if (!body || !body.token) {
    return c.json(errorHelper.error(400, 'Bad Request'));
  }

  const oldToken = body.token.split(' ')[1];

  if (!oldToken) {
    return c.json(errorHelper.error(400, 'Bad Request'));
  }

  const validation = logoutReqSchema.safeParse({token: oldToken});

  if (!validation.success) {
    return c.json(errorHelper.error(400, 'Validation failed'));
  }
  
    await db.delete(tokens).where(eq(tokens.token, oldToken));
    
    
    return c.json({ 
      message: 'Logged out successfully' 
    }, 200);
    
  } catch (error: any) {
    return c.json(errorHelper.error(401, `Invalid token`));
  }
};

export { logoutController };
//auth.ts
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import type { Context, Next } from 'hono';
import { errorHelper } from './errorHelper';
import { authReqSchema, type AuthReq } from './authType';

config();

export const auth = async (c: Context, next: Next): Promise<Response | void> => {
    try {
        const body = await c.req.json();
        if (!body) {
          return c.json(errorHelper.error(400, 'Bad Request'));
        }
        const token = body.token.split(' ')[1];

        if (!token) {
          return c.json(errorHelper.error(401, 'Authentication required'));
        }
  
  
    const validation = authReqSchema.safeParse({token});
    if (!validation.success) {
      return c.json(errorHelper.error(401, 'Validation failed'));
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as jwt.JwtPayload;
    
    c.set('user', decoded);
    
    await next();

  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
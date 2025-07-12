//auth.ts
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import type { Context, Next } from 'hono';

config();

export const auth = async (c: Context, next: Next): Promise<Response | void> => {
  const body = await c.req.json();
  const token = body.token.split(' ')[1];
  
  if (!token) {
    return c.json({
      error: 'Authentication required',
      message: 'Token not provided in request body'
    }, 401);
  }
  
  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as jwt.JwtPayload;
    
    
    await next();

  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
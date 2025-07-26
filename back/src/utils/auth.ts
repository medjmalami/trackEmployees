import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import type { Context, Next } from 'hono';
import { errorHelper } from './errorHelper';
import { authReqSchema } from './authType';

config();

export const auth = async (c: Context, next: Next): Promise<Response | void> => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorHelper.error(401, 'Authorization header missing or malformed'));
    }

    const token = authHeader.split(' ')[1];

    const validation = authReqSchema.safeParse({ token });
    if (!validation.success) {
      return c.json(errorHelper.error(401, 'Token validation failed'));
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    c.set('user', decoded);

    await next();
  } catch (error) {
    return c.json(errorHelper.error(401, 'Unauthorized'));
  }
};

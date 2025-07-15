import type { Context, Next } from 'hono';
import { errorHelper } from './errorHelper';

export const adminAuth = async (c: Context, next: Next): Promise<Response | void> => {
  try {
    const user = c.get('user');
  if (!user) {
    return c.json(errorHelper.error(401, 'Unauthorized'));
  }
  if (!user.isAdmin) {
    return c.json(errorHelper.error(401, 'Unauthorized'));
  }
  await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
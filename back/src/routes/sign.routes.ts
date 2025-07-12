import { signController } from '../controller/sign.controller';
import { Hono } from 'hono';

export const signRoutes = new Hono();

signRoutes.post('/signin', signController);
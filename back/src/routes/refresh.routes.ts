import { refreshController } from '../controller/refresh.controller';
import { Hono } from 'hono';

export const refreshRoutes = new Hono();

refreshRoutes.post('/refresh', refreshController);
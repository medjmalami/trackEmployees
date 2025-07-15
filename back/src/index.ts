import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { cors } from 'hono/cors';
import rateLimit from 'hono-rate-limit';
import { signRoutes } from './routes/sign.routes';
import { refreshRoutes } from './routes/refresh.routes';
import { logoutRoutes } from './routes/logout.routes';
import { adminRoutes } from './routes/admin.routes';
import { chefRoutes } from './routes/chef.routes';

const app = new Hono();

// ✅ CORS Configuration
app.use('*', cors({
  origin: process.env.FRONTEND_URL!,
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600,
}));

// ✅ HTTP Security Headers (helmet equivalent)
app.use('*', secureHeaders());

// ✅ Logging (morgan equivalent)
app.use('*', logger());

// ✅ Rate Limiting
app.use('*', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: 'Too many requests from this IP, please try again later.',
}));

// ✅ Root Route
app.get('/', (c) => c.text('API is running'));

// ✅ 404 Route
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

app.route('/', signRoutes);
app.route('/', refreshRoutes);
app.route('/', logoutRoutes);
app.route('/', adminRoutes);
app.route('/', chefRoutes);

// ✅ Start Server (Bun)
export default {
  port: Number(process.env.PORT || 3000),
  fetch: app.fetch,
};
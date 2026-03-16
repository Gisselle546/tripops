import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().default('tripops'),
  NODE_ENV: z.string().default('development'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_ACCESS_TTL: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL: z.coerce.number().int().positive().default(1209600),

  // Cookies
  REFRESH_COOKIE_NAME: z.string().default('tripops_refresh'),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_DOMAIN: z.string().optional(),

  // CORS
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

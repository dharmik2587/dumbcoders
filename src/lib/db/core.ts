import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema/core';

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function hasCoreDatabase() {
  return Boolean(process.env.CORE_DATABASE_URL);
}

/** Neon uses HTTP 402 when the project's data-transfer quota is exhausted. */
export function isDatabaseQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const cause = error && typeof error === 'object' && 'cause' in error
    ? String((error as { cause?: unknown }).cause)
    : '';
  return /402|data transfer quota|exceeded.*quota/i.test(`${message} ${cause}`);
}

export function getCoreDb() {
  if (!process.env.CORE_DATABASE_URL) {
    throw new Error('CORE_DATABASE_URL is not configured');
  }

  if (!cachedDb) {
    const sql = neon(process.env.CORE_DATABASE_URL);
    cachedDb = drizzle(sql, {
      schema,
      logger: process.env.NODE_ENV === 'development',
    });
  }

  return cachedDb;
}

export { schema };

import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export function parseNullableUuid(value: string | null) {
  if (!value) return null;
  return z.string().uuid().safeParse(value).success ? value : null;
}

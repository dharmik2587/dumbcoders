import { z } from 'zod';

export const createRequestSchema = z.object({
  toUserId: z.string().min(1),
  teamId: z.string().uuid().nullable().optional(),
  hackathonId: z.string().uuid().nullable().optional(),
  message: z.string().trim().max(500).optional(),
  roleOffered: z.string().trim().max(80).optional(),
});

export const requestActionSchema = z.object({
  action: z.enum(['accept', 'reject', 'withdraw']),
});

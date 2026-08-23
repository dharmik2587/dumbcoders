import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional(),
  hackathonId: z.string().uuid().nullable().optional(),
  maxMembers: z.number().int().min(2).max(20).default(4),
  rolesNeeded: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  isOpen: z.boolean().default(true),
});

export const updateTeamSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  maxMembers: z.number().int().min(2).max(20).optional(),
  rolesNeeded: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  isOpen: z.boolean().optional(),
  status: z.enum(['forming', 'complete', 'submitted', 'won', 'closed']).optional(),
  resultNote: z.string().trim().max(1000).nullable().optional(),
  projectName: z.string().trim().max(160).nullable().optional(),
  projectUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
  demoUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional(),
});

export const teamInviteSchema = z.object({
  userId: z.string().min(1),
  role: z.string().trim().max(60).optional(),
  message: z.string().trim().max(500).optional(),
});

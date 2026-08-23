import { z } from 'zod';

const optionalString = (maxLen = 500) =>
  z
    .string()
    .trim()
    .max(maxLen)
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional();

const optionalUrl = z
  .union([z.string().url(), z.literal(''), z.null()])
  .transform((val) => (val === '' ? null : val))
  .nullable()
  .optional();

export const profileUpdateSchema = z.object({
  fullName: optionalString(100),
  bio: optionalString(500),
  collegeId: z
    .union([z.string().uuid(), z.literal(''), z.null()])
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .optional(),
  branch: optionalString(100),
  graduationYear: z
    .union([z.number().int().min(1980).max(2100), z.literal(''), z.null()])
    .transform((val) => (typeof val === 'number' ? val : null))
    .nullable()
    .optional(),
  skills: z.array(z.string().trim().min(1).max(50)).max(30).optional().default([]),
  rolePreference: optionalString(80),
  hackathonInterests: z.array(z.string().trim().min(1).max(80)).max(20).optional().default([]),
  availability: optionalString(120),
  portfolioUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  onboardingDone: z.boolean().optional(),
  isOpenToTeam: z.boolean().optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

import { NextRequest } from 'next/server';
import { getOptionalUser, requireUser } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { updateProfile } from '@/lib/db/queries/profiles';
import { ensureStudentProfile, getStudentByAnyKey } from '@/lib/profile/student';
import { failure, success } from '@/lib/http';
import { profileUpdateSchema } from '@/lib/validations/profile';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = await getOptionalUser(token);
  if (!user) return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  try {
    await ensureStudentProfile(user);
    const data = await getStudentByAnyKey(user.id);
    if (!data) return failure('PROFILE_NOT_FOUND', 'Could not load your profile.', 404);

    const profile = {
      ...data.profile,
      college: data.college,
      github: data.github,
    };
    return success(profile);
  } catch (error) {
    console.error('GET /api/users/me failed', error);
    return failure('DATABASE_ERROR', 'Could not load your profile.', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  let user;
  try {
    user = await requireUser(token);
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }

  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return failure('VALIDATION_ERROR', `Profile data is invalid: ${issues.join('; ')}`, 400);
  }

  try {
    // Ensure profile row exists in database before patching
    await ensureStudentProfile(user);

    const updated = await updateProfile(user.id, parsed.data);
    if (!updated) return failure('PROFILE_NOT_FOUND', 'Profile could not be updated.', 404);

    const data = await getStudentByAnyKey(user.id);
    const profile = data
      ? { ...data.profile, college: data.college, github: data.github }
      : updated;

    return success(profile);
  } catch (error: any) {
    console.error('PATCH /api/users/me failed:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return failure('DATABASE_ERROR', `Could not update your profile: ${msg}`, 500);
  }
}

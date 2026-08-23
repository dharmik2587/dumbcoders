import { NextRequest } from 'next/server';
import { getOptionalUser, requireUser } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { getProfileById, updateProfile } from '@/lib/db/queries/profiles';
import { ensureStudentProfile } from '@/lib/profile/student';
import { failure, success } from '@/lib/http';
import { profileUpdateSchema } from '@/lib/validations/profile';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getOptionalUser();
  if (!user) return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  try {
    const profile = await ensureStudentProfile(user);
    return success(profile);
  } catch (error) {
    console.error('GET /api/users/me failed', error);
    return failure('DATABASE_ERROR', 'Could not load your profile.', 500);
  }
}

export async function PATCH(request: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return failure('UNAUTHORIZED', 'Sign in to continue.', 401);
  }

  if (!hasCoreDatabase()) return failure('NOT_CONFIGURED', 'Database is not configured.', 503);

  const body = await request.json().catch(() => null);
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', 'The profile data is invalid.', 400, {
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    // Ensure profile row exists in Neon database before patching
    await ensureStudentProfile(user);

    const updated = await updateProfile(user.id, parsed.data);
    if (!updated) return failure('PROFILE_NOT_FOUND', 'Profile could not be updated.', 404);
    return success(updated);
  } catch (error) {
    console.error('PATCH /api/users/me failed', error);
    return failure('DATABASE_ERROR', 'Could not update your profile.', 500);
  }
}

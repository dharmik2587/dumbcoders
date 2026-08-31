import { NextRequest } from 'next/server';
import { getOptionalUser, requireUser } from '@/lib/auth/server';
import { hasCoreDatabase, isDatabaseQuotaError } from '@/lib/db/core';
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
    // Try to ensure profile exists, but don't hard-fail if it returns null —
    // getStudentByAnyKey below will be the final arbiter.
    try {
      await ensureStudentProfile(user);
    } catch (profileErr) {
      console.error('ensureStudentProfile threw:', profileErr);
    }

    const data = await getStudentByAnyKey(user.id);
    if (!data) {
      // Profile genuinely doesn't exist — one more attempt to create it
      const profile = await ensureStudentProfile(user);
      if (!profile) {
        return failure('PROFILE_NOT_FOUND', 'Your profile could not be created. Please try signing out and back in.', 404);
      }
      return success({ ...profile, college: null, github: null });
    }

    const profile = {
      ...data.profile,
      college: data.college,
      github: data.github,
    };
    return success(profile);
  } catch (error) {
    console.error('GET /api/users/me failed', error);
    if (isDatabaseQuotaError(error)) {
      return failure('DATABASE_QUOTA_EXCEEDED', 'The database quota has been exceeded. Restore Neon database capacity to load your profile.', 503);
    }
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
    const profileResult = await ensureStudentProfile(user);
    if (!profileResult) {
      return failure('PROFILE_CREATION_FAILED', 'Could not load or create your profile. Database might be out of sync.', 500);
    }

    const updated = await updateProfile(user.id, parsed.data);
    if (!updated) return failure('PROFILE_NOT_FOUND', 'Profile could not be updated.', 404);

    const data = await getStudentByAnyKey(user.id);
    const profile = data
      ? { ...data.profile, college: data.college, github: data.github }
      : updated;

    return success(profile);
  } catch (error: any) {
    console.error('PATCH /api/users/me failed:', error);
    if (isDatabaseQuotaError(error)) {
      return failure('DATABASE_QUOTA_EXCEEDED', 'The database quota has been exceeded. Restore Neon database capacity before saving profile details.', 503);
    }
    const msg = error instanceof Error ? error.message : String(error);
    return failure('DATABASE_ERROR', `Could not update your profile: ${msg}`, 500);
  }
}

import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { failure, success } from '@/lib/http';
import { getCoreDb, isDatabaseQuotaError } from '@/lib/db/core';
import { profiles } from '@/lib/db/schema/core';
import { eq } from 'drizzle-orm';
import {
  extractDomain,
  getOrCreateCollegeByDomain,
  verifyCollegeOtp,
} from '@/lib/college-verification';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  let user;
  try {
    user = await requireUser(token);
  } catch (err: any) {
    console.error('[verify-otp] requireUser failed:', err);
    return failure('UNAUTHORIZED', 'Please sign in to verify your college email.', 401);
  }

  const body = await request.json().catch(() => null);
  const email = (body?.email || '').trim().toLowerCase();
  const code = (body?.code || '').trim();

  if (!email || !code) {
    return failure('VALIDATION_ERROR', 'Email and verification code are required.', 400);
  }

  try {
    // 1. Verify OTP
    const verification = await verifyCollegeOtp(user.id, email, code);
    if (!verification.valid) {
      return failure('INVALID_OTP', verification.error || 'Invalid or expired code.', 400);
    }

    const domain = verification.domain || extractDomain(email);

    // 2. Resolve college
    const college = await getOrCreateCollegeByDomain(domain);

    // 3. Update student profile in Neon DB
    const db = getCoreDb();
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        email: email,
        collegeId: college?.id || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))
      .returning();

    return success({
      verified: true,
      college: college ? {
        id: college.id,
        name: college.name,
        shortName: college.shortName,
        domain: college.domain,
      } : null,
      profile: updatedProfile,
      message: `Successfully verified as student of ${college?.shortName || college?.name || domain}!`,
    });
  } catch (error: any) {
    console.error('Error verifying college OTP:', error);
    if (isDatabaseQuotaError(error)) {
      return failure('DATABASE_QUOTA_EXCEEDED', 'The database quota has been exceeded. Restore Neon database capacity before completing verification.', 503);
    }
    return failure('SERVER_ERROR', error?.message || 'Could not verify code.', 500);
  }
}

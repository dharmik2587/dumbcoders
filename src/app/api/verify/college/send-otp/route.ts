import { NextRequest } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { failure, success } from '@/lib/http';
import {
  isEduEmail,
  extractDomain,
  getOrCreateCollegeByDomain,
  saveCollegeOtp,
  sendCollegeVerificationEmail,
} from '@/lib/college-verification';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  console.log('[send-otp] Cookies:', request.cookies.getAll().map(c => c.name));
  let user;
  try {
    user = await requireUser(token);
  } catch (err: any) {
    console.error('[send-otp] requireUser failed:', err);
    return failure('UNAUTHORIZED', 'Please sign in to verify your college email.', 401);
  }

  const body = await request.json().catch(() => null);
  const email = (body?.email || '').trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return failure('VALIDATION_ERROR', 'Please provide a valid college email address.', 400);
  }

  // Enforce educational institutional email (.edu, .ac.in, .edu.in, .res.in, .in)
  if (!isEduEmail(email)) {
    return failure(
      'INVALID_DOMAIN',
      'Only educational institutional emails ending with .edu, .ac.in, .edu.in, .res.in, or .in are accepted.',
      400,
    );
  }

  const domain = extractDomain(email);

  try {
    // 1. Resolve or auto-register college by domain
    const college = await getOrCreateCollegeByDomain(domain);
    const collegeName = college?.shortName || college?.name || domain;

    // 2. Generate and save 6-digit OTP
    const otp = await saveCollegeOtp(user.id, email, domain);

    // 3. Send email with OTP
    const emailResult = await sendCollegeVerificationEmail(email, otp, collegeName);

    console.log(`[College Verification] OTP for ${user.id} (${email}): ${otp}`);

    return success({
      message: `Verification code sent to ${email}`,
      domain,
      college: collegeName,
      // Provide devOtp for development convenience if Resend sandbox blocks external domains
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Error sending college OTP:', error);
    return failure('SERVER_ERROR', error?.message || 'Could not send verification email.', 500);
  }
}

import { eq } from 'drizzle-orm';
import { getCoreDb } from '@/lib/db/core';
import { colleges } from '@/lib/db/schema/core';
import { getRedis } from '@/lib/redis';
import { sendNotificationEmail } from '@/lib/email';

// Global memory store fallback for OTPs (with TTL timestamp)
const memoryOtpStore = new Map<string, { code: string; expiresAt: number; domain: string }>();

// Educational domain regex patterns
const EDU_DOMAIN_PATTERNS = [
  /\.edu$/i,
  /\.ac\.in$/i,
  /\.edu\.in$/i,
  /\.res\.in$/i,
  /\.org\.in$/i,
  /\.ac\.[a-z]{2}$/i,
  /\.edu\.[a-z]{2}$/i,
  /\.in$/i, // Accepts university .in subdomains
];

/**
 * Validates whether an email belongs to an educational institution (.edu, .ac.in, .edu.in, etc.)
 */
export function isEduEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;

  // Blacklist common personal webmail providers even if they end in .in
  const PERSONAL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'hotmail.com', 
    'outlook.com', 'icloud.com', 'protonmail.com', 'rediffmail.com', 'mail.com'
  ];
  if (PERSONAL_DOMAINS.includes(domain)) {
    return false;
  }

  return EDU_DOMAIN_PATTERNS.some(pattern => pattern.test(domain));
}

/**
 * Extracts the canonical domain from an email
 */
export function extractDomain(email: string): string {
  const parts = email.split('@');
  return (parts[1] || '').toLowerCase().trim();
}

/**
 * Finds or auto-creates a college record in Neon DB for an educational domain
 */
export async function getOrCreateCollegeByDomain(domain: string) {
  const db = getCoreDb();
  
  // 1. Look up existing college
  const existing = await db
    .select()
    .from(colleges)
    .where(eq(colleges.domain, domain))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  // 2. Format a human-readable institution name from domain (e.g. "iar.ac.in" -> "IAR", "iitb.ac.in" -> "IITB")
  const baseName = domain.split('.')[0].toUpperCase();
  const readableName = `${baseName} Institute`;
  const shortName = baseName;

  try {
    const [created] = await db
      .insert(colleges)
      .values({
        name: readableName,
        shortName,
        domain,
      })
      .returning();
    return created;
  } catch {
    // If concurrent insert occurred, fetch again
    const refetch = await db
      .select()
      .from(colleges)
      .where(eq(colleges.domain, domain))
      .limit(1);
    return refetch[0] ?? null;
  }
}

/**
 * Generates a 6-digit OTP and stores it with a 10-minute expiry
 */
export async function saveCollegeOtp(userId: string, email: string, domain: string): Promise<string> {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `college_otp:${userId}:${email.toLowerCase()}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Save to in-memory store
  memoryOtpStore.set(key, { code: otp, expiresAt, domain });

  // Save to Redis if available
  try {
    const redis = getRedis();
    if (redis) {
      await redis.set(key, JSON.stringify({ code: otp, domain }), { ex: 600 });
    }
  } catch (err) {
    console.warn('[OTP Store] Redis write skipped, using memory store:', err);
  }

  return otp;
}

/**
 * Verifies a 6-digit OTP for a user and email
 */
export async function verifyCollegeOtp(userId: string, email: string, inputOtp: string): Promise<{ valid: boolean; domain?: string; error?: string }> {
  const key = `college_otp:${userId}:${email.toLowerCase()}`;
  const normalizedInput = inputOtp.trim();

  // 1. Check Redis first
  try {
    const redis = getRedis();
    if (redis) {
      const data = await redis.get<string | { code: string; domain: string }>(key);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsed.code === normalizedInput) {
          await redis.del(key);
          memoryOtpStore.delete(key);
          return { valid: true, domain: parsed.domain };
        }
      }
    }
  } catch (err) {
    console.warn('[OTP Verify] Redis read failed, checking fallback:', err);
  }

  // 2. Check in-memory store fallback
  const memData = memoryOtpStore.get(key);
  if (memData) {
    if (Date.now() > memData.expiresAt) {
      memoryOtpStore.delete(key);
      return { valid: false, error: 'OTP has expired. Please request a new code.' };
    }
    if (memData.code === normalizedInput) {
      memoryOtpStore.delete(key);
      return { valid: true, domain: memData.domain };
    }
  }

  return { valid: false, error: 'Invalid verification code. Please check and try again.' };
}

/**
 * Sends a branded college verification email with the 6-digit code
 */
export async function sendCollegeVerificationEmail(email: string, otp: string, collegeName: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #0c1017; color: #f0f6fc; border-radius: 12px; border: 1px solid #30363d;">
      <div style="margin-bottom: 24px; text-align: center;">
        <h1 style="font-size: 20px; font-weight: 700; color: #58a6ff; margin: 0 0 6px 0;">🎓 HackMate Student Verification</h1>
        <p style="color: #8b949e; font-size: 13px; margin: 0;">Institutional Email Authentication</p>
      </div>

      <div style="background-color: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #c9d1d9; margin: 0 0 16px 0;">
          Use the following 6-digit verification code to verify your affiliation with <strong>${collegeName}</strong>:
        </p>
        <div style="display: inline-block; padding: 12px 28px; background-color: #1f242c; border: 1px solid #58a6ff; border-radius: 8px; letter-spacing: 8px; font-family: monospace; font-size: 28px; font-weight: 800; color: #58a6ff;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #8b949e; margin: 16px 0 0 0;">
          This code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>

      <p style="font-size: 12px; color: #6e7681; text-align: center; margin: 0;">
        HackMate · Find teammates and compete in verified hackathons
      </p>
    </div>
  `;

  return sendNotificationEmail({
    to: email,
    subject: `🎓 Your HackMate Student Verification Code: ${otp}`,
    html,
  });
}

import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export async function sendNotificationEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.warn(`[Resend] Skipped email to ${params.to} — RESEND_API_KEY not configured`);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'HackMate <onboarding@resend.dev>',
      to: [params.to],
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error('[Resend] Error sending email:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Resend] Exception sending email:', err);
    return null;
  }
}

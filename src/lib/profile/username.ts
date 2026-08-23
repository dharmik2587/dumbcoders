export function usernameBase(input: {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  userId: string;
}) {
  const raw =
    input.username ||
    `${input.firstName ?? ''}${input.lastName ?? ''}` ||
    input.email?.split('@')[0] ||
    `student${input.userId.slice(-8)}`;

  const clean = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);

  return clean || `student${input.userId.slice(-8)}`;
}

export function usernameCandidate(base: string, attempt: number) {
  if (attempt === 0) return base;
  return `${base.slice(0, 19)}${attempt.toString().padStart(2, '0')}`;
}

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function jsonError(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Unexpected server error';
}

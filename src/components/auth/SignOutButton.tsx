'use client';

import { useAuth } from '@/providers/AuthProvider';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <button
      onClick={() => void signOut()}
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-red-600"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign out</span>
    </button>
  );
}

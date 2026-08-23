import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOptionalUserId } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { getProfileById } from '@/lib/db/queries/profiles';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const userId = await getOptionalUserId();

  if (userId && hasCoreDatabase()) {
    const profile = await getProfileById(userId);
    if (profile && !profile.onboardingDone) redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-xl font-black tracking-tight text-slate-950">
            Hack<span className="text-blue-600">Mate</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-950">Dashboard</Link>
              <Link href="/hackathons" className="hover:text-slate-950">Hackathons</Link>
              <Link href="/find-partners" className="hover:text-slate-950">Partners</Link>
              <Link href="/requests" className="hover:text-slate-950">Requests</Link>
              <Link href="/teams/my" className="hover:text-slate-950">Teams</Link>
              <Link href="/bookmarks" className="hover:text-slate-950">Bookmarks</Link>
              <Link href="/notifications" className="hover:text-slate-950">Inbox</Link>
            </nav>
            {userId && (
              <div className="border-l border-slate-200 pl-4">
                <SignOutButton />
              </div>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

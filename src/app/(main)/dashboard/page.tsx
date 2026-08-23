import Link from 'next/link';
import { getOptionalUserId } from '@/lib/auth/server';
import { hasCoreDatabase } from '@/lib/db/core';
import { getProfileById } from '@/lib/db/queries/profiles';
import { listHackathons } from '@/lib/db/queries/hackathons';
import { InteractiveHackathonList } from '@/components/hackathons/InteractiveHackathonList';
import { Sparkles, Trophy, Users, Compass } from 'lucide-react';

export default async function DashboardPage() {
  const userId = await getOptionalUserId();
  const profile = userId && hasCoreDatabase() ? await getProfileById(userId) : null;
  const name = profile?.fullName?.split(' ')[0] ?? 'builder';

  const hackathonsData = hasCoreDatabase()
    ? await listHackathons({ page: 1, pageSize: 60 })
    : { rows: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>HackMate Live Workspace</span>
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Welcome, {name}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Explore live hackathons from Unstop, find complementary teammates, and build
            winning projects together.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/find-partners"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-400"
            >
              <Users className="h-4 w-4" />
              Find Teammates
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Edit Builder Profile
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />
      </section>

      {/* Metrics Row */}
      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Hackathons
            </p>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{hackathonsData.total}</p>
          <p className="mt-1 text-xs text-slate-500">Live synced from Unstop</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Profile Completeness
            </p>
            <Sparkles className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">
            {profile ? `${profile.profileComplete}%` : '0%'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {profile?.onboardingDone ? 'Ready for partner matchmaking' : 'Complete profile to get matched'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Discovery Engine
            </p>
            <Compass className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">Auto-Daily</p>
          <p className="mt-1 text-xs text-slate-500">Apify & Unstop crawler active</p>
        </div>
      </section>

      {/* Interactive Unstop Hackathons Explorer */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Explore Active Hackathons
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time opportunities synced from Unstop. Click any card to apply or view on Unstop.
          </p>
        </div>

        <InteractiveHackathonList initialHackathons={hackathonsData.rows} />
      </section>
    </div>
  );
}

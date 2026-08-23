'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Trophy, Calendar, Users, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';

async function fetchHackathons(q: string, mode: string) {
  const params = new URLSearchParams({ pageSize: '50' });
  if (q) params.set('q', q);
  if (mode && mode !== 'ALL') params.set('mode', mode);

  const response = await fetch(`/api/hackathons?${params.toString()}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message ?? 'Could not load hackathons');
  return body.data as {
    data: Array<{
      id: string;
      title: string;
      description: string | null;
      organizer: string | null;
      mode: string | null;
      themes: string[];
      registrationDeadlineAt: string | null;
      prizeDisplay: string | null;
      prizeAmount: string | null;
      registrationUrl: string | null;
      sourceUrl: string | null;
      teamSizeMin: number | null;
      teamSizeMax: number | null;
    }>;
    meta: { total: number };
  };
}

export function HackathonBoard() {
  const [query, setQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'Online' | 'In-Person'>('ALL');

  const { data, isLoading, error } = useQuery({
    queryKey: ['hackathons', query, modeFilter],
    queryFn: () => fetchHackathons(query, modeFilter),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Live Unstop Hackathons</span>
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
            Explore All Hackathons
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse active hackathons, apply on Unstop, or find complementary teammates.
          </p>
        </div>

        {/* Search & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hackathons..."
              className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['ALL', 'Online', 'In-Person'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  modeFilter === mode
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading live hackathons from Unstop...
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-amber-50 p-6 text-amber-800">
          {error.message}
        </div>
      )}

      {!isLoading && !error && data?.data.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          No hackathons match your search. Try changing filters or search terms.
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.data.map((hackathon) => {
          const isOnline = hackathon.mode?.toLowerCase() === 'online';
          const deadline = hackathon.registrationDeadlineAt
            ? new Date(hackathon.registrationDeadlineAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : null;

          return (
            <div
              key={hackathon.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isOnline
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    {hackathon.mode || 'Online'}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    <Trophy className="h-3 w-3 text-amber-600" />
                    {hackathon.prizeDisplay || (hackathon.prizeAmount ? `₹${hackathon.prizeAmount}` : 'Cash & Swags')}
                  </span>
                </div>

                <h3 className="mt-4 line-clamp-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600">
                  {hackathon.title}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                  by {hackathon.organizer || 'Unstop Organizer'}
                </p>

                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {hackathon.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {hackathon.themes.slice(0, 3).map((theme) => (
                    <span
                      key={theme}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {deadline ? `Deadline: ${deadline}` : 'Open now'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {hackathon.teamSizeMin || 1}-{hackathon.teamSizeMax || 4} members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={hackathon.registrationUrl || hackathon.sourceUrl || 'https://unstop.com/hackathons'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-500"
                  >
                    <span>View on Unstop</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <Link
                    href={`/find-partners?hackathonId=${hackathon.id}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    title="Find Teammates"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

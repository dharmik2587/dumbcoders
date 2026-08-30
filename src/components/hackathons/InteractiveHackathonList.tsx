'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Calendar, Users, Trophy, Sparkles, MapPin, Search, RefreshCw } from 'lucide-react';
import type { Hackathon } from '@/lib/db/schema/core';

interface InteractiveHackathonListProps {
  initialHackathons: Hackathon[];
}

export function InteractiveHackathonList({ initialHackathons }: InteractiveHackathonListProps) {
  const [hackathons, setHackathons] = useState<Hackathon[]>(initialHackathons);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'Online' | 'In-Person'>('ALL');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const filtered = hackathons.filter((h) => {
    if (h.status === 'closed') return false;
    
    const matchesSearch =
      search.trim() === '' ||
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      (h.organizer && h.organizer.toLowerCase().includes(search.toLowerCase())) ||
      h.themes.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesMode =
      modeFilter === 'ALL' ||
      (modeFilter === 'Online' && h.mode?.toLowerCase() === 'online') ||
      (modeFilter === 'In-Person' && h.mode?.toLowerCase() !== 'online');

    return matchesSearch && matchesMode;
  });

  const handleRefresh = async () => {
    setSyncing(true);
    setSyncMsg('Fetching active hackathons from Unstop...');
    try {
      const res = await fetch('/api/hackathons?pageSize=50');
      const data = await res.json();
      if (data.data?.rows) {
        setHackathons(data.data.rows);
        setSyncMsg(`Refreshed! Showing ${data.data.rows.length} live hackathons.`);
      }
    } catch {
      setSyncMsg('Failed to refresh.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Unstop hackathons by name, theme, college..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['ALL', 'Online', 'In-Person'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  modeFilter === mode
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh Unstop Hackathons"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">
          {syncMsg}
        </div>
      )}

      {/* Hackathons Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-base font-semibold text-slate-700">No hackathons match your search.</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or click Refresh.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hackathon) => {
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
                  {/* Tags / Badges */}
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

                  {/* Title & Organizer */}
                  <h3 className="mt-4 line-clamp-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600">
                    {hackathon.title}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                    by {hackathon.organizer || 'Unstop Organizer'}
                  </p>

                  {/* Description preview */}
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {hackathon.description}
                  </p>

                  {/* Themes / Tags */}
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

                {/* Footer / Actions */}
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
      )}
    </div>
  );
}

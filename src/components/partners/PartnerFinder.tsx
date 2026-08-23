'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

type PartnerItem = {
  id: string;
  studentCode: string | null;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  skills: string[];
  rolePreference: string | null;
  compatibility: {
    score: number;
    reasons: string[];
  };
};

export function PartnerFinder() {
  const [query, setQuery] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['partners', query],
    queryFn: async () => {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? 'Could not load partners');
      return body.data as {
        data: PartnerItem[];
        meta: { total: number };
      };
    },
  });

  async function sendRequest(toUserId: string) {
    const message = window.prompt('Add a short message (optional):') ?? '';
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ toUserId, message }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      window.alert(body?.error?.message ?? 'Could not send request');
      return;
    }
    window.alert('Collaboration request sent successfully');
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Partner finder</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">Find your missing teammate</h1>
          <p className="mt-3 text-slate-600">
            Search by student code (e.g. HM-XXXXXX), name, or username. Ranked by complementary skills and roles.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by code (HM-...), name or username"
          className="input max-w-md"
        />
      </div>

      {isLoading && <p className="mt-10 text-slate-500">Finding builders…</p>}
      {error && <div className="mt-10 rounded-xl bg-amber-50 p-5 text-amber-800">{error.message}</div>}

      {!isLoading && !error && data?.data.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No open profiles found matching your search.
        </div>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.data.map((partner) => (
          <div key={partner.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {partner.avatarUrl ? (
                    <img src={partner.avatarUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                      {(partner.fullName ?? partner.username).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${partner.username}`} className="font-bold text-slate-900 hover:text-blue-700">
                        {partner.fullName ?? partner.username}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500">@{partner.username}</p>
                      {partner.studentCode && (
                        <span className="font-mono text-[10px] rounded bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 font-semibold text-blue-700">
                          {partner.studentCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 shrink-0">
                  {partner.compatibility.score}%
                </span>
              </div>

              {partner.rolePreference && (
                <div className="mt-3">
                  <span className="font-mono text-[11px] rounded bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                    Role: {partner.rolePreference}
                  </span>
                </div>
              )}

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                {partner.bio ?? 'No bio yet.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {partner.skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-3">
                {partner.compatibility.reasons.join(' · ') || 'Open to collaboration'}
              </p>
              <button
                type="button"
                onClick={() => void sendRequest(partner.id)}
                className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send request
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

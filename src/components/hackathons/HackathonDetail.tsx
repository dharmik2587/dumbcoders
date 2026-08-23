'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

type DetailResponse = {
  hackathon: {
    id: string;
    title: string;
    description: string | null;
    organizer: string | null;
    mode: string | null;
    location: string | null;
    registrationUrl: string | null;
    registrationDeadlineAt: string | null;
    startAt: string | null;
    endAt: string | null;
    themes: string[];
    techStack: string[];
    prizeDisplay: string | null;
  };
  bookmarked: boolean;
  interested: boolean;
};

export function HackathonDetail({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ['hackathon', id],
    queryFn: async () => {
      const response = await fetch(`/api/hackathons/${id}`);
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? 'Could not load hackathon');
      return body.data as DetailResponse;
    },
  });

  async function toggle(kind: 'bookmark' | 'interest', active: boolean) {
    const response = await fetch(`/api/hackathons/${id}/${kind}`, { method: active ? 'DELETE' : 'POST' });
    if (response.ok) void query.refetch();
    else {
      const body = await response.json().catch(() => null);
      window.alert(body?.error?.message ?? 'Sign in to use this feature');
    }
  }

  if (query.isLoading) return <div className="text-slate-500">Loading hackathon…</div>;
  if (query.error || !query.data) return <div className="rounded-xl bg-amber-50 p-5 text-amber-800">{query.error?.message ?? 'Hackathon not found.'}</div>;
  const { hackathon } = query.data;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/hackathons" className="text-sm font-semibold text-blue-700">← All hackathons</Link>
      <div className="mt-6 rounded-3xl bg-slate-950 px-8 py-12 text-white">
        <p className="text-sm font-semibold text-blue-300">{hackathon.organizer ?? 'Hackathon'} · {hackathon.mode ?? 'Open format'}</p>
        <h1 className="mt-4 text-4xl font-bold">{hackathon.title}</h1>
        <p className="mt-5 max-w-3xl leading-8 text-slate-300">{hackathon.description ?? 'The source has not provided a description yet.'}</p>
        <div className="mt-8 flex flex-wrap gap-3">{hackathon.themes.map((theme) => <span key={theme} className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-blue-100">{theme}</span>)}</div>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">Event details</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-slate-400">When</dt><dd className="mt-1 text-slate-700">{hackathon.startAt ? new Date(hackathon.startAt).toLocaleString() : 'To be announced'}{hackathon.endAt ? ` – ${new Date(hackathon.endAt).toLocaleString()}` : ''}</dd></div>
            <div><dt className="text-slate-400">Registration deadline</dt><dd className="mt-1 text-slate-700">{hackathon.registrationDeadlineAt ? new Date(hackathon.registrationDeadlineAt).toLocaleString() : 'To be announced'}</dd></div>
            <div><dt className="text-slate-400">Location</dt><dd className="mt-1 text-slate-700">{hackathon.location ?? 'Online or to be announced'}</dd></div>
            <div><dt className="text-slate-400">Prize</dt><dd className="mt-1 text-slate-700">{hackathon.prizeDisplay ?? 'Details on source listing'}</dd></div>
          </dl>
          {hackathon.techStack.length > 0 && <div className="mt-7"><h2 className="text-sm font-bold">Tech stack</h2><div className="mt-3 flex flex-wrap gap-2">{hackathon.techStack.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{item}</span>)}</div></div>}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Plan your participation</p>
          <div className="mt-4 grid gap-3"><button type="button" onClick={() => void toggle('bookmark', query.data.bookmarked)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${query.data.bookmarked ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700'}`}>{query.data.bookmarked ? 'Bookmarked' : 'Bookmark'}</button><button type="button" onClick={() => void toggle('interest', query.data.interested)} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${query.data.interested ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-700'}`}>{query.data.interested ? 'Interested' : 'Mark interested'}</button></div>
          {hackathon.registrationUrl ? <a href={hackathon.registrationUrl} target="_blank" rel="noreferrer" className="mt-4 block rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white">Register externally</a> : <p className="mt-4 text-sm text-slate-500">Registration URL not available.</p>}
        </div>
      </div>
    </div>
  );
}

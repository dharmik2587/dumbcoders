'use client';

import { useQuery } from '@tanstack/react-query';

export default function NotificationsPage() {
  const query = useQuery({ queryKey: ['notifications'], queryFn: async () => { const response = await fetch('/api/notifications'); const body = await response.json(); if (!response.ok) throw new Error(body.error?.message ?? 'Could not load notifications'); return body.data as Array<{ id: string; title: string; message: string; href: string | null; createdAt: string; readAt: string | null }>; } });
  return <div className="mx-auto max-w-3xl px-6 py-12"><p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Inbox</p><h1 className="mt-2 text-4xl font-bold">Notifications</h1>{query.isLoading && <p className="mt-8 text-slate-500">Loading…</p>}{query.error && <div className="mt-8 rounded-xl bg-amber-50 p-5 text-amber-800">{query.error.message}</div>}<div className="mt-8 space-y-3">{query.data?.length ? query.data.map((item) => <div key={item.id} className={`rounded-2xl border p-5 ${item.readAt ? 'border-slate-200 bg-white' : 'border-blue-200 bg-blue-50'}`}><p className="font-bold">{item.title}</p><p className="mt-1 text-sm text-slate-600">{item.message}</p><p className="mt-3 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p></div>) : !query.isLoading && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No notifications yet.</div>}</div></div>;
}

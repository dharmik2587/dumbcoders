'use client';

export default function PartnersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-xl px-6 py-20 text-center"><h1 className="text-2xl font-bold">Partner finder unavailable</h1><button onClick={reset} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white">Retry</button></div>;
}

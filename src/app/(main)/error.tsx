'use client';

export default function MainError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-2xl font-bold">This workspace could not load</h1>
      <p className="mt-3 text-slate-600">Retry the request or check your configuration.</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white">Retry</button>
    </div>
  );
}

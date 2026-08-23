'use client';

export default function ProfileError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Profile unavailable</h1>
        <button onClick={reset} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-white">Retry</button>
      </div>
    </div>
  );
}

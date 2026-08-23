'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-slate-600">Please retry the page. If the problem continues, check the server logs.</p>
        <button onClick={reset} className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-white">
          Try again
        </button>
      </div>
    </main>
  );
}

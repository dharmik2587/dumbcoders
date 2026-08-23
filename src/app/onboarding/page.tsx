import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">Stage 1</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Build your builder profile</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          A few thoughtful details help HackMate recommend teammates with complementary skills.
        </p>
        <div className="mt-10 rounded-3xl bg-white p-6 text-slate-900 shadow-soft sm:p-10">
          <OnboardingWizard />
        </div>
      </div>
    </main>
  );
}

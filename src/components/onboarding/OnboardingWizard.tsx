'use client';

import { useState } from 'react';

const steps = ['Basics', 'College', 'Skills', 'Role', 'Availability', 'Done'];

const initialForm = {
  fullName: '',
  bio: '',
  collegeId: null as string | null,
  branch: '',
  graduationYear: new Date().getFullYear() + 4,
  skills: [] as string[],
  rolePreference: '',
  hackathonInterests: [] as string[],
  availability: '',
  portfolioUrl: '',
  linkedinUrl: '',
};

const skillOptions = ['React', 'Next.js', 'Python', 'Machine Learning', 'Design', 'Product', 'Backend', 'DevOps'];
const interestOptions = ['AI/ML', 'FinTech', 'HealthTech', 'Web3', 'EdTech', 'Climate', 'Gaming', 'Open Innovation'];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key: 'skills' | 'hackathonInterests', value: string) {
    const values = form[key];
    update(key, values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  async function complete() {
    setSaving(true);
    setError('');

    // Client-side sanitization
    const payload = {
      ...form,
      // Convert empty collegeId to null
      collegeId: form.collegeId || null,
      // Handle NaN graduation year
      graduationYear: isNaN(form.graduationYear) ? null : form.graduationYear,
      onboardingDone: true,
    };

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSaving(false);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const msg = body?.error?.message ?? 'We could not save your profile. Make sure you are signed in and the database is configured.';
        setError(msg);
        return;
      }
      setStep(5);
    } catch (err: any) {
      setSaving(false);
      setError(err?.message ?? 'Failed to connect to server.');
    }
  }

  function next() {
    if (step === 4) {
      void complete();
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between gap-2">
        {steps.map((label, index) => (
          <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${index <= step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {index + 1}
            </div>
            <span className={`hidden truncate text-xs font-medium sm:block ${index === step ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <Field label="Full name">
            <input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Aditi Sharma" className="input" />
          </Field>
          <Field label="Short bio">
            <textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} placeholder="What do you like building?" className="input min-h-28" />
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <Field label="College ID (optional for now)">
            <input value={form.collegeId ?? ''} onChange={(event) => update('collegeId', event.target.value || null)} placeholder="Paste a college UUID after seeding colleges" className="input" />
          </Field>
          <Field label="Branch or course">
            <input value={form.branch} onChange={(event) => update('branch', event.target.value)} placeholder="Computer Science" className="input" />
          </Field>
          <Field label="Graduation year">
            <input type="number" value={form.graduationYear} onChange={(event) => update('graduationYear', Number(event.target.value))} className="input" />
          </Field>
        </div>
      )}

      {step === 2 && (
        <OptionGrid title="Choose your strongest skills" options={skillOptions} values={form.skills} onToggle={(value) => toggleArray('skills', value)} />
      )}

      {step === 3 && (
        <div className="space-y-7">
          <Field label="Preferred role">
            <select value={form.rolePreference} onChange={(event) => update('rolePreference', event.target.value)} className="input">
              <option value="">Select a role</option>
              <option>Frontend</option><option>Backend</option><option>AI/ML</option><option>Designer</option><option>Product</option><option>Any role</option>
            </select>
          </Field>
          <OptionGrid title="Topics you want to hack on" options={interestOptions} values={form.hackathonInterests} onToggle={(value) => toggleArray('hackathonInterests', value)} />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <Field label="Availability">
            <select value={form.availability} onChange={(event) => update('availability', event.target.value)} className="input">
              <option value="">Choose availability</option>
              <option>Weekends</option><option>Evenings</option><option>Flexible</option><option>Full-time during events</option>
            </select>
          </Field>
          <Field label="Portfolio URL (optional)">
            <input value={form.portfolioUrl} onChange={(event) => update('portfolioUrl', event.target.value)} placeholder="https://yourportfolio.dev" className="input" />
          </Field>
          <Field label="LinkedIn URL (optional)">
            <input value={form.linkedinUrl} onChange={(event) => update('linkedinUrl', event.target.value)} placeholder="https://linkedin.com/in/you" className="input" />
          </Field>
        </div>
      )}

      {step === 5 && (
        <div className="rounded-2xl bg-blue-50 p-6">
          <h2 className="text-2xl font-bold text-slate-900">Your profile is ready.</h2>
          <p className="mt-3 leading-7 text-slate-600">
            You can edit these details anytime. Your unique student code is generated and linked.
          </p>
          <div className="mt-6">
            <a
              href="/dashboard"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500 shadow-md"
            >
              Go to Dashboard →
            </a>
          </div>
        </div>
      )}

      {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {step < 5 && (
        <div className="mt-10 flex justify-between gap-3">
          <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || saving} className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 disabled:opacity-40">Back</button>
          <button type="button" onClick={next} disabled={saving} className="rounded-lg bg-slate-950 px-5 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : step === 4 ? 'Finish profile' : 'Continue'}</button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}

function OptionGrid({ title, options, values, onToggle }: { title: string; options: string[]; values: string[]; onToggle: (value: string) => void }) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold text-slate-700">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = values.includes(option);
          return <button type="button" key={option} onClick={() => onToggle(option)} className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}>{option}</button>;
        })}
      </div>
    </div>
  );
}

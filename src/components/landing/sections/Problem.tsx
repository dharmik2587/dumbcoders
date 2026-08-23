'use client';

import { Kicker, Reveal } from "../lib/kit";

const FAILURES = [
  {
    t: "T-14d",
    title: "The chat goes quiet",
    body: "A 240-member group chat, forty 'interested' replies, and nobody has actually said what they can build.",
  },
  {
    t: "T-06h",
    title: "Three frontend, no backend",
    body: "Teams form around people who reply fastest, not around the skills the problem statement demands.",
  },
  {
    t: "T+20h",
    title: "The designer arrives late",
    body: "By the time design enters, the data model is fixed and the interface has to be argued backwards.",
  },
  {
    t: "T+34h",
    title: "Submission is a solo sprint",
    body: "One person writes the README, the deck and the demo script while everyone else sleeps.",
  },
];

export function Problem() {
  return (
    <section
      id="problem"
      data-zone="dark"
      className="relative border-t border-white/10 bg-ink-950 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
          {/* margin rail */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <Kicker tone="beam">03 / The problem</Kicker>
              </Reveal>
              <Reveal delay={80}>
                <p className="mt-5 max-w-[240px] font-mono text-[11px] leading-[1.8] tracking-[0.02em] text-slate-400">
                  Field notes from 60+ campus hackathons, 2024–2026. Teams rarely fail on
                  ideas. They fail on composition.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-8 space-y-2 border-t border-white/10 pt-4">
                  {[
                    ["Sample", "n = 412 teams"],
                    ["Window", "Jan 2024 — Feb 2026"],
                    ["Method", "Post-submission interviews"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                        {k}
                      </span>
                      <span className="font-mono text-[10px] text-slate-300">{v}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>

          {/* editorial body */}
          <div className="lg:col-span-8 lg:col-start-5">
            <Reveal>
              <h2 className="text-[clamp(2rem,4.6vw,3.9rem)] font-medium leading-[1.0] tracking-[-0.04em] text-white">
                Most hackathon teams are assembled by accident.
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
                <p className="text-[15px] leading-[1.75] text-slate-400">
                  <span className="float-left mr-2 mt-1 text-[42px] font-medium leading-[0.8] tracking-[-0.04em] text-white">
                    Y
                  </span>
                  ou find a problem statement you care about. You post it in a group chat.
                  Four people say yes within a minute — three of them write React. Nobody
                  has asked who owns the model, who owns the deck, or who is actually free
                  on Saturday afternoon.
                </p>
                <p className="text-[15px] leading-[1.75] text-slate-400">
                  The result is a team that looks complete on the registration form and
                  behaves like two people and an audience for thirty-six hours. The gap
                  isn&apos;t talent. It&apos;s that nobody could see the shape of the team until it
                  was too late to change it.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <figure className="my-14 border-y border-white/10 py-10">
                <blockquote className="text-[clamp(1.5rem,3vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.035em] text-white">
                  &ldquo;We didn&apos;t lose because the idea was weak. We lost because nobody on the
                  team could build the thing we pitched.&rdquo;
                  <span className="ml-2 inline-block h-[1px] w-16 translate-y-[-0.35em] bg-mint" />
                </blockquote>
                <figcaption className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Finalist debrief — regional round, Pune
                </figcaption>
              </figure>
            </Reveal>

            {/* failure ledger */}
            <Reveal>
              <div className="flex items-baseline justify-between border-b border-white/15 pb-3">
                <Kicker tone="beam">Failure ledger</Kicker>
                <span className="font-mono text-[10px] tracking-[0.14em] text-slate-500">
                  observed pattern
                </span>
              </div>
            </Reveal>

            <div className="divide-y divide-white/10">
              {FAILURES.map((f, i) => (
                <Reveal
                  key={f.t}
                  delay={i * 80}
                  className="group grid grid-cols-12 gap-x-6 gap-y-2 py-6 transition-colors hover:bg-ink-900/40"
                >
                  <div className="col-span-3 md:col-span-2">
                    <span className="font-mono text-[11px] tnum text-amber">{f.t}</span>
                  </div>
                  <div className="col-span-9 md:col-span-4">
                    <h3 className="text-[16px] font-medium tracking-[-0.02em] text-white group-hover:text-beam transition-colors">
                      {f.title}
                    </h3>
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <p className="text-[13.5px] leading-[1.65] text-slate-400">
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-12 flex items-start gap-4 border-l-2 border-beam bg-ink-900/60 px-6 py-5 border border-white/10">
                <span className="mono-label mt-0.5 text-beam font-semibold">Constraint</span>
                <p className="text-[14px] leading-[1.7] text-slate-300">
                  Team composition is decided in the first six hours. Any tool that helps
                  has to work <em className="not-italic text-white font-medium">before</em> the
                  hackathon starts — not inside it.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CornerTicks, Kicker, Meter, Reveal } from "../lib/kit";
import { projectTimeline } from "../lib/content";
import { cn } from "@/lib/utils";

export function Builder() {
  return (
    <section
      id="builder"
      data-zone="dark"
      className="relative overflow-hidden bg-ink-950 py-24 md:py-32 text-white"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(79,140,255,.5),transparent)",
        }}
        aria-hidden
      />
      <div className="tech-cols pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] opacity-[0.12] blur-[130px]"
        style={{ background: "radial-gradient(circle,#FFB866,transparent 65%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-x-10 gap-y-16 lg:grid-cols-12">
          {/* statement */}
          <div className="lg:col-span-6">
            <Reveal>
              <Kicker tone="amber">08 / Why it matters</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-7 text-[clamp(2.2rem,5vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.045em]">
                Nobody remembers
                <br />
                the prize money.
                <br />
                <span className="text-slate-tech">
                  They remember the
                  <br />
                  Sunday night build.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={170}>
              <div className="mt-10 max-w-lg space-y-5 text-[15px] leading-[1.75] text-slate-tech">
                <p>
                  The thing students describe months later isn&apos;t the result. It&apos;s that one
                  weekend where the work compounded — where the model landed at 3 a.m. and
                  the interface was already waiting for it.
                </p>
                <p>
                  That only happens with the right four people. Not the most decorated, the
                  right ones: the person who holds the backend steady, the person who cuts
                  scope without killing the idea, the person who makes it legible to a judge
                  in ninety seconds.
                </p>
                <p className="border-l border-white/15 pl-4 text-white">
                  HackMate exists to make that combination findable in an afternoon instead
                  of a lucky semester.
                </p>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div className="mt-10 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
                {[
                  { k: "Before", v: "Group chat", s: "whoever replies first" },
                  { k: "With HackMate", v: "Coverage map", s: "who closes the gap" },
                  { k: "After", v: "Project record", s: "portfolio, not a screenshot" },
                ].map((c) => (
                  <div key={c.k} className="bg-ink-900 p-4">
                    <div className="mono-label text-slate-muted">{c.k}</div>
                    <div className="mt-2 text-[14px] text-white font-medium">{c.v}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-muted">
                      {c.s}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* project workspace */}
          <div className="lg:col-span-6">
            <Reveal delay={140}>
              <div className="relative border border-white/12 bg-ink-900/80">
                <CornerTicks tone="beam" />
                <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[19px] tracking-[-0.025em] text-white font-medium">
                        Triage
                      </span>
                      <span className="mono-label border border-beam/40 bg-beam/10 px-1.5 py-0.5 text-beam">
                        in build
                      </span>
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-muted">
                      Symbiosis · track: ai/health · submission T-08:20
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {["AR", "DM", "SK", "RS"].map((a) => (
                      <span
                        key={a}
                        className="flex h-7 w-7 items-center justify-center border border-white/15 bg-ink-850 font-mono text-[9px] text-slate-tech"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* progress */}
                <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
                  {[
                    { k: "Commits", v: "112" },
                    { k: "Open tasks", v: "6" },
                    { k: "Owner gaps", v: "0" },
                  ].map((s) => (
                    <div key={s.k} className="px-5 py-4">
                      <div className="mono-label text-slate-muted">{s.k}</div>
                      <div className="mt-1.5 font-mono text-[20px] tnum text-white">
                        {s.v}
                      </div>
                    </div>
                  ))}
                </div>

                {/* timeline */}
                <div className="px-5 py-5">
                  <div className="mono-label text-slate-muted">Build log</div>
                  <div className="relative mt-5">
                    <span className="absolute left-[5px] top-1 bottom-1 w-px bg-white/10" />
                    {projectTimeline.map((t, i) => (
                      <div key={t.t} className="relative flex gap-4 pb-5 last:pb-0">
                        <span
                          className={cn(
                            "relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border",
                            t.state === "done" && "border-mint/60 bg-mint",
                            t.state === "active" && "border-beam bg-beam/30",
                            t.state === "todo" && "border-white/25 bg-ink-900",
                          )}
                        >
                          {t.state === "active" && (
                            <span className="absolute inset-0 animate-pulse-dot rounded-full bg-beam/60" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3">
                            <span className="font-mono text-[11px] tnum text-slate-muted">
                              {t.t}
                            </span>
                            <span
                              className={cn(
                                "text-[13.5px]",
                                t.state === "todo"
                                  ? "text-slate-muted"
                                  : "text-white",
                              )}
                            >
                              {t.label}
                            </span>
                          </div>
                          {t.state === "active" && (
                            <div className="mt-2 max-w-[240px]">
                              <Meter value={68} tone="beam" delay={i * 100} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* checklist */}
                <div className="border-t border-white/10 px-5 py-5">
                  <div className="mono-label text-slate-muted">
                    Submission checklist · 3 of 5
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {[
                      ["Repo public + README", true],
                      ["Demo video under 3 min", true],
                      ["Model card + eval table", true],
                      ["Deck exported to PDF", false],
                      ["All member profiles linked", false],
                    ].map(([label, done]) => (
                      <div
                        key={label as string}
                        className="flex items-center justify-between gap-4"
                      >
                        <span
                          className={cn(
                            "text-[12.5px]",
                            done ? "text-slate-muted line-through" : "text-white",
                          )}
                        >
                          {label as string}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[10px] uppercase tracking-[0.14em]",
                            done ? "text-mint" : "text-amber",
                          )}
                        >
                          {done ? "done" : "pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-slate-muted">
                Every project stays in your profile after submission — stack, role, hours,
                outcome. The next team you join starts with evidence.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push(`/sign-up?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <section
      id="cta"
      data-zone="dark"
      className="relative overflow-hidden border-t border-white/10 bg-ink-900 py-28 md:py-40 text-white"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2 opacity-[0.14] blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, #4F8CFF, transparent 60%), radial-gradient(ellipse at 75% 50%, #43D6C2, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="tech-cols pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Kicker tone="mint">09 / Start</Kicker>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-7 text-[clamp(2.4rem,6vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.045em]">
              Your idea already has
              <br />
              a shape.{" "}
              <span className="text-slate-tech">
                Find the people
                <br />
                who fit it.
              </span>
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mx-auto mt-7 max-w-md text-[15px] leading-[1.7] text-slate-tech">
              Build a profile in about six minutes. We&apos;ll show you the events that fit your
              term and the builders who close your gaps.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 flex max-w-lg flex-col gap-2 sm:flex-row"
            >
              <label className="sr-only" htmlFor="email">
                College email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="flex-1 border border-white/15 bg-ink-950/70 px-4 py-3.5 font-mono text-[12px] text-white placeholder:text-slate-muted focus:border-beam focus:outline-none"
              />
              <button
                type="submit"
                className="group relative overflow-hidden bg-beam px-7 py-3.5 text-[13px] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Request access</span>
                <span className="absolute inset-0 -translate-x-full bg-[#3d78e8] transition-transform duration-500 group-hover:translate-x-0" />
              </button>
            </form>
          </Reveal>

          <Reveal delay={310}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-muted">
              <span>Onboarding 6 min</span>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <span>College email required</span>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <span>Always free for students</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

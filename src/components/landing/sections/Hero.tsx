'use client';

import Link from 'next/link';
import { CornerTicks, Kicker, Meter, Reveal, SkillChip } from "../lib/kit";
import { candidates } from "../lib/content";

export function Hero() {
  return (
    <section
      id="top"
      data-zone="dark"
      className="relative min-h-[100svh] overflow-hidden bg-ink-950 pt-28 md:pt-32 text-white"
    >
      {/* technical background */}
      <div className="tech-cols pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="dotfield pointer-events-none absolute inset-0 opacity-40"
        style={{
          maskImage:
            "radial-gradient(120% 90% at 70% 0%, #000 0%, transparent 68%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 70% 0%, #000 0%, transparent 68%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 -top-52 h-[560px] w-[560px] rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(circle,#4F8CFF,transparent 65%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full opacity-[0.10] blur-[120px]"
        style={{ background: "radial-gradient(circle,#43D6C2,transparent 65%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        {/* top meta rail */}
        <Reveal className="flex items-center justify-between border-b border-white/10 pb-3">
          <Kicker tone="beam">01 / Teammate layer for college hackathons</Kicker>
          <Kicker className="hidden md:inline-flex">Cycle 2026 · Spring</Kicker>
        </Reveal>

        <div className="grid grid-cols-1 gap-x-10 gap-y-14 pt-12 lg:grid-cols-12 lg:pt-16">
          {/* ---------------- left: editorial ---------------- */}
          <div className="lg:col-span-6 xl:col-span-6">
            <Reveal delay={60}>
              <h1 className="text-[clamp(2.7rem,7.4vw,5.6rem)] font-medium leading-[0.92] tracking-[-0.045em]">
                Find the missing
                <br />
                piece in your{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">build.</span>
                  <span
                    className="absolute bottom-1 left-0 -z-0 h-[0.32em] w-full bg-beam/25"
                    aria-hidden
                  />
                  <svg
                    className="absolute -bottom-1 left-0 h-3 w-full text-beam"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      d="M1 9C40 3 90 3 199 6"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-8 max-w-xl text-[16px] leading-[1.65] text-slate-tech md:text-[17px]">
                HackMate reads what your team can actually ship — the roles you have, the
                hours you&apos;re free, the stack you argue about least — then introduces the
                few people who close the gap. No cold DMs into random group chats.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/sign-up"
                  className="group relative overflow-hidden bg-beam px-6 py-3.5 text-[13px] font-medium tracking-[-0.01em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Start your build profile</span>
                  <span className="absolute inset-0 -translate-x-full bg-[#3d78e8] transition-transform duration-500 group-hover:translate-x-0" />
                </Link>
                <a
                  href="#discovery"
                  className="group flex items-center gap-2 border border-white/15 px-6 py-3.5 text-[13px] text-white/80 transition-colors hover:border-white/35 hover:text-white"
                >
                  Browse hackathons
                  <span className="font-mono text-[11px] transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-muted">
                <span>College email verified</span>
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
                <span>Free for students</span>
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
                <span>No recruiter access</span>
              </div>
            </Reveal>
          </div>

          {/* ---------------- right: match console ---------------- */}
          <div className="lg:col-span-6">
            <Reveal delay={220}>
              <Console />
            </Reveal>
          </div>
        </div>

        {/* bottom status rail */}
        <Reveal
          delay={420}
          className="mt-16 hidden items-center justify-between border-t border-white/10 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-muted md:flex lg:mt-20"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
            Match engine active
          </span>
          <span>Team gap detection · v0.9.2</span>
          <span>Scroll to see how it works</span>
        </Reveal>
      </div>
    </section>
  );
}

function Console() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden border border-white/12 bg-ink-900/85 backdrop-blur-sm">
        <CornerTicks tone="beam" />
        {/* live scan — the engine is re-ranking */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-20 animate-sweep bg-gradient-to-b from-transparent via-beam/[0.07] to-transparent"
        />

        {/* window header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
            <span className="mono-label text-white/80">Match console</span>
          </div>
          <span className="mono-label text-slate-muted">team · orbit-04</span>
        </div>

        {/* context strip */}
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
          {[
            { k: "Event", v: "Symbiosis", s: "HK-2041" },
            { k: "Members", v: "3 / 4", s: "1 slot open" },
            { k: "Gap", v: "AI / ML", s: "critical" },
          ].map((c) => (
            <div key={c.k} className="px-4 py-3.5">
              <div className="mono-label text-slate-muted">{c.k}</div>
              <div className="mt-1.5 text-[15px] tracking-[-0.02em] text-white">
                {c.v}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-slate-tech">{c.s}</div>
            </div>
          ))}
        </div>

        {/* candidate rows */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="mono-label text-slate-muted">
              Ranked complements
            </span>
            <span className="mono-label text-mint">4 candidates</span>
          </div>

          <div className="mt-3 space-y-px">
            {candidates.map((c, i) => (
              <div
                key={c.id}
                className="group relative border border-white/8 bg-white/[0.015] px-3.5 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-muted">
                        {c.id}
                      </span>
                      <span className="truncate text-[14px] tracking-[-0.01em] text-white">
                        {c.name}
                      </span>
                      {i === 0 && (
                        <span className="mono-label border border-mint/40 bg-mint/10 px-1.5 py-0.5 text-mint">
                          best fit
                        </span>
                      )}
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-slate-muted">
                      {c.meta} · {c.reason}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[17px] tnum text-white">
                      {c.score}
                      <span className="text-[10px] text-slate-muted">%</span>
                    </div>
                    <div className="mono-label mt-0.5 text-slate-muted">complement</div>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <Meter
                    value={c.score}
                    delay={i * 130}
                    tone={i === 0 ? "mint" : "beam"}
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {c.skills.map((s) => (
                    <SkillChip key={s} label={s} />
                  ))}
                  <span className="ml-auto font-mono text-[10px] text-slate-tech">
                    {c.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* slots footer */}
        <div className="border-t border-white/10 px-4 py-3.5">
          <div className="mono-label text-slate-muted">Roster coverage</div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {[
              { r: "Front", f: true },
              { r: "Back", f: true },
              { r: "Product", f: true },
              { r: "AI/ML", f: false },
            ].map((s) => (
              <div
                key={s.r}
                className={
                  s.f
                    ? "border border-white/12 bg-white/[0.03] px-1.5 py-2 text-center"
                    : "border border-dashed border-amber/45 bg-amber/[0.06] px-1.5 py-2 text-center"
                }
              >
                <div
                  className={
                    s.f
                      ? "font-mono text-[9px] uppercase tracking-[0.1em] text-slate-tech"
                      : "font-mono text-[9px] uppercase tracking-[0.1em] text-amber"
                  }
                >
                  {s.r}
                </div>
                <div
                  className={
                    s.f
                      ? "mt-1 font-mono text-[10px] text-mint"
                      : "mt-1 font-mono text-[10px] text-amber/70"
                  }
                >
                  {s.f ? "filled" : "open"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* annotations */}
      <div className="pointer-events-none absolute -left-4 top-1/2 hidden -translate-x-full xl:block">
        <div className="flex items-center gap-2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] text-slate-muted">
          <span className="h-px w-8 bg-white/20" />
          complement score
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-6 right-0 hidden lg:block">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber/80">
          ↓ open slot triggers outreach
        </div>
      </div>
    </div>
  );
}

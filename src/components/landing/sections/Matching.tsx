'use client';

import { useState } from "react";
import { CountUp, CornerTicks, Kicker, Meter, Reveal } from "../lib/kit";
import { matchSignals } from "../lib/content";
import { cn } from "@/lib/utils";

type Break = { id: string; raw: number };
const BREAKDOWN: Record<string, Break[]> = {
  "Priya T.": [
    { id: "S-01", raw: 0.96 },
    { id: "S-02", raw: 0.98 },
    { id: "S-03", raw: 0.91 },
    { id: "S-04", raw: 0.88 },
    { id: "S-05", raw: 0.95 },
  ],
  "Arjun K.": [
    { id: "S-01", raw: 0.82 },
    { id: "S-02", raw: 0.94 },
    { id: "S-03", raw: 0.86 },
    { id: "S-04", raw: 0.98 },
    { id: "S-05", raw: 0.78 },
  ],
  "Meera S.": [
    { id: "S-01", raw: 0.93 },
    { id: "S-02", raw: 0.75 },
    { id: "S-03", raw: 0.79 },
    { id: "S-04", raw: 0.55 },
    { id: "S-05", raw: 0.9 },
  ],
};

const STEPS = [
  { n: "01", t: "Parse", d: "Repos, projects, stack and self-declared roles become a skill vector." },
  { n: "02", t: "Detect", d: "The team's vector is compared against the event's track demands." },
  { n: "03", t: "Rank", d: "Builders are ranked by how much of the gap they close, not by similarity." },
  { n: "04", t: "Open", d: "A request carries role, hours and reason — both sides see the fit." },
];

export function Matching() {
  const names = Object.keys(BREAKDOWN);
  const [active, setActive] = useState(names[0]);
  const rows = BREAKDOWN[active];
  const byId = Object.fromEntries(rows.map((r) => [r.id, r.raw]));
  const total = Math.round(
    matchSignals.reduce((acc, s) => acc + s.weight * (byId[s.id] ?? 0), 0),
  );

  return (
    <section
      id="matching"
      data-zone="dark"
      className="relative overflow-hidden bg-ink-950 py-24 md:py-32 text-white"
    >
      <div className="tech-cols pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 opacity-[0.13] blur-[130px]"
        style={{ background: "radial-gradient(ellipse,#4F8CFF,transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Kicker tone="beam">04 / Matching model</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-6 text-[clamp(2.1rem,4.4vw,3.6rem)] font-medium leading-[1.02] tracking-[-0.04em]">
                Compatibility is a
                <br />
                <span className="text-slate-tech">calculation,</span> not a
                <br />
                first impression.
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-md text-[15px] leading-[1.7] text-slate-tech">
                Five signals, weighted, scored against the specific event you&apos;re entering.
                The output is a number both people can interrogate — every point traceable
                to a signal you can disagree with.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-10 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4 lg:grid-cols-2">
                {STEPS.map((s) => (
                  <div key={s.n} className="bg-ink-900 p-4">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-beam">
                      {s.n}
                    </span>
                    <div className="mt-2 text-[14px] tracking-[-0.01em] text-white">
                      {s.t}
                    </div>
                    <p className="mt-1.5 text-[12px] leading-[1.55] text-slate-muted">
                      {s.d}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* score decomposition */}
          <div className="lg:col-span-7">
            <Reveal delay={140}>
              <div className="relative border border-white/12 bg-ink-900/80">
                <CornerTicks tone="mint" />
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="mono-label text-white/80">Score decomposition</span>
                    <span className="mono-label text-slate-muted">orbit-04</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {names.map((n) => (
                      <button
                        key={n}
                        onClick={() => setActive(n)}
                        className={cn(
                          "border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors",
                          active === n
                            ? "border-mint/50 bg-mint/10 text-mint"
                            : "border-white/12 text-slate-muted hover:border-white/30 hover:text-white",
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* table header */}
                <div className="hidden grid-cols-12 gap-4 border-b border-white/10 px-5 py-2.5 md:grid">
                  <span className="mono-label col-span-4 text-slate-muted">Signal</span>
                  <span className="mono-label col-span-2 text-right text-slate-muted">Weight</span>
                  <span className="mono-label col-span-2 text-right text-slate-muted">Raw</span>
                  <span className="mono-label col-span-4 text-slate-muted">Contribution</span>
                </div>

                <div className="divide-y divide-white/8">
                  {matchSignals.map((s, i) => {
                    const raw = byId[s.id] ?? 0;
                    const contribution = (s.weight * raw) / 34; // normalised for bar width
                    return (
                      <div
                        key={s.id}
                        className="group grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                      >
                        <div className="col-span-12 md:col-span-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-muted">
                              {s.id}
                            </span>
                            <span className="text-[13.5px] text-white">{s.label}</span>
                          </div>
                          <p className="mt-1 text-[11.5px] leading-[1.5] text-slate-muted md:hidden">
                            {s.detail}
                          </p>
                        </div>
                        <div className="col-span-4 md:col-span-2 md:text-right">
                          <span className="font-mono text-[12px] tnum text-slate-tech">
                            {s.weight}
                          </span>
                          <span className="font-mono text-[10px] text-slate-muted">w</span>
                        </div>
                        <div className="col-span-4 md:col-span-2 md:text-right">
                          <span className="font-mono text-[12px] tnum text-mint">
                            {raw.toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-4 flex items-center gap-3 md:col-span-4">
                          <Meter
                            key={`${active}-${s.id}`}
                            value={Math.min(contribution, 100)}
                            delay={i * 90}
                            tone={i === 0 ? "mint" : "beam"}
                          />
                          <span className="w-9 shrink-0 text-right font-mono text-[11px] tnum text-slate-tech">
                            {(s.weight * raw).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* total */}
                <div className="flex items-center justify-between border-t border-white/12 bg-white/[0.02] px-5 py-5">
                  <div>
                    <div className="mono-label text-slate-muted">
                      Complement score · {active}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-muted">
                      Σ wᵢ · sᵢ , renorm. 0—100
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[34px] leading-none tnum text-white">
                      <CountUp to={total} duration={900} />
                    </div>
                    <div className="mono-label mt-1.5 text-mint">/ 100</div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* signal legend */}
            <Reveal delay={260}>
              <div className="mt-4 border border-white/10">
                {matchSignals.slice(0, 2).map((s, i) => (
                  <div
                    key={s.id}
                    className={cn(
                      "flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-start sm:gap-6",
                      i === 0 && "border-b border-white/10",
                    )}
                  >
                    <span className="mono-label w-36 shrink-0 pt-1 text-slate-muted">
                      {s.id} · {s.label}
                    </span>
                    <p className="text-[13px] leading-[1.65] text-slate-tech">
                      {s.detail}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* contrast band */}
        <Reveal delay={120}>
          <div className="mt-20 grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-2">
            <Contrast
              tone="slate"
              label="Similarity matching"
              line="Ranks people who look like you."
              body="Two React developers and a dream. Feels comfortable on day one, stalls on day two."
              cells={[0.9, 0.85, 0.2, 0.1, 0.15]}
            />
            <Contrast
              tone="mint"
              label="Complement matching"
              line="Ranks people who complete the build."
              body="The missing model and the missing interface arrive before the scope is frozen."
              cells={[0.35, 0.5, 0.95, 0.9, 0.4]}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Contrast({
  tone,
  label,
  line,
  body,
  cells,
}: {
  tone: "slate" | "mint";
  label: string;
  line: string;
  body: string;
  cells: number[];
}) {
  const labels = ["Front", "Back", "ML", "Design", "Pitch"];
  return (
    <div className="bg-ink-900 p-7">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "mint" ? "bg-mint" : "bg-slate-muted",
          )}
        />
        <span className="mono-label text-white/70">{label}</span>
      </div>
      <p className="mt-4 text-[19px] tracking-[-0.025em] text-white">{line}</p>
      <p className="mt-2 max-w-sm text-[13.5px] leading-[1.65] text-slate-muted">{body}</p>

      <div className="mt-7 flex gap-1.5">
        {cells.map((c, i) => (
          <div key={i} className="flex-1">
            <div
              className={cn(
                "h-16 w-full border",
                tone === "mint"
                  ? "border-mint/25 bg-mint/10"
                  : "border-white/10 bg-white/[0.03]",
              )}
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div
                className={cn(
                  "absolute bottom-0 left-0 w-full transition-all duration-1000",
                  tone === "mint" ? "bg-mint/70" : "bg-white/25",
                )}
                style={{ height: `${c * 100}%`, transitionDelay: `${i * 90}ms` }}
              />
            </div>
            <div className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-slate-muted">
              {labels[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

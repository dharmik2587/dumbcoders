'use client';

import { useState } from "react";
import { Kicker, Meter, Reveal } from "../lib/kit";
import { requests } from "../lib/content";
import { cn } from "@/lib/utils";

type Decision = "pending" | "accepted" | "passed";

const BASE_ROSTER = [
  {
    name: "You",
    role: "Frontend",
    hours: [2, 3, 1, 0, 3, 4, 4],
    stack: ["React", "TS"],
  },
  {
    name: "Riya S.",
    role: "Product",
    hours: [1, 2, 2, 3, 2, 3, 2],
    stack: ["Research", "Deck"],
  },
];

const DELTAS: Record<string, { coverage: number; name: string; role: string; hours: number[]; stack: string[] }> = {
  "REQ-2291": { coverage: 12, name: "Ananya R.", role: "AI / ML", hours: [3, 2, 4, 2, 3, 4, 3], stack: ["PyTorch", "Python"] },
  "REQ-2288": { coverage: 7, name: "Dev M.", role: "Backend", hours: [2, 4, 3, 1, 4, 3, 1], stack: ["Go", "Postgres"] },
  "REQ-2284": { coverage: 9, name: "Sara K.", role: "Design", hours: [1, 1, 2, 4, 2, 2, 1], stack: ["Figma", "Motion"] },
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function Composition() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({
    "REQ-2291": "pending",
    "REQ-2288": "pending",
    "REQ-2284": "accepted",
  });

  const coverage = 52 + Object.entries(decisions).reduce(
    (acc, [id, d]) => (d === "accepted" ? acc + DELTAS[id].coverage : acc),
    0,
  );

  const roster = [
    ...BASE_ROSTER,
    ...Object.entries(decisions)
      .filter(([, d]) => d === "accepted")
      .map(([id]) => {
        const m = DELTAS[id];
        return { name: m.name, role: m.role, hours: m.hours, stack: m.stack };
      }),
  ];

  const set = (id: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: d }));

  return (
    <section
      id="composition"
      data-zone="dark"
      className="relative border-t border-white/10 bg-ink-950 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Kicker tone="beam">07 / Composition</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-white">
                Assemble the team like a system diagram.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-slate-400">
                Each accepted request writes into the roster: a role, a stack, and the hours
                that person is genuinely free. Coverage updates in place, so the team can see
                what changed and why.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="mt-9 border border-white/10 bg-ink-900/70 backdrop-blur-sm p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="mono-label text-slate-400">Roster coverage</div>
                    <div className="mt-2 font-mono text-[44px] leading-none tnum text-white">
                      {coverage}
                      <span className="text-[18px] text-slate-500">%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono-label text-slate-400">Target</div>
                    <div className="mt-2 font-mono text-[18px] tnum text-slate-400">
                      85%
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <Meter
                    value={Math.min(coverage, 100)}
                    theme="dark"
                    tone={coverage >= 85 ? "mint" : "amber"}
                    height={4}
                  />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  <span>{roster.length} members</span>
                  <span>
                    {coverage >= 85 ? "Ready to register" : `${85 - coverage}% short`}
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* roster */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="border border-white/10 bg-ink-900/60 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 bg-ink-900">
                  <span className="mono-label text-slate-400">
                    Live roster · orbit-04
                  </span>
                  <span className="mono-label text-mint">weekly availability</span>
                </div>
                <div className="divide-y divide-white/10">
                  {roster.map((m) => (
                    <div
                      key={m.name}
                      className="grid grid-cols-12 items-center gap-4 px-5 py-4"
                      style={{ animation: "rise .6s cubic-bezier(.16,1,.3,1) both" }}
                    >
                      <div className="col-span-5 md:col-span-4">
                        <div className="text-[14.5px] tracking-[-0.01em] text-white font-medium">
                          {m.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                          {m.role}
                        </div>
                      </div>
                      <div className="col-span-7 flex flex-wrap gap-2 md:col-span-4">
                        {m.stack.map((s) => (
                          <span
                            key={s}
                            className="border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="col-span-12 flex items-center justify-between gap-1 md:col-span-4">
                        {m.hours.map((h, i) => (
                          <div key={i} className="flex flex-1 flex-col items-center gap-1">
                            <span
                              className={cn(
                                "h-5 w-full",
                                h === 0
                                  ? "bg-white/5"
                                  : h <= 1
                                    ? "bg-beam/30"
                                    : h === 2
                                      ? "bg-beam/60"
                                      : "bg-beam shadow-[0_0_8px_rgba(79,140,255,0.7)]",
                              )}
                            />
                            <span className="font-mono text-[8px] text-slate-500">
                              {DAYS[i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* requests */}
        <Reveal>
          <div className="mt-16 flex items-baseline justify-between border-b border-white/10 pb-3">
            <Kicker tone="beam">Collaboration requests</Kicker>
            <span className="font-mono text-[10px] tracking-[0.14em] text-slate-500">
              inbound · last 24h
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-px border-b border-white/10 bg-white/10 md:grid-cols-3">
          {requests.map((r, i) => {
            const d = decisions[r.id] ?? "pending";
            const m = DELTAS[r.id];
            return (
              <Reveal
                key={r.id}
                delay={i * 90}
                className={cn(
                  "flex flex-col bg-ink-900/90 backdrop-blur-sm p-6 transition-opacity duration-500",
                  d === "passed" && "opacity-40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-slate-500">
                    {r.id}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{r.age}</span>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center border border-white/15 bg-white/[0.04] font-mono text-[11px] text-white">
                    {r.from
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div>
                    <div className="text-[14px] text-white font-medium">{r.from}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      {m.role} · {r.event}
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-[13px] leading-[1.6] text-slate-300">
                  “{r.message}”
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                  <span className="mono-label text-mint">
                    +{m.coverage}% coverage
                  </span>
                  <span className="ml-auto flex gap-1.5">
                    {d === "accepted" ? (
                      <button
                        onClick={() => set(r.id, "pending")}
                        className="border border-mint/50 bg-mint/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-mint transition-colors hover:bg-mint/20"
                      >
                        Added
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => set(r.id, "accepted")}
                          className="border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:border-beam hover:bg-beam"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => set(r.id, "passed")}
                          className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:text-white"
                        >
                          Pass
                        </button>
                      </>
                    )}
                  </span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

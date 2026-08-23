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
      data-zone="light"
      className="relative border-t border-dark-ink/10 bg-paper py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <Kicker tone="dark">07 / Composition</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-dark-ink">
                Assemble the team like a system diagram.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-slate-muted">
                Each accepted request writes into the roster: a role, a stack, and the hours
                that person is genuinely free. Coverage updates in place, so the team can see
                what changed and why.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="mt-9 border border-dark-ink/12 bg-paper-2 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="mono-label text-slate-muted">Roster coverage</div>
                    <div className="mt-2 font-mono text-[44px] leading-none tnum text-dark-ink">
                      {coverage}
                      <span className="text-[18px] text-slate-tech">%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mono-label text-slate-muted">Target</div>
                    <div className="mt-2 font-mono text-[18px] tnum text-slate-tech">
                      85%
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <Meter
                    value={Math.min(coverage, 100)}
                    theme="light"
                    tone={coverage >= 85 ? "mint" : "amber"}
                    height={4}
                  />
                </div>
                <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-slate-muted">
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
              <div className="border border-dark-ink/12">
                <div className="flex items-center justify-between border-b border-dark-ink/12 px-5 py-3">
                  <span className="mono-label text-slate-muted">
                    Live roster · orbit-04
                  </span>
                  <span className="mono-label text-[#128a79]">weekly availability</span>
                </div>
                <div className="divide-y divide-dark-ink/10">
                  {roster.map((m) => (
                    <div
                      key={m.name}
                      className="grid grid-cols-12 items-center gap-4 px-5 py-4"
                      style={{ animation: "rise .6s cubic-bezier(.16,1,.3,1) both" }}
                    >
                      <div className="col-span-5 md:col-span-4">
                        <div className="text-[14.5px] tracking-[-0.01em] text-dark-ink">
                          {m.name}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-muted">
                          {m.role}
                        </div>
                      </div>
                      <div className="col-span-7 flex gap-3 md:col-span-4">
                        {m.stack.map((s) => (
                          <span
                            key={s}
                            className="border border-dark-ink/12 px-2 py-1 font-mono text-[10px] text-slate-muted"
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
                                  ? "bg-dark-ink/6"
                                  : h <= 1
                                    ? "bg-beam/25"
                                    : h === 2
                                      ? "bg-beam/50"
                                      : "bg-beam",
                              )}
                            />
                            <span className="font-mono text-[8px] text-slate-tech">
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
          <div className="mt-16 flex items-baseline justify-between border-b border-dark-ink/15 pb-3">
            <Kicker tone="dark">Collaboration requests</Kicker>
            <span className="font-mono text-[10px] tracking-[0.14em] text-slate-tech">
              inbound · last 24h
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-px border-b border-dark-ink/10 bg-dark-ink/10 md:grid-cols-3">
          {requests.map((r, i) => {
            const d = decisions[r.id] ?? "pending";
            const m = DELTAS[r.id];
            return (
              <Reveal
                key={r.id}
                delay={i * 90}
                className={cn(
                  "flex flex-col bg-paper p-6 transition-opacity duration-500",
                  d === "passed" && "opacity-45",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-slate-tech">
                    {r.id}
                  </span>
                  <span className="font-mono text-[10px] text-slate-muted">{r.age}</span>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center border border-dark-ink/12 font-mono text-[11px] text-dark-ink">
                    {r.from
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div>
                    <div className="text-[14px] text-dark-ink font-medium">{r.from}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-muted">
                      {m.role} · {r.event}
                    </div>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-[13px] leading-[1.6] text-slate-muted">
                  “{r.message}”
                </p>

                <div className="mt-4 flex items-center gap-2 border-t border-dark-ink/10 pt-4">
                  <span className="mono-label text-[#128a79]">
                    +{m.coverage}% coverage
                  </span>
                  <span className="ml-auto flex gap-1.5">
                    {d === "accepted" ? (
                      <button
                        onClick={() => set(r.id, "pending")}
                        className="border border-mint/50 bg-mint/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#128a79] transition-colors hover:bg-mint/20"
                      >
                        Added
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => set(r.id, "accepted")}
                          className="border border-dark-ink/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dark-ink transition-colors hover:border-beam hover:bg-beam hover:text-white"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => set(r.id, "passed")}
                          className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-muted transition-colors hover:text-dark-ink"
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

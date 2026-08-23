'use client';

import { useEffect, useRef, useState } from "react";
import { CornerTicks, Kicker, Reveal } from "../lib/kit";
import { cn } from "@/lib/utils";

/* local tiny hook to avoid prop drilling */
function useInviewOnce() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

const MEMBERS = [
  { id: "you", name: "You", role: "Frontend" },
  { id: "dev", name: "Dev M.", role: "Backend" },
  { id: "riya", name: "Riya S.", role: "Product" },
  { id: "open", name: "Open", role: "unfilled" },
];

const SKILLS: { name: string; levels: [number, number, number] }[] = [
  { name: "React / Next", levels: [3, 1, 1] },
  { name: "TypeScript", levels: [3, 2, 1] },
  { name: "Interface motion", levels: [2, 0, 1] },
  { name: "Go / Node", levels: [1, 3, 0] },
  { name: "Postgres / SQL", levels: [1, 3, 0] },
  { name: "Infra / deploy", levels: [1, 2, 0] },
  { name: "Python", levels: [1, 2, 1] },
  { name: "PyTorch", levels: [0, 1, 0] },
  { name: "Evals / fine-tune", levels: [0, 0, 0] },
  { name: "Figma systems", levels: [1, 0, 2] },
  { name: "User research", levels: [1, 0, 3] },
  { name: "Pitch / demo", levels: [1, 1, 3] },
];

const FINDINGS = [
  {
    id: "F-01",
    sev: "critical",
    title: "No model experience on the roster",
    body: "The chosen track requires inference at runtime. Two members list Python; neither lists framework experience.",
    action: "3 ranked complements",
  },
  {
    id: "F-02",
    sev: "watch",
    title: "Frontend overlap at 84%",
    body: "You and Dev M. both hold the interface layer. One of you will idle during the integration window.",
    action: "Suggest role split",
  },
  {
    id: "F-03",
    sev: "watch",
    title: "Design capacity is 0.4 of a person",
    body: "Riya covers research and deck, leaving the screen-level design unowned past hour twelve.",
    action: "Open design request",
  },
];

export function Compatibility() {
  const gaps = SKILLS.filter((s) => Math.max(...s.levels) === 0);

  return (
    <section
      id="compatibility"
      data-zone="dark"
      className="relative overflow-hidden bg-ink-900 py-24 md:py-32 text-white"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(90% 70% at 50% 40%, #000, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(90% 70% at 50% 40%, #000, transparent 75%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal>
              <Kicker tone="mint">06 / Compatibility</Kicker>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-6 text-[clamp(2rem,4.2vw,3.4rem)] font-medium leading-[1.03] tracking-[-0.04em]">
                See the hole
                <br />
                before you fall in.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-sm text-[15px] leading-[1.7] text-slate-tech">
                Coverage is recomputed every time a request is accepted or a skill is added.
                What the team cannot do is stated plainly, with the roles that would fix it
                attached.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="mt-9 space-y-3 border-t border-white/10 pt-5">
                <Legend swatch="bg-beam" label="3 — owns it" />
                <Legend swatch="bg-beam/45" label="2 — ships with review" />
                <Legend swatch="bg-white/18" label="1 — can contribute" />
                <Legend swatch="bg-amber" label="0 — team gap" />
              </div>
            </Reveal>

            <Reveal delay={270}>
              <div className="mt-8 border border-amber/25 bg-amber/[0.06] px-5 py-4">
                <div className="mono-label text-amber">
                  {gaps.length} hard gap{gaps.length === 1 ? "" : "s"} detected
                </div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-amber/80">
                  {gaps.map((g) => g.name).join(" · ")}
                </p>
              </div>
            </Reveal>
          </div>

          {/* matrix */}
          <div className="lg:col-span-8">
            <Reveal delay={120}>
              <div className="relative border border-white/12 bg-ink-950/60 backdrop-blur-sm">
                <CornerTicks tone="amber" />
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                  <span className="mono-label text-white/80">Coverage matrix</span>
                  <span className="mono-label text-slate-muted">
                    orbit-04 · symbiosis
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    {/* member headers */}
                    <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-5 py-3">
                      <div className="col-span-6 md:col-span-4">
                        <span className="mono-label text-slate-muted">Skill cluster</span>
                      </div>
                      {MEMBERS.map((m) => (
                        <div
                          key={m.id}
                          className={cn(
                            "flex flex-col items-center",
                            colSpanFor(m.id),
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono text-[10px] tracking-[0.06em]",
                              m.id === "open" ? "text-amber" : "text-white",
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-muted">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-white/[0.06]">
                      {SKILLS.map((s, i) => {
                        const max = Math.max(...s.levels);
                        const gap = max === 0;
                        return (
                          <div
                            key={s.name}
                            className="grid grid-cols-12 items-center gap-2 px-5 py-[9px] transition-colors hover:bg-white/[0.025]"
                          >
                            <div className="col-span-6 flex items-center gap-2.5 md:col-span-4">
                              <span className="font-mono text-[9px] tnum text-slate-muted">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={cn(
                                  "text-[12.5px]",
                                  gap ? "text-amber" : "text-slate-tech",
                                )}
                              >
                                {s.name}
                              </span>
                            </div>
                            {s.levels.map((l, j) => (
                              <div key={j} className={cn("flex justify-center", colSpanFor(MEMBERS[j].id))}>
                                <Cell level={l} delay={i * 40 + j * 60} />
                              </div>
                            ))}
                            <div className="col-span-2 flex justify-center">
                              <Cell level={0} gap delay={i * 40 + 240} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-muted">
                        Roster coverage 61% · target 85%
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">
                        Gap column drives ranking
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* findings */}
        <div className="mt-16 grid grid-cols-1 gap-px border border-white/10 bg-white/10 md:grid-cols-3">
          {FINDINGS.map((f, i) => (
            <Reveal key={f.id} delay={i * 90} className="bg-ink-950 p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.18em] text-slate-muted">
                  {f.id}
                </span>
                <span
                  className={cn(
                    "mono-label border px-1.5 py-0.5",
                    f.sev === "critical"
                      ? "border-amber/40 bg-amber/10 text-amber"
                      : "border-white/15 text-slate-tech",
                  )}
                >
                  {f.sev}
                </span>
              </div>
              <h3 className="mt-5 text-[16.5px] leading-snug tracking-[-0.02em] text-white">
                {f.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-[1.6] text-slate-muted">{f.body}</p>
              <button className="mt-5 inline-flex items-center gap-2 border-b border-white/20 pb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mint transition-colors hover:border-mint">
                {f.action}
                <span>→</span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function colSpanFor(id: string) {
  return "col-span-2 md:col-span-2";
  void id;
}

function Cell({
  level,
  gap,
  delay = 0,
}: {
  level: number;
  gap?: boolean;
  delay?: number;
}) {
  const { ref, inView } = useInviewOnce();
  const fill = [
    "bg-white/6 border-white/10",
    "bg-white/18 border-white/15",
    "bg-beam/45 border-beam/30",
    "bg-beam border-beam/50",
  ][level];

  if (gap) {
    return (
      <span
        ref={ref}
        className="flex h-4 w-8 items-center justify-center border border-dashed border-amber/50"
        style={{
          opacity: inView ? 1 : 0,
          transition: `opacity .7s ease ${delay}ms`,
        }}
      >
        <span className="h-px w-3 bg-amber/60" />
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn("block h-4 w-8 border", fill)}
      style={{
        transform: inView ? "scaleY(1)" : "scaleY(0.2)",
        transformOrigin: "center",
        opacity: inView ? 1 : 0,
        transition: `transform .6s cubic-bezier(.16,1,.3,1) ${delay}ms, opacity .6s ease ${delay}ms`,
      }}
    />
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("h-2 w-6 border border-white/10", swatch)} />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-muted">
        {label}
      </span>
    </div>
  );
}

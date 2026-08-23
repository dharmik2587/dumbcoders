'use client';

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "top", n: "01", label: "Overview" },
  { id: "platform", n: "02", label: "Platform" },
  { id: "problem", n: "03", label: "Problem" },
  { id: "matching", n: "04", label: "Matching" },
  { id: "discovery", n: "05", label: "Discovery" },
  { id: "compatibility", n: "06", label: "Compatibility" },
  { id: "composition", n: "07", label: "Composition" },
  { id: "builder", n: "08", label: "Projects" },
  { id: "cta", n: "09", label: "Start" },
];

export function SectionRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.4;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= mid) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div className="flex flex-col items-end gap-3">
        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pointer-events-auto group flex items-center gap-3"
              aria-label={s.label}
            >
              <span
                className={cn(
                  "font-mono text-[9px] uppercase tracking-[0.18em] opacity-0 transition-all duration-300 group-hover:opacity-100",
                  on ? "text-white opacity-100" : "text-slate-tech",
                )}
              >
                {s.n} {on ? s.label : ""}
              </span>
              <span
                className={cn(
                  "block h-px transition-all duration-500",
                  on
                    ? "w-8 bg-beam shadow-[0_0_10px_rgba(79,140,255,.9)]"
                    : "w-3.5 bg-white/25 group-hover:w-6 group-hover:bg-white/60",
                )}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
}

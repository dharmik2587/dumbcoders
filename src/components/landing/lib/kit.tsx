'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------
   Reveal — scroll-triggered entrance with stagger
--------------------------------------------------------------- */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  variant,
}: {
  children?: ReactNode;
  delay?: number;
  as?: "div" | "span" | "li" | "p" | "h2" | "h3" | "section";
  className?: string;
  variant?: "clip";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -4% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = cn(
    variant === "clip" ? "reveal-clip" : "reveal",
    className,
  );

  return (
    <Tag
      ref={ref as never}
      data-visible={visible}
      className={cls}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------
   useInView + count up
--------------------------------------------------------------- */
export function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
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
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function CountUp({
  to,
  duration = 1400,
  suffix = "",
  decimals = 0,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className="tnum">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------------
   Type atoms
--------------------------------------------------------------- */
export function Kicker({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark" | "beam" | "mint" | "amber";
  className?: string;
}) {
  const tones = {
    light: "text-slate-tech",
    dark: "text-slate-muted",
    beam: "text-beam",
    mint: "text-mint",
    amber: "text-amber",
  } as const;
  return (
    <span className={cn("mono-label inline-flex items-center gap-2", tones[tone], className)}>
      {children}
    </span>
  );
}

export function IndexMark({ n }: { n: string }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.16em] text-slate-muted">
      {n}
    </span>
  );
}

/* ---------------------------------------------------------------
   Structural
--------------------------------------------------------------- */
export function Rule({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <Reveal
      variant="clip"
      className={cn(
        "h-px w-full",
        tone === "light" ? "bg-dark-ink/10" : "bg-white/12",
        className,
      )}
    />
  );
}

export function CornerTicks({
  tone = "mint",
  className,
}: {
  tone?: "mint" | "beam" | "amber" | "slate";
  className?: string;
}) {
  const c = {
    mint: "border-mint/60",
    beam: "border-beam/60",
    amber: "border-amber/60",
    slate: "border-white/20",
  }[tone];
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <span className={cn("absolute left-0 top-0 h-2.5 w-2.5 border-l border-t", c)} />
      <span className={cn("absolute right-0 top-0 h-2.5 w-2.5 border-r border-t", c)} />
      <span className={cn("absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l", c)} />
      <span className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r", c)} />
    </span>
  );
}

export function MarqueeRow({
  children,
  speed = "normal",
  reverse,
}: {
  children: ReactNode;
  speed?: "normal" | "slow";
  reverse?: boolean;
}) {
  return (
    <div className="mask-fade-x overflow-hidden">
      <div
        className={cn(
          "flex w-max gap-0",
          speed === "normal" ? "animate-marquee" : "animate-marquee-slow",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   Skill chip
--------------------------------------------------------------- */
export function SkillChip({
  label,
  level,
  tone = "neutral",
  theme = "dark",
}: {
  label: string;
  level?: string;
  tone?: "neutral" | "beam" | "mint" | "amber";
  theme?: "dark" | "light";
}) {
  const dark = {
    neutral: "border-white/12 text-slate-tech",
    beam: "border-beam/35 text-beam bg-beam/6",
    mint: "border-mint/35 text-mint bg-mint/6",
    amber: "border-amber/35 text-amber bg-amber/6",
  }[tone];
  const light = {
    neutral: "border-dark-ink/12 text-slate-muted",
    beam: "border-beam/40 text-[#2f6ede] bg-beam/8",
    mint: "border-mint/50 text-[#128a79] bg-mint/10",
    amber: "border-amber/50 text-[#a8641d] bg-amber/12",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-[0.06em]",
        theme === "dark" ? dark : light,
      )}
    >
      {label}
      {level && (
        <span className={theme === "dark" ? "text-white/30" : "text-dark-ink/30"}>
          {level}
        </span>
      )}
    </span>
  );
}

/* ---------------------------------------------------------------
   Meter bar
--------------------------------------------------------------- */
export function Meter({
  value,
  delay = 0,
  tone = "beam",
  theme = "dark",
  height = 3,
}: {
  value: number;
  delay?: number;
  tone?: "beam" | "mint" | "amber" | "slate";
  theme?: "dark" | "light";
  height?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const fill = {
    beam: "bg-beam",
    mint: "bg-mint",
    amber: "bg-amber",
    slate: theme === "dark" ? "bg-white/50" : "bg-dark-ink/45",
  }[tone];
  const track = theme === "dark" ? "bg-white/10" : "bg-dark-ink/10";
  return (
    <div ref={ref} className={cn("w-full", track)} style={{ height }}>
      <div
        className={cn("h-full", fill)}
        style={{
          width: inView ? `${value}%` : "0%",
          transition: `width 1.2s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

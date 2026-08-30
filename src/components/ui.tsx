"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/client/utils/cn";
import { useStore } from "@/client/store/useStore";

/* ------------------------------------------------------------------ */
/* Scroll reveal                                                       */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  className,
  variant,
  as: Tag = "div",
}: {
  children?: ReactNode;
  delay?: number;
  className?: string;
  variant?: "clip";
  as?: "div" | "section" | "li" | "p" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      data-visible={visible}
      className={cn(variant === "clip" ? "reveal-clip" : "reveal", className)}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

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
  duration = 1100,
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
      setV(to * (1 - Math.pow(1 - p, 3)));
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

/* ------------------------------------------------------------------ */
/* Type atoms                                                          */
/* ------------------------------------------------------------------ */
export function Label({
  children,
  className,
  tone = "muted",
}: {
  children: ReactNode;
  className?: string;
  tone?: "muted" | "accent" | "mint" | "amber" | "fg";
}) {
  const tones = {
    muted: "text-fg3",
    accent: "text-accent",
    mint: "text-mint",
    amber: "text-amber",
    fg: "text-fg",
  }[tone];
  return (
    <span className={cn("mono-label inline-flex items-center gap-2", tones, className)}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */
type BtnProps = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "danger" | "mint";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled,
  title,
}: BtnProps) {
  const sizes = {
    sm: "px-2.5 py-1.5 text-[11px]",
    md: "px-4 py-2.5 text-[13px]",
    lg: "px-6 py-3.5 text-[14px]",
  }[size];
  const variants = {
    primary:
      "bg-accent text-accent-ink hover:brightness-110 hover:-translate-y-px shadow-[0_10px_30px_-14px_var(--accent)]",
    mint: "bg-mint text-white hover:brightness-110 hover:-translate-y-px",
    outline:
      "border border-line-strong text-fg hover:border-accent hover:text-accent hover:-translate-y-px",
    ghost: "text-fg2 hover:text-fg hover:bg-hover",
    danger: "border border-danger/50 text-danger hover:bg-danger-soft",
  }[variant];
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
        sizes,
        variants,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  children,
  label,
  onClick,
  className,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center border border-line text-fg2 transition-all duration-200",
        "hover:border-line-strong hover:text-fg [&>svg]:transition-transform [&>svg]:duration-200 hover:[&>svg]:scale-110",
        active && "border-accent-line bg-accent-soft text-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Chips / badges                                                      */
/* ------------------------------------------------------------------ */
export function Chip({
  children,
  tone = "neutral",
  className,
  onClick,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "mint" | "amber" | "violet" | "danger";
  className?: string;
  onClick?: () => void;
}) {
  const tones = {
    neutral: "border-line text-fg2",
    accent: "border-accent-line bg-accent-soft text-accent",
    mint: "border-mint-line bg-mint-soft text-mint",
    amber: "border-amber-line bg-amber-soft text-amber",
    violet: "border-[color:color-mix(in_srgb,var(--violet)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--violet)_10%,transparent)] text-violet",
    danger: "border-danger/40 bg-danger-soft text-danger",
  }[tone];
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-[0.06em] transition-colors",
        onClick && "cursor-pointer hover:brightness-110",
        tones,
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function StateDot({
  tone = "mint",
  pulse,
}: {
  tone?: "mint" | "amber" | "accent" | "danger" | "muted";
  pulse?: boolean;
}) {
  const c = {
    mint: "bg-mint",
    amber: "bg-amber",
    accent: "bg-accent",
    danger: "bg-danger",
    muted: "bg-fg3",
  }[tone];
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 shrink-0 rounded-full", c, pulse && "animate-pulse-dot")}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mono-label mb-2 block text-fg3">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-fg3">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full border border-line bg-surface px-3 py-2.5 text-[13px] text-fg placeholder:text-fg3 transition-colors focus:border-accent focus:outline-none";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "resize-none", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(inputCls, "cursor-pointer appearance-none pr-8", props.className)}
      style={{
        backgroundImage:
          "linear-gradient(45deg, transparent 50%, var(--fg-3) 50%), linear-gradient(135deg, var(--fg-3) 50%, transparent 50%)",
        backgroundPosition: "calc(100% - 15px) 50%, calc(100% - 10px) 50%",
        backgroundSize: "5px 5px, 5px 5px",
        backgroundRepeat: "no-repeat",
        ...props.style,
      }}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200",
        checked ? "border-accent-line bg-accent" : "border-line-strong bg-hover",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all duration-300",
          checked ? "left-[19px] bg-white" : "left-[3px] bg-fg3",
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Meter                                                               */
/* ------------------------------------------------------------------ */
export function Meter({
  value,
  tone = "accent",
  height = 3,
  delay = 0,
  className,
}: {
  value: number;
  tone?: "accent" | "mint" | "amber" | "danger" | "muted";
  height?: number;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const fill = {
    accent: "bg-accent",
    mint: "bg-mint",
    amber: "bg-amber",
    danger: "bg-danger",
    muted: "bg-fg3",
  }[tone];
  return (
    <div
      ref={ref}
      className={cn("w-full bg-hover", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full", fill)}
        style={{
          width: inView ? `${Math.min(100, Math.max(0, value))}%` : "0%",
          transition: `width 1s cubic-bezier(.16,1,.3,1) ${delay}ms`,
        }}
      />
    </div>
  );
}

export function Ring({
  value,
  size = 44,
  tone = "accent",
}: {
  value: number;
  size?: number;
  tone?: "accent" | "mint" | "amber";
}) {
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const stroke = { accent: "var(--accent)", mint: "var(--mint)", amber: "var(--amber)" }[tone];
  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--hairline)" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={inView ? c - (c * value) / 100 : c}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tnum text-fg">
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */
export function Panel({
  children,
  className,
  ticks,
}: {
  children: ReactNode;
  className?: string;
  ticks?: boolean;
}) {
  return (
    <div className={cn("relative border border-line bg-surface", className)}>
      {ticks && <CornerTicks />}
      {children}
    </div>
  );
}

export function CornerTicks({ tone = "accent" }: { tone?: "accent" | "mint" | "amber" }) {
  const c = { accent: "border-accent/60", mint: "border-mint/60", amber: "border-amber/60" }[tone];
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className={cn("absolute left-0 top-0 h-2.5 w-2.5 border-l border-t", c)} />
      <span className={cn("absolute right-0 top-0 h-2.5 w-2.5 border-r border-t", c)} />
      <span className={cn("absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l", c)} />
      <span className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r", c)} />
    </span>
  );
}

export function SectionHead({
  index,
  kicker,
  title,
  sub,
  right,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="grid gap-6 border-b border-line pb-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <Label tone="accent">
          <span className="text-fg3">{index}</span> / {kicker}
        </Label>
        <h1 className="display mt-4 text-[clamp(1.75rem,3.2vw,2.6rem)] font-medium leading-[1.06] text-fg">
          {title}
        </h1>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-5 lg:items-end">
        {sub && <p className="max-w-md text-[13.5px] leading-relaxed text-fg2">{sub}</p>}
        {right}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line-strong px-6 py-16 text-center">
      <span className="mono-label text-fg3">no results</span>
      <h3 className="display mt-4 text-[19px] text-fg">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-fg2">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-shimmer bg-hover", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, var(--hairline), transparent)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
            value === t.id ? "text-fg" : "text-fg3 hover:text-fg2",
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-1.5 text-fg3 tnum">{t.count}</span>
          )}
          {value === t.id && (
            <motion.span
              layoutId={`tab-${t.id}`}
              className="absolute inset-x-0 -bottom-px h-px bg-accent"
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 pt-[10vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="absolute inset-0 bg-[#05070c]/70 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full border border-line-strong bg-surface",
              wide ? "max-w-3xl" : "max-w-lg",
            )}
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <span className="mono-label text-fg">{title}</span>
              <IconButton label="Close dialog" onClick={onClose}>
                <X size={14} />
              </IconButton>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Toaster                                                             */
/* ------------------------------------------------------------------ */
export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(92vw,340px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 24, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto border border-line-strong bg-surface p-3.5"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                  t.tone === "good" && "bg-mint",
                  t.tone === "warn" && "bg-amber",
                  t.tone === "bad" && "bg-danger",
                  t.tone === "info" && "bg-accent",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="mono-label text-fg">{t.label}</div>
                <p className="mt-1.5 text-[12.5px] leading-snug text-fg2">{t.body}</p>
                {t.undo && (
                  <button
                    onClick={() => {
                      t.undo?.();
                      dismiss(t.id);
                    }}
                    className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent hover:underline"
                  >
                    Undo
                  </button>
                )}
              </div>
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="text-fg3 transition-colors hover:text-fg"
              >
                <X size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee                                                             */
/* ------------------------------------------------------------------ */
export function Marquee({
  children,
  slow,
  className,
}: {
  children: ReactNode;
  slow?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mask-fade-x overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max",
          slow ? "animate-marquee-slow" : "animate-marquee",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

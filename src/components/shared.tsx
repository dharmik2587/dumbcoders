"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { cn } from "@/client/utils/cn";
import type { Builder, Hackathon, RoleKey, Team } from "@/client/types";
import { ROLE_LABEL } from "@/client/types";
import { CLUSTER_NAME, CLUSTER_ORDER } from "@/client/data/seed";
import {
  clusterLevels,
  gapClusters,
  type Coverage,
} from "@/client/lib/matching";
import { Chip, Ring, StateDot } from "./ui";

/* ---------------- formatters ---------------- */
export const inr = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`
    : `₹${(n / 1000).toFixed(0)}K`;

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const roleTone: Record<RoleKey, "accent" | "mint" | "amber" | "violet" | "neutral"> = {
  frontend: "accent",
  backend: "mint",
  ml: "amber",
  design: "violet",
  product: "neutral",
  mobile: "mint",
  devops: "accent",
};

export const roleColor: Record<RoleKey, string> = {
  frontend: "var(--accent)",
  backend: "var(--mint)",
  ml: "var(--amber)",
  design: "var(--violet)",
  product: "var(--fg-2)",
  mobile: "var(--mint)",
  devops: "var(--accent)",
};

/* ---------------- avatar ---------------- */
export function Avatar({
  b,
  size = 28,
  link = true,
}: {
  b: Pick<Builder, "id" | "initials" | "name">;
  size?: number;
  link?: boolean;
}) {
  const el = (
    <span
      title={b.name}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="flex shrink-0 items-center justify-center border border-line bg-raised font-mono text-fg2 transition-colors group-hover:border-accent-line group-hover:text-accent"
    >
      {b.initials}
    </span>
  );
  return link ? <Link href={`/b/${b.id}`}>{el}</Link> : el;
}

/* ---------------- level control ---------------- */
export const LEVEL_LABEL = ["none", "contribute", "ships", "owns it"];

export function LevelPicker({
  value,
  onChange,
  label,
}: {
  value: 0 | 1 | 2 | 3;
  onChange: (v: 0 | 1 | 2 | 3) => void;
  label: string;
}) {
  return (
    <div className="flex gap-px border border-line bg-raised p-px" role="radiogroup" aria-label={label}>
      {([0, 1, 2, 3] as const).map((lv) => (
        <button
          key={lv}
          role="radio"
          aria-checked={value === lv}
          aria-label={`${label}: ${LEVEL_LABEL[lv]}`}
          onClick={() => onChange(lv)}
          className={cn(
            "h-5 w-6 transition-all duration-200",
            value === lv
              ? lv === 0
                ? "bg-hover"
                : lv === 1
                  ? "bg-accent/30"
                  : lv === 2
                    ? "bg-accent/65"
                    : "bg-accent"
              : "hover:bg-hover",
          )}
        />
      ))}
    </div>
  );
}

export function LevelCell({ level, gap, delay = 0 }: { level: number; gap?: boolean; delay?: number }) {
  if (gap)
    return (
      <span
        className="flex h-4 w-8 items-center justify-center border border-dashed border-amber-line"
        style={{ animation: `rise .5s cubic-bezier(.16,1,.3,1) ${delay}ms both` }}
        aria-label="team gap"
      >
        <span className="h-px w-3 bg-amber/60" />
      </span>
    );
  const cls = [
    "bg-hover border-line",
    "bg-accent/20 border-accent/25",
    "bg-accent/55 border-accent/40",
    "bg-accent border-accent",
  ][level];
  return (
    <span
      className={cn("block h-4 w-8 border", cls)}
      style={{ animation: `rise .5s cubic-bezier(.16,1,.3,1) ${delay}ms both` }}
      aria-label={`level ${level} — ${LEVEL_LABEL[level as 0 | 1 | 2 | 3]}`}
    />
  );
}

/* ---------------- availability grid ---------------- */
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function AvailabilityGrid({
  value,
  onChange,
  editable,
  compact,
}: {
  value: { day: number; start: number; end: number }[];
  onChange?: (v: { day: number; start: number; end: number }[]) => void;
  editable?: boolean;
  compact?: boolean;
}) {
  const [cells, setCells] = useState<boolean[][]>(() => {
    const g = Array.from({ length: 7 }, () => Array(24).fill(false));
    value.forEach((s) => {
      for (let h = s.start; h < s.end; h++) if (g[s.day]) g[s.day][h] = true;
    });
    return g;
  });
  const [painting, setPainting] = useState(false);
  const [paintVal, setPaintVal] = useState(true);

  const commit = (next: boolean[][]) => {
    setCells(next);
    if (!onChange) return;
    const slots: { day: number; start: number; end: number }[] = [];
    next.forEach((row, d) => {
      let start = -1;
      row.forEach((on, h) => {
        if (on && start === -1) start = h;
        if ((!on || h === 23) && start !== -1) {
          slots.push({ day: d, start, end: on && h === 23 ? 24 : h });
          start = -1;
        }
      });
    });
    onChange(slots);
  };

  const set = (d: number, h: number, v: boolean) => {
    if (!editable) return;
    const next = cells.map((r) => [...r]);
    next[d][h] = v;
    commit(next);
  };

  const total = useMemo(
    () => cells.reduce((a, r) => a + r.filter(Boolean).length, 0),
    [cells],
  );

  return (
    <div>
      <div className="scroll-x">
        <div className="min-w-[460px]" onMouseLeave={() => setPainting(false)}>
          {!compact && (
            <div className="mb-1 flex gap-px pl-7">
              {Array.from({ length: 24 }, (_, h) => (
                <span
                  key={h}
                  className="flex-1 text-center font-mono text-[8px] text-fg3"
                >
                  {h % 4 === 0 ? h : ""}
                </span>
              ))}
            </div>
          )}
          {cells.map((row, d) => (
            <div key={d} className="mb-px flex items-center gap-px">
              <span className="w-6 shrink-0 font-mono text-[9px] uppercase text-fg3">
                {DAYS[d]}
              </span>
              {row.map((on, h) => (
                <button
                  key={h}
                  type="button"
                  tabIndex={editable ? 0 : -1}
                  aria-label={`${DAYS[d]}ay ${h}:00 ${on ? "free" : "unavailable"}`}
                  onMouseDown={() => {
                    if (!editable) return;
                    setPainting(true);
                    setPaintVal(!on);
                    set(d, h, !on);
                  }}
                  onMouseEnter={() => {
                    if (editable && painting) set(d, h, paintVal);
                  }}
                  onMouseUp={() => setPainting(false)}
                  className={cn(
                    "h-5 flex-1 border border-transparent transition-colors duration-100",
                    on ? "bg-accent" : "bg-hover hover:bg-line",
                    !editable && "cursor-default",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {editable && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg3">
          drag to paint · {total} free hours / week
        </p>
      )}
    </div>
  );
}

export function AvailabilityStrip({ b }: { b: Builder }) {
  const byDay = useMemo(() => {
    const n = Array(7).fill(0);
    b.availability.forEach((s) => (n[s.day] = s.end - s.start));
    return n;
  }, [b]);
  return (
    <div className="flex items-end gap-1">
      {byDay.map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span
            className={cn(
              "h-4 w-full transition-colors",
              h === 0 ? "bg-hover" : h <= 2 ? "bg-accent/30" : h <= 4 ? "bg-accent/60" : "bg-accent",
            )}
            title={`${DAYS[i]} · ${h}h`}
          />
          <span className="font-mono text-[8px] text-fg3">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- coverage matrix ---------------- */
export function CoverageMatrix({
  team,
  byId,
  compact,
}: {
  team: Team;
  byId: Map<string, Builder>;
  compact?: boolean;
}) {
  const levels = clusterLevels(team, byId);
  const { hard } = gapClusters(levels);
  const clusters = compact ? CLUSTER_ORDER : CLUSTER_ORDER;

  return (
    <div className="scroll-x">
      <div className="min-w-[520px]">
        <div className="grid grid-cols-12 gap-2 border-b border-line px-4 py-2.5">
          <span className="mono-label col-span-4 text-fg3">Skill cluster</span>
          {team.members.map((m) => {
            const b = byId.get(m.builderId);
            return (
              <div key={m.builderId} className="col-span-2 flex flex-col items-center">
                <span className="max-w-full truncate font-mono text-[10px] text-fg">
                  {b?.name.split(" ")[0] ?? "?"}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-fg3">
                  {ROLE_LABEL[m.role as RoleKey]}
                </span>
              </div>
            );
          })}
          <div className="col-span-2 flex flex-col items-center">
            <span className="font-mono text-[10px] text-amber">Gap</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-fg3">
              unfilled
            </span>
          </div>
        </div>

        <div className="divide-y divide-line">
          {clusters.map((c, i) => {
            const isGap = hard.includes(c);
            return (
              <div key={c} className="grid grid-cols-12 items-center gap-2 px-4 py-[7px] transition-colors hover:bg-hover">
                <div className="col-span-4 flex items-center gap-2.5">
                  <span className="font-mono text-[9px] tnum text-fg3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn("text-[12.5px]", isGap ? "text-amber" : "text-fg2")}>
                    {CLUSTER_NAME[c]}
                  </span>
                </div>
                {team.members.map((m, j) => {
                  const b = byId.get(m.builderId);
                  const lv = b
                    ? b.skills.filter((s) => s.cluster === c).reduce((a, s) => a + s.level, 0)
                    : 0;
                  return (
                    <div key={m.builderId} className="col-span-2 flex justify-center">
                      <LevelCell level={Math.min(3, lv)} delay={i * 35 + j * 50} />
                    </div>
                  );
                })}
                <div className="col-span-2 flex justify-center">
                  <LevelCell level={0} gap={isGap} delay={i * 35 + 200} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CoverageLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {[
        ["bg-accent", "3 — owns it"],
        ["bg-accent/55", "2 — ships with review"],
        ["bg-accent/20", "1 — can contribute"],
        ["border border-dashed border-amber-line", "0 — team gap"],
      ].map(([c, l]) => (
        <span key={l} className="flex items-center gap-2">
          <span className={cn("h-2.5 w-6 border border-line", c)} />
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-fg3">{l}</span>
        </span>
      ))}
    </div>
  );
}

export function CoverageHead({
  coverage,
  target = 85,
}: {
  coverage: Coverage;
  target?: number;
}) {
  const tone = coverage.overall >= target ? "mint" : coverage.overall >= 60 ? "accent" : "amber";
  return (
    <div className="flex items-center gap-4">
      <Ring value={coverage.overall} tone={tone} size={52} />
      <div>
        <div className="mono-label text-fg3">roster coverage</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] text-fg2 tnum">
            target {target}%
          </span>
          {coverage.hardGaps.length > 0 ? (
            <Chip tone="amber">
              <StateDot tone="amber" />
              {coverage.hardGaps.length} hard gap{coverage.hardGaps.length > 1 ? "s" : ""}
            </Chip>
          ) : (
            <Chip tone="mint">
              <StateDot tone="mint" />
              no hard gaps
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- hackathon row bits ---------------- */
export function EventStateChip({ h }: { h: Hackathon }) {
  if (h.status === "closed")
    return <Chip tone="neutral">closed</Chip>;
  if (h.status === "closing")
    return (
      <Chip tone="amber">
        <StateDot tone="amber" pulse />
        closing
      </Chip>
    );
  return (
    <Chip tone="mint">
      <StateDot tone="mint" />
      open
    </Chip>
  );
}

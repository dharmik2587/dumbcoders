import type { Builder, Hackathon, RoleKey, Team } from "../types";
import { CLUSTER_ORDER, CLUSTER_NAME } from "../data/seed";

export const WEIGHTS = {
  skillComplement: 0.34,
  commitment: 0.22,
  buildHistory: 0.18,
  stackOverlap: 0.14,
  intent: 0.12,
} as const;

export type SignalId = keyof typeof WEIGHTS;

export const SIGNAL_LABEL: Record<SignalId, string> = {
  skillComplement: "Skill complement",
  commitment: "Commitment window",
  buildHistory: "Build history",
  stackOverlap: "Stack overlap",
  intent: "Intent match",
};

export const SIGNAL_DETAIL: Record<SignalId, string> = {
  skillComplement:
    "Share of the team's gap clusters this builder raises to shipping level, minus a penalty for duplicating a role you already cover.",
  commitment:
    "Overlap of weekly free hours, scaled by whether that overlap lands inside the event's build window.",
  buildHistory:
    "Shipped projects, repositories and prior hackathon submissions, normalised across the current corpus.",
  stackOverlap:
    "Shared languages and frameworks, so the first commit doesn't start with a tooling argument.",
  intent:
    "Same event, same track interest, and a stated goal that lines up with the team's.",
};

export type SignalBreak = {
  id: SignalId;
  label: string;
  weight: number;
  raw: number;
  contribution: number;
};

export type ScoredCandidate = {
  builder: Builder;
  total: number;
  signals: SignalBreak[];
  reason: string;
  fillsGaps: string[];
  redundant: string[];
};

/* ---------------------------------------------------------------- */

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const jaccard = (a: Set<string>, b: Set<string>) => {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  a.forEach((x) => b.has(x) && inter++);
  return inter / (a.size + b.size - inter || 1);
};

/** Team level per cluster = min(3, Σ member levels), capped. */
export function clusterLevels(team: Team, byId: Map<string, Builder>) {
  const out: Record<string, number> = {};
  for (const c of CLUSTER_ORDER) out[c] = 0;
  for (const m of team.members) {
    const b = byId.get(m.builderId);
    if (!b) continue;
    for (const s of b.skills) {
      out[s.cluster] = Math.min(3, (out[s.cluster] ?? 0) + s.level);
    }
  }
  return out;
}

export function gapClusters(levels: Record<string, number>) {
  return {
    hard: CLUSTER_ORDER.filter((c) => (levels[c] ?? 0) === 0),
    weak: CLUSTER_ORDER.filter((c) => (levels[c] ?? 0) === 1),
  };
}

/** Which clusters does the event actually need? */
function demandedClusters(h: Hackathon | undefined) {
  const set = new Set<string>();
  if (!h) return set;
  const byRole: Record<string, string[]> = {
    frontend: ["interface", "craft"],
    backend: ["services"],
    ml: ["intelligence"],
    design: ["craft"],
    product: ["narrative"],
    mobile: ["mobile"],
    devops: ["infra"],
  };
  for (const [role, w] of Object.entries(h.trackDemands)) {
    if ((w ?? 0) >= 0.6) (byRole[role] ?? []).forEach((c) => set.add(c));
  }
  return set.size ? set : new Set(CLUSTER_ORDER);
}

/* ---------------- individual signals ---------------- */

function skillComplement(
  candidate: Builder,
  levels: Record<string, number>,
  demanded: Set<string>,
) {
  const cand: Record<string, number> = {};
  for (const s of candidate.skills)
    cand[s.cluster] = Math.max(cand[s.cluster] ?? 0, s.level);

  const gaps = CLUSTER_ORDER.filter((c) => (levels[c] ?? 0) <= 1);
  const relevant = gaps.filter((c) => demanded.has(c));
  const pool = relevant.length ? relevant : gaps;

  let filled = 0;
  const fills: string[] = [];
  for (const c of pool) {
    if ((cand[c] ?? 0) >= 2) {
      filled++;
      fills.push(CLUSTER_NAME[c]);
    }
  }
  const base = pool.length ? filled / pool.length : 0;

  const redundant: string[] = [];
  let dup = 0;
  for (const c of CLUSTER_ORDER) {
    if ((levels[c] ?? 0) >= 3 && (cand[c] ?? 0) >= 2) {
      dup++;
      redundant.push(CLUSTER_NAME[c]);
    }
  }
  const penalty = 0.35 * (dup / CLUSTER_ORDER.length) * 3;
  return { value: clamp01(base - penalty), fills, redundant };
}

function grid(b: Builder) {
  const g = Array.from({ length: 7 * 24 }, () => false);
  for (const s of b.availability)
    for (let h = s.start; h < s.end; h++) g[s.day * 24 + h] = true;
  return g;
}

function commitment(a: Builder, b: Builder, eventHours: number) {
  const ga = grid(a);
  const gb = grid(b);
  let inter = 0;
  let union = 0;
  for (let i = 0; i < ga.length; i++) {
    if (ga[i] && gb[i]) inter++;
    if (ga[i] || gb[i]) union++;
  }
  const j = union ? inter / union : 0;
  // can the overlap sustain a long build window?
  const weekendCover = inter >= eventHours * 0.5 ? 1 : inter / (eventHours * 0.5);
  return clamp01(j * 0.6 + weekendCover * 0.4);
}

function buildHistory(b: Builder, maxP: number, maxR: number, maxE: number) {
  const n = (v: number, m: number) => (m ? Math.min(1, v / m) : 0);
  return clamp01(
    0.5 * n(b.projects.length, maxP) +
      0.3 * n(b.repos.reduce((a, r) => a + r.stars, 0), maxR) +
      0.2 * n(b.events.length, maxE),
  );
}

function stackOverlap(a: Builder, b: Builder) {
  const s = (x: Builder) =>
    new Set(
      x.skills
        .filter((k) => k.level >= 2)
        .map((k) => k.label.split(" ")[0].toLowerCase()),
    );
  return jaccard(s(a), s(b));
}

function intent(
  a: Builder,
  b: Builder,
  hackathon: Hackathon | undefined,
  teamEventId: string,
) {
  let v = 0;
  const sameEvent =
    hackathon && a.events.some((e) => e.hackathonId === hackathon.id);
  if (sameEvent || hackathon?.id === teamEventId) v += 0.6;
  if (a.goal === b.goal) v += 0.25;
  const tracks = new Set(hackathon?.tracks ?? []);
  if (a.skills.some((s) => tracks.has(s.cluster))) v += 0.15;
  return clamp01(v);
}

/* ---------------- public API ---------------- */

export function scoreCandidate(
  candidate: Builder,
  me: Builder,
  team: Team,
  byId: Map<string, Builder>,
  hackathon: Hackathon | undefined,
  corpus: Builder[],
): ScoredCandidate {
  const levels = clusterLevels(team, byId);
  const demanded = demandedClusters(hackathon);
  const { value: sc, fills, redundant } = skillComplement(candidate, levels, demanded);

  const maxP = Math.max(...corpus.map((b) => b.projects.length), 1);
  const maxR = Math.max(...corpus.map((b) => b.repos.reduce((a, r) => a + r.stars, 0)), 1);
  const maxE = Math.max(...corpus.map((b) => b.events.length), 1);

  const raw: Record<SignalId, number> = {
    skillComplement: sc,
    commitment: commitment(me, candidate, hackathon?.durationHours ?? 36),
    buildHistory: buildHistory(candidate, maxP, maxR, maxE),
    stackOverlap: stackOverlap(me, candidate),
    intent: intent(candidate, me, hackathon, team.hackathonId),
  };

  const signals = (Object.keys(WEIGHTS) as SignalId[]).map((id) => ({
    id,
    label: SIGNAL_LABEL[id],
    weight: WEIGHTS[id],
    raw: raw[id],
    contribution: WEIGHTS[id] * raw[id],
  }));

  const total = Math.round(100 * signals.reduce((a, s) => a + s.contribution, 0));

  const top = [...signals].sort((a, b) => b.contribution - a.contribution)[0];
  const reason =
    top.id === "skillComplement" && fills.length
      ? `Covers ${fills.slice(0, 2).join(" and ")} — ${redundant.length ? `already covered: ${redundant[0]}` : "nothing duplicated"}`
      : top.id === "commitment"
        ? `Free hours line up across the ${hackathon?.durationHours ?? 36}-hour window`
        : top.id === "buildHistory"
          ? `${candidate.projects.length} shipped builds, ${candidate.repos.length} public repos`
          : top.id === "stackOverlap"
            ? `Shares your stack, so the first commit is cheap`
            : `Same event, same goal (${candidate.goal})`;

  return { builder: candidate, total, signals, reason, fillsGaps: fills, redundant };
}

export function rankCandidates(
  pool: Builder[],
  me: Builder,
  team: Team,
  byId: Map<string, Builder>,
  hackathon: Hackathon | undefined,
  opts: { minScore?: number; role?: RoleKey; exclude?: string[] } = {},
): ScoredCandidate[] {
  const exclude = new Set([me.id, ...(opts.exclude ?? [])]);
  return pool
    .filter((b) => !exclude.has(b.id))
    .filter((b) => (opts.role ? b.role === opts.role || b.secondary.includes(opts.role) : true))
    .map((b) => scoreCandidate(b, me, team, byId, hackathon, pool))
    .filter((s) => s.total >= (opts.minScore ?? 0))
    .sort((a, b) => b.total - a.total);
}

export type Coverage = {
  byCluster: Record<string, number>;
  overall: number;
  hardGaps: string[];
  weak: string[];
};

export function teamCoverage(team: Team, byId: Map<string, Builder>, hackathon?: Hackathon): Coverage {
  const byCluster = clusterLevels(team, byId);
  const demanded = demandedClusters(hackathon);
  const { hard, weak } = gapClusters(byCluster);

  let sum = 0;
  let weight = 0;
  for (const c of CLUSTER_ORDER) {
    const w = demanded.has(c) ? 2 : 1;
    sum += (byCluster[c] / 3) * w;
    weight += w;
  }
  return {
    byCluster,
    overall: Math.round((sum / weight) * 100),
    hardGaps: hard,
    weak,
  };
}

/** Availability raster used by the paint grid + heat strips. */
export function availabilityRaster(b: Builder) {
  const g = grid(b);
  const byDay: number[] = [];
  for (let d = 0; d < 7; d++) {
    let n = 0;
    for (let h = 0; h < 24; h++) if (g[d * 24 + h]) n++;
    byDay.push(n);
  }
  return { flat: g, byDay };
}

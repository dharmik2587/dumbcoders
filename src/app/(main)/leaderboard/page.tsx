"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { Code2, Loader2 } from "lucide-react";

/** Inline GitHub mark — lucide-react doesn't ship a GitHub logo. */
function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
import { useStore } from "@/client/store/useStore";
import { useApiStore } from "@/client/store/apiStore";
import { Avatar } from "@/components/shared";
import {
  Label,
  Panel,
  Reveal,
  SectionHead,
  Select,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/client/utils/cn";

/* ------------------------------------------------------------------ */
/* Link Account Form                                                    */
/* ------------------------------------------------------------------ */
function LinkAccountPanel() {
  const submitPlatformUsername = useApiStore((s) => s.submitPlatformUsername);
  const [githubInput, setGithubInput] = useState("");
  const [leetcodeInput, setLeetcodeInput] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [leetcodeLoading, setLeetcodeLoading] = useState(false);
  const [githubLinked, setGithubLinked] = useState(false);
  const [leetcodeLinked, setLeetcodeLinked] = useState(false);

  const handleGithubSubmit = useCallback(async () => {
    if (!githubInput.trim() || githubLoading) return;
    setGithubLoading(true);
    const ok = await submitPlatformUsername("github", githubInput.trim());
    setGithubLoading(false);
    if (ok) {
      setGithubLinked(true);
    }
  }, [githubInput, githubLoading, submitPlatformUsername]);

  const handleLeetcodeSubmit = useCallback(async () => {
    if (!leetcodeInput.trim() || leetcodeLoading) return;
    setLeetcodeLoading(true);
    const ok = await submitPlatformUsername("leetcode", leetcodeInput.trim());
    setLeetcodeLoading(false);
    if (ok) {
      setLeetcodeLinked(true);
    }
  }, [leetcodeInput, leetcodeLoading, submitPlatformUsername]);

  return (
    <Reveal className="lg:col-span-12">
      <Panel ticks>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <Label tone="accent">link your accounts</Label>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg3">
            add profiles to compete
          </span>
        </div>

        <div className="grid gap-px border-b border-line bg-line sm:grid-cols-2">
          {/* GitHub */}
          <div className="bg-surface px-5 py-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#24292e]">
                <GithubIcon size={16} className="text-white" />
              </div>
              <div>
                <div className="text-[13.5px] text-fg">GitHub</div>
                <div className="font-mono text-[10px] text-fg3">repos · followers · languages</div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter GitHub username"
                value={githubInput}
                onChange={(e) => {
                  setGithubInput(e.target.value);
                  setGithubLinked(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleGithubSubmit()}
                disabled={githubLoading}
                className={cn(
                  "flex-1 border bg-raised px-3 py-2 font-mono text-[12px] text-fg placeholder:text-fg3/50 outline-none transition-colors",
                  githubLinked
                    ? "border-mint/50 bg-mint/5"
                    : "border-line focus:border-accent-line",
                )}
              />
              <button
                onClick={handleGithubSubmit}
                disabled={!githubInput.trim() || githubLoading}
                className={cn(
                  "flex h-[38px] items-center gap-1.5 border px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-all",
                  githubLinked
                    ? "border-mint/40 bg-mint/10 text-mint"
                    : githubLoading
                      ? "border-line bg-raised text-fg3 cursor-wait"
                      : "border-accent-line bg-accent-soft text-accent hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed",
                )}
              >
                {githubLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : githubLinked ? (
                  <>✓ linked</>
                ) : (
                  <>verify</>
                )}
              </button>
            </div>
          </div>

          {/* LeetCode */}
          <div className="bg-surface px-5 py-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFA116]">
                <Code2 size={16} className="text-black" />
              </div>
              <div>
                <div className="text-[13.5px] text-fg">LeetCode</div>
                <div className="font-mono text-[10px] text-fg3">problems · rating · contests</div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter LeetCode username"
                value={leetcodeInput}
                onChange={(e) => {
                  setLeetcodeInput(e.target.value);
                  setLeetcodeLinked(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleLeetcodeSubmit()}
                disabled={leetcodeLoading}
                className={cn(
                  "flex-1 border bg-raised px-3 py-2 font-mono text-[12px] text-fg placeholder:text-fg3/50 outline-none transition-colors",
                  leetcodeLinked
                    ? "border-mint/50 bg-mint/5"
                    : "border-line focus:border-accent-line",
                )}
              />
              <button
                onClick={handleLeetcodeSubmit}
                disabled={!leetcodeInput.trim() || leetcodeLoading}
                className={cn(
                  "flex h-[38px] items-center gap-1.5 border px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-all",
                  leetcodeLinked
                    ? "border-mint/40 bg-mint/10 text-mint"
                    : leetcodeLoading
                      ? "border-line bg-raised text-fg3 cursor-wait"
                      : "border-accent-line bg-accent-soft text-accent hover:bg-accent/20 disabled:opacity-40 disabled:cursor-not-allowed",
                )}
              >
                {leetcodeLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : leetcodeLinked ? (
                  <>✓ linked</>
                ) : (
                  <>verify</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3">
          <p className="font-mono text-[10px] leading-relaxed text-fg3">
            We fetch your public stats once from the platform API, verify the account exists, and compute your score.
            Link either or both — your composite score reflects whichever platforms you&apos;ve connected.
          </p>
        </div>
      </Panel>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */
function Leaderboard() {
  const leaderboard = useApiStore((s) => s.leaderboard);
  const leaderboardLoading = useApiStore((s) => s.leaderboardLoading);
  const loadLeaderboard = useApiStore((s) => s.loadLeaderboard);
  const me = useStore((s) => s.meId);
  const [scope, setScope] = useState<"global" | "college" | "batch">("global");

  useEffect(() => {
    loadLeaderboard({ scope });
  }, [loadLeaderboard, scope]);

  const myRank = leaderboard.findIndex((e: any) => e.userId === me) + 1;

  return (
    <div className="mx-auto max-w-[1400px]">
      <SectionHead
        index="05"
        kicker="Leaderboard"
        title={<>Signal, not noise — ranked by what you ship.</>}
        sub="Composite score from GitHub activity, LeetCode progress, hackathon participation and placements. Link your accounts to compete."
        right={
          <div className="flex items-center gap-2">
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="w-36"
            >
              <option value="global">Global</option>
              <option value="college">My college</option>
              <option value="batch">My batch</option>
            </Select>
          </div>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Link accounts panel */}
        <LinkAccountPanel />

        {/* Stats strip */}
        <Reveal className="lg:col-span-12">
          <Panel ticks>
            <div className="grid divide-x divide-line border-b border-line sm:grid-cols-5">
              {[
                ["Entries", leaderboard.length || "—"],
                ["Your rank", myRank ? `#${myRank}` : "—"],
                ["Scored", "github + leetcode + events"],
                ["Components", "4 × 25 pts"],
                ["Updated", "live"],
              ].map(([label, value]) => (
                <div key={label as string} className="px-5 py-4">
                  <Label tone="muted">{label as string}</Label>
                  <div className="mt-1.5 font-mono text-[16px] tnum text-fg">{value}</div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        {/* Table */}
        <Reveal className="lg:col-span-12">
          <Panel>
            <div className="divide-y divide-line">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-fg3">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Builder</div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center gap-1">
                    <GithubIcon size={10} /> GitHub
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="inline-flex items-center gap-1">
                    <Code2 size={10} /> LeetCode
                  </span>
                </div>
                <div className="col-span-1 text-right">Events</div>
                <div className="col-span-2 text-right">Composite</div>
              </div>

              {leaderboardLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 px-5 py-4">
                    <div className="col-span-1"><Skeleton className="h-4 w-8" /></div>
                    <div className="col-span-4"><Skeleton className="h-5 w-48" /></div>
                    <div className="col-span-2"><Skeleton className="ml-auto h-4 w-16" /></div>
                    <div className="col-span-2"><Skeleton className="ml-auto h-4 w-16" /></div>
                    <div className="col-span-1"><Skeleton className="ml-auto h-4 w-12" /></div>
                    <div className="col-span-2"><Skeleton className="ml-auto h-5 w-16" /></div>
                  </div>
                ))
              ) : leaderboard.length === 0 ? (
                <div className="px-5 py-16 text-center text-[13px] text-fg3">
                  No data yet for this scope. Link your GitHub or LeetCode above to get started.
                </div>
              ) : (
                leaderboard.map((entry: any) => {
                  const isMe = entry.userId === me;
                  const top3 = entry.rank <= 3;
                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "grid grid-cols-12 items-center gap-3 px-5 py-3.5 transition-colors",
                        isMe && "bg-accent-soft/50",
                      )}
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        {top3 ? (
                          <span className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold tnum",
                            entry.rank === 1 && "bg-amber text-black",
                            entry.rank === 2 && "bg-fg3/40 text-fg",
                            entry.rank === 3 && "bg-amber/40 text-amber",
                          )}>
                            {entry.rank}
                          </span>
                        ) : (
                          <span className="pl-2 font-mono text-[12px] tnum text-fg3">#{entry.rank}</span>
                        )}
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <Avatar
                          b={{
                            id: entry.username || entry.userId,
                            name: entry.fullName,
                            initials: entry.fullName
                              .split(" ")
                              .map((w: string) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase(),
                          }}
                          size={32}
                        />
                        <div className="min-w-0">
                          <Link href={`/b/${entry.username}`} className="block truncate text-[13.5px] text-fg hover:text-accent">
                            {entry.fullName}
                            {isMe && <span className="ml-2 text-[10px] uppercase tracking-wider text-accent">(you)</span>}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="font-mono text-[10px] text-fg3">@{entry.username}</span>
                            {entry.githubUsername && (
                              <span className="flex items-center gap-0.5 font-mono text-[10px] text-fg3" title={`GitHub: ${entry.githubUsername}`}>
                                · <GithubIcon size={9} /> {entry.githubUsername}
                              </span>
                            )}
                            {entry.leetcodeUsername && (
                              <span className="flex items-center gap-0.5 font-mono text-[10px] text-fg3" title={`LeetCode: ${entry.leetcodeUsername}`}>
                                · <Code2 size={9} /> {entry.leetcodeUsername}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={cn(
                          "font-mono text-[12.5px] tnum",
                          (entry.githubScore ?? 0) > 0 ? "text-fg2" : "text-fg3/40",
                        )}>
                          {entry.githubScore ?? 0}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={cn(
                          "font-mono text-[12.5px] tnum",
                          (entry.leetcodeScore ?? 0) > 0 ? "text-[#FFA116]" : "text-fg3/40",
                        )}>
                          {entry.leetcodeScore ?? 0}
                        </span>
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="font-mono text-[12.5px] tnum text-fg2">{(entry.participationScore || 0) + (entry.resultScore || 0)}</span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={cn(
                          "font-mono text-[14px] font-semibold tnum",
                          top3 ? "text-accent" : "text-fg",
                        )}>
                          {entry.composite}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}

export default Leaderboard;

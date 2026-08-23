'use client';

import { Kicker, MarqueeRow, Reveal } from "../lib/kit";
import { deadlineRail } from "../lib/content";

const MODULES = [
  {
    id: "M-01",
    name: "Discover",
    copy: "Hackathons filtered by track, travel distance, team-size cap and how close the deadline is.",
    glyph: <GlyphDiscover />,
  },
  {
    id: "M-02",
    name: "Profile",
    copy: "A technical profile built from repos, shipped projects and self-declared stack — not a résumé.",
    glyph: <GlyphProfile />,
  },
  {
    id: "M-03",
    name: "Match",
    copy: "Compatibility scored on skill complement, free hours and intent for the same event.",
    glyph: <GlyphMatch />,
  },
  {
    id: "M-04",
    name: "Compose",
    copy: "See which roles your team is missing before the first commit, not on hour thirty.",
    glyph: <GlyphCompose />,
  },
  {
    id: "M-05",
    name: "Request",
    copy: "Structured collaboration requests with role, availability and a reason — no cold intros.",
    glyph: <GlyphRequest />,
  },
  {
    id: "M-06",
    name: "Track",
    copy: "Deadlines, submission checklists and project history across every hackathon you enter.",
    glyph: <GlyphTrack />,
  },
];

export function PlatformStrip() {
  return (
    <section id="platform" data-zone="light" className="relative bg-paper-2">
      {/* deadline rail */}
      <div className="border-y border-dark-ink/10 bg-paper">
        <MarqueeRow>
          {deadlineRail.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-4 whitespace-nowrap border-r border-dark-ink/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-muted"
            >
              <span
                className={
                  item.includes("T-0D") || item.includes("CLOSES")
                    ? "h-1.5 w-1.5 rounded-full bg-amber"
                    : "h-1.5 w-1.5 rounded-full bg-mint"
                }
              />
              {item}
            </span>
          ))}
        </MarqueeRow>
      </div>

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-10 py-20 md:grid-cols-12 md:py-24">
          <div className="md:col-span-4">
            <Reveal>
              <Kicker tone="dark">02 / The platform</Kicker>
              <h2 className="mt-5 text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.02] tracking-[-0.035em] text-dark-ink">
                Six things that replace the group chat.
              </h2>
              <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-slate-muted">
                Every module writes back into the same graph. Bookmark an event and it
                feeds your matching; request a teammate and it updates your team&apos;s
                coverage.
              </p>
            </Reveal>
            <Reveal delay={140}>
              <a
                href="#matching"
                className="group mt-7 inline-flex items-center gap-2 border-b border-dark-ink/25 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-dark-ink transition-colors hover:border-beam hover:text-[#2f6ede]"
              >
                Read the matching spec
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>
          </div>

          <div className="md:col-span-8">
            <div className="grid grid-cols-1 border-t border-l border-dark-ink/10 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m, i) => (
                <Reveal
                  key={m.id}
                  delay={i * 70}
                  className="group relative border-b border-r border-dark-ink/10 bg-paper p-6 transition-colors duration-500 hover:bg-paper-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-slate-tech">
                      {m.id}
                    </span>
                    <span className="text-slate-muted transition-colors duration-500 group-hover:text-beam">
                      {m.glyph}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[17px] tracking-[-0.02em] text-dark-ink">
                    {m.name}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-slate-muted">
                    {m.copy}
                  </p>
                  <span className="absolute bottom-0 left-0 h-px w-0 bg-beam transition-all duration-500 group-hover:w-full" />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- glyphs ---------------- */
const g = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GlyphDiscover() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" {...g}>
      <circle cx="14" cy="14" r="8" />
      <path d="M20 20l6 6" />
      <path d="M11 14h6M14 11v6" opacity="0.5" />
    </svg>
  );
}
function GlyphProfile() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" {...g}>
      <rect x="5" y="4" width="20" height="22" rx="1" />
      <path d="M9 10h7M9 14h12M9 18h9M9 22h5" opacity="0.6" />
      <circle cx="21" cy="8" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function GlyphMatch() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" {...g}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="21" cy="8" r="3" />
      <circle cx="15" cy="22" r="3" />
      <path d="M11 10.5l2.5 8.5M19 10.5l-2.5 8.5M12 8h6" opacity="0.55" />
      <path d="M12 8h6" strokeDasharray="2 2" />
    </svg>
  );
}
function GlyphCompose() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" {...g}>
      <rect x="4" y="6" width="9" height="9" />
      <rect x="17" y="6" width="9" height="9" />
      <rect x="4" y="19" width="9" height="6" />
      <rect
        x="17"
        y="19"
        width="9"
        height="6"
        strokeDasharray="2.5 2.5"
        opacity="0.75"
      />
    </svg>
  );
}
function GlyphRequest() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" {...g}>
      <path d="M4 9h22v12H10l-6 5z" />
      <path d="M10 13h10M10 17h6" opacity="0.6" />
    </svg>
  );
}
function GlyphTrack() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" {...g}>
      <path d="M4 26V12M11 26V6M18 26v-9M25 26V9" />
      <circle cx="25" cy="9" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

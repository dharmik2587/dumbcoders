/* Illustrative product data used to demonstrate HackMate's interface. */

export type Hackathon = {
  code: string;
  name: string;
  host: string;
  city: string;
  mode: string;
  closes: string;
  daysLeft: number;
  track: string;
  prize: string;
  demand: string;
  state: "open" | "closing" | "closed";
};

export const hackathons: Hackathon[] = [
  {
    code: "HK-2041",
    name: "Symbiosis",
    host: "IIT Bombay · E-Cell",
    city: "Mumbai",
    mode: "Onsite · 36h",
    closes: "2026-03-14",
    daysLeft: 6,
    track: "AI / Health",
    prize: "₹4,00,000",
    demand: "high",
    state: "closing",
  },
  {
    code: "HK-2038",
    name: "Nullspace",
    host: "BITS Pilani · ACM",
    city: "Goa",
    mode: "Hybrid · 48h",
    closes: "2026-03-22",
    daysLeft: 14,
    track: "Systems / Infra",
    prize: "₹2,50,000",
    demand: "medium",
    state: "open",
  },
  {
    code: "HK-2035",
    name: "Paperclip",
    host: "IIIT Hyderabad",
    city: "Hyderabad",
    mode: "Onsite · 24h",
    closes: "2026-04-02",
    daysLeft: 25,
    track: "Open build",
    prize: "₹1,20,000",
    demand: "low",
    state: "open",
  },
  {
    code: "HK-2031",
    name: "Coldstart",
    host: "NSUT · Startup Cell",
    city: "Delhi",
    mode: "Onsite · 30h",
    closes: "2026-02-28",
    daysLeft: 0,
    track: "Fintech",
    prize: "₹3,00,000",
    demand: "high",
    state: "closed",
  },
  {
    code: "HK-2044",
    name: "Latency",
    host: "VIT Vellore · GDG",
    city: "Vellore",
    mode: "Remote · 72h",
    closes: "2026-04-19",
    daysLeft: 42,
    track: "Devtools",
    prize: "₹90,000",
    demand: "medium",
    state: "open",
  },
];

export const roles = [
  {
    key: "frontend",
    label: "Frontend",
    note: "Interface, state, motion",
    coverage: 82,
    tone: "beam" as const,
  },
  {
    key: "backend",
    label: "Backend",
    note: "APIs, data, auth",
    coverage: 64,
    tone: "beam" as const,
  },
  {
    key: "ml",
    label: "AI / ML",
    note: "Models, evals, inference",
    coverage: 38,
    tone: "amber" as const,
  },
  {
    key: "design",
    label: "Product design",
    note: "Flow, visual system",
    coverage: 27,
    tone: "amber" as const,
  },
  {
    key: "pm",
    label: "Product / pitch",
    note: "Scope, story, demo",
    coverage: 71,
    tone: "mint" as const,
  },
];

export const matchSignals = [
  {
    id: "S-01",
    label: "Skill complement",
    weight: 34,
    detail:
      "Measures overlap between the roles your team is missing and what a builder has actually shipped.",
  },
  {
    id: "S-02",
    label: "Commitment window",
    weight: 22,
    detail:
      "Overlapping free hours across the 72 hours before submission, not just a timezone match.",
  },
  {
    id: "S-03",
    label: "Build history",
    weight: 18,
    detail:
      "Repos, shipped projects and hackathon submissions — verified through linked accounts.",
  },
  {
    id: "S-04",
    label: "Stack overlap",
    weight: 14,
    detail:
      "Shared languages and frameworks so the first commit doesn't start with a tooling argument.",
  },
  {
    id: "S-05",
    label: "Intent match",
    weight: 12,
    detail:
      "Same event, similar track interest, and a stated goal: win, learn, or prototype.",
  },
];

export const candidates = [
  {
    id: "b-117",
    name: "Ananya R.",
    meta: "3rd yr · CSE · VIT",
    score: 94,
    reason: "Covers your LLM + design gap",
    skills: ["PyTorch", "Figma", "Next.js"],
    availability: "28h / weekend",
    tone: "mint" as const,
  },
  {
    id: "b-204",
    name: "Dev M.",
    meta: "2nd yr · ECE · BITS",
    score: 87,
    reason: "Ships fast backend, same stack",
    skills: ["Go", "Postgres", "Docker"],
    availability: "22h / weekend",
    tone: "beam" as const,
  },
  {
    id: "b-318",
    name: "Sara K.",
    meta: "4th yr · Design · NIFT",
    score: 81,
    reason: "Pitch deck + prototype polish",
    skills: ["Prototyping", "Story", "Rive"],
    availability: "16h / weekend",
    tone: "amber" as const,
  },
  {
    id: "b-402",
    name: "Rahul V.",
    meta: "1st yr · CS · IIIT",
    score: 73,
    reason: "First hackathon, high availability",
    skills: ["React", "Firebase"],
    availability: "34h / weekend",
    tone: "beam" as const,
  },
];

export const requests = [
  {
    id: "REQ-2291",
    from: "Ananya R.",
    role: "AI / ML",
    event: "Symbiosis",
    message: "I read your problem statement — I can train the triage model by Saturday.",
    age: "4m ago",
    state: "new" as const,
  },
  {
    id: "REQ-2288",
    from: "Dev M.",
    role: "Backend",
    event: "Nullspace",
    message: "Got a Go ingest service already scaffolded. Can I plug in?",
    age: "1h ago",
    state: "reviewing" as const,
  },
  {
    id: "REQ-2284",
    from: "Sara K.",
    role: "Design",
    event: "Symbiosis",
    message: "Sending a flow draft tonight. Team looks frontend-heavy.",
    age: "5h ago",
    state: "accepted" as const,
  },
];

export const projectTimeline = [
  { t: "Fri 21:00", label: "Team locked · 4 members", state: "done" },
  { t: "Sat 02:40", label: "Scope cut to one user flow", state: "done" },
  { t: "Sat 15:10", label: "Model endpoint live on /v1/triage", state: "done" },
  { t: "Sun 09:30", label: "Design pass · 11 screens", state: "active" },
  { t: "Sun 18:00", label: "Submission · Symbiosis", state: "todo" },
];

export const deadlineRail = hackathons
  .map((h) => `${h.code} · ${h.name.toUpperCase()} · ${h.city.toUpperCase()} · T-${h.daysLeft}D`)
  .concat(["4 TEAMS SEEKING DESIGN", "12 BUILDERS OPEN IN MUMBAI", "SYMBIOSIS SHORTLIST CLOSES FRI"]);

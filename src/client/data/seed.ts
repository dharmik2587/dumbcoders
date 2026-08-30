import type {
  Builder,
  CollabRequest,
  Hackathon,
  Notification,
  Project,
  RoleKey,
  Skill,
  Team,
} from "../types";

/* ---------------------------------------------------------------
   Reference date — keeps all countdowns stable
--------------------------------------------------------------- */
export const NOW = new Date("2026-03-08T09:41:00+05:30");

const day = 86_400_000;
const iso = (offsetDays: number) =>
  new Date(NOW.getTime() + offsetDays * day).toISOString();

/* ---------------------------------------------------------------
   Skill taxonomy
--------------------------------------------------------------- */
export const CLUSTERS: { cluster: string; label: string; role: RoleKey }[] = [
  { cluster: "interface", label: "React / Next", role: "frontend" },
  { cluster: "interface", label: "TypeScript", role: "frontend" },
  { cluster: "interface", label: "Interface motion", role: "frontend" },
  { cluster: "interface", label: "State & data fetching", role: "frontend" },
  { cluster: "services", label: "Node / Express", role: "backend" },
  { cluster: "services", label: "Go", role: "backend" },
  { cluster: "services", label: "Postgres / SQL", role: "backend" },
  { cluster: "services", label: "Auth & sessions", role: "backend" },
  { cluster: "infra", label: "Docker", role: "devops" },
  { cluster: "infra", label: "CI / deploy", role: "devops" },
  { cluster: "infra", label: "Observability", role: "devops" },
  { cluster: "intelligence", label: "Python", role: "ml" },
  { cluster: "intelligence", label: "PyTorch", role: "ml" },
  { cluster: "intelligence", label: "Evals & fine-tuning", role: "ml" },
  { cluster: "intelligence", label: "RAG / retrieval", role: "ml" },
  { cluster: "craft", label: "Figma systems", role: "design" },
  { cluster: "craft", label: "Prototyping", role: "design" },
  { cluster: "craft", label: "Design tokens", role: "design" },
  { cluster: "narrative", label: "User research", role: "product" },
  { cluster: "narrative", label: "Scoping", role: "product" },
  { cluster: "narrative", label: "Pitch & demo", role: "product" },
  { cluster: "mobile", label: "React Native", role: "mobile" },
  { cluster: "mobile", label: "Kotlin / Swift", role: "mobile" },
];

export const CLUSTER_ORDER = [
  "interface",
  "services",
  "infra",
  "intelligence",
  "craft",
  "narrative",
  "mobile",
];

export const CLUSTER_NAME: Record<string, string> = {
  interface: "Interface",
  services: "Services",
  infra: "Infra",
  intelligence: "Intelligence",
  craft: "Craft",
  narrative: "Narrative",
  mobile: "Mobile",
};

const skill = (label: string, level: 0 | 1 | 2 | 3): Skill => {
  const meta = CLUSTERS.find((c) => c.label === label)!;
  return {
    id: label.toLowerCase().replace(/[^a-z]+/g, "-"),
    cluster: meta.cluster,
    label,
    level,
  };
};

/* ---------------------------------------------------------------
   Hackathons
--------------------------------------------------------------- */
const RAW_EVENTS: [
  string, string, string, string, Hackathon["mode"], number, number, string,
  number, number, Hackathon["demand"],
][] = [
  ["Symbiosis", "IIT Bombay · E-Cell", "Mumbai", "AI / Health", "onsite", 36, 6, "Health", 400000, 4, "high"],
  ["Nullspace", "BITS Pilani · ACM", "Goa", "Systems / Infra", "hybrid", 48, 14, "Systems", 250000, 4, "medium"],
  ["Paperclip", "IIIT Hyderabad", "Hyderabad", "Open build", "onsite", 24, 25, "Open", 120000, 5, "low"],
  ["Coldstart", "NSUT · Startup Cell", "Delhi", "Fintech", "onsite", 30, -2, "Fintech", 300000, 4, "high"],
  ["Latency", "VIT Vellore · GDG", "Vellore", "Devtools", "remote", 72, 42, "Devtools", 90000, 3, "medium"],
  ["Halcyon", "IISc Bangalore", "Bangalore", "Climate / Energy", "onsite", 36, 9, "Climate", 350000, 4, "high"],
  ["Overclock", "COEP Pune", "Pune", "Open build", "hybrid", 36, 18, "Open", 150000, 4, "medium"],
  ["Tessellate", "IIT Madras", "Chennai", "Design systems", "onsite", 24, 31, "Design", 110000, 4, "low"],
  ["Undertow", "BITS Goa · Quark", "Goa", "Ocean / Geo", "remote", 60, 47, "Geo", 200000, 3, "medium"],
  ["Kindling", "NIT Trichy", "Trichy", "EdTech", "onsite", 36, 12, "EdTech", 175000, 5, "high"],
  ["Static", "DTU Delhi", "Delhi", "Security", "onsite", 48, 22, "Security", 220000, 4, "medium"],
  ["Beacon", "IIIT Delhi", "Delhi", "AI / Health", "hybrid", 36, 4, "Health", 280000, 4, "high"],
  ["Ferrous", "NITK Surathkal", "Mangalore", "Hardware", "onsite", 48, 36, "Hardware", 160000, 4, "low"],
  ["Slipstream", "IIT Kharagpur", "Kharagpur", "Devtools", "remote", 72, 55, "Devtools", 130000, 3, "medium"],
  ["Nocturne", "Ashoka University", "Sonipat", "Open build", "onsite", 24, 8, "Open", 95000, 4, "medium"],
  ["Vantage", "SPJIMR × IIT B", "Mumbai", "Fintech", "hybrid", 36, 27, "Fintech", 320000, 4, "medium"],
  ["Cobalt", "IIT Roorkee", "Roorkee", "Robotics", "onsite", 48, 40, "Robotics", 240000, 4, "low"],
  ["Meridian", "ISI Kolkata", "Kolkata", "AI / Research", "remote", 72, 16, "AI", 260000, 3, "high"],
  ["Tidewater", "NIT Calicut", "Kozhikode", "Climate / Energy", "onsite", 36, 19, "Climate", 180000, 4, "medium"],
  ["Palladium", "Manipal · MIT", "Manipal", "Design systems", "hybrid", 30, 11, "Design", 140000, 4, "medium"],
  ["Ironwork", "Jadavpur University", "Kolkata", "Systems / Infra", "onsite", 48, 33, "Systems", 210000, 4, "low"],
  ["Solstice", "IIT Delhi", "Delhi", "EdTech", "onsite", 36, 3, "EdTech", 290000, 5, "high"],
  ["Aperture", "Symbiosis Pune", "Pune", "AI / Health", "hybrid", 36, 21, "Health", 230000, 4, "medium"],
  ["Longwave", "IIT BHU", "Varanasi", "Open build", "remote", 60, 29, "Open", 105000, 3, "low"],
];

const DEMAND_PROFILE: Record<string, Partial<Record<RoleKey, number>>> = {
  Health: { ml: 0.95, backend: 0.8, frontend: 0.6, design: 0.55, product: 0.6 },
  Systems: { backend: 0.95, devops: 0.85, frontend: 0.4, product: 0.35 },
  Open: { frontend: 0.8, backend: 0.7, design: 0.65, product: 0.7, ml: 0.4 },
  Fintech: { backend: 0.9, frontend: 0.75, product: 0.8, devops: 0.55, ml: 0.45 },
  Devtools: { backend: 0.85, frontend: 0.75, devops: 0.8, product: 0.5 },
  Climate: { ml: 0.8, backend: 0.7, design: 0.6, product: 0.65 },
  Design: { design: 0.95, frontend: 0.8, product: 0.6, backend: 0.35 },
  Geo: { ml: 0.85, backend: 0.75, frontend: 0.6, design: 0.5 },
  EdTech: { frontend: 0.9, product: 0.85, design: 0.75, backend: 0.6 },
  Security: { backend: 0.9, devops: 0.8, ml: 0.5, product: 0.45 },
  Hardware: { backend: 0.7, devops: 0.6, ml: 0.6, design: 0.5 },
  AI: { ml: 0.95, backend: 0.7, frontend: 0.5, product: 0.5 },
  Robotics: { backend: 0.8, ml: 0.75, devops: 0.6, design: 0.45 },
};

export const HACKATHONS: Hackathon[] = RAW_EVENTS.map(
  ([name, host, city, track, mode, hours, dLeft, group, prize, maxTeam, demand], i) => {
    const daysLeft = dLeft;
    return {
      id: `hk-${1000 + i}`,
      code: `HK-${2000 + i * 3}`,
      name,
      host,
      city,
      mode,
      durationHours: hours,
      startDate: iso(daysLeft + 12),
      registerDeadline: iso(daysLeft),
      track,
      tracks: [group, track.split(" / ")[0]],
      prize,
      currency: "INR",
      maxTeamSize: maxTeam,
      minTeamSize: 2,
      demand,
      trackDemands: DEMAND_PROFILE[group] ?? DEMAND_PROFILE.Open,
      description:
        `${track} track at ${host}. ${hours}-hour build window, on-campus judging, and a ` +
        `problem statement released at kickoff. ${maxTeam}-member cap. ${
          mode === "remote"
            ? "Fully remote — submissions close at 23:59 IST on the final day."
            : "Travel and stay are arranged for outstation teams."
        }`,
      status: daysLeft < 0 ? "closed" : daysLeft <= 7 ? "closing" : "open",
    };
  },
);

export const daysLeft = (h: Hackathon) =>
  Math.round(
    (new Date(h.registerDeadline).getTime() - NOW.getTime()) / day,
  );

/* ---------------------------------------------------------------
   Builders
--------------------------------------------------------------- */
const FIRST = ["Ananya","Dev","Sara","Rahul","Riya","Kabir","Meera","Arjun","Ishita","Nikhil","Tara","Vivaan","Zoya","Aditya","Nisha","Rehan","Diya","Farhan","Aisha","Manav","Sneha","Yash","Priya","Karan","Anika","Rohan","Lavanya","Imran","Trisha","Aarav"];
const LAST = ["R.","M.","K.","V.","S.","B.","N.","P.","G.","J.","T.","D.","C.","L.","A.","H."];
const COLLEGES = ["IIT Bombay","BITS Pilani","IIIT Hyderabad","VIT Vellore","NSUT Delhi","IIT Madras","COEP Pune","NIT Trichy","IIT Delhi","IIIT Delhi","Manipal MIT","NITK Surathkal"];
const BRANCH: Record<RoleKey, string> = {
  frontend: "CSE", backend: "IT", ml: "AI & DS", design: "Design",
  product: "CSE / MBA", mobile: "ECE", devops: "IT",
};

const ROLE_SKILLS: Record<RoleKey, [string, 0 | 1 | 2 | 3][]> = {
  frontend: [["React / Next", 3], ["TypeScript", 3], ["Interface motion", 2], ["State & data fetching", 2], ["Figma systems", 1], ["Node / Express", 1]],
  backend: [["Node / Express", 3], ["Go", 2], ["Postgres / SQL", 3], ["Auth & sessions", 2], ["Docker", 2], ["CI / deploy", 2], ["React / Next", 1]],
  ml: [["Python", 3], ["PyTorch", 3], ["Evals & fine-tuning", 2], ["RAG / retrieval", 2], ["Postgres / SQL", 1], ["Node / Express", 1]],
  design: [["Figma systems", 3], ["Prototyping", 3], ["Design tokens", 2], ["Interface motion", 2], ["React / Next", 1], ["User research", 2]],
  product: [["User research", 3], ["Scoping", 3], ["Pitch & demo", 3], ["Figma systems", 1], ["React / Next", 1]],
  mobile: [["React Native", 3], ["Kotlin / Swift", 2], ["TypeScript", 2], ["Auth & sessions", 1], ["CI / deploy", 1]],
  devops: [["Docker", 3], ["CI / deploy", 3], ["Observability", 2], ["Go", 2], ["Postgres / SQL", 2], ["Node / Express", 1]],
};

const CITIES = ["Mumbai","Goa","Hyderabad","Delhi","Vellore","Bangalore","Pune","Chennai","Kolkata","Trichy"];
const GOALS: Builder["goal"][] = ["win","learn","ship"];

function seeded(n: number) {
  let s = n;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function availability(rnd: () => number, weekly: number) {
  const slots: { day: number; start: number; end: number }[] = [];
  const density = Math.min(0.85, weekly / 45);
  for (let d = 0; d < 7; d++) {
    if (rnd() > density) continue;
    const weekend = d >= 5;
    const start = weekend ? Math.floor(rnd() * 4) + 8 : Math.floor(rnd() * 3) + 18;
    const len = weekend ? Math.floor(rnd() * 4) + 5 : Math.floor(rnd() * 3) + 2;
    slots.push({ day: d, start, end: Math.min(24, start + len) });
  }
  return slots;
}

export const BUILDERS: Builder[] = FIRST.map((first, i) => {
  const rnd = seeded(1337 + i * 97);
  const role = (["frontend","backend","ml","design","product","mobile","devops"] as RoleKey[])[
    Math.floor(rnd() * 7)
  ];
  const weekly = 14 + Math.floor(rnd() * 24);
  const college = COLLEGES[i % COLLEGES.length];
  const events = HACKATHONS.filter(() => rnd() > 0.86).slice(0, 2).map((h) => ({
    hackathonId: h.id,
    year: 2025,
    placement: rnd() > 0.6 ? "Finalist" : undefined,
  }));
  const stack = ROLE_SKILLS[role];
  return {
    id: `b-${100 + i}`,
    handle: `${first.toLowerCase()}.${LAST[i % LAST.length].toLowerCase().replace(/\W/g, "") || "x"}`,
    name: `${first} ${LAST[i % LAST.length]}`,
    initials: `${first[0]}${LAST[i % LAST.length][0]}`,
    college,
    year: (1 + Math.floor(rnd() * 4)) as Builder["year"],
    branch: BRANCH[role],
    city: CITIES[i % CITIES.length],
    role,
    secondary: (["frontend","backend","ml","design","product"] as RoleKey[]).filter(
      (r) => r !== role && rnd() > 0.7,
    ).slice(0, 2),
    goal: GOALS[Math.floor(rnd() * 3)],
    bio:
      role === "ml"
        ? "Training small models that survive contact with a demo."
        : role === "design"
          ? "Interfaces that hold up at 3 a.m. under a projector."
          : role === "product"
            ? "I cut scope so the demo actually finishes."
            : role === "devops"
              ? "If it isn't deployed, it didn't happen."
              : role === "backend"
                ? "APIs, queues, and the part nobody screenshares."
                : role === "mobile"
                  ? "Shipping to a real device before the judging panel arrives."
                  : "Interfaces, motion, and the last 5% that judges actually see.",
    skills: stack.map(([l, lv]) => skill(l, lv)),
    repos: [
      { name: `${first.toLowerCase()}-${role}-kit`, lang: stack[0][0].split(" ")[0], stars: Math.floor(rnd() * 240) + 4, url: "https://github.com" },
      { name: `weekend-${first.toLowerCase()}`, lang: stack[1][0].split(" ")[0], stars: Math.floor(rnd() * 90) + 1, url: "https://github.com" },
    ],
    projects: [
      {
        id: `p-${i}-a`,
        name: ["Triage","Ledgerlite","Pulse","Waypoint","Cinder","Slate","Halyard"][i % 7],
        role,
        year: 2025,
        outcome: events[0]?.placement ? `Finalist · ${events[0].placement}` : "Shipped to pilot users",
      },
      {
        id: `p-${i}-b`,
        name: ["Nullroute","Kettle","Ferrous UI","Driftlog","Cassette"][i % 5],
        role,
        year: 2024,
        outcome: "Open-sourced",
      },
    ],
    events,
    availability: availability(rnd, weekly),
    weeklyHours: weekly,
    openToTeams: rnd() > 0.2,
    verified: i % 5 !== 0,
    lastActive: `${Math.floor(rnd() * 55) + 2}m ago`,
  };
});

export const ME_ID = "b-100";

/* ---------------------------------------------------------------
   Teams, projects, requests
--------------------------------------------------------------- */
export const TEAMS: Team[] = [
  {
    id: "t-orbit",
    name: "Orbit-04",
    hackathonId: HACKATHONS[0].id,
    ownerId: ME_ID,
    members: [
      { builderId: ME_ID, role: "frontend", joinedAt: iso(-9) },
      { builderId: "b-104", role: "product", joinedAt: iso(-7) },
    ],
    openSlots: [
      { role: "ml", note: "Runtime inference for the triage model" },
      { role: "design", note: "Screen-level design past hour twelve" },
    ],
    project: "proj-triage",
    visibility: "discoverable",
  },
  {
    id: "t-kettle",
    name: "Kettle Works",
    hackathonId: HACKATHONS[5].id,
    ownerId: "b-101",
    members: [
      { builderId: "b-101", role: "backend", joinedAt: iso(-5) },
      { builderId: "b-106", role: "devops", joinedAt: iso(-4) },
      { builderId: "b-102", role: "ml", joinedAt: iso(-3) },
    ],
    openSlots: [{ role: "frontend", note: "Dashboard + judge demo" }],
    visibility: "discoverable",
  },
  {
    id: "t-slate",
    name: "Slate",
    hackathonId: HACKATHONS[7].id,
    ownerId: "b-103",
    members: [
      { builderId: "b-103", role: "design", joinedAt: iso(-2) },
      { builderId: "b-100", role: "frontend", joinedAt: iso(-2) },
    ],
    openSlots: [
      { role: "product", note: "Research + pitch" },
      { role: "backend", note: "Token pipeline" },
    ],
    visibility: "private",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "proj-triage",
    name: "Triage",
    teamId: "t-orbit",
    hackathonId: HACKATHONS[0].id,
    commitCount: 112,
    commitsByDay: [4, 11, 19, 26, 18, 22, 12],
    submissionAt: iso(6),
    notes:
      "One user flow only: paramedic uploads vitals, model returns a triage band. Cut the history view on Saturday.",
    tasks: [
      { id: "k1", projectId: "proj-triage", title: "Triage model endpoint on /v1/triage", ownerId: null, column: "done" },
      { id: "k2", projectId: "proj-triage", title: "Vitals capture screen", ownerId: ME_ID, column: "done" },
      { id: "k3", projectId: "proj-triage", title: "Confidence banding UI", ownerId: ME_ID, column: "doing" },
      { id: "k4", projectId: "proj-triage", title: "Eval table with 40-case fixture", ownerId: null, column: "doing" },
      { id: "k5", projectId: "proj-triage", title: "Deck export to PDF", ownerId: "b-104", column: "todo" },
      { id: "k6", projectId: "proj-triage", title: "Demo script — 90 seconds", ownerId: "b-104", column: "todo" },
      { id: "k7", projectId: "proj-triage", title: "Link all member profiles to submission", ownerId: null, column: "todo" },
    ],
    log: [
      { id: "l1", projectId: "proj-triage", at: "Fri 21:00", label: "Team locked · 4 members", state: "done" },
      { id: "l2", projectId: "proj-triage", at: "Sat 02:40", label: "Scope cut to one user flow", state: "done" },
      { id: "l3", projectId: "proj-triage", at: "Sat 15:10", label: "Model endpoint live on /v1/triage", state: "done" },
      { id: "l4", projectId: "proj-triage", at: "Sun 09:30", label: "Design pass · 11 screens", state: "active", progress: 68 },
      { id: "l5", projectId: "proj-triage", at: "Sun 18:00", label: "Submission · Symbiosis", state: "todo" },
    ],
    checklist: [
      { id: "c1", label: "Repo public + README", done: true },
      { id: "c2", label: "Demo video under 3 minutes", done: true },
      { id: "c3", label: "Model card + eval table", done: true },
      { id: "c4", label: "Deck exported to PDF", done: false },
      { id: "c5", label: "All member profiles linked", done: false },
    ],
  },
  {
    id: "proj-kettle",
    name: "Kettle",
    teamId: "t-kettle",
    hackathonId: HACKATHONS[5].id,
    commitCount: 41,
    commitsByDay: [2, 6, 9, 11, 8, 5, 0],
    submissionAt: iso(21),
    notes: "Grid-load forecaster for campus microgrids. Backend is ahead of the interface.",
    tasks: [
      { id: "q1", projectId: "proj-kettle", title: "Ingest pipeline for meter CSVs", ownerId: "b-101", column: "done" },
      { id: "q2", projectId: "proj-kettle", title: "Forecast model v1", ownerId: "b-102", column: "doing" },
      { id: "q3", projectId: "proj-kettle", title: "Dashboard shell", ownerId: null, column: "todo" },
      { id: "q4", projectId: "proj-kettle", title: "Deploy preview env", ownerId: "b-106", column: "doing" },
    ],
    log: [
      { id: "m1", projectId: "proj-kettle", at: "Thu 18:00", label: "Kickoff · problem statement", state: "done" },
      { id: "m2", projectId: "proj-kettle", at: "Fri 11:20", label: "Ingest pipeline green", state: "done" },
      { id: "m3", projectId: "proj-kettle", at: "Sat 10:00", label: "Forecast v1 training", state: "active", progress: 42 },
      { id: "m4", projectId: "proj-kettle", at: "Sat 22:00", label: "Dashboard handoff", state: "todo" },
    ],
    checklist: [
      { id: "d1", label: "Repo public + README", done: true },
      { id: "d2", label: "Demo video under 3 minutes", done: false },
      { id: "d3", label: "Model card + eval table", done: false },
      { id: "d4", label: "Deck exported to PDF", done: false },
    ],
  },
];

export const REQUESTS: CollabRequest[] = [
  {
    id: "REQ-2291",
    fromId: "b-102",
    teamId: "t-orbit",
    role: "ml",
    message: "I read your problem statement — I can train the triage model by Saturday and hand you a versioned endpoint.",
    score: 94,
    state: "new",
    createdAt: iso(-0.003),
  },
  {
    id: "REQ-2288",
    fromId: "b-101",
    teamId: "t-orbit",
    role: "backend",
    message: "Got a Go ingest service already scaffolded for vitals streams. Can I plug it in?",
    score: 87,
    state: "new",
    createdAt: iso(-0.05),
  },
  {
    id: "REQ-2284",
    fromId: "b-103",
    teamId: "t-orbit",
    role: "design",
    message: "Sending a flow draft tonight. Your roster looks frontend-heavy, which is usually where the demo suffers.",
    score: 81,
    state: "accepted",
    createdAt: iso(-0.22),
  },
  {
    id: "REQ-2270",
    fromId: ME_ID,
    toId: "b-106",
    teamId: "t-orbit",
    role: "devops",
    message: "We need someone who can get this deployed to a preview URL before Sunday morning.",
    score: 78,
    state: "reviewing",
    createdAt: iso(-0.4),
  },
  {
    id: "REQ-2261",
    fromId: ME_ID,
    toId: "b-109",
    teamId: "t-kettle",
    role: "frontend",
    message: "Dashboard-heavy build, backend is done. Looking for someone who can land it in one pass.",
    score: 72,
    state: "declined",
    createdAt: iso(-1.2),
  },
  {
    id: "REQ-2255",
    fromId: "b-108",
    teamId: "t-slate",
    role: "product",
    message: "I can take research and the pitch. Have run three finals in this track.",
    score: 69,
    state: "new",
    createdAt: iso(-0.02),
  },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", kind: "request", title: "New request · Ananya R.", body: "AI / ML for Orbit-04 · 94% complement", at: "4m ago", read: false, href: "/requests" },
  { id: "n2", kind: "deadline", title: "Symbiosis closes in 6 days", body: "Registration ends 2026-03-14", at: "1h ago", read: false, href: "/discover" },
  { id: "n3", kind: "match", title: "3 new complements", body: "Builders who close your AI/ML gap", at: "5h ago", read: true, href: "/match" },
  { id: "n4", kind: "team", title: "Sara K. joined Slate", body: "Design slot closed", at: "1d ago", read: true, href: "/teams" },
];

export const config = { runtime: "edge" };

const USERNAME = "lowdevco";

const FALLBACK = {
  stars: 0,
  commits: 15,
  prs: 2,
  issues: 0,
  langs: [
    { name: "Python", pct: 55 },
    { name: "JavaScript", pct: 25 },
    { name: "HTML", pct: 12 },
    { name: "CSS", pct: 8 },
  ],
};

const LANG_COLORS = {
  Python: "#3572a5",
  CSS: "#563d7c",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  Shell: "#89e051",
  default: "#8b949e",
};

async function fetchStats() {
  const token =
    typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined;
  const base = {
    "User-Agent": "lowdevco-readme/2.0",
    Accept: "application/vnd.github.v3+json",
  };
  const hdrs = token ? { ...base, Authorization: `Bearer ${token}` } : base;

  // ── GraphQL (authenticated) ────────────────────────────────────────────────
  if (token) {
    const q = `{user(login:"${USERNAME}"){
      repositories(first:100,ownerAffiliations:OWNER,isFork:false){nodes{
        stargazerCount
        languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}
      }}
      contributionsCollection(from:"2026-01-01T00:00:00Z"){
        totalCommitContributions totalPullRequestContributions totalIssueContributions
      }
    }}`;
    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { data } = await res.json();
      const u = data.user;
      const stars = u.repositories.nodes.reduce(
        (s, r) => s + r.stargazerCount,
        0,
      );
      const lm = {};
      u.repositories.nodes.forEach((r) =>
        r.languages.edges.forEach(({ size, node }) => {
          if (
            node.name.toLowerCase() !== "shell" &&
            node.name.toLowerCase() !== "typescript"
          ) {
            lm[node.name] = (lm[node.name] || 0) + size;
          }
        }),
      );
      const tot = Object.values(lm).reduce((a, b) => a + b, 0);
      const langs = Object.entries(lm)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, b]) => ({ name, pct: Math.round((b / tot) * 100) }));
      return {
        stars,
        langs,
        commits: u.contributionsCollection.totalCommitContributions,
        prs: u.contributionsCollection.totalPullRequestContributions,
        issues: u.contributionsCollection.totalIssueContributions,
      };
    } catch {
      /* fall through to REST */
    }
  }

  // ── REST (unauthenticated) ─────────────────────────────────────────────────
  try {
    const [rR, pR, iR, cR] = await Promise.allSettled([
      fetch(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`,
        { headers: hdrs },
      ),
      fetch(
        `https://api.github.com/search/issues?q=author:${USERNAME}+type:pr&per_page=1`,
        { headers: hdrs },
      ),
      fetch(
        `https://api.github.com/search/issues?q=author:${USERNAME}+type:issue&per_page=1`,
        { headers: hdrs },
      ),
      fetch(
        `https://api.github.com/search/commits?q=author:${USERNAME}+committer-date:2026-01-01..2026-12-31&per_page=1`,
        {
          headers: {
            ...hdrs,
            Accept: "application/vnd.github.cloak-preview+json",
          },
        },
      ),
    ]);
    let { stars, langs, prs, issues, commits } = FALLBACK;

    if (rR.status === "fulfilled" && rR.value.ok) {
      const repos = await rR.value.json();
      if (Array.isArray(repos)) {
        stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
        const lc = {};
        repos.forEach((r) => {
          if (
            r.language &&
            r.language.toLowerCase() !== "shell" &&
            r.language.toLowerCase() !== "typescript"
          ) {
            lc[r.language] = (lc[r.language] || 0) + 1;
          }
        });
        const tot = Object.values(lc).reduce((a, b) => a + b, 0);
        if (tot > 0)
          langs = Object.entries(lc)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([name, cnt]) => ({
              name,
              pct: Math.round((cnt / tot) * 100),
            }));
      }
    }
    if (pR.status === "fulfilled" && pR.value.ok) {
      const d = await pR.value.json();
      prs = d.total_count ?? prs;
    }
    if (iR.status === "fulfilled" && iR.value.ok) {
      const d = await iR.value.json();
      issues = d.total_count ?? issues;
    }
    if (cR.status === "fulfilled" && cR.value.ok) {
      const d = await cR.value.json();
      commits = d.total_count ?? commits;
    }
    return { stars, commits, prs, issues, langs };
  } catch {
    return FALLBACK;
  }
}

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
        bg: "#000000",
        bg2: "#05030a",
        bg3: "#090514",
        text: "#ffffff",
        muted: "#c084fc",
        dim: "#7c3aed",
        border: "#2d1a47",
        border2: "#1e1130",
        accent: "#a855f7",
        statVal: "#c084fc",
        tagABg: "#2e1065",
        tagAFg: "#c084fc",
        tagBBg: "#1e1130",
        tagBFg: "#a855f7",
      }
    : {
        bg: "#ffffff",
        bg2: "#faf5ff",
        bg3: "#f3e8ff",
        text: "#000000",
        muted: "#6d28d9",
        dim: "#8b5cf6",
        border: "#e9d5ff",
        border2: "#d8b4fe",
        accent: "#7c3aed",
        statVal: "#6d28d9",
        tagABg: "#f3e8ff",
        tagAFg: "#7c3aed",
        tagBBg: "#faf5ff",
        tagBFg: "#6d28d9",
      };

  const stats = await fetchStats();
  const { stars, commits, prs, issues, langs } = stats;

  // ── Layout constants ────────────────────────────────────────────────────────
  const W = 900;
  const PAD_X = 24;
  const STRIP_W = 3; // left accent strip — visual rhyme anchor
  const DIVX = 456; // column split x
  const L_X = PAD_X;
  const R_X = DIVX + PAD_X;
  const R_END = W - PAD_X;

  // Section header baseline / underline
  const SEC_Y = 16;
  const UND_Y = 24;

  // ── LEFT: ABOUT ─────────────────────────────────────────────────────────────
  const ABOUT_LINES = [
    { text: "I build robust web systems from the database up —", bold: true },
    { text: "scalability first, clean code always.", bold: true },
    { text: null },
    {
      text: "Python Full Stack Developer based in Kerala, India,",
      bold: false,
    },
    {
      text: "turning complex requirements into elegant solutions.",
      bold: false,
    },
    { text: "Specialized in crafting reliable backends using", bold: false },
    { text: "Django and building dynamic frontends with React.", bold: false },
    { text: null },
    {
      text: "Focused on clean REST APIs, optimized SQL databases,",
      bold: false,
    },
    {
      text: "responsive Tailwind CSS designs, and writing clean,",
      bold: false,
    },
    {
      text: "maintainable code with a strong attention to detail.",
      bold: false,
    },
  ];

  const L_H = 15;
  const L_SY = UND_Y + 20;

  const aboutSVG = ABOUT_LINES.map((line, i) => {
    if (!line.text) return "";
    const y = L_SY + i * L_H;
    return `<text x="${L_X}" y="${y}"
      font-family="'Courier New',Consolas,monospace"
      font-size="${line.bold ? 12.5 : 11}" font-weight="${line.bold ? "700" : "400"}"
      fill="${line.bold ? c.text : c.muted}">${line.text}</text>`;
  }).join("\n");

  const ABOUT_BOTTOM = L_SY + ABOUT_LINES.length * L_H + 16;

  // Bullet list below about text — dot prefix (visual rhyme with badge dot)
  const BUL_Y1 = ABOUT_BOTTOM;
  const BUL_Y2 = BUL_Y1 + 16;

  // ── RIGHT: GITHUB STATS CARD ─────────────────────────────────────────────
  const STAT_ROWS = [
    { label: "Commits (2026)", value: commits, icon: "↑" },
    { label: "Pull Requests", value: prs, icon: "⇄" },
    { label: "Issues", value: issues, icon: "!" },
  ];

  const CARD_X = DIVX;
  const CARD_Y = 0;
  const CARD_W = W - CARD_X;
  const S_SY = UND_Y + 14;
  const S_ROW_H = 46;

  const statsSVG = STAT_ROWS.map(({ label, value, icon }, i) => {
    const ry = S_SY + i * S_ROW_H;
    const isLast = i === STAT_ROWS.length - 1;
    return `
  <!-- stat row ${i} -->
  <text x="${R_X}" y="${ry + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.accent}">${icon}</text>
  <text x="${R_X + 16}" y="${ry + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.muted}">${label}</text>
  <!-- Stat value with optional glow (depth — makes numbers feel luminous in dark) -->
  ${
    dark
      ? `<text x="${R_END}" y="${ry + 14}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="20" font-weight="700" fill="${c.statVal}"
        filter="url(#numGlow)">${value}</text>`
      : ""
  }
  <text x="${R_END}" y="${ry + 14}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="20" font-weight="700" fill="${c.statVal}">${value}</text>`;
  }).join("");

  const STATS_BOTTOM = S_SY + STAT_ROWS.length * S_ROW_H;

  // Meta tags below stats
  const TAG_Y = STATS_BOTTOM + 10;
  const TAG_H = 20;

  const metaSVG = `
  <rect x="${R_END - 186}" y="${TAG_Y}" width="88" height="${TAG_H}" rx="10"
        fill="${c.tagABg}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${R_END - 142}" y="${TAG_Y + 13}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="9.5" font-weight="700" fill="${c.tagAFg}">Full Stack</text>
  <rect x="${R_END - 88}" y="${TAG_Y}" width="88" height="${TAG_H}" rx="10"
        fill="${c.tagBBg}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${R_END - 44}" y="${TAG_Y + 13}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="9.5" font-weight="700" fill="${c.tagBFg}">IST · IN</text>`;

  const H = Math.max(BUL_Y2 + 20, TAG_Y + TAG_H + 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="pc"><rect width="${W}" height="${H}"/></clipPath>
  <!-- Number glow filter (depth — only applied in dark mode) -->
  <filter id="numGlow" x="-40%" y="-60%" width="180%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  <!-- Column divider gradient: solid top → transparent bottom (depth) -->
  <linearGradient id="divGrad" x1="0" x2="0"
                  gradientUnits="userSpaceOnUse"
                  y1="${UND_Y}" y2="${H - 12}">
    <stop offset="0%"   stop-color="${c.accent}" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
  </linearGradient>
</defs>
<g clip-path="url(#pc)">

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ── LEFT: ABOUT ──────────────────────────────────────────────────── -->
  <!-- Section label (// prefix — visual rhyme across all cards) -->
  <text x="${L_X}" y="${SEC_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// ABOUT</text>
  <line x1="${L_X}" y1="${UND_Y}" x2="${DIVX - 20}" y2="${UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${aboutSVG}

  <!-- Divider + bullet list below about text -->
  <line x1="${L_X}" y1="${BUL_Y1 - 8}" x2="${DIVX - 20}" y2="${BUL_Y1 - 8}"
        stroke="${c.border2}" stroke-width="0.5"/>

  <!-- Dot bullet (visual rhyme — same dot used in badge, footer links, legend) -->
  <circle cx="${L_X + 5}" cy="${BUL_Y1 - 1}" r="2.5" fill="${c.accent}" opacity="0.75"/>
  <text x="${L_X + 16}" y="${BUL_Y1 + 4}"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.dim}">Django · REST APIs · SQL Databases</text>

  <circle cx="${L_X + 5}" cy="${BUL_Y2 - 1}" r="2.5" fill="${c.accent}" opacity="0.75"/>
  <text x="${L_X + 16}" y="${BUL_Y2 + 4}"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.dim}">React · Tailwind CSS · JavaScript · Git</text>

  <!-- ── COLUMN DIVIDER (gradient fade — depth) ───────────────────────── -->
  <rect x="${DIVX}" y="${UND_Y}" width="1" height="${H - 12 - UND_Y}"
        fill="url(#divGrad)"/>

  <!-- ── RIGHT: GITHUB STATS ───────────────────────────────────────────── -->
  <!-- Tinted card background (depth layer — elevation panel) -->
  <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD_W}" height="${H}"
        fill="${c.bg2}" opacity="${dark ? "0.6" : "0.5"}"/>

  <!-- Section label -->
  <text x="${R_X}" y="${SEC_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// GITHUB STATS</text>
  <line x1="${R_X}" y1="${UND_Y}" x2="${R_END}" y2="${UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${statsSVG}
  ${metaSVG}

  <!-- ── LEFT ACCENT STRIP (visual rhyme anchor — on every card) ────────── -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <!-- Borders -->
  <rect x="${W - 1}" y="0" width="1" height="${H}" fill="${c.border}"/>
  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

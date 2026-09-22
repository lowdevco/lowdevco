import { INFO } from "./info.js";

export const config = { runtime: "edge" };

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
        bg: "#000000",
        bar: "#090514",
        text: "#ffffff",
        muted: "#c084fc",
        dim: "#B694FF",
        border: "#2d1a47",
        accent: "#A57AFF",
        aBg: "#2e1065",
        badgeBg: "#0f2a18",
        badgeFg: "#39d353",
      }
    : {
        bg: "#ffffff",
        bar: "#faf5ff",
        text: "#000000",
        muted: "#6d28d9",
        dim: "#B694FF",
        border: "#e9d5ff",
        accent: "#A57AFF",
        aBg: "#f3e8ff",
        badgeBg: "#dcfce7",
        badgeFg: "#16a34a",
      };

  const W = 900,
    H = 196;
  const BAR_H = 32;
  const PAD_X = 28;
  const STRIP_W = 3; // left accent strip — visual rhyme anchor across all cards

  // Vertical layout adjustments
  const NAME_Y = BAR_H + 46;
  const ROLE_Y = NAME_Y + 22;
  const STATUS_Y = ROLE_Y + 28;
  const TYPE_Y = STATUS_Y + 40;
  
  // Calculate a rough underline width based on name length
  const underlineW = (INFO.name.length * 20) - 20;

  const lines = INFO.typingLines;
  const duration = 4; // seconds per line
  const totalDuration = lines.length * duration;

  let clipPaths = "";
  let linesSVG = "";

  lines.forEach((line, i) => {
    const startTime = i * duration;
    const typeTime = 1.5; 
    const p1 = startTime / totalDuration;
    const p2 = (startTime + typeTime) / totalDuration;
    const p3 = (startTime + duration - 0.1) / totalDuration;
    const p4 = (startTime + duration) / totalDuration;

    const clipKeyTimes = `0; ${p1}; ${p2}; ${p3}; ${p4}; 1`;
    const clipValues = `0; 0; 800; 800; 0; 0`; 
    const opacValues = `0; 0; 1; 1; 0; 0`;

    clipPaths += `
      <clipPath id="type-clip-${i}">
        <rect x="${PAD_X}" y="${TYPE_Y - 20}" height="30" width="0">
          <animate attributeName="width" values="${clipValues}" keyTimes="${clipKeyTimes}" dur="${totalDuration}s" repeatCount="indefinite" />
        </rect>
      </clipPath>
    `;

    linesSVG += `
      <text x="${PAD_X}" y="${TYPE_Y}"
            font-family="'Courier New', Consolas, monospace" font-size="13" font-weight="700"
            fill="${c.accent}"
            clip-path="url(#type-clip-${i})"
            opacity="0">
        ${escapeXml(line)}
        <animate attributeName="opacity" values="${opacValues}" keyTimes="${clipKeyTimes}" dur="${totalDuration}s" repeatCount="indefinite" />
      </text>
    `;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="bc"><rect x="0" y="0" width="${W}" height="${H + 20}" rx="8"/></clipPath>
  <linearGradient id="typeBarGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${c.bg}"/>
    <stop offset="5%" stop-color="${c.bar}"/>
    <stop offset="100%" stop-color="${c.bg}"/>
  </linearGradient>
  ${clipPaths}
</defs>
<g clip-path="url(#bc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="${BAR_H}" fill="${c.bar}"/>
  <rect y="${BAR_H}" width="${W}" height="1" fill="${c.border}" opacity="0.5"/>

  <!-- Window controls -->
  <circle cx="20" cy="16" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="16" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="16" r="5" fill="#27c93f"/>
  
  <!-- Terminal title -->
  <text x="72" y="20" font-family="'Courier New', Consolas, monospace" font-size="11" fill="${c.dim}">~/${escapeXml(INFO.handle)} — zsh</text>

  <!-- Name and Underline -->
  <text x="${PAD_X}" y="${NAME_Y}" font-family="'Courier New', Consolas, monospace" font-size="34" font-weight="bold" fill="${c.text}">${escapeXml(INFO.name)}</text>
  <rect x="${PAD_X}" y="${NAME_Y + 8}" width="${underlineW}" height="2" fill="${c.accent}" opacity="0.8"/>
  
  <!-- Role / Subtitle -->
  <text x="${PAD_X}" y="${ROLE_Y}" font-family="'Courier New', Consolas, monospace" font-size="11" font-weight="700" fill="${c.muted}">${escapeXml(INFO.role)} · ${escapeXml(INFO.skillsSubtitle)} · ${escapeXml(INFO.location)} · ${escapeXml(INFO.timezone)}</text>

  <!-- Status / Let me cook (simple text instead of badge) -->
  <text x="${PAD_X}" y="${STATUS_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="11" font-weight="700"
        fill="${c.text}">${escapeXml(INFO.statusBadge)}</text>

  <!-- Typing Animation Area -->
  <rect x="0" y="${TYPE_Y - 22}" width="${W}" height="36" fill="url(#typeBarGrad)"/>
  <line x1="0" y1="${TYPE_Y - 22}" x2="${W}" y2="${TYPE_Y - 22}" stroke="${c.border}" stroke-width="0.5" opacity="0.8"/>
  ${linesSVG}

  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>
  
  <!-- Borders -->
  <rect y="0" width="${W}" height="1" fill="${c.border}"/>
  <rect x="${W - 1}" y="0" width="1" height="${H}" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

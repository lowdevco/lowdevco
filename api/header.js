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
  const NAME_Y = BAR_H + 54;
  const ROLE_Y = NAME_Y + 24;
  const STATUS_Y = ROLE_Y + 36;
  
  // Calculate a rough underline width based on name length
  // Courier bold 34px is approx 20px per character.
  // "Muhammad Irfan" = 14 chars, let's underline "Muhammad " or the whole name?
  // Let's underline the whole name, or about 280px.
  const underlineW = (INFO.name.length * 20) - 20;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="bc"><rect x="0" y="0" width="${W}" height="${H + 20}" rx="8"/></clipPath>
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

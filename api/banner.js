export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#000000",
        border: "#2e1a47",
        accent: "#a855f7",
        text: "#ffffff",
        dim: "#9333ea",
        boxBg: "#090514",
      }
    : {
        bg: "#ffffff",
        border: "#e9d5ff",
        accent: "#7c3aed",
        text: "#000000",
        dim: "#6d28d9",
        boxBg: "#faf5ff",
      };

  const W = 900,
    H = 44;
  const STRIP_W = 3;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="bc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#bc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <rect y="0" width="${W}" height="0.5" fill="${c.border}" opacity="0.8"/>
  <rect y="${H - 0.5}" width="${W}" height="0.5" fill="${c.border}" opacity="0.8"/>

  <rect x="20" y="7" width="${W - 40}" height="30" rx="4" fill="${c.boxBg}" stroke="${c.border}" stroke-width="0.5"/>

  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <text x="35" y="26" font-family="'Courier New',Consolas,monospace" font-size="12" font-weight="bold" fill="${c.accent}">>_</text>

  <text x="${W / 2}" y="26" text-anchor="middle" font-family="'Courier New',Consolas,monospace" font-size="12" font-weight="700" letter-spacing="2" fill="${c.text}">DEPLOY YOUR OWN TERMINAL PROFILE</text>

  <text x="${W - 35}" y="26" text-anchor="end" font-family="'Courier New',Consolas,monospace" font-size="12" font-weight="700" fill="${c.dim}">[ CLICK HERE ]</text>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

/**
 * =============================================================================
 * CENTRAL PROFILE CONFIGURATION (info.js)
 * =============================================================================
 * Edit this single file to update your personal details, bio, tech stack,
 * social links, and terminal status across all your README cards.
 * =============================================================================
 */

export const INFO = {
  // ── Personal Identification & Subtitles ─────────────────────────────────────
  /**  full display name shown in the Header card */
  name: "Muhammad Irfan",

  /** GitHub username / terminal handle */
  handle: "lowdevco",

  /** Primary role title shown in the Header card */
  role: "Full Stack Developer",

  /** Role secondary subtitle / tech specialization */
  skillsSubtitle: "React & Django",

  /**  location string */
  location: "Kerala, India",

  /** Timezone string */
  timezone: "UTC+5:30",

  /** Open-for-work status text shown in the header badge (keeps green theme) */
  statusBadge: "OPEN FOR WORK",

  // ── Header Terminal Typing Animation Lines ──────────────────────────────────
  /**
   * Animated lines that cycle continuously in the Header card.
   * Add or modify lines here. Keep line length reasonable for optimal rendering.
   */
  typingLines: [
    ">_Staging Automation: Python | Django | React | REST APIs",
    ">_System Target: Full Stack Developer | Open for Work | IST UTC+5:30",
    ">_Pipeline Status: Building real projects, ignoring tutorials...",
  ],

  // ── About & Bio Section ─────────────────────────────────────────────────────
  /**
   * Main bold headline shown at the top of the ABOUT section in the Profile card.
   * Split into 2 short lines for optimal visual balance.
   */
  headlineLine1: "I build robust web systems from the database up —",
  headlineLine2: "scalability first, clean code always.",

  /**
   * Main paragraph sentences shown in the ABOUT section.
   * Each string is rendered as a clean line.
   */
  aboutParagraphs: [
    "Python Full Stack Developer based in Kerala, India,",
    "turning complex requirements into elegant solutions.",
    "Specialized in crafting reliable backends using",
    "Django and building dynamic frontends with React.",
    "", // empty string creates vertical space
    "Focused on clean REST APIs, optimized SQL databases,",
    "responsive Tailwind CSS designs, and writing clean,",
    "maintainable code with a strong attention to detail.",
  ],

  /**
   * Bullet summary list shown at the bottom of the ABOUT section.
   */
  bulletList: [
    "Django · REST APIs · SQL Databases",
    "React · Tailwind CSS · JavaScript · Git",
  ],

  /**
   * Small tag pills shown at the bottom right of the Github Stats card.
   */
  tagBadges: {
    primary: "Full Stack",
    secondary: "IST · IN",
  },

  // ── Technologies & Frameworks Grid ──────────────────────────────────────────
  /**
   * The 10 technologies displayed in the 2-row grid on the Skills & Stack cards.
   * Order matters: First 5 items form Row 1, next 5 items form Row 2.
   */
  technologies: [
    // Row 1
    "Python",
    "Django",
    "React",
    "JavaScript",
    "Tailwind",
    // Row 2
    "MySQL",
    "REST API",
    "HTML",
    "CSS",
    "Git",
  ],

  // ── Language Metrics Exclusions ─────────────────────────────────────────────
  /**
   * Lowercase names of languages to exclude from GitHub language metrics tracking.
   * e.g., ['shell', 'typescript'] prevents shell scripts or unused languages from diluting metrics.
   */
  excludedLanguages: ["shell", "typescript"],

  // ── Social & Portfolio Links ────────────────────────────────────────────────
  /**
   * Links displayed as interactive pills in the Footer card.
   */
  links: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/muhammadirfank/",
    },
    {
      label: "GitHub",
      url: "https://github.com/lowdevco",
    },
    {
      label: "Portfolio",
      url: "https://lowdevco.vercel.app/",
    },
  ],
};

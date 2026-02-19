// Theme configuration — edit this file to rebrand for a different food event.
// After editing, run: python3 apply-theme.py
// This updates og-image, CNAME, HTML fallbacks, and README to match.

const THEME = {
  // Event identity
  eventName: "SB Burger Week 2026",
  eventDates: "Feb 19–25",
  emoji: "🍔",

  // OG image text (two lines for the social preview image)
  ogLine1: "Santa Barbara",
  ogLine2: "Burger Week 2026",

  // Labels (what to call the featured item)
  itemLabel: "burger",
  itemLabelPlural: "burgers",

  // Site URL (used for OG meta tags, embed snippets, print page)
  siteUrl: "https://sbburgerweekmap.com",

  // Description (used for meta tags)
  description:
    "Interactive map of all participating restaurants. Search, filter by area, and get directions.",

  // Header
  sourceLabel: "Source: The Independent",
  sourceUrl: "https://www.independent.com/2026/02/05/burger-week-2026/",

  // Venmo tip jar (set venmoUser to null to hide the link)
  venmoUser: "samgutentag",
  venmoNote: "Buy me a burger?",
  venmoAmount: 5,

  // LocalStorage namespace
  storageKey: "sbburgerweek-checklist",

  // Print page
  printTitle: "SB Burger Week 2026 — My Picks",

  // Data launch date — before this date, data.js (skeleton) is loaded.
  // On or after this date, data-<year>.js (full menu details) is loaded.
  // Format: "YYYY-MM-DD" in local time, activates at 12:01 AM. Set null to always load full data.
  dataLiveDate: "2026-02-18",

  // Event tracking — Cloudflare Worker URL (null to disable)
  trackUrl: "https://sbburgerweek-track.developer-95b.workers.dev",

  // Cloudflare Web Analytics (null to disable)
  cfAnalyticsToken: "4a7b8d80cde44aaeae633e477756e567",
};

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
  sourceUrl: "https://www.independent.com/2026/02/18/go-beast-mode-for-santa-barbara-burger-week-2026",

  // Venmo tip jar (set venmoUser to null to hide the link)
  venmoUser: "samgutentag",
  venmoNote: "Buy me a burger?",

  // Tip jar tiers — size: "s" (custom emoji), "m" (half theme emoji), "l" (full theme emoji)
  // The "m" tier is auto-featured (orange border). Tracking: tip-s, tip-m, tip-l
  tipTiers: [
    { size: "s", label: "Side of Fries", emoji: "🍟", amount: 1 },
    { size: "m", label: "Half a Burger", amount: 5 },
    { size: "l", label: "Full Burger", amount: 10 },
  ],

  // LocalStorage namespace
  storageKey: "sbburgerweek-checklist",

  // Print page
  printTitle: "SB Burger Week 2026 — My Picks",

  // Event start date — used for analytics/stats time filters (ISO date)
  eventStartDate: "2026-02-19",

  // Event end date — concluded banner/modal auto-shows after this date (ISO date, null to never show)
  eventEndDate: "2026-02-25",

  // Map center and zoom level
  mapCenter: [34.42, -119.7],
  mapZoom: 13,

  // GitHub repo URL (used in About modal, footer links)
  githubRepoUrl: "https://github.com/samgutentag/sbburgerweek",

  // Data launch date — before this date, data.js (skeleton) is loaded.
  // On or after this date, data-<year>.js (full menu details) is loaded.
  // Format: "YYYY-MM-DD" in local time, activates at 12:01 AM. Set null to always load full data.
  dataLiveDate: "2026-02-18",

  // Event tracking — Cloudflare Worker URL (null to disable)
  trackUrl: null,

  // Cloudflare Web Analytics (null to disable)
  cfAnalyticsToken: null,

  // Contact email domain — generates sb{itemLabel}week{year}@{domain}
  // Set null to hide the contact link
  contactDomain: "samgutentag.com",

  // Google Places API key for hours fetching (null to disable hours feature)
  // Only used by fetch-hours.py and fetch-place-ids.py, never exposed client-side.
  // The actual API key should be stored as a GitHub repo secret: GOOGLE_PLACES_API_KEY
  googlePlacesApiKey: null,
};

# SB Burger Week 2026 Map

[![Hits](https://hits.sh/sbburgerweekmap.com.svg)](https://hits.sh/sbburgerweekmap.com/)

An interactive map of all participating restaurants for [Santa Barbara Burger Week 2026](https://www.independent.com/2026/02/05/burger-week-2026/) (Feb 19–25). Browse, filter, share, and plan your burger week from your phone or desktop.

**Live at [sbburgerweekmap.com](https://sbburgerweekmap.com)**

## Features

- **Interactive map** — Leaflet map with color-coded markers by area, marker clustering, and drop shadows
- **Search & filter** — Find restaurants by name, menu item, or area. Area filter zooms the map to fit
- **Deep linking** — Share a direct link to any restaurant (e.g. `sbburgerweekmap.com/#arnoldis`). URL hash updates as you browse
- **Share button** — Each popup has a Share button that opens the native share sheet (iOS/Android) or copies the link to clipboard
- **Multi-item menus** — Restaurants with multiple specials show each item with its own name and description
- **Sectioned popup cards** — Icon buttons for Apple Maps, Google Maps, Instagram, Website, Call, and Share
- **Sidebar interaction** — Hover a restaurant in the list to spot it on the map. Click to fly to it
- **Cluster tooltips** — Hover over marker clusters to see a list of restaurant names
- **Pick Favorites** — Toggle checklist mode to select/deselect restaurants with All/None bulk actions. Selections persist via localStorage
- **Print Selected** — Generate a printable page with a numbered map, grouped restaurant list, and Venmo QR code
- **Mobile-friendly** — Bottom drawer with three-stop snap (peek, half, full), drag handle, and touch-friendly tap targets
- **Embeddable map** — Self-contained iframe-friendly version with sidebar, search, filters, and favorites
- **Trending metrics** — Fire emoji badges on popular restaurants and a sort-by-popularity toggle, powered by click tracking data
- **Click tracking** — Cloudflare Worker + Analytics Engine tracks views, direction clicks, website visits, calls, and shares
- **Loading spinner** — Smooth loading overlay that fades out when map tiles are ready
- **About modal** — Info modal with event details, source link, Venmo tip jar, embed link, and GitHub link
- **Venmo deep linking** — `venmo://` deeplink on mobile, `account.venmo.com` on desktop. Print page includes a QR code via [QR Server API](https://goqr.me/api/)
- **Source monitoring** — GitHub Actions workflow checks the source article daily and opens an issue if content changes
- **Placeholder support** — Restaurants without menu details show "Details coming soon!" in popups and sidebar

## How It Works

This is a static site — plain HTML, CSS, and JavaScript with no build step and no dependencies to install. Everything loads from CDNs.

| File                                    | Purpose                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `index.html`                            | Page shell with OG meta tags, favicon, analytics                                |
| `app.js`                                | Map, markers, sidebar, filtering, search, deep linking, share, checklist, print |
| `style.css`                             | All styles including mobile responsive layout                                   |
| `config.js`                             | Theme config (event name, dates, emoji, URLs, Venmo, analytics, trending)       |
| `data.js`                               | Restaurant data array (skeleton with empty `menuItems`) and area colors         |
| `data-2026.js`                          | Production restaurant data with full `menuItems` for 2026                       |
| `mock_data.js`                          | Copy of `data.js` with placeholder names/descriptions for testing               |
| `trending.js`                           | Auto-generated trending scores (written by GitHub Action, do not edit)          |
| `track.js`                              | Client-side click tracker (reads `THEME.trackUrl`, no-ops if null)              |
| `apply-theme.py`                        | Reads `config.js`, updates OG image, CNAME, HTML fallbacks, README              |
| `workers/track/`                        | Cloudflare Worker for click tracking + trending API                             |
| `embed/map/`                            | Self-contained embeddable map (own JS/CSS, shares `data.js` and `config.js`)    |
| `embed/index.html`                      | Embed showcase page with iframe preview and copyable embed code                 |
| `.github/workflows/check-source.yml`    | Daily source article change detection                                           |
| `.github/workflows/update-trending.yml` | Generates `trending.js` every 6 hours                                           |

The map uses [Leaflet](https://leafletjs.com/) with [MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster) and [CARTO](https://carto.com/) basemap tiles.

## Run Locally

Start a local server from the project root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). A local server is required — `file://` won't work due to module loading.

### Using mock data

To test with placeholder burger names and descriptions, swap the data source in `index.html`:

```html
<!-- <script src="data.js"></script> -->
<script src="mock_data.js"></script>
```

Comment out `data.js` and uncomment `mock_data.js`, then refresh.

## Fork It — Complete Setup Guide

Have a burger week (or any food event) in your city? Fork this repo and make it your own. This guide walks through every step — no assumptions.

We'll use **"SB Burrito Week"** as the running example throughout.

---

### Step 1: Fork & Clone

1. Click **Fork** on the [GitHub repo page](https://github.com/samgutentag/sbburgerweek)
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/sbburgerweek.git
   cd sbburgerweek
   ```

3. Verify it runs:

   ```bash
   python3 -m http.server 8000
   ```

   Open [http://localhost:8000](http://localhost:8000) — you should see the map with the original burger week data.

---

### Step 2: Add Your Restaurant Data

Edit `data.js`. Each restaurant entry looks like this:

```js
{
  name: "Super Cucas",
  address: "626 State St., Santa Barbara, CA",
  website: "https://supercucas.com",        // optional, null if unknown
  phone: "805-555-1234",                     // optional, null if unknown
  instagram: "supercucas",                   // optional, null if unknown (handle only, no @)
  area: "Downtown SB",                       // used for color-coding and filtering
  lat: 34.4200,                              // latitude
  lng: -119.7000,                            // longitude
  mapUrl: "https://maps.app.goo.gl/...",     // Google Maps link
  appleMapsUrl: "https://maps.apple/p/...",  // Apple Maps link, or null
  menuItems: [
    { name: "The Mega Burrito", description: "Carne asada, guac, and extra cheese." },
    { name: "Veggie Burrito", description: null },  // null description = "coming soon"
  ],
}
```

- Restaurants with multiple specials get multiple entries in the `menuItems` array
- Use an empty array `[]` for restaurants with no menu info yet — they'll show "Details coming soon!"
- The `instagram` field shows an Instagram icon button in the popup. Use just the handle (no `@`)

**Tips for coordinates and map links:**

- Search on [Google Maps](https://maps.google.com), right-click the pin, and copy coordinates for `lat`/`lng`
- Click "Share" on Google Maps and copy the link for `mapUrl`
- Search on Apple Maps, tap "Share", copy the link for `appleMapsUrl`
- If you don't have a direct link, use: `https://www.google.com/maps/search/?api=1&query=123+Main+St+City+CA`
- If `appleMapsUrl` is `null`, the app falls back to address-based directions

**Update area colors** in the `AREA_COLORS` object at the top of `data.js`:

```js
const AREA_COLORS = {
  "Downtown SB": "#e63946",
  Goleta: "#2d6a4f",
  Carpinteria: "#1d3557",
  "Isla Vista": "#7b2cbf",
  "Santa Ynez": "#e76f51",
  "Other SB": "#e07a5f",
};
```

Change the keys and colors to match your event's areas.

---

### Step 3: Set the Map Center

Update the starting coordinates and zoom level in **two files**:

**`app.js`** (line ~67):

```js
const map = L.map("map", { ... }).setView([34.42, -119.70], 13);
```

**`embed/map/embed.js`** (line ~76):

```js
var map = L.map("map", { ... }).setView([34.42, -119.70], 13);
```

Change `[34.42, -119.70]` to your city's center coordinates and adjust `13` (the zoom level) as needed. Higher numbers zoom in more.

---

### Step 4: Configure Your Theme

Edit `config.js` to match your event. Here's a complete example for SB Burrito Week:

```js
const THEME = {
  // Event identity
  eventName: "SB Burrito Week 2026",
  eventDates: "Mar 5–11",
  emoji: "🌯",

  // OG image text (two lines for the social preview image)
  ogLine1: "Santa Barbara",
  ogLine2: "Burrito Week 2026",

  // Labels (what to call the featured item)
  itemLabel: "burrito",
  itemLabelPlural: "burritos",

  // Site URL (used for OG meta tags, embed snippets, share links)
  siteUrl: "https://sbburritoweekmap.com",

  // Description (used for meta tags)
  description:
    "Interactive map of all participating restaurants. Search, filter by area, and get directions.",

  // Header
  sourceLabel: "Source: The Independent",
  sourceUrl: "https://example.com/burrito-week-article",

  // Venmo tip jar (set venmoUser to null to hide the link entirely)
  venmoUser: "yourusername", // null to hide
  venmoNote: "Buy me a burrito?",
  venmoAmount: 5,

  // LocalStorage namespace (unique per event to avoid collisions)
  storageKey: "sbburritoweek-checklist",

  // Print page
  printTitle: "SB Burrito Week 2026 — My Picks",

  // Data launch date — before this date, data.js (skeleton) is loaded.
  // On or after this date, data-<year>.js (full menu details) is loaded.
  // Format: "YYYY-MM-DD" in local time. Set null to always load full data.
  dataLiveDate: "2026-03-04", // null to always show full data

  // Trending metrics — show fire emoji badges and sort-by-popularity toggle.
  // Data still collects if trackUrl is set; this only controls the UI.
  showTrending: false, // flip to true after a day or two of real data

  // Event tracking — Cloudflare Worker URL (null to disable)
  trackUrl: null, // null to disable tracking

  // Cloudflare Web Analytics (null to disable)
  cfAnalyticsToken: null, // null to disable analytics
};
```

See the [Config Reference](#config-reference) table below for a quick-scan of every field.

---

### Step 5: Generate Assets

Run the apply script to update the OG image, CNAME, HTML fallbacks, and README to match your config:

```bash
python3 apply-theme.py
```

**Prerequisites:**

- Python 3 (pre-installed on macOS)
- ImageMagick for PNG generation: `brew install imagemagick`

**What it updates:**

- `og-image.svg` and `og-image.png` — social preview image with your event name and emoji
- `CNAME` — custom domain file (extracted from `siteUrl`)
- `index.html` — favicon emoji, page title, header text, Venmo link, analytics snippet
- `embed/index.html` — embed bar text and snippet
- `README.md` — title, hits badge domain, embed snippet

---

### Step 6: Deploy to GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under "Build and deployment", select **Deploy from a branch** → **main** → **/ (root)**
3. Click **Save**

Your site will be live at `https://YOUR_USERNAME.github.io/sbburgerweek/` within a minute or two.

#### Custom domain (optional)

To use your own domain (e.g. `sbburritoweekmap.com`):

1. In GitHub Pages settings, enter your domain under "Custom domain" and click **Save**
2. The `CNAME` file is already managed by `apply-theme.py` (from `siteUrl` in config.js)
3. Configure DNS at your registrar (or Cloudflare):

   | Type  | Name | Content                 |
   | ----- | ---- | ----------------------- |
   | A     | @    | 185.199.108.153         |
   | A     | @    | 185.199.109.153         |
   | A     | @    | 185.199.110.153         |
   | A     | @    | 185.199.111.153         |
   | CNAME | www  | YOUR_USERNAME.github.io |

4. Wait for DNS propagation (a few minutes to a few hours)
5. Back in GitHub Pages settings, check "Enforce HTTPS"

> **If using Cloudflare DNS:** Set the proxy to **OFF** (grey cloud icon) for all these records. GitHub Pages needs to terminate SSL directly — Cloudflare's proxy breaks this.

---

### Step 7: Cloudflare Web Analytics (optional)

Adds a simple page-view analytics dashboard — no cookies, no personal data.

1. Create a free [Cloudflare account](https://dash.cloudflare.com/sign-up) if you don't have one
2. Go to **Web Analytics** in the Cloudflare dashboard
3. Click **Add a site**, enter your domain, and copy the token (a hex string like `4a7b8d80cde44aaeae633e477756e567`)
4. Set `cfAnalyticsToken` in `config.js`:

   ```js
   cfAnalyticsToken: "YOUR_TOKEN_HERE",
   ```

5. Run `python3 apply-theme.py` to inject the analytics snippet into `index.html`
6. Deploy. Analytics appear in the Cloudflare dashboard within minutes.

To disable, set `cfAnalyticsToken: null` and re-run `apply-theme.py`.

---

### Step 8: Click Tracking (optional)

Tracks which restaurants people view, get directions to, call, visit, and share. Data powers the trending feature (Step 9). Uses a Cloudflare Worker + Analytics Engine (free tier: 100k writes/day, 90-day retention).

**Prerequisites:** A Cloudflare account and Node.js installed.

1. **Install Wrangler** (Cloudflare's CLI):

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **Create an Analytics Engine dataset:**
   - Go to Cloudflare dashboard → **Workers & Pages** → **Analytics Engine**
   - Create a new dataset (e.g. `sbburritoweek`)

3. **Update `workers/track/wrangler.toml`:**

   ```toml
   name = "sbburritoweek-track"
   main = "index.js"
   compatibility_date = "2024-01-01"

   [vars]
   ACCOUNT_ID = "YOUR_CLOUDFLARE_ACCOUNT_ID"

   [[analytics_engine_datasets]]
   binding = "TRACKER"
   dataset = "sbburritoweek"
   ```

   - Change `name` to something unique for your event
   - Replace `ACCOUNT_ID` with your Cloudflare account ID (found in the dashboard URL or sidebar)
   - Change `dataset` to match the dataset you created

4. **Create a Cloudflare API token:**
   - Go to Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token**
   - Permissions needed: **Analytics Engine: Read**, **Workers Scripts: Edit**
   - Copy the token

5. **Add the token as a Worker secret:**

   ```bash
   cd workers/track
   wrangler secret put CF_API_TOKEN
   # Paste your token when prompted
   ```

6. **Update the event start date** in `workers/track/index.js`:
   - Find the SQL `WHERE timestamp >= toDateTime('...')` line
   - Change the date to your event start date in UTC (e.g. `2026-03-05 08:00:00` for Mar 5 at midnight PT)

7. **Deploy the Worker:**

   ```bash
   wrangler deploy
   ```

   Note the Worker URL it prints (e.g. `https://sbburritoweek-track.YOUR_SUBDOMAIN.workers.dev`)

8. **Set `trackUrl` in `config.js`:**

   ```js
   trackUrl: "https://sbburritoweek-track.YOUR_SUBDOMAIN.workers.dev",
   ```

9. **Verify:** Open your site, click around, then check Worker logs:

   ```bash
   wrangler tail
   ```

   You should see POST requests with `{action, label}` payloads.

---

### Step 9: Trending Metrics (optional)

Shows fire emoji badges next to popular restaurants and adds a sort-by-popularity toggle button. Requires click tracking (Step 8) to be set up first.

**How it works:**

- A GitHub Action runs every 6 hours, queries the Analytics Engine SQL API, and generates `trending.js`
- On page load, the app also does a live fetch to the Worker for the latest counts
- Restaurants are ranked by a weighted score: `views + (intents * 3)`
- Fire emojis by rank: top 5 get 🔥🔥🔥🔥🔥, 6–15 get 🔥🔥🔥, 16–25 get 🔥🔥, 26–35 get 🔥

**Setup:**

1. **Update `ACCOUNT_ID`** in `.github/workflows/update-trending.yml`:

   ```yaml
   env:
     CF_ACCOUNT_ID: "YOUR_CLOUDFLARE_ACCOUNT_ID"
   ```

2. **Update the event start date** in `.github/workflows/update-trending.yml`:
   - Find the SQL `WHERE timestamp >=` line
   - Change it to your event start date in UTC

3. **Add `CF_API_TOKEN` as a GitHub repo secret:**
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `CF_API_TOKEN`
   - Value: the same API token from Step 8

4. **Set `showTrending` in `config.js`:**

   ```js
   showTrending: false,  // start with false
   ```

   Data collects silently in the background as long as `trackUrl` is set. After a day or two of real traffic, flip to `true` to show the fire badges and sort toggle.

5. **Trigger the Action manually** to verify:
   - Go to your repo → **Actions** → **Update Trending** → **Run workflow**
   - Check that `trending.js` gets updated with data

**What `showTrending` controls:**

- `true` — fire emoji badges appear in the sidebar, sort-by-popularity toggle button is visible
- `false` — no visual trending indicators, but data still collects if `trackUrl` is set

---

### Step 10: Source Monitoring (optional)

Automatically checks if the source article changes and opens a GitHub issue with a diff.

1. Update `ARTICLE_URL` in `.github/workflows/check-source.yml` to your source page
2. Update the CSS class name (`wkwp-post-content`) to match your source page's article container
3. Push and trigger manually from the **Actions** tab to create the initial baseline files
4. Runs daily at 7am PT (cron `0 14 * * *`) — edit the cron expression to change the schedule

To disable, delete the workflow file or remove the `schedule` trigger.

---

### Step 11: Embed (optional)

The map can be embedded on other websites via iframe. Use this snippet (update the domain):

```html
<iframe
  src="https://sbburritoweekmap.com/embed/map"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  title="SB Burrito Week 2026 Interactive Map"
  loading="lazy"
  allowfullscreen
>
</iframe>
```

The embed includes the full interactive map with search, area filters, favorites, and directions. It shares `data.js` and `config.js` with the main site, so data updates propagate automatically. A showcase page lives at `/embed`.

The embed has its own `embed.js` and `embed.css` — feature changes to `app.js` or `style.css` do **not** automatically propagate to the embed.

---

## Config Reference

| Field                           | Type           | Description                                                             |
| ------------------------------- | -------------- | ----------------------------------------------------------------------- |
| `eventName`                     | string         | Event title shown in header and OG tags                                 |
| `eventDates`                    | string         | Date range shown in header                                              |
| `emoji`                         | string         | Emoji for favicon, markers, and popups                                  |
| `ogLine1` / `ogLine2`           | string         | Two-line text for OG social preview image                               |
| `itemLabel` / `itemLabelPlural` | string         | What to call the menu item (e.g. "burrito" / "burritos")                |
| `siteUrl`                       | string         | Full URL for OG tags, share links, and embed snippets                   |
| `description`                   | string         | Meta description for search engines                                     |
| `sourceLabel` / `sourceUrl`     | string         | Header link text and URL for source article                             |
| `venmoUser`                     | string \| null | Venmo username for tip jar. `null` hides the link                       |
| `venmoNote`                     | string         | Pre-filled Venmo payment note                                           |
| `venmoAmount`                   | number         | Pre-filled Venmo amount                                                 |
| `storageKey`                    | string         | localStorage key for favorites (unique per event)                       |
| `printTitle`                    | string         | Title shown on the printable picks page                                 |
| `dataLiveDate`                  | string \| null | `"YYYY-MM-DD"` to gate full data until that date. `null` to always show |
| `showTrending`                  | boolean        | Show fire emoji badges and sort-by-popularity toggle                    |
| `trackUrl`                      | string \| null | Cloudflare Worker URL for click tracking. `null` to disable             |
| `cfAnalyticsToken`              | string \| null | Cloudflare Web Analytics token. `null` to disable                       |

## Issues & Feedback

Found a bug, missing restaurant, or wrong detail? [Open an issue](../../issues) and let me know.

## Author

Made by [Sam Gutentag](https://www.gutentag.world) in Santa Barbara, CA.

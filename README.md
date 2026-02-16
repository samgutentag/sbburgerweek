# SB Burger Week 2026 Map

[![Hits](https://hits.sh/sbburgerweekmap.com.svg)](https://hits.sh/sbburgerweekmap.com/)

An interactive map of all participating restaurants for [Santa Barbara Burger Week 2026](https://www.independent.com/2026/02/05/burger-week-2026/) (Feb 19–25). Browse, filter, share, and plan your burger week from your phone or desktop.

**Live at [sbburgerweekmap.com](https://sbburgerweekmap.com)**

## Features

- **Interactive map** — Leaflet map with color-coded markers by area, marker clustering, and drop shadows
- **Search & filter** — Find restaurants by name, menu item, or area. Area filter zooms the map to fit
- **Deep linking** — Share a direct link to any restaurant (e.g. `sbburgerweekmap.com/#arnoldis`). URL hash updates as you browse
- **Share button** — Each popup has a Share button that opens the native share sheet (iOS/Android) or copies the link to clipboard
- **Restaurant popups** — Burger name, description, and icon buttons for Apple Maps, Google Maps, Website, Call, and Share
- **Sidebar interaction** — Hover a restaurant in the list to spot it on the map. Click to fly to it
- **Cluster tooltips** — Hover over marker clusters to see a list of restaurant names
- **Pick Favorites** — Toggle checklist mode to select/deselect restaurants with All/None bulk actions. Selections persist via localStorage
- **Print Selected** — Generate a printable page with a numbered map and grouped restaurant list
- **Mobile-friendly** — Bottom drawer with three-stop snap (peek, half, full), drag handle, and touch-friendly tap targets
- **Embeddable map** — Self-contained iframe-friendly version with sidebar, search, filters, and favorites
- **Loading spinner** — Smooth loading overlay that fades out when map tiles are ready
- **About modal** — Info modal with event details, source link, embed link, and Venmo tip jar
- **Source monitoring** — GitHub Actions workflow checks the source article daily and opens an issue if content changes
- **Placeholder support** — Restaurants without menu details show "Details coming soon!" in popups and sidebar

## How It Works

This is a static site — plain HTML, CSS, and JavaScript with no build step and no dependencies to install. Everything loads from CDNs.

| File | Purpose |
|------|---------|
| `index.html` | Page shell with OG meta tags, favicon, analytics |
| `app.js` | Map, markers, sidebar, filtering, search, deep linking, share, checklist, print |
| `style.css` | All styles including mobile responsive layout |
| `config.js` | Theme config (event name, dates, emoji, URLs, Venmo, analytics token) |
| `data.js` | Restaurant data array and area colors |
| `mock_data.js` | Copy of `data.js` with placeholder names/descriptions for testing |
| `apply-theme.py` | Reads `config.js`, updates OG image, CNAME, HTML fallbacks, README |
| `embed/map/` | Self-contained embeddable map (own JS/CSS, shares `data.js` and `config.js`) |
| `embed/index.html` | Embed showcase page with iframe preview and copyable embed code |

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

## Fork It

Have a burger week (or any food event) in your city? Fork this repo and make it your own.

### 1. Update your restaurant data

Edit `data.js`. Each restaurant entry looks like this:

```js
{
  name: "Restaurant Name",
  address: "123 Main St., Your City, CA",
  website: "https://example.com",       // optional, null if unknown
  phone: "805-555-1234",                 // optional, null if unknown
  area: "Downtown",                      // used for color-coding and filtering
  lat: 34.4200,                          // latitude
  lng: -119.7000,                        // longitude
  mapUrl: "https://maps.app.goo.gl/...", // Google Maps link
  appleMapsUrl: "https://maps.apple/p/...", // Apple Maps link, or null
  menuItem: "The Signature Burger",      // menu item name, or null
  description: "A delicious burger..."   // description, or null
}
```

**Tips for coordinates and map links:**

- Search on [Google Maps](https://maps.google.com), click "Share", copy the link for `mapUrl`
- Search on Apple Maps, tap "Share", copy the link for `appleMapsUrl`
- Right-click a pin on Google Maps and copy coordinates for `lat`/`lng`
- If you don't have a direct link, use: `https://www.google.com/maps/search/?api=1&query=123+Main+St+City+CA`
- If `appleMapsUrl` is `null`, the app falls back to address-based directions

### 2. Update area colors

Edit the `AREA_COLORS` object in `data.js` to match your areas:

```js
const AREA_COLORS = {
  Downtown: "#e63946",
  Midtown: "#2d6a4f",
  Eastside: "#1d3557",
};
```

### 3. Set the map center

In `app.js`, update the starting coordinates and zoom level:

```js
const map = L.map("map", { ... }).setView([34.42, -119.70], 13);
```

### 4. Update the theme config

Edit `config.js` to match your event:

```js
const THEME = {
  eventName: "SB Taco Week 2026",
  eventDates: "Mar 5–11",
  emoji: "🌮",
  itemLabel: "taco",
  itemLabelPlural: "tacos",
  siteUrl: "https://yourdomain.com",
  description: "Interactive map of all participating restaurants...",
  sourceLabel: "Source: Your Publication",
  sourceUrl: "https://example.com/article",
  venmoUser: "yourusername",
  venmoNote: "Buy me a taco?",
  venmoAmount: 5,
  storageKey: "sbtacoweek-checklist",
  printTitle: "SB Taco Week 2026 — My Picks",
  cfAnalyticsToken: null,
};
```

Then run the apply script to update OG image, CNAME, HTML fallbacks, and README:

```bash
python3 apply-theme.py
```

Requires Python 3 (pre-installed on macOS) and ImageMagick (`brew install imagemagick`) for PNG generation.

### 5. Deploy

Enable GitHub Pages (Settings > Pages > Deploy from branch > `main`). Your site will be live at `https://yourusername.github.io/yourrepo/`.

For a custom domain, add a `CNAME` file and configure DNS. If using Cloudflare, set the proxy to **off** (grey cloud) so GitHub Pages SSL works.

### 6. Source monitoring (optional)

The `.github/workflows/check-source.yml` workflow checks a source article daily for changes and opens a GitHub issue with a diff.

1. Update `ARTICLE_URL` in the workflow to your source page
2. Update the CSS class name to match your source page's article container (default: `wkwp-post-content`)
3. Push and trigger manually from the Actions tab to create the initial baseline
4. Runs daily at 7am PT and can be triggered manually anytime

To disable, delete the workflow file.

## Embed

Want to embed the map on your website? Use this iframe snippet:

```html
<iframe
  src="https://sbburgerweekmap.com/embed/map"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  title="SB Burger Week 2026 Interactive Map"
  loading="lazy"
  allowfullscreen
>
</iframe>
```

The embed includes the full interactive map with search, area filters, favorites, and directions. It shares `data.js` with the main site so data updates propagate automatically. Checklist selections sync between the main site and embed via localStorage. Hash links from the embed redirect to the main site. Adjust `height` to fit your layout.

See the embed showcase page at [sbburgerweekmap.com/embed](https://sbburgerweekmap.com/embed).

## Issues & Feedback

Found a bug, missing restaurant, or wrong detail? [Open an issue](../../issues) and let us know.

## Author

Made by [Sam Gutentag](https://www.gutentag.world) in Santa Barbara, CA.

# SB Burger Week 2026 Map

[![Hits](https://hits.sh/sbburgerweekmap.com.svg)](https://hits.sh/sbburgerweekmap.com/)

An interactive map of all participating restaurants for [Santa Barbara Burger Week 2026](https://www.independent.com/2026/02/05/burger-week-2026/) (Feb 19–25).

## Features

- Interactive Leaflet map with color-coded markers by area
- Search and filter restaurants by name or area
- Map zooms to fit when filtering by area
- Burger details and descriptions in marker popups
- Website, phone, Apple Maps, and Google Maps links per restaurant
- Hover over a restaurant in the list to spot it on the map
- Hover over map markers to preview details, hover over clusters to see names
- **Pick Favorites** — toggle checklist mode to check/uncheck restaurants, with All/None bulk actions. Selections persist across sessions via localStorage
- **Print Selected** — generate a printable page with a numbered map and grouped restaurant list for your favorites
- Mobile-friendly with a slide-up drawer that stays open while browsing, auto-opens on page load
- Embeddable map with its own sidebar, search, filters, and Pick Favorites support
- Automated source monitoring via GitHub Actions

## How It Works

This is a static site — plain HTML, CSS, and JavaScript with no build step and no dependencies to install.

- `data.js` — All restaurant data (names, addresses, coordinates, links, burger details)
- `mock_data.js` — Copy of `data.js` with placeholder burger names and descriptions for testing
- `app.js` — Map rendering, markers, sidebar, filtering, search, checklist, print
- `style.css` — All styles including mobile responsive layout
- `index.html` — Page shell, loads everything via `<script>` tags
- `embed/map/` — Self-contained embeddable map (own JS, CSS, shares `data.js`)

The map uses [Leaflet](https://leafletjs.com/) with [MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster) and [CARTO](https://carto.com/) basemap tiles, all loaded from CDNs.

## Run Locally

Start a local server from the project root:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000). A local server is required for the embed page (`/embed`) to load correctly — it won't work via `file://`.

### Using mock data

To test with placeholder burger names and descriptions, swap the data source in `index.html` (lines 154–156):

```html
<!-- <script src="data.js"></script> -->
<!-- Uncomment this and comment out the first line to load some mock data-->
<script src="mock_data.js"></script>
```

Comment out `data.js` and uncomment `mock_data.js`, then refresh the page.

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
  mapUrl: "https://maps.app.goo.gl/...", // Google Maps link to the business
  appleMapsUrl: "https://maps.apple/p/...", // Apple Maps link, or null
  burger: "The Signature Burger",        // menu item name, or null
  description: "A delicious burger..."   // menu item description, or null
}
```

**Tips for getting coordinates and map links:**

- Search for the restaurant on [Google Maps](https://maps.google.com), click "Share", copy the link for `mapUrl`
- Search on Apple Maps, tap "Share", copy the link for `appleMapsUrl`
- For `lat`/`lng`, right-click the pin on Google Maps and copy the coordinates
- If you don't have a direct link, use a search URL as a fallback: `https://www.google.com/maps/search/?api=1&query=123+Main+St+City+CA`
- If `appleMapsUrl` is `null`, the app falls back to address-based directions automatically

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

### 4. Update the header

In `index.html`, change the title, dates, and source link to match your event.

### 5. Deploy

Enable GitHub Pages in your repo settings (Settings > Pages > Deploy from branch > `main`). Your site will be live at `https://yourusername.github.io/yourrepo/`.

### 6. Source monitoring (optional, beta)

The `.github/workflows/check-source.yml` workflow checks a source article daily for changes and opens a GitHub issue with a diff. To use it:

1. Update the `ARTICLE_URL` in the workflow to your source page
2. The workflow extracts content from a `wkwp-post-content` CSS class — update the class name to match your source page's article container
3. Push and trigger manually from the Actions tab to create the initial baseline
4. The workflow runs daily at 7am PT and can be triggered manually anytime

To disable it, just delete the workflow file.

## Embed

Want to embed the map on your website? Use this iframe snippet in a WordPress Gutenberg **Custom HTML** block or any HTML page:

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

The embed includes the full interactive map with search, area filters, Pick Favorites with print, and directions links. It shares `data.js` with the main site so data updates propagate automatically. Checklist selections are shared between the main site and embed via localStorage. Adjust the `height` value to fit your layout.

## Issues & Feedback

Found a bug, missing restaurant, or wrong detail? [Open an issue](../../issues) and let us know.

## Author

Made by [Sam Gutentag](https://www.gutentag.world) in Santa Barbara, CA.

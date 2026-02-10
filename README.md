# SB Burger Week 2026 Map

[![Hits](https://hits.sh/samgutentag.github.io/sbburgerweek.svg)](https://hits.sh/samgutentag.github.io/sbburgerweek/)

An interactive map of all participating restaurants for [Santa Barbara Burger Week 2026](https://www.independent.com/2026/02/05/burger-week-2026/) (Feb 19–25).

## Features

- Interactive Leaflet map with color-coded markers by area
- Search and filter restaurants by name or area
- Burger details and descriptions in marker popups
- Directions via Apple Maps or Google Maps
- Mobile-friendly with a slide-up restaurant list
- Automated source monitoring to detect article updates

## How It Works

This is a static site — plain HTML, CSS, and JavaScript with no build step. Restaurant data lives in `data.js` and is rendered on a Leaflet map with CARTO basemap tiles.

A GitHub Action runs daily to check the [source article](https://www.independent.com/2026/02/05/burger-week-2026/) for updates and opens an issue with a diff when changes are detected.

## Fork It

Have a burger week (or any food event) in your city? Fork this repo and make it your own:

1. Fork the repo
2. Update `data.js` with your restaurants
3. Adjust the map center and zoom in `app.js`
4. Update the source article URL in the GitHub Action workflow
5. Enable GitHub Pages and you're live

## Author

Made by [Sam Gutentag](https://www.gutentag.world) in Santa Barbara.

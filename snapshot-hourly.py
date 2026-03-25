#!/usr/bin/env python3
"""Snapshot hourly tracking data from the Cloudflare Worker for a concluded event.

Reads event dates and filter labels from config.js / data files, fetches hourly
data from the Worker, and saves to snapshots/ for permanent archival.

The stats dashboard loads these files automatically when the event is concluded.
"""

import glob
import json
import os
import re
import subprocess
import sys
import urllib.parse


def extract_config(config_path):
    """Extract trackUrl, eventStartDate, eventEndDate from config.js."""
    with open(config_path) as f:
        text = f.read()

    def get(key):
        m = re.search(rf'{key}:\s*"([^"]+)"', text)
        return m.group(1) if m else None

    return get("trackUrl"), get("eventStartDate"), get("eventEndDate"), text


def extract_labels(project_dir, config_text):
    """Build filter labels from AREA_COLORS in data files + tagFilters/hoursFilters in config."""
    labels = []

    # Area names from AREA_COLORS in data files (handles both quoted and unquoted keys)
    for data_file in sorted(glob.glob(os.path.join(project_dir, "data*.js"))):
        with open(data_file) as f:
            content = f.read()
        area_match = re.search(r"AREA_COLORS\s*=\s*\{([^}]+)\}", content)
        if area_match:
            block = area_match.group(1)
            # Match quoted keys: "Downtown SB": or 'Downtown SB':
            for m in re.finditer(r'''["']([^"']+)["']\s*:''', block):
                area = m.group(1)
                if area not in labels:
                    labels.append(area)
            # Match unquoted keys: Goleta:
            for m in re.finditer(r"(?:^|,)\s*(\w+)\s*:", block):
                area = m.group(1)
                if area not in labels:
                    labels.append(area)
            break

    # Tag and hours filter keys from config.js
    for m in re.finditer(r'''key:\s*["']([^"']+)["']''', config_text):
        key = m.group(1)
        if key not in labels:
            labels.append(key)

    return labels


def fetch_json(url):
    """Fetch JSON from a URL using curl."""
    result = subprocess.run(["curl", "-s", url], capture_output=True, text=True)
    return json.loads(result.stdout)


def main():
    project_dir = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    config_path = os.path.join(project_dir, "config.js")
    snapshots_dir = os.path.join(project_dir, "snapshots")

    track_url, start_date, end_date, config_text = extract_config(config_path)

    if not track_url or not start_date or not end_date:
        print("Error: config.js must have trackUrl, eventStartDate, and eventEndDate set.")
        print(f"  trackUrl:       {track_url or '<missing>'}")
        print(f"  eventStartDate: {start_date or '<missing>'}")
        print(f"  eventEndDate:   {end_date or '<missing>'}")
        sys.exit(1)

    os.makedirs(snapshots_dir, exist_ok=True)

    # Fetch hourly event data
    print(f"Fetching hourly event data ({start_date} to {end_date})...")
    hourly_file = os.path.join(snapshots_dir, "hourly-events.json")
    hourly_data = fetch_json(f"{track_url}?hourly=true&start={start_date}&end={end_date}")
    with open(hourly_file, "w") as f:
        json.dump(hourly_data, f, indent=2)
    print(f"  Saved {len(hourly_data)} hours to snapshots/hourly-events.json")

    # Fetch per-label hourly data
    print("Fetching per-label hourly data...")
    labels = extract_labels(project_dir, config_text)
    if not labels:
        print("  Warning: no filter labels found in config.js/data files")
        with open(os.path.join(snapshots_dir, "hourly-labels.json"), "w") as f:
            json.dump({}, f)
        return

    print(f"  Found {len(labels)} labels: {labels}")

    label_data = {}
    for label in labels:
        encoded = urllib.parse.quote(label)
        url = f"{track_url}?hourly=true&label={encoded}&start={start_date}&end={end_date}"
        try:
            data = fetch_json(url)
            if data and len(data) > 0:
                label_data[label] = data
                print(f"  {label}: {len(data)} hours")
            else:
                print(f"  {label}: empty")
        except Exception as e:
            print(f"  {label}: failed ({e})")

    labels_file = os.path.join(snapshots_dir, "hourly-labels.json")
    with open(labels_file, "w") as f:
        json.dump(label_data, f, indent=2)
    print(f"  Saved {len(label_data)} labels to snapshots/hourly-labels.json")

    print()
    print("Done! Snapshot files:")
    print("  snapshots/hourly-events.json  — hourly action counts (all metrics)")
    print("  snapshots/hourly-labels.json  — hourly counts per filter label")
    print()
    print("These are used by the stats dashboard when the event is concluded.")
    print("Commit them to the repo: git add snapshots/hourly-*.json")


if __name__ == "__main__":
    main()

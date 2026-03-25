#!/usr/bin/env bash
# Snapshot hourly tracking data from the Cloudflare Worker for a concluded event.
# Reads event dates from config.js and saves to snapshots/ for permanent archival.
#
# Usage: ./snapshot-hourly.sh
#
# Prerequisites:
#   - config.js must have trackUrl, eventStartDate, and eventEndDate set
#   - The Worker must be deployed with start/end query param support
#   - curl and python3 must be available

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$SCRIPT_DIR/config.js"
SNAPSHOTS="$SCRIPT_DIR/snapshots"

# Extract config values from config.js
extract() {
  python3 -c "
import re, sys
with open('$CONFIG') as f:
    m = re.search(r'$1:\s*\"([^\"]+)\"', f.read())
    print(m.group(1) if m else '')
"
}

TRACK_URL=$(extract 'trackUrl')
START_DATE=$(extract 'eventStartDate')
END_DATE=$(extract 'eventEndDate')

if [ -z "$TRACK_URL" ] || [ -z "$START_DATE" ] || [ -z "$END_DATE" ]; then
  echo "Error: config.js must have trackUrl, eventStartDate, and eventEndDate set."
  echo "  trackUrl:       ${TRACK_URL:-<missing>}"
  echo "  eventStartDate: ${START_DATE:-<missing>}"
  echo "  eventEndDate:   ${END_DATE:-<missing>}"
  exit 1
fi

mkdir -p "$SNAPSHOTS"

echo "Fetching hourly event data ($START_DATE to $END_DATE)..."
HOURLY_FILE="$SNAPSHOTS/hourly-events.json"
curl -s "${TRACK_URL}?hourly=true&start=${START_DATE}&end=${END_DATE}" | python3 -m json.tool > "$HOURLY_FILE"
HOURS=$(python3 -c "import json; print(len(json.load(open('$HOURLY_FILE'))))")
echo "  Saved $HOURS hours to snapshots/hourly-events.json"

echo "Fetching per-label hourly data..."
LABELS_FILE="$SNAPSHOTS/hourly-labels.json"
python3 -c "
import json, subprocess, urllib.parse

labels = ['Downtown SB','Goleta','Carpinteria','Isla Vista','Santa Ynez','Other SB',
          'vegetarian','glutenFree','hasFries','open','lunch','dinner']
base = '${TRACK_URL}'
start = '${START_DATE}'
end = '${END_DATE}'
result = {}
for label in labels:
    url = f'{base}?hourly=true&label={urllib.parse.quote(label)}&start={start}&end={end}'
    out = subprocess.run(['curl', '-s', url], capture_output=True, text=True)
    try:
        data = json.loads(out.stdout)
        if data and len(data) > 0:
            result[label] = data
            print(f'  {label}: {len(data)} hours')
        else:
            print(f'  {label}: empty')
    except Exception as e:
        print(f'  {label}: failed ({e})')

with open('$LABELS_FILE', 'w') as f:
    json.dump(result, f, indent=2)
print(f'  Saved {len(result)} labels to snapshots/hourly-labels.json')
"

echo ""
echo "Done! Snapshot files:"
echo "  snapshots/hourly-events.json  — hourly action counts (all metrics)"
echo "  snapshots/hourly-labels.json  — hourly counts per filter label"
echo ""
echo "These are used by the stats dashboard when the event is concluded."
echo "Commit them to the repo: git add snapshots/hourly-*.json"

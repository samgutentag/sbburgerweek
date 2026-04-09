# SB Burger Week 2026 — Wind-Down Audit

Event dates: Feb 19–25, 2026
Wind-down date: Apr 9, 2026

## Checklist

- [x] Snapshot hourly data (`./snapshot-hourly.sh`) — 163 hours, 12 labels
- [x] Hourly snapshots committed (`snapshots/hourly-events.json`, `snapshots/hourly-labels.json`)
- [x] Set `trackUrl: null` in `config.js` (`cfAnalyticsToken` was already null)
- [x] Run `python3 apply-theme.py`
- [x] Comment out cron schedule in `snapshot-tracking.yml` (`fetch-hours.yml` was already disabled)
- [x] Disable Worker writes (early return on POST, `writeDataPoint` commented out)
- [ ] Deploy Worker (`cd workers/track && wrangler deploy`)

## API Call Audit — Confirmed No Active Calls

All client-side fetch calls and the tracking beacon are gated on `THEME.trackUrl`.
With `trackUrl: null`, every call path short-circuits before making any network request.
The CF Web Analytics beacon was already removed (`cfAnalyticsToken` was already null).
Worker POST handler returns immediate "ok" without writing to Analytics Engine.

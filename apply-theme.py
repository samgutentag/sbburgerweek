#!/usr/bin/env python3
"""Read config.js and update all files that can't read it at runtime.

Usage:
    python3 apply-theme.py

Updates: og-image.svg, og-image.png, CNAME, index.html,
         embed/index.html, embed/map/index.html, README.md
"""

import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------------------
# Config parsing
# ---------------------------------------------------------------------------

def parse_config(path):
    """Extract THEME fields from config.js using regex."""
    with open(path, encoding="utf-8") as f:
        text = f.read()

    def get(key):
        m = re.search(rf'{key}:\s*"([^"]*)"', text)
        return m.group(1) if m else None

    def get_int(key):
        m = re.search(rf"{key}:\s*(\d+)", text)
        return int(m.group(1)) if m else None

    return {
        "eventName": get("eventName"),
        "eventDates": get("eventDates"),
        "emoji": get("emoji"),
        "ogLine1": get("ogLine1"),
        "ogLine2": get("ogLine2"),
        "itemLabel": get("itemLabel"),
        "itemLabelPlural": get("itemLabelPlural"),
        "siteUrl": get("siteUrl"),
        "description": get("description"),
        "sourceLabel": get("sourceLabel"),
        "sourceUrl": get("sourceUrl"),
        "venmoUser": get("venmoUser"),
        "venmoNote": get("venmoNote"),
        "venmoAmount": get_int("venmoAmount"),
        "storageKey": get("storageKey"),
        "printTitle": get("printTitle"),
        "cfAnalyticsToken": get("cfAnalyticsToken"),
    }


def domain_from_url(url):
    """Extract domain from a URL like https://example.com/path."""
    return re.sub(r"^https?://", "", url).rstrip("/").split("/")[0]


# ---------------------------------------------------------------------------
# OG image SVG
# ---------------------------------------------------------------------------

def update_og_svg(cfg):
    path = os.path.join(SCRIPT_DIR, "og-image.svg")
    with open(path, encoding="utf-8") as f:
        svg = f.read()

    domain = domain_from_url(cfg["siteUrl"])

    # Expand short dates like "Feb 19–25" to "February 19–25"
    month_map = {
        "Jan": "January", "Feb": "February", "Mar": "March",
        "Apr": "April", "May": "May", "Jun": "June",
        "Jul": "July", "Aug": "August", "Sep": "September",
        "Oct": "October", "Nov": "November", "Dec": "December",
    }
    dates_long = cfg["eventDates"]
    for short, full in month_map.items():
        if dates_long.startswith(short) and not dates_long.startswith(full):
            dates_long = full + dates_long[len(short):]
            break

    # Subtitle: "Interactive Map of Restaurants joining Burger Week"
    label = cfg["itemLabel"]
    label_cap = label[0].upper() + label[1:]
    subtitle = f"Interactive Map of Restaurants joining {label_cap} Week"

    # OG line 1 / line 2 (fallback: eventName on a single line)
    line1 = cfg["ogLine1"] or cfg["eventName"]
    line2 = cfg["ogLine2"] or ""

    replacements = {
        "130": cfg["emoji"],
        "260": line1,
        "335": line2,
        "395": dates_long,
        "455": subtitle,
        "540": domain,
    }

    for y_val, new_text in replacements.items():
        def make_replacer(txt):
            def replacer(m):
                return m.group(1) + txt + m.group(3)
            return replacer
        svg = re.sub(
            rf'(<text\b[^>]*\by="{y_val}"[^>]*>)(.*?)(</text>)',
            make_replacer(new_text),
            svg,
        )

    with open(path, "w", encoding="utf-8") as f:
        f.write(svg)


# ---------------------------------------------------------------------------
# OG image PNG (ImageMagick + Twemoji)
# ---------------------------------------------------------------------------

def update_og_png(cfg):
    svg_path = os.path.join(SCRIPT_DIR, "og-image.svg")
    png_path = os.path.join(SCRIPT_DIR, "og-image.png")

    # Check for magick
    try:
        subprocess.run(["magick", "--version"], capture_output=True, check=True)
    except FileNotFoundError:
        print("  WARNING: 'magick' not found — skipping PNG generation")
        print("  Install ImageMagick: brew install imagemagick")
        return

    # Step 1: Render SVG to PNG (emoji will be blank)
    subprocess.run(
        ["magick", "-background", "none", "-density", "150",
         svg_path, "-resize", "1200x630!", png_path],
        check=True, capture_output=True,
    )

    # Step 2: Download Twemoji PNG for the emoji
    emoji = cfg["emoji"]
    codepoints = "-".join(f"{ord(c):x}" for c in emoji if ord(c) not in (0xfe0e, 0xfe0f))
    twemoji_url = f"https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/{codepoints}.png"
    twemoji_path = os.path.join(SCRIPT_DIR, ".twemoji-tmp.png")

    try:
        urllib.request.urlretrieve(twemoji_url, twemoji_path)
    except urllib.error.URLError as e:
        print(f"  WARNING: Could not download Twemoji ({e}) — PNG will have no emoji")
        return

    # Step 3: Composite Twemoji onto the PNG at the emoji position
    # The emoji is at y=130 (center), x=600 (center), font-size=100
    # In the 1200x630 image, that's roughly centered at (600, 110), size ~90px
    subprocess.run(
        ["magick", "composite", "-geometry", "90x90+555+65",
         twemoji_path, png_path, png_path],
        check=True, capture_output=True,
    )

    # Clean up
    os.remove(twemoji_path)


# ---------------------------------------------------------------------------
# CNAME
# ---------------------------------------------------------------------------

def update_cname(cfg):
    path = os.path.join(SCRIPT_DIR, "CNAME")
    domain = domain_from_url(cfg["siteUrl"])
    with open(path, "w", encoding="utf-8") as f:
        f.write(domain + "\n")


# ---------------------------------------------------------------------------
# HTML fallback updates
# ---------------------------------------------------------------------------

def update_index_html(cfg):
    path = os.path.join(SCRIPT_DIR, "index.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()

    emoji = cfg["emoji"]
    event = cfg["eventName"]
    dates = cfg["eventDates"]
    venmo_user = cfg["venmoUser"]
    venmo_note = cfg["venmoNote"]
    venmo_amount = cfg["venmoAmount"] or 5

    # Title fallback
    html = re.sub(
        r"<title>[^<]*</title>",
        f"<title>{event} Map</title>",
        html,
    )

    # Favicon emoji — only the <link rel="icon"> href
    html = re.sub(
        r"""(href="data:image/svg\+xml,[^"]*font-size='90'>)[^<]*(</text>)""",
        rf"\g<1>{emoji}\g<2>",
        html,
    )

    # Header H1 fallback
    html = re.sub(
        r'(<h1 id="headerTitle">)[^<]*(<span>)\| [^<]*(</span></h1>)',
        rf"\g<1>{event} \g<2>| {dates}\g<3>",
        html,
    )

    # About modal: Venmo link href and text
    encoded_note = urllib.parse.quote(f"{emoji} {venmo_note}", safe="!?")
    venmo_href = f"venmo://paycharge?txn=pay&amp;recipients={venmo_user}&amp;note={encoded_note}&amp;amount={venmo_amount}"
    html = re.sub(
        r'(<a\s+id="aboutVenmo"\s+href=")[^"]*(")',
        rf"\g<1>{venmo_href}\g<2>",
        html,
    )
    html = re.sub(
        r'(id="aboutVenmo"[^>]*>)[^<]*(</a)',
        rf"\g<1>{emoji} {venmo_note}\g<2>",
        html,
    )

    # About modal: source link href and text
    html = re.sub(
        r'(<a\s+id="aboutSource"\s+href=")[^"]*(")',
        rf'\g<1>{cfg["sourceUrl"]}\g<2>',
        html,
    )
    source_text = cfg["sourceLabel"].replace("Source: ", "", 1) if cfg["sourceLabel"].startswith("Source: ") else cfg["sourceLabel"]
    html = re.sub(
        r'(id="aboutSource"[^>]*>)[^<]*(</a)',
        r"\g<1>" + "\U0001F4F0 " + source_text + r"\g<2>",
        html,
    )

    # About modal: title and dates
    html = re.sub(
        r'(<h2\s+id="aboutTitle">)[^<]*(</h2>)',
        rf"\g<1>{event}\g<2>",
        html,
    )
    html = re.sub(
        r'(<p\s+id="aboutDates"[^>]*>)[^<]*(</p>)',
        rf"\g<1>{dates}\g<2>",
        html,
    )

    # Cloudflare Web Analytics — inject or remove based on token
    cf_token = cfg["cfAnalyticsToken"]
    if cf_token:
        cf_snippet = (
            "<!-- Cloudflare Web Analytics -->\n"
            "    <script\n"
            "      defer\n"
            '      src="https://static.cloudflareinsights.com/beacon.min.js"\n'
            f"""      data-cf-beacon='{{"token": "{cf_token}"}}'\n"""
            "    ></script>\n"
            "    <!-- End Cloudflare Web Analytics -->"
        )
    else:
        cf_snippet = (
            "<!-- Cloudflare Web Analytics -->\n"
            "    <!-- End Cloudflare Web Analytics -->"
        )
    html = re.sub(
        r"<!-- Cloudflare Web Analytics -->.*?<!-- End Cloudflare Web Analytics -->",
        cf_snippet,
        html,
        flags=re.DOTALL,
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def update_embed_index(cfg):
    path = os.path.join(SCRIPT_DIR, "embed", "index.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()

    emoji = cfg["emoji"]
    event = cfg["eventName"]

    # Title fallback
    html = re.sub(
        r"<title>[^<]*</title>",
        f"<title>Embed — {event} Map</title>",
        html,
    )

    # Favicon emoji — only the <link rel="icon"> href, not JS code
    html = re.sub(
        r"""(href="data:image/svg\+xml,[^"]*font-size='90'>)[^<]*(</text>)""",
        rf"\g<1>{emoji}\g<2>",
        html,
    )

    # Showcase title fallback
    html = re.sub(
        r'(id="embedShowcaseTitle">)[^<]*(</h1>)',
        rf"\g<1>Embed the {event} Map\g<2>",
        html,
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def update_embed_map_index(cfg):
    path = os.path.join(SCRIPT_DIR, "embed", "map", "index.html")
    with open(path, encoding="utf-8") as f:
        html = f.read()

    emoji = cfg["emoji"]
    event = cfg["eventName"]
    dates = cfg["eventDates"]
    site_url = cfg["siteUrl"].rstrip("/")

    # Title fallback
    html = re.sub(
        r"<title>[^<]*</title>",
        f"<title>{event} Map</title>",
        html,
    )

    # Favicon emoji — only the <link rel="icon"> href
    html = re.sub(
        r"""(href="data:image/svg\+xml,[^"]*font-size='90'>)[^<]*(</text>)""",
        rf"\g<1>{emoji}\g<2>",
        html,
    )

    # Embed bar title fallback
    html = re.sub(
        r'(id="embedTitle"\s*>)[^<]*(<span class="embed-dates">)\| [^<]*(</span></span)',
        rf"\g<1>{event} \g<2>| {dates}\g<3>",
        html,
    )

    # Full map link fallback
    html = re.sub(
        r'(id="embedFullMapLink" href=")[^"]*(")',
        rf"\g<1>{site_url}/\g<2>",
        html,
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


# ---------------------------------------------------------------------------
# README
# ---------------------------------------------------------------------------

def update_readme(cfg):
    path = os.path.join(SCRIPT_DIR, "README.md")
    with open(path, encoding="utf-8") as f:
        md = f.read()

    domain = domain_from_url(cfg["siteUrl"])
    event = cfg["eventName"]
    site_url = cfg["siteUrl"].rstrip("/")

    # Hits badge: hits.sh/OLD_DOMAIN.svg and hits.sh/OLD_DOMAIN/
    md = re.sub(
        r"(hits\.sh/)[a-zA-Z0-9.-]+?(?=\.svg|/|\)|\])",
        rf"\g<1>{domain}",
        md,
    )

    # Embed snippet src
    md = re.sub(
        r'(src="https?://)[^"/]+(/embed/map")',
        rf"\g<1>{domain}\g<2>",
        md,
    )

    # Embed snippet title
    md = re.sub(
        r'(title=")[^"]*(Interactive Map")',
        rf"\g<1>{event} \g<2>",
        md,
    )

    # README title (first H1)
    md = re.sub(
        r"^# .+$",
        f"# {event} Map",
        md,
        count=1,
        flags=re.MULTILINE,
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(md)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    config_path = os.path.join(SCRIPT_DIR, "config.js")

    print("Reading config.js...")
    cfg = parse_config(config_path)

    event = cfg["eventName"]
    emoji = cfg["emoji"]
    site = cfg["siteUrl"]

    if not event or not emoji or not site:
        print("ERROR: config.js is missing required fields (eventName, emoji, siteUrl)")
        sys.exit(1)

    print(f"  Event: {event}")
    print(f"  Emoji: {emoji}")
    print(f"  Site:  {site}")
    print()

    print("Updating og-image.svg...", end=" ", flush=True)
    update_og_svg(cfg)
    print("done")

    print("Generating og-image.png...", end=" ", flush=True)
    update_og_png(cfg)
    print("done")

    print("Updating CNAME...", end=" ", flush=True)
    update_cname(cfg)
    print("done")

    print("Updating index.html...", end=" ", flush=True)
    update_index_html(cfg)
    print("done")

    print("Updating embed/index.html...", end=" ", flush=True)
    update_embed_index(cfg)
    print("done")

    print("Updating embed/map/index.html...", end=" ", flush=True)
    update_embed_map_index(cfg)
    print("done")

    print("Updating README.md...", end=" ", flush=True)
    update_readme(cfg)
    print("done")


if __name__ == "__main__":
    main()

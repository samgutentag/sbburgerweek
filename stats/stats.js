// Stats Dashboard — fetch tracking data and render leaderboard

(function () {
  "use strict";

  // Track stats page view
  if (typeof window.track === "function") window.track("stats-view", "stats");

  // Apply theme
  var pageTitle = document.getElementById("pageTitle");
  if (pageTitle) pageTitle.textContent = THEME.eventName;
  var backLink = document.getElementById("backLink");
  if (backLink) backLink.href = THEME.siteUrl + "/";

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // Build area color lookup from data.js
  var areaByName = {};
  if (typeof restaurants !== "undefined") {
    restaurants.forEach(function (r) {
      areaByName[r.name] = r.area;
    });
  }

  // Labels for filter stats display
  var filterLabels = {
    "Downtown SB": "Downtown SB",
    "Goleta": "Goleta",
    "Carpinteria": "Carpinteria",
    "Isla Vista": "Isla Vista",
    "Santa Ynez": "Santa Ynez",
    "Other SB": "Other SB",
    "vegetarian": "Vegetarian",
    "glutenFree": "Gluten Free",
    "hasFries": "Fries",
    "open": "Open Now",
    "lunch": "Lunch",
    "dinner": "Dinner",
  };

  // Column definitions for sortable leaderboard
  var columns = [
    { key: "deeplinks", label: "Direct" },
    { key: "views", label: "Views" },
    { key: "directions", label: "Maps" },
    { key: "website", label: "Website" },
    { key: "phone", label: "Phone" },
    { key: "instagram", label: "Instagram" },
    { key: "shares", label: "Shares" },
    { key: "likes", label: "Likes" },
    { key: "score", label: "Score" },
  ];

  // Sort state: null = default (score desc), otherwise { key, dir }
  // dir: "desc" or "asc"
  var sortState = null;
  var currentRows = [];

  function defaultSort(rows) {
    return rows.slice().sort(function (a, b) {
      return b.score - a.score || a.name.localeCompare(b.name);
    });
  }

  function sortRows(rows) {
    if (!sortState) return defaultSort(rows);
    var key = sortState.key;
    var dir = sortState.dir;
    return rows.slice().sort(function (a, b) {
      if (key === "name") {
        var cmp = a.name.localeCompare(b.name);
        return dir === "asc" ? cmp : -cmp;
      }
      var diff = dir === "desc" ? b[key] - a[key] : a[key] - b[key];
      return diff || a.name.localeCompare(b.name);
    });
  }

  function renderTable() {
    var sorted = sortRows(currentRows);
    var tbody = document.getElementById("leaderboardBody");
    tbody.innerHTML = "";

    sorted.forEach(function (row, i) {
      var rank = i + 1;
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="rank-cell">' + rank + "</td>" +
        '<td class="name-cell">' +
        '<a href="' + THEME.siteUrl + '/#' + slugify(row.name) + '" target="_blank" rel="noopener">' + escapeHtml(row.name) + '</a>' +
        "</td>" +
        '<td class="col-num">' + row.deeplinks.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.views.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.directions.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.website.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.phone.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.instagram.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.shares.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.likes.toLocaleString() + "</td>" +
        '<td class="col-num score-cell">' + row.score.toLocaleString() + "</td>";
      tbody.appendChild(tr);
    });

    updateHeaderIndicators();
  }

  function updateHeaderIndicators() {
    var ths = document.querySelectorAll("#leaderboard thead th[data-sort]");
    ths.forEach(function (th) {
      var key = th.getAttribute("data-sort");
      var arrow = th.querySelector(".sort-arrow");
      if (sortState && sortState.key === key) {
        arrow.textContent = sortState.dir === "desc" ? " \u25BC" : " \u25B2";
        th.classList.add("sort-active");
      } else {
        arrow.textContent = "";
        th.classList.remove("sort-active");
      }
    });
  }

  function setupSortHeaders() {
    var headerRow = document.querySelector("#leaderboard thead tr");
    var ths = headerRow.querySelectorAll("th");

    // Add data-sort and name sort to Restaurant column
    ths[1].setAttribute("data-sort", "name");
    var nameArrow = document.createElement("span");
    nameArrow.className = "sort-arrow";
    ths[1].appendChild(nameArrow);
    ths[1].style.cursor = "pointer";

    // Add data-sort to numeric columns
    columns.forEach(function (col, i) {
      var th = ths[i + 2]; // offset by # and Restaurant
      th.setAttribute("data-sort", col.key);
      var arrow = document.createElement("span");
      arrow.className = "sort-arrow";
      th.appendChild(arrow);
      th.style.cursor = "pointer";
    });

    headerRow.addEventListener("click", function (e) {
      var th = e.target.closest("th[data-sort]");
      if (!th) return;
      var key = th.getAttribute("data-sort");

      // 3-way toggle: desc → asc → none
      if (!sortState || sortState.key !== key) {
        sortState = { key: key, dir: "desc" };
      } else if (sortState.dir === "desc") {
        sortState = { key: key, dir: "asc" };
      } else {
        sortState = null;
      }

      renderTable();
    });
  }

  setupSortHeaders();

  // Scoring method toggle
  var scoringToggle = document.getElementById("scoringToggle");
  var scoringDetail = document.getElementById("scoringDetail");
  if (scoringToggle && scoringDetail) {
    scoringToggle.addEventListener("click", function () {
      var arrow = scoringToggle.querySelector(".toggle-arrow");
      scoringDetail.classList.toggle("open");
      arrow.classList.toggle("open");
    });
  }

  function render(data) {
    var totalViews = 0;
    var totalDirApple = 0;
    var totalDirGoogle = 0;
    var totalWebsite = 0;
    var totalPhone = 0;
    var totalInstagram = 0;
    var totalShares = 0;
    var totalDeeplinks = 0;
    var totalLikes = 0;

    // Collect filter usage stats
    var filterCounts = {};

    var rows = [];
    Object.keys(data).forEach(function (name) {
      var d = data[name];

      // Gather filter-area, filter-tag, and filter-hours events
      var filterArea = d["filter-area"] || 0;
      var filterTag = d["filter-tag"] || 0;
      var filterHours = d["filter-hours"] || 0;
      if (filterArea > 0 || filterTag > 0 || filterHours > 0) {
        filterCounts[name] = (filterCounts[name] || 0) + filterArea + filterTag + filterHours;
      }

      // Skip non-restaurant entries for the leaderboard
      var hasRestaurantEvents = d.view || d["directions-apple"] || d["directions-google"] || d.website || d.phone || d.instagram || d.share || d.deeplink || d.upvote;
      if (!hasRestaurantEvents) return;

      var views = d.view || 0;
      var dirApple = d["directions-apple"] || 0;
      var dirGoogle = d["directions-google"] || 0;
      var directions = dirApple + dirGoogle;
      var website = d.website || 0;
      var phone = d.phone || 0;
      var instagram = d.instagram || 0;
      var shares = d.share || 0;
      var deeplinks = d.deeplink || 0;
      var likes = Math.max((d.upvote || 0) - (d["un-upvote"] || 0), 0);
      var score = (directions + phone) * 3 + (deeplinks + shares + likes) * 2 + website + instagram + views;

      totalViews += views;
      totalDirApple += dirApple;
      totalDirGoogle += dirGoogle;
      totalWebsite += website;
      totalPhone += phone;
      totalInstagram += instagram;
      totalShares += shares;
      totalDeeplinks += deeplinks;
      totalLikes += likes;

      rows.push({
        name: name,
        views: views,
        directions: directions,
        website: website,
        phone: phone,
        instagram: instagram,
        shares: shares,
        deeplinks: deeplinks,
        likes: likes,
        score: score,
      });
    });

    currentRows = rows;

    // Summary cards
    document.getElementById("totalViews").textContent =
      totalViews.toLocaleString();
    document.getElementById("totalDirApple").textContent =
      totalDirApple.toLocaleString();
    document.getElementById("totalDirGoogle").textContent =
      totalDirGoogle.toLocaleString();
    document.getElementById("totalWebsite").textContent =
      totalWebsite.toLocaleString();
    document.getElementById("totalPhone").textContent =
      totalPhone.toLocaleString();
    document.getElementById("totalInstagram").textContent =
      totalInstagram.toLocaleString();
    document.getElementById("totalShares").textContent =
      totalShares.toLocaleString();
    document.getElementById("totalDeeplinks").textContent =
      totalDeeplinks.toLocaleString();
    document.getElementById("totalLikes").textContent =
      totalLikes.toLocaleString();

    // Render leaderboard
    renderTable();

    // Filter usage section — always show, with zeros for missing filters
    var filterSection = document.getElementById("filterSection");
    var filterGrid = document.getElementById("filterStatsGrid");
    filterSection.style.display = "";
    filterGrid.innerHTML = "";
    var allFilterKeys = Object.keys(filterLabels);
    allFilterKeys.forEach(function (key) {
      var count = filterCounts[key] || 0;
      var card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        '<div class="card-value">' + count.toLocaleString() + "</div>" +
        '<div class="card-label">' + escapeHtml(filterLabels[key]) + "</div>";
      filterGrid.appendChild(card);
    });

    // Stats page view count
    var statsData = data["stats"];
    if (statsData) {
      var statsViews = statsData["stats-view"] || 0;
      document.getElementById("statsPageViews").textContent = statsViews.toLocaleString();
    }

    var note = document.getElementById("footerNote");
    if (rows.length > 0) {
      note.textContent =
        "Updated every 5 minutes. Data collected since event start (Feb 19).";
    } else {
      note.textContent =
        "No tracking data yet. Stats will appear once the event starts.";
    }
  }

  // ── Platform & Device (RUM) ──────────────
  function renderBars(container, rawData) {
    var entries = Object.keys(rawData).map(function (k) {
      return { label: k, count: rawData[k] };
    }).sort(function (a, b) { return b.count - a.count; }).slice(0, 6);

    if (entries.length === 0) return;
    var max = entries[0].count;

    entries.forEach(function (e) {
      var row = document.createElement("div");
      row.className = "bar-row";
      var pct = max > 0 ? (e.count / max * 100) : 0;
      row.innerHTML =
        '<span class="bar-label">' + escapeHtml(e.label) + '</span>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div>' +
        '<span class="bar-value">' + e.count.toLocaleString() + '</span>';
      container.appendChild(row);
    });
  }

  function renderPlatform(data) {
    var grid = document.getElementById("platformGrid");
    if (!grid) return;

    var hasData = (Object.keys(data.devices).length + Object.keys(data.browsers).length + Object.keys(data.os).length) > 0;
    if (!hasData) return;

    document.getElementById("platformSection").style.display = "";
    grid.innerHTML = "";

    // Device Type column
    var devCol = document.createElement("div");
    devCol.className = "platform-col";
    devCol.innerHTML = '<h3>Device Type</h3>';
    var devCards = document.createElement("div");
    devCards.className = "device-cards";
    var total = 0;
    Object.keys(data.devices).forEach(function (k) { total += data.devices[k]; });

    var deviceMeta = {
      desktop: { emoji: "\uD83D\uDDA5\uFE0F", label: "Desktop" },
      mobile: { emoji: "\uD83D\uDCF1", label: "Mobile" },
      tablet: { emoji: "\uD83D\uDCCB", label: "Tablet" },
    };

    ["desktop", "mobile", "tablet"].forEach(function (type) {
      var count = data.devices[type] || 0;
      if (count === 0 && !data.devices[type]) return;
      var meta = deviceMeta[type] || { emoji: "\u2753", label: type };
      var pct = total > 0 ? (count / total * 100).toFixed(1) : "0";
      var card = document.createElement("div");
      card.className = "device-card";
      card.innerHTML =
        '<span class="device-emoji">' + meta.emoji + '</span>' +
        '<div class="device-pct">' + pct + '%</div>' +
        '<div class="device-label">' + meta.label + '</div>' +
        '<div class="device-count">' + count.toLocaleString() + '</div>';
      devCards.appendChild(card);
    });
    devCol.appendChild(devCards);
    grid.appendChild(devCol);

    // Browsers column
    var brCol = document.createElement("div");
    brCol.className = "platform-col";
    brCol.innerHTML = '<h3>Top Browsers</h3>';
    renderBars(brCol, data.browsers);
    grid.appendChild(brCol);

    // OS column
    var osCol = document.createElement("div");
    osCol.className = "platform-col";
    osCol.innerHTML = '<h3>Operating System</h3>';
    renderBars(osCol, data.os);
    grid.appendChild(osCol);
  }

  // Fetch RUM data (independent of detail fetch)
  if (THEME.trackUrl) {
    fetch(THEME.trackUrl + "?rum=true", { method: "GET" })
      .then(function (resp) { return resp.json(); })
      .then(function (data) {
        if (data && typeof data === "object") renderPlatform(data);
      })
      .catch(function () { /* section stays hidden */ });
  }

  // ── Live activity section ──────────────
  function updateLiveActivity() {
    if (!THEME.trackUrl) return;
    fetch(THEME.trackUrl + "?active=true", { method: "GET" })
      .then(function (resp) { return resp.json(); })
      .then(function (data) {
        var section = document.getElementById("liveSection");
        if (!section || !data) return;

        var v = data.visitors1h || 0;
        var a = data.recentActions || 0;

        document.getElementById("liveVisitors").textContent = v.toLocaleString();
        document.getElementById("liveActions").textContent = a.toLocaleString();
        section.style.display = "";
      })
      .catch(function () { /* section stays hidden */ });
  }

  updateLiveActivity();
  setInterval(updateLiveActivity, 30000);

  // Try live fetch with ?detail=true
  if (THEME.trackUrl) {
    fetch(THEME.trackUrl + "?detail=true", { method: "GET" })
      .then(function (resp) {
        return resp.json();
      })
      .then(function (data) {
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          render(data);
        } else {
          document.getElementById("footerNote").textContent =
            "No tracking data yet. Stats will appear once the event starts.";
        }
      })
      .catch(function () {
        document.getElementById("footerNote").textContent =
          "No tracking data yet. Stats will appear once the event starts.";
      });
  } else {
    document.getElementById("footerNote").textContent =
      "No tracking data yet. Stats will appear once the event starts.";
  }
})();

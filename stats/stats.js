// Stats Dashboard — fetch tracking data and render leaderboard

(function () {
  "use strict";

  // Track stats page view
  if (typeof window.track === "function") window.track("stats-view", "stats");

  // Apply theme
  var pageTitle = document.getElementById("pageTitle");
  if (pageTitle) {
    pageTitle.textContent = THEME.eventName;
    pageTitle.href = THEME.siteUrl + "/";
  }
  var backLink = document.getElementById("backLink");
  if (backLink) backLink.href = THEME.siteUrl + "/";

  var escapeHtml = StatsUtils.escapeHtml;
  var slugify = StatsUtils.slugify;

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
    { key: "contact", label: "Contact" },
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
        '<td class="col-num">' + row.contact.toLocaleString() + "</td>" +
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
        contact: website + phone + instagram,
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
      card.className = "card card-clickable";
      card.setAttribute("data-filter-label", key);
      card.setAttribute("data-metric-label", filterLabels[key]);
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

  // ── Hourly chart modal ──────────────────
  var hourlyCache = null;
  var hourlyLabelCache = {};
  var chartInstance = null;

  function fetchHourly() {
    if (hourlyCache) return Promise.resolve(hourlyCache);
    if (!THEME.trackUrl) return Promise.resolve(null);
    return fetch(THEME.trackUrl + "?hourly=true", { method: "GET" })
      .then(function (resp) { return resp.json(); })
      .then(function (data) { hourlyCache = data; return data; })
      .catch(function () { return null; });
  }

  function fetchHourlyLabel(label) {
    if (hourlyLabelCache[label]) return Promise.resolve(hourlyLabelCache[label]);
    if (!THEME.trackUrl) return Promise.resolve(null);
    return fetch(THEME.trackUrl + "?hourly=true&label=" + encodeURIComponent(label), { method: "GET" })
      .then(function (resp) { return resp.json(); })
      .then(function (data) { hourlyLabelCache[label] = data; return data; })
      .catch(function () { return null; });
  }

  function formatHourLabel(h) {
    var d = new Date(h);
    var mon = d.getMonth() + 1;
    var day = d.getDate();
    var hr = d.getHours();
    var ampm = hr >= 12 ? "p" : "a";
    var h12 = hr % 12 || 12;
    return mon + "/" + day + " " + h12 + ampm;
  }

  function formatHourTooltip(h) {
    var d = new Date(h);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + " " +
      d.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
  }

  // opts: { cumulative: bool }
  function renderChart(hours, values, label, opts) {
    var cumulative = opts && opts.cumulative;
    var chartValues = values;
    if (cumulative) {
      chartValues = [];
      var sum = 0;
      values.forEach(function (v) { sum += v; chartValues.push(sum); });
    }

    var labels = hours.map(formatHourLabel);

    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    var ctx = document.getElementById("chartModalCanvas").getContext("2d");

    var dataset = {
      label: label,
      data: chartValues,
      borderColor: "#e76f51",
      backgroundColor: "rgba(230, 111, 81, 0.1)",
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHitRadius: 8,
    };

    chartInstance = new Chart(ctx, {
      type: "line",
      data: { labels: labels, datasets: [dataset] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) {
                return formatHourTooltip(hours[items[0].dataIndex]);
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { maxRotation: 45, font: { size: 10 }, autoSkip: true, maxTicksLimit: 24 },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 11 } },
          },
        },
      },
    });
  }

  // Open chart for a metric (action-based, from ?hourly=true)
  function openChartModal(metricKey, label, opts) {
    fetchHourly().then(function (data) {
      if (!data) return;

      var overlay = document.getElementById("chartModalOverlay");
      document.getElementById("chartModalTitle").textContent = label + " per Hour";
      overlay.classList.add("open");

      var keys = metricKey.split(",");
      var hourMap = {};
      Object.keys(data).forEach(function (hour) {
        var total = 0;
        keys.forEach(function (k) { total += data[hour][k] || 0; });
        hourMap[hour] = total;
      });

      var hours = Object.keys(hourMap).sort();
      var values = hours.map(function (h) { return hourMap[h]; });
      renderChart(hours, values, label, opts);
    });
  }

  // Open chart for a filter label (label-based, from ?hourly=true&label=X)
  function openFilterChartModal(filterKey, label) {
    fetchHourlyLabel(filterKey).then(function (data) {
      if (!data) return;

      var overlay = document.getElementById("chartModalOverlay");
      document.getElementById("chartModalTitle").textContent = label + " (Cumulative)";
      overlay.classList.add("open");

      var hours = Object.keys(data).sort();
      var values = hours.map(function (h) { return data[h] || 0; });
      renderChart(hours, values, label, { cumulative: true });
    });
  }

  function closeChartModal() {
    var overlay = document.getElementById("chartModalOverlay");
    overlay.classList.remove("open");
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  }

  // Close handlers
  document.getElementById("chartModalOverlay").addEventListener("click", function (e) {
    if (e.target === this) closeChartModal();
  });
  document.getElementById("chartModalClose").addEventListener("click", closeChartModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeChartModal();
  });

  // Summary card click → bar chart
  document.getElementById("summaryCards").addEventListener("click", function (e) {
    var card = e.target.closest(".card-clickable[data-metric]");
    if (!card) return;
    var metric = card.getAttribute("data-metric");
    var label = card.getAttribute("data-metric-label");
    openChartModal(metric, label);
  });

  // Filter card click → cumulative line chart
  document.getElementById("filterStatsGrid").addEventListener("click", function (e) {
    var card = e.target.closest(".card-clickable[data-filter-label]");
    if (!card) return;
    var filterKey = card.getAttribute("data-filter-label");
    var label = card.getAttribute("data-metric-label");
    openFilterChartModal(filterKey, label);
  });

  // Live card click → line chart
  document.getElementById("liveCards").addEventListener("click", function (e) {
    var card = e.target.closest(".card-clickable[data-live-metric]");
    if (!card) return;
    var metric = card.getAttribute("data-live-metric");
    var label = card.getAttribute("data-metric-label");

    if (metric === "all-actions") {
      // Sum all actions per hour
      fetchHourly().then(function (data) {
        if (!data) return;
        var overlay = document.getElementById("chartModalOverlay");
        document.getElementById("chartModalTitle").textContent = label + " per Hour";
        overlay.classList.add("open");

        var hourMap = {};
        Object.keys(data).forEach(function (hour) {
          var total = 0;
          Object.keys(data[hour]).forEach(function (k) { total += data[hour][k] || 0; });
          hourMap[hour] = total;
        });

        var hours = Object.keys(hourMap).sort();
        var values = hours.map(function (h) { return hourMap[h]; });
        renderChart(hours, values, label);
      });
    } else {
      // Label-based (e.g. stats-view)
      openFilterChartModal(metric, label);
    }
  });

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

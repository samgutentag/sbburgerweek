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

  function getTrendingFires(rank) {
    if (rank <= 5) return 5;
    if (rank <= 15) return 3;
    if (rank <= 25) return 2;
    if (rank <= 35) return 1;
    return 0;
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
  };

  // Column definitions for sortable leaderboard
  var columns = [
    { key: "deeplinks", label: "Direct" },
    { key: "views", label: "Views" },
    { key: "dirApple", label: "Apple" },
    { key: "dirGoogle", label: "Google" },
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
        '<td class="col-num">' + row.dirApple.toLocaleString() + "</td>" +
        '<td class="col-num">' + row.dirGoogle.toLocaleString() + "</td>" +
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

      // Gather filter-area and filter-tag events
      var filterArea = d["filter-area"] || 0;
      var filterTag = d["filter-tag"] || 0;
      if (filterArea > 0 || filterTag > 0) {
        filterCounts[name] = (filterCounts[name] || 0) + filterArea + filterTag;
      }

      // Skip non-restaurant entries (filter labels) for the leaderboard
      if (d["filter-area"] || d["filter-tag"]) {
        // Check if this entry ONLY has filter events (not a restaurant)
        var hasRestaurantEvents = d.view || d["directions-apple"] || d["directions-google"] || d.website || d.phone || d.instagram || d.share || d.deeplink || d.upvote;
        if (!hasRestaurantEvents) return;
      }

      var views = d.view || 0;
      var dirApple = d["directions-apple"] || 0;
      var dirGoogle = d["directions-google"] || 0;
      var website = d.website || 0;
      var phone = d.phone || 0;
      var instagram = d.instagram || 0;
      var shares = d.share || 0;
      var deeplinks = d.deeplink || 0;
      var likes = Math.max((d.upvote || 0) - (d["un-upvote"] || 0), 0);
      var score = (dirApple + dirGoogle + phone) * 3 + (deeplinks + shares + likes) * 2 + website + instagram + views;

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
        dirApple: dirApple,
        dirGoogle: dirGoogle,
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

    var note = document.getElementById("footerNote");
    if (rows.length > 0) {
      note.textContent =
        "Updated every 5 minutes. Data collected since event start (Feb 19).";
    } else {
      note.textContent =
        "No tracking data yet. Stats will appear once the event starts.";
    }
  }

  // Render from static trending data first as fallback
  function renderFromTrending() {
    var trending = window.TRENDING || {};
    var fakeDetail = {};
    Object.keys(trending).forEach(function (name) {
      var t = trending[name];
      fakeDetail[name] = {
        view: t.views || 0,
        "directions-apple": 0,
        "directions-google": Math.round((t.intents || 0) * 0.6),
        website: Math.round((t.intents || 0) * 0.3),
        phone: 0,
        share: Math.round((t.intents || 0) * 0.1),
      };
    });
    render(fakeDetail);
  }

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
          renderFromTrending();
        }
      })
      .catch(function () {
        renderFromTrending();
      });
  } else {
    renderFromTrending();
  }
})();

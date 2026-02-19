// Stats Dashboard — fetch tracking data and render leaderboard

(function () {
  "use strict";

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

  function render(data) {
    var totalViews = 0;
    var totalDirApple = 0;
    var totalDirGoogle = 0;
    var totalWebsite = 0;
    var totalPhone = 0;
    var totalInstagram = 0;
    var totalShares = 0;

    var rows = [];
    Object.keys(data).forEach(function (name) {
      var d = data[name];
      var views = d.view || 0;
      var dirApple = d["directions-apple"] || 0;
      var dirGoogle = d["directions-google"] || 0;
      var website = d.website || 0;
      var phone = d.phone || 0;
      var instagram = d.instagram || 0;
      var shares = d.share || 0;
      var intents = dirApple + dirGoogle + website + phone + instagram + shares;
      var score = views + intents * 3;

      totalViews += views;
      totalDirApple += dirApple;
      totalDirGoogle += dirGoogle;
      totalWebsite += website;
      totalPhone += phone;
      totalInstagram += instagram;
      totalShares += shares;

      rows.push({
        name: name,
        views: views,
        dirApple: dirApple,
        dirGoogle: dirGoogle,
        website: website,
        phone: phone,
        instagram: instagram,
        shares: shares,
        score: score,
      });
    });

    rows.sort(function (a, b) {
      return b.score - a.score || a.name.localeCompare(b.name);
    });

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

    // Leaderboard
    var tbody = document.getElementById("leaderboardBody");
    tbody.innerHTML = "";

    rows.forEach(function (row, i) {
      var rank = i + 1;
      var fires = getTrendingFires(rank);
      var area = areaByName[row.name] || "";
      var color =
        typeof AREA_COLORS !== "undefined"
          ? AREA_COLORS[area] || "#999"
          : "#999";

      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="rank-cell">' +
        rank +
        "</td>" +
        '<td class="name-cell">' +
        '<a href="' + THEME.siteUrl + '/#' + slugify(row.name) + '" target="_blank" rel="noopener">' + escapeHtml(row.name) + '</a>' +
        "</td>" +
        '<td class="col-num">' +
        row.views.toLocaleString() +
        "</td>" +
        '<td class="col-num">' +
        row.dirApple.toLocaleString() +
        "</td>" +
        '<td class="col-num">' +
        row.dirGoogle.toLocaleString() +
        "</td>" +
        '<td class="col-num">' +
        row.website.toLocaleString() +
        "</td>" +
        '<td class="col-num">' +
        row.phone.toLocaleString() +
        "</td>" +
        '<td class="col-num">' +
        row.instagram.toLocaleString() +
        "</td>" +
        '<td class="col-num">' +
        row.shares.toLocaleString() +
        "</td>" +
        '<td class="col-num score-cell">' +
        row.score.toLocaleString() +
        "</td>";
      tbody.appendChild(tr);
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

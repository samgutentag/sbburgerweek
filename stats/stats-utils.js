// Shared utilities for stats dashboard tabs
var StatsUtils = (function () {
  "use strict";

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function isRestaurant(name, d) {
    return !!(d.view || d["sidebar-view"] || d["directions-apple"] || d["directions-google"] || d.website || d.phone);
  }

  function formatDate(ds) {
    var parts = ds.split("-");
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[parseInt(parts[1], 10) - 1] + " " + parseInt(parts[2], 10);
  }

  // Build area lookup from restaurant data
  function buildAreaByName() {
    var map = {};
    if (typeof restaurants !== "undefined") {
      restaurants.forEach(function (r) {
        map[r.name] = r.area;
      });
    }
    return map;
  }

  // Fetch all available daily snapshots
  function fetchAllSnapshots(basePath) {
    basePath = basePath || "../snapshots/";
    var today = new Date();
    var dates = [];
    for (var d = new Date(THEME.eventStartDate); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10));
    }

    var fetches = dates.map(function (ds) {
      return fetch(basePath + "tracking-" + ds + ".json")
        .then(function (r) {
          return r.ok ? r.json().then(function (j) { return { date: ds, data: j }; }) : null;
        })
        .catch(function () { return null; });
    });

    return Promise.all(fetches).then(function (results) {
      return results
        .filter(function (r) { return r && r.data && r.data.detail; })
        .sort(function (a, b) { return a.date.localeCompare(b.date); });
    });
  }

  return {
    slugify: slugify,
    escapeHtml: escapeHtml,
    isRestaurant: isRestaurant,
    formatDate: formatDate,
    buildAreaByName: buildAreaByName,
    fetchAllSnapshots: fetchAllSnapshots,
  };
})();

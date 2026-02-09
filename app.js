// SB Burger Week 2026 — Map Application

(function () {
  "use strict";

  // ── Map setup ──────────────────────────────────

  const map = L.map("map", {
    zoomControl: true,
    attributionControl: true
  }).setView([34.42, -119.70], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  // ── Marker cluster group ───────────────────────

  const clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 35,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // ── Build markers ──────────────────────────────

  const markerMap = new Map(); // restaurant name → marker

  restaurants.forEach(function (r) {
    const color = AREA_COLORS[r.area] || "#999";

    const marker = L.circleMarker([r.lat, r.lng], {
      radius: 9,
      fillColor: color,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    });

    const popupHtml =
      '<div class="popup-content">' +
        "<h3>" + escapeHtml(r.name) + "</h3>" +
        "<p>" + escapeHtml(r.address) + "</p>" +
        '<a href="' + r.mapUrl + '" target="_blank" rel="noopener">Get Directions &rarr;</a>' +
      "</div>";

    marker.bindPopup(popupHtml, { maxWidth: 240 });
    clusterGroup.addLayer(marker);
    markerMap.set(r.name, marker);
  });

  map.addLayer(clusterGroup);

  // Fit bounds to show all markers
  const allCoords = restaurants.map(function (r) { return [r.lat, r.lng]; });
  if (allCoords.length) {
    map.fitBounds(allCoords, { padding: [30, 30] });
  }

  // ── Sidebar: area filter buttons ───────────────

  const areas = ["All"];
  restaurants.forEach(function (r) {
    if (areas.indexOf(r.area) === -1) areas.push(r.area);
  });

  const filtersEl = document.getElementById("areaFilters");
  areas.forEach(function (area) {
    const btn = document.createElement("button");
    btn.className = "area-btn" + (area === "All" ? " active" : "");
    btn.setAttribute("data-area", area);
    btn.textContent = area;
    filtersEl.appendChild(btn);
  });

  var activeArea = "All";

  filtersEl.addEventListener("click", function (e) {
    if (!e.target.classList.contains("area-btn")) return;
    filtersEl.querySelectorAll(".area-btn").forEach(function (b) { b.classList.remove("active"); });
    e.target.classList.add("active");
    activeArea = e.target.getAttribute("data-area");
    renderList();
  });

  // ── Sidebar: restaurant list ───────────────────

  var searchTerm = "";
  var searchBox = document.getElementById("searchBox");

  searchBox.addEventListener("input", function () {
    searchTerm = this.value.toLowerCase().trim();
    renderList();
  });

  function renderList() {
    var listEl = document.getElementById("restaurantList");
    var countEl = document.getElementById("restaurantCount");
    listEl.innerHTML = "";

    // Update cluster layer to reflect filter
    clusterGroup.clearLayers();

    var filtered = restaurants.filter(function (r) {
      var matchesArea = activeArea === "All" || r.area === activeArea;
      var matchesSearch = !searchTerm ||
        r.name.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.address.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.area.toLowerCase().indexOf(searchTerm) !== -1;
      return matchesArea && matchesSearch;
    });

    countEl.textContent = filtered.length + " of " + restaurants.length + " restaurants";

    if (filtered.length === 0) {
      var noRes = document.createElement("li");
      noRes.className = "no-results";
      noRes.textContent = "No restaurants match your search.";
      listEl.appendChild(noRes);
      return;
    }

    filtered.forEach(function (r) {
      // Re-add marker to cluster
      var marker = markerMap.get(r.name);
      if (marker) clusterGroup.addLayer(marker);

      // List item
      var li = document.createElement("li");
      li.className = "restaurant-item";

      var nameSpan = document.createElement("span");
      nameSpan.className = "name";
      nameSpan.textContent = r.name;

      var badge = document.createElement("span");
      badge.className = "area-badge";
      badge.textContent = r.area;
      badge.style.backgroundColor = AREA_COLORS[r.area] || "#999";

      li.appendChild(nameSpan);
      li.appendChild(badge);

      li.addEventListener("click", function () {
        map.flyTo([r.lat, r.lng], 17, { duration: 0.8 });
        // After fly, open popup (with slight delay for cluster to resolve)
        setTimeout(function () {
          if (marker) {
            // Spiderfy the cluster if needed
            var parent = clusterGroup.getVisibleParent(marker);
            if (parent && parent !== marker) {
              parent.spiderfy();
              setTimeout(function () { marker.openPopup(); }, 300);
            } else {
              marker.openPopup();
            }
          }
        }, 900);

        // Close mobile drawer
        if (window.innerWidth <= 768) {
          document.getElementById("sidebar").classList.remove("open");
          document.getElementById("mobileToggle").style.display = "block";
        }
      });

      listEl.appendChild(li);
    });
  }

  renderList();

  // ── Mobile toggle ──────────────────────────────

  var mobileToggle = document.getElementById("mobileToggle");
  var sidebar = document.getElementById("sidebar");

  mobileToggle.addEventListener("click", function () {
    sidebar.classList.add("open");
    this.style.display = "none";
  });

  // Close drawer on drag handle tap
  document.getElementById("dragHandle").addEventListener("click", function () {
    sidebar.classList.remove("open");
    mobileToggle.style.display = "block";
  });

  // Close drawer when clicking map on mobile
  map.on("click", function () {
    if (window.innerWidth <= 768 && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      mobileToggle.style.display = "block";
    }
  });

  // Re-render map tiles on resize / orientation change
  window.addEventListener("resize", function () {
    map.invalidateSize();
  });

  // ── Utility ────────────────────────────────────

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

})();

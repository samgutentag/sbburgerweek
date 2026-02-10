// SB Burger Week 2026 — Embed Map

(function () {
  "use strict";

  // ── Map setup ──────────────────────────────────

  var map = L.map("map", {
    zoomControl: true,
    attributionControl: true
  }).setView([34.42, -119.70], 13);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  // ── Marker cluster group ───────────────────────

  var clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 20,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // ── Build markers ──────────────────────────────

  var markerMap = new Map();

  restaurants.forEach(function (r) {
    var color = AREA_COLORS[r.area] || "#999";

    var marker = L.circleMarker([r.lat, r.lng], {
      radius: 9,
      fillColor: color,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    });

    var appleMapsUrl = r.appleMapsUrl || "https://maps.apple.com/?daddr=" + encodeURIComponent(r.address);

    var popupHtml = '<div class="popup-content">' +
        "<h3>" + escapeHtml(r.name) + "</h3>";
    if (r.burger) popupHtml += '<p class="popup-burger">🍔 ' + escapeHtml(r.burger) + "</p>";
    if (r.description) popupHtml += '<p class="popup-description"><em>' + escapeHtml(r.description) + "</em></p>";
    popupHtml += "<p>" + escapeHtml(r.address) + "</p>";
    if (r.website || r.phone) {
      popupHtml += '<div class="directions-links">';
      if (r.website) popupHtml += '<a href="' + r.website + '" target="_blank" rel="noopener">Website</a>';
      if (r.website && r.phone) popupHtml += '<span class="link-sep">|</span>';
      if (r.phone) popupHtml += '<a href="tel:' + r.phone + '">' + escapeHtml(r.phone) + "</a>";
      popupHtml += "</div>";
    }
    popupHtml +=
        '<div class="directions-links">' +
          '<a href="' + appleMapsUrl + '" target="_blank" rel="noopener">Apple Maps</a>' +
          '<span class="link-sep">|</span>' +
          '<a href="' + r.mapUrl + '" target="_blank" rel="noopener">Google Maps</a>' +
        "</div>" +
      "</div>";

    marker.bindPopup(popupHtml, { maxWidth: 240 });

    marker.on("mouseover", function () {
      showBurgerOverlay([r.lat, r.lng]);
      this.openPopup();
    });

    clusterGroup.addLayer(marker);
    markerMap.set(r.name, marker);
  });

  map.addLayer(clusterGroup);

  // ── Cluster hover tooltip ────────────────────

  clusterGroup.on("clustermouseover", function (e) {
    var childMarkers = e.layer.getAllChildMarkers();
    var names = childMarkers.map(function (m) {
      var name = "";
      markerMap.forEach(function (marker, key) {
        if (marker === m) name = key;
      });
      return name;
    }).sort();
    var html = '<div class="cluster-tooltip">' +
      names.map(function (n) { return "<div>" + n + "</div>"; }).join("") +
      "</div>";
    e.layer.bindTooltip(html, { sticky: true, direction: "right", className: "cluster-tooltip-wrapper" }).openTooltip();
  });

  clusterGroup.on("clustermouseout", function (e) {
    e.layer.unbindTooltip();
  });

  // ── Burger emoji overlay ─────────────────────

  var burgerIcon = L.divIcon({
    html: '<span class="burger-icon">🍔</span>',
    className: "burger-icon-wrapper",
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  var activeOverlay = null;

  function showBurgerOverlay(latlng) {
    removeBurgerOverlay();
    activeOverlay = L.marker(latlng, { icon: burgerIcon, interactive: false, zIndexOffset: 10000 }).addTo(map);
  }

  function removeBurgerOverlay() {
    if (activeOverlay) {
      map.removeLayer(activeOverlay);
      activeOverlay = null;
    }
  }

  map.on("popupopen", function (e) {
    showBurgerOverlay(e.popup.getLatLng());
  });

  map.on("popupclose", function () {
    removeBurgerOverlay();
  });

  // Fit bounds to show all markers
  var allCoords = restaurants.map(function (r) { return [r.lat, r.lng]; });
  if (allCoords.length) {
    map.fitBounds(allCoords, { padding: [30, 30] });
  }

  // ── Sidebar: area filter buttons ───────────────

  var areas = ["All"];
  restaurants.forEach(function (r) {
    if (areas.indexOf(r.area) === -1) areas.push(r.area);
  });

  var filtersEl = document.getElementById("areaFilters");
  areas.forEach(function (area) {
    var btn = document.createElement("button");
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

    clusterGroup.clearLayers();

    var filtered = restaurants.filter(function (r) {
      var matchesArea = activeArea === "All" || r.area === activeArea;
      var matchesSearch = !searchTerm ||
        r.name.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.address.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.area.toLowerCase().indexOf(searchTerm) !== -1;
      return matchesArea && matchesSearch;
    });

    filtered.sort(function (a, b) {
      return a.name.localeCompare(b.name);
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
      var marker = markerMap.get(r.name);
      if (marker) clusterGroup.addLayer(marker);

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

      li.addEventListener("mouseenter", function () {
        showBurgerOverlay([r.lat, r.lng]);
      });

      li.addEventListener("mouseleave", function () {
        if (!marker || !marker.isPopupOpen()) {
          removeBurgerOverlay();
        }
      });

      li.addEventListener("click", function () {
        map.flyTo([r.lat, r.lng], 17, { duration: 0.8 });
        setTimeout(function () {
          if (marker) {
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
        if (window.innerWidth <= 600) {
          document.getElementById("sidebar").classList.remove("open");
          document.getElementById("mobileToggle").style.display = "block";
        }
      });

      listEl.appendChild(li);
    });

    var coords = filtered.map(function (r) { return [r.lat, r.lng]; });
    if (coords.length) {
      map.fitBounds(coords, { padding: [30, 30] });
    }
  }

  renderList();

  // ── Mobile toggle ──────────────────────────────

  var mobileToggle = document.getElementById("mobileToggle");
  var sidebar = document.getElementById("sidebar");

  mobileToggle.addEventListener("click", function () {
    sidebar.classList.add("open");
    this.style.display = "none";
  });

  document.getElementById("dragHandle").addEventListener("click", function () {
    sidebar.classList.remove("open");
    mobileToggle.style.display = "block";
  });

  map.on("click", function () {
    if (window.innerWidth <= 600 && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      mobileToggle.style.display = "block";
    }
  });

  window.addEventListener("resize", function () {
    map.invalidateSize();
  });

  // ── Utility ──────────────────────────────────

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

})();

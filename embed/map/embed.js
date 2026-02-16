// SB Burger Week 2026 — Embed Map

(function () {
  "use strict";

  // ── Redirect mobile users to full map ─────────────
  if (window.innerWidth <= 600) {
    window.location.replace(THEME.siteUrl + "/embed/");
    return;
  }

  // ── Apply theme to page ──────────────────────────
  document.title = THEME.eventName + " Map";
  document.querySelector('link[rel="icon"]').href =
    "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>" + THEME.emoji + "</text></svg>";
  var embedTitle = document.getElementById("embedTitle");
  if (embedTitle) {
    embedTitle.innerHTML = THEME.eventName + ' <span class="embed-dates">| ' + THEME.eventDates + "</span>";
  }
  var embedFullMapLink = document.getElementById("embedFullMapLink");
  if (embedFullMapLink) {
    embedFullMapLink.href = THEME.siteUrl + "/";
  }

  // ── Map setup ──────────────────────────────────

  var map = L.map("map", {
    zoomControl: true,
    attributionControl: true,
  }).setView([34.42, -119.7], 13);

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
      maxZoom: 20,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  ).addTo(map);

  // ── Marker cluster group ───────────────────────

  var clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 20,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  });

  // ── Build markers ──────────────────────────────

  var markerMap = new Map();

  // ── Checklist state ─────────────────────────────
  var checklistMode = false;
  var checkedSet = new Set();
  var STORAGE_KEY = THEME.storageKey;

  function loadChecklist() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        JSON.parse(saved).forEach(function (n) {
          checkedSet.add(n);
        });
      } else {
        restaurants.forEach(function (r) {
          checkedSet.add(r.name);
        });
      }
    } catch (e) {
      restaurants.forEach(function (r) {
        checkedSet.add(r.name);
      });
    }
  }

  function saveChecklist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(checkedSet)));
    } catch (e) {
      // ignore
    }
  }

  loadChecklist();

  restaurants.forEach(function (r) {
    var color = AREA_COLORS[r.area] || "#999";

    var marker = L.circleMarker([r.lat, r.lng], {
      radius: 9,
      fillColor: color,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85,
    });

    var appleMapsUrl =
      r.appleMapsUrl ||
      "https://maps.apple.com/?daddr=" + encodeURIComponent(r.address);

    var popupHtml =
      '<div class="popup-content">' + "<h3>" + escapeHtml(r.name) + "</h3>";
    if (r.menuItem)
      popupHtml +=
        '<p class="popup-burger">' + THEME.emoji + " " + escapeHtml(r.menuItem) + "</p>";
    if (r.description)
      popupHtml +=
        '<p class="popup-description"><em>' +
        escapeHtml(r.description) +
        "</em></p>";
    popupHtml += "<p>" + escapeHtml(r.address) + "</p>";
    if (r.website || r.phone) {
      popupHtml += '<div class="directions-links">';
      if (r.website)
        popupHtml +=
          '<a href="' +
          r.website +
          '" target="_blank" rel="noopener">Website</a>';
      if (r.website && r.phone) popupHtml += '<span class="link-sep">|</span>';
      if (r.phone)
        popupHtml +=
          '<a href="tel:' + r.phone + '">' + escapeHtml(r.phone) + "</a>";
      popupHtml += "</div>";
    }
    popupHtml +=
      '<div class="directions-links">' +
      '<a href="' +
      appleMapsUrl +
      '" target="_blank" rel="noopener">Apple Maps</a>' +
      '<span class="link-sep">|</span>' +
      '<a href="' +
      r.mapUrl +
      '" target="_blank" rel="noopener">Google Maps</a>' +
      "</div>" +
      "</div>";

    var popupMaxWidth = window.innerWidth > 600 ? 360 : 240;
    marker.bindPopup(popupHtml, { maxWidth: popupMaxWidth, offset: [0, -4] });

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
    var names = childMarkers
      .map(function (m) {
        var name = "";
        markerMap.forEach(function (marker, key) {
          if (marker === m) name = key;
        });
        return name;
      })
      .sort();
    var html =
      '<div class="cluster-tooltip">' +
      names
        .map(function (n) {
          return "<div>" + n + "</div>";
        })
        .join("") +
      "</div>";
    e.layer
      .bindTooltip(html, {
        sticky: true,
        direction: "right",
        className: "cluster-tooltip-wrapper",
      })
      .openTooltip();
  });

  clusterGroup.on("clustermouseout", function (e) {
    e.layer.unbindTooltip();
  });

  // ── Burger emoji overlay ─────────────────────

  var burgerIcon = L.divIcon({
    html: '<span class="burger-icon">' + THEME.emoji + '</span>',
    className: "burger-icon-wrapper",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  map.createPane("burgerOverlay");
  map.getPane("burgerOverlay").style.zIndex = 750;

  var activeOverlay = null;

  function showBurgerOverlay(latlng) {
    removeBurgerOverlay();
    activeOverlay = L.marker(latlng, {
      icon: burgerIcon,
      interactive: false,
      pane: "burgerOverlay",
      zIndexOffset: 10000,
    }).addTo(map);
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
  var allCoords = restaurants.map(function (r) {
    return [r.lat, r.lng];
  });
  if (allCoords.length) {
    map.fitBounds(allCoords, { padding: [30, 30] });
  }

  // ── Zoom reset control ──────────────────────────
  L.Control.ZoomReset = L.Control.extend({
    options: { position: "topleft" },
    onAdd: function () {
      var container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      var btn = L.DomUtil.create("a", "", container);
      btn.href = "#";
      btn.title = "Zoom to fit all";
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" style="vertical-align:middle"><path d="M0 4V1a1 1 0 011-1h3M10 0h3a1 1 0 011 1v3M14 10v3a1 1 0 01-1 1h-3M4 14H1a1 1 0 01-1-1v-3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
      btn.style.lineHeight = "30px";
      btn.style.textAlign = "center";
      btn.setAttribute("role", "button");
      btn.setAttribute("aria-label", "Zoom to fit all");
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(btn, "click", function (e) {
        L.DomEvent.preventDefault(e);
        if (allCoords.length) {
          map.fitBounds(allCoords, { padding: [30, 30] });
        }
      });
      return container;
    },
  });
  new L.Control.ZoomReset().addTo(map);

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
    filtersEl.querySelectorAll(".area-btn").forEach(function (b) {
      b.classList.remove("active");
    });
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
      var matchesSearch =
        !searchTerm ||
        r.name.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.address.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.area.toLowerCase().indexOf(searchTerm) !== -1 ||
        (r.menuItem && r.menuItem.toLowerCase().indexOf(searchTerm) !== -1);
      return matchesArea && matchesSearch;
    });

    filtered.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    if (checklistMode) {
      var checkedCount = filtered.filter(function (r) {
        return checkedSet.has(r.name);
      }).length;
      countEl.innerHTML =
        filtered.length +
        " of " +
        restaurants.length +
        ' restaurants — <span class="checklist-summary">' +
        checkedCount +
        " selected</span>";
    } else {
      countEl.textContent =
        filtered.length + " of " + restaurants.length + " restaurants";
    }

    if (filtered.length === 0) {
      var noRes = document.createElement("li");
      noRes.className = "no-results";
      noRes.textContent = "No restaurants match your search.";
      listEl.appendChild(noRes);
      return;
    }

    filtered.forEach(function (r) {
      var marker = markerMap.get(r.name);
      if (marker) {
        clusterGroup.addLayer(marker);
        updateMarkerOpacity(r.name);
      }

      var li = document.createElement("li");
      li.className = "restaurant-item";
      var isChecked = checkedSet.has(r.name);
      if (checklistMode && !isChecked) {
        li.classList.add("unchecked");
      }

      if (checklistMode) {
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "checklist-checkbox";
        cb.checked = isChecked;
        cb.addEventListener("change", function (e) {
          e.stopPropagation();
          if (this.checked) {
            checkedSet.add(r.name);
            li.classList.remove("unchecked");
          } else {
            checkedSet.delete(r.name);
            li.classList.add("unchecked");
          }
          saveChecklist();
          updateMarkerOpacity(r.name);
          updateChecklistCount();
        });
        li.appendChild(cb);
      }

      var nameCol = document.createElement("div");
      nameCol.className = "name-col";

      var nameSpan = document.createElement("span");
      nameSpan.className = "name";
      nameSpan.textContent = r.name;
      nameCol.appendChild(nameSpan);

      if (r.menuItem) {
        var subtitle = document.createElement("span");
        subtitle.className = "menu-item-subtitle";
        subtitle.textContent = r.menuItem;
        nameCol.appendChild(subtitle);
      }

      var badge = document.createElement("span");
      badge.className = "area-badge";
      badge.textContent = r.area;
      badge.style.backgroundColor = AREA_COLORS[r.area] || "#999";

      li.appendChild(nameCol);
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
              setTimeout(function () {
                marker.openPopup();
              }, 300);
            } else {
              marker.openPopup();
            }
          }
        }, 900);
      });

      listEl.appendChild(li);
    });

    var coords = filtered.map(function (r) {
      return [r.lat, r.lng];
    });
    if (coords.length) {
      map.fitBounds(coords, { padding: [30, 30] });
    }
  }

  renderList();

  // ── Checklist helpers ───────────────────────────

  function updateMarkerOpacity(name) {
    var marker = markerMap.get(name);
    if (!marker) return;
    if (checklistMode && !checkedSet.has(name)) {
      marker.setStyle({ fillOpacity: 0.2, opacity: 0.3 });
    } else {
      marker.setStyle({ fillOpacity: 0.85, opacity: 1 });
    }
  }

  function updateChecklistCount() {
    var countEl = document.getElementById("restaurantCount");
    var filtered = restaurants.filter(function (r) {
      var matchesArea = activeArea === "All" || r.area === activeArea;
      var matchesSearch =
        !searchTerm ||
        r.name.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.address.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.area.toLowerCase().indexOf(searchTerm) !== -1 ||
        (r.menuItem && r.menuItem.toLowerCase().indexOf(searchTerm) !== -1);
      return matchesArea && matchesSearch;
    });
    var checkedVisible = filtered.filter(function (r) {
      return checkedSet.has(r.name);
    }).length;
    countEl.innerHTML =
      filtered.length +
      " of " +
      restaurants.length +
      ' restaurants — <span class="checklist-summary">' +
      checkedVisible +
      " selected</span>";
  }

  // ── Checklist toggle + bulk actions ─────────────

  var checklistToggleBtn = document.getElementById("checklistToggle");
  var checklistActionsEl = document.getElementById("checklistActions");

  checklistToggleBtn.addEventListener("click", function () {
    checklistMode = !checklistMode;
    this.classList.toggle("active", checklistMode);
    checklistActionsEl.classList.toggle("visible", checklistMode);
    renderList();
  });

  document
    .getElementById("checklistAllOn")
    .addEventListener("click", function () {
      restaurants.forEach(function (r) {
        checkedSet.add(r.name);
      });
      saveChecklist();
      renderList();
    });

  document
    .getElementById("checklistAllOff")
    .addEventListener("click", function () {
      checkedSet.clear();
      saveChecklist();
      renderList();
    });

  // ── Print selected restaurants ──────────────────

  document
    .getElementById("checklistPrint")
    .addEventListener("click", function () {
      var selected = restaurants.filter(function (r) {
        return checkedSet.has(r.name);
      });

      if (selected.length === 0) {
        alert("No restaurants selected. Check some restaurants first.");
        return;
      }

      var areaOrder = Object.keys(AREA_COLORS);
      var groups = {};
      selected.forEach(function (r) {
        if (!groups[r.area]) groups[r.area] = [];
        groups[r.area].push(r);
      });

      Object.keys(groups).forEach(function (area) {
        groups[area].sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
      });

      var sortedAreas = Object.keys(groups).sort(function (a, b) {
        var ai = areaOrder.indexOf(a);
        var bi = areaOrder.indexOf(b);
        if (ai === -1) ai = 999;
        if (bi === -1) bi = 999;
        return ai - bi;
      });

      var num = 1;
      var numberedItems = [];
      sortedAreas.forEach(function (area) {
        groups[area].forEach(function (r) {
          numberedItems.push({ num: num++, restaurant: r, area: area });
        });
      });

      var markersJs = numberedItems
        .map(function (item) {
          var r = item.restaurant;
          return (
            "L.marker([" +
            r.lat +
            "," +
            r.lng +
            "],{icon:L.divIcon({html:'<div style=\"background:" +
            (AREA_COLORS[r.area] || "#999") +
            ';color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.3)">' +
            item.num +
            "</div>',className:'',iconSize:[24,24],iconAnchor:[12,12]})}).addTo(m);"
          );
        })
        .join("\n");

      var boundsJs =
        "m.fitBounds([" +
        numberedItems
          .map(function (item) {
            return "[" + item.restaurant.lat + "," + item.restaurant.lng + "]";
          })
          .join(",") +
        "],{padding:[50,50]});";

      var listHtml = "";
      sortedAreas.forEach(function (area) {
        listHtml +=
          '<h2 style="margin:18px 0 8px;font-size:1.1rem;color:' +
          (AREA_COLORS[area] || "#999") +
          ";border-bottom:2px solid " +
          (AREA_COLORS[area] || "#999") +
          ';padding-bottom:4px">' +
          escapeHtml(area) +
          "</h2>";
        groups[area].forEach(function (r) {
          var n = numberedItems.find(function (item) {
            return item.restaurant === r;
          }).num;
          listHtml +=
            '<div style="display:flex;gap:12px;margin-bottom:12px;padding-left:8px">';
          listHtml += '<div style="flex:1;min-width:0">';
          listHtml +=
            '<div style="font-weight:700;font-size:0.95rem"><span style="display:inline-block;background:' +
            (AREA_COLORS[r.area] || "#999") +
            ';color:#fff;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-size:11px;margin-right:6px">' +
            n +
            "</span>" +
            escapeHtml(r.name) +
            "</div>";
          listHtml +=
            '<div style="font-size:0.85rem;color:#555">' +
            escapeHtml(r.address) +
            "</div>";
          if (r.phone)
            listHtml +=
              '<div style="font-size:0.85rem;color:#555">' +
              escapeHtml(r.phone) +
              "</div>";
          listHtml += "</div>";
          if (r.menuItem || r.description) {
            listHtml += '<div style="flex:1;min-width:0">';
            if (r.menuItem)
              listHtml +=
                '<div style="font-size:0.85rem;font-weight:600">' +
                escapeHtml(r.menuItem) +
                "</div>";
            if (r.description)
              listHtml +=
                '<div style="font-size:0.82rem;color:#666;font-style:italic">' +
                escapeHtml(r.description) +
                "</div>";
            listHtml += "</div>";
          }
          listHtml += "</div>";
        });
      });

      var printHtml =
        "<!DOCTYPE html><html><head>" +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        "<title>" + THEME.printTitle + "</title>" +
        '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">' +
        "<style>" +
        "body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;margin:0 auto;padding:20px;color:#2b2b2b;width:800px}" +
        "h1{font-size:1.3rem;margin-bottom:4px}" +
        ".subtitle{color:#888;font-size:0.85rem;margin-bottom:16px}" +
        "#printMap{height:400px;border-radius:8px;border:1px solid #ddd;margin-bottom:20px}" +
        "#mapImage{width:100%;height:400px;border-radius:8px;border:1px solid #ddd;margin-bottom:20px;object-fit:cover;display:none}" +
        ".print-btn{display:block;margin:0 auto 20px;padding:10px 28px;background:#e63946;color:#fff;border:none;border-radius:20px;font-size:0.95rem;font-weight:600;cursor:pointer}" +
        ".print-btn:hover{background:#c62d3a}" +
        "@media print{.print-btn{display:none}" +
        "*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}" +
        "}" +
        "</style>" +
        "</head><body>" +
        "<h1>" + THEME.printTitle + "</h1>" +
        '<p class="subtitle">' +
        selected.length +
        " restaurants selected | " + THEME.siteUrl.replace(/^https?:\/\//, "") + "</p>" +
        '<button class="print-btn" id="printBtn">Print This Page</button>' +
        '<div id="printMap"></div>' +
        '<img id="mapImage" alt="Map of selected restaurants">' +
        listHtml +
        '<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></' +
        "script>" +
        '<script src="https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js"></' +
        "script>" +
        "<script>" +
        'var m=L.map("printMap",{zoomControl:false,attributionControl:false});' +
        'L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{maxZoom:20,subdomains:"abcd",crossOrigin:true}).addTo(m);' +
        markersJs +
        boundsJs +
        'document.getElementById("printBtn").addEventListener("click",function(){' +
        "var btn=this;btn.textContent='Capturing map...';btn.disabled=true;" +
        "var mapEl=document.getElementById('printMap');" +
        "var imgEl=document.getElementById('mapImage');" +
        "html2canvas(mapEl,{useCORS:true,scale:2,logging:false}).then(function(canvas){" +
        "imgEl.src=canvas.toDataURL('image/png');" +
        "imgEl.style.display='block';" +
        "mapEl.style.display='none';" +
        "setTimeout(function(){window.print();" +
        "imgEl.style.display='none';" +
        "mapEl.style.display='block';" +
        "btn.textContent='Print This Page';btn.disabled=false;" +
        "},300);" +
        "}).catch(function(){" +
        "btn.textContent='Print This Page';btn.disabled=false;" +
        "window.print();" +
        "});" +
        "});" +
        "</" +
        "script>" +
        "</body></html>";

      var printWindow = window.open("", "_blank");
      printWindow.document.write(printHtml);
      printWindow.document.close();
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

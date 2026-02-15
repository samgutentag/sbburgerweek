// SB Burger Week 2026 — Map Application

(function () {
  "use strict";

  // ── Apply theme to header ──────────────────────────
  var headerTitle = document.getElementById("headerTitle");
  if (headerTitle) {
    headerTitle.innerHTML = THEME.eventName + " <span>| " + THEME.eventDates + "</span>";
  }
  var headerSource = document.getElementById("headerSource");
  if (headerSource) {
    headerSource.href = THEME.sourceUrl;
    // Abbreviate on mobile: "Source: The Independent" → "The Independent"
    if (window.innerWidth <= 768) {
      headerSource.textContent = THEME.sourceLabel.replace(/^Source:\s*/i, "");
    } else {
      headerSource.textContent = THEME.sourceLabel;
    }
  }
  var headerVenmo = document.getElementById("headerVenmo");
  if (headerVenmo) {
    headerVenmo.textContent = THEME.emoji + " " + THEME.venmoNote;
    headerVenmo.href = "https://venmo.com/u/" + THEME.venmoUser + "?txn=pay&amount=" + THEME.venmoAmount + "&note=" + encodeURIComponent(THEME.emoji + " " + THEME.venmoNote);
  }

  // ── Shared DOM refs + drawer state ────────────
  var sidebar = document.getElementById("sidebar");
  var PEEK_HEIGHT = 130;
  var drawerStops = [];
  var currentStop = 0;

  // ── Map setup ──────────────────────────────────

  const map = L.map("map", {
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

  const clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 20,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
  });

  // ── Build markers ──────────────────────────────

  const markerMap = new Map(); // restaurant name → marker

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
        // Default: all checked
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
    const color = AREA_COLORS[r.area] || "#999";

    const marker = L.circleMarker([r.lat, r.lng], {
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

    marker.bindPopup(popupHtml, { maxWidth: 240, offset: [0, -4] });

    // Show popup and burger overlay on hover
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
        // Find restaurant name from markerMap
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

  // ── Burger emoji overlay on selected marker ──

  var burgerIcon = L.divIcon({
    html: '<span class="burger-icon">' + THEME.emoji + '</span>',
    className: "burger-icon-wrapper",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  // Custom pane so the burger emoji renders above popups
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

    // Find and highlight the active restaurant in the sidebar
    var popupLatLng = e.popup.getLatLng();
    var activeName = null;
    markerMap.forEach(function (marker, name) {
      var ll = marker.getLatLng();
      if (Math.abs(ll.lat - popupLatLng.lat) < 0.0001 && Math.abs(ll.lng - popupLatLng.lng) < 0.0001) {
        activeName = name;
      }
    });
    var listEl = document.getElementById("restaurantList");
    var items = listEl.querySelectorAll(".restaurant-item");
    items.forEach(function (item) {
      var nameEl = item.querySelector(".name");
      if (nameEl && nameEl.textContent === activeName) {
        item.classList.add("active");
        // Scroll so active item is at the top of the visible list
        listEl.scrollTo({ top: item.offsetTop - listEl.offsetTop, behavior: "smooth" });
      } else {
        item.classList.remove("active");
      }
    });
  });

  map.on("popupclose", function () {
    removeBurgerOverlay();
    // Clear active highlight
    var items = document.querySelectorAll(".restaurant-item.active");
    items.forEach(function (item) { item.classList.remove("active"); });
  });

  // Fit bounds to show all markers
  const allCoords = restaurants.map(function (r) {
    return [r.lat, r.lng];
  });

  // Returns fitBounds padding that accounts for the mobile drawer
  function getMapPadding() {
    if (window.innerWidth <= 768 && drawerStops.length) {
      var drawerVisible = (sidebar.offsetHeight || 0) - (drawerStops[currentStop] || 0);
      return { paddingTopLeft: [20, 20], paddingBottomRight: [20, drawerVisible + 20] };
    }
    return { padding: [30, 30] };
  }

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

    // Update cluster layer to reflect filter
    clusterGroup.clearLayers();

    var filtered = restaurants.filter(function (r) {
      var matchesArea = activeArea === "All" || r.area === activeArea;
      var matchesSearch =
        !searchTerm ||
        r.name.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.address.toLowerCase().indexOf(searchTerm) !== -1 ||
        r.area.toLowerCase().indexOf(searchTerm) !== -1;
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
      // Re-add marker to cluster
      var marker = markerMap.get(r.name);
      if (marker) {
        clusterGroup.addLayer(marker);
        updateMarkerOpacity(r.name);
      }

      // List item
      var li = document.createElement("li");
      li.className = "restaurant-item";
      var isChecked = checkedSet.has(r.name);
      if (checklistMode && !isChecked) {
        li.classList.add("unchecked");
      }

      // Checkbox (only in checklist mode)
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
        // Only remove if no popup is open on this marker
        if (!marker || !marker.isPopupOpen()) {
          removeBurgerOverlay();
        }
      });

      li.addEventListener("click", function () {
        var isMobile = window.innerWidth <= 768;
        if (isMobile && currentStop > 0) {
          // Offset the target so marker appears in visible area above the drawer
          var drawerVisible = sidebar.offsetHeight - drawerStops[currentStop];
          var offsetY = Math.round(drawerVisible * 0.4);
          var targetPoint = map.project([r.lat, r.lng], 17);
          targetPoint.y += offsetY;
          var offsetLatLng = map.unproject(targetPoint, 17);
          map.flyTo(offsetLatLng, 17, { duration: 0.8 });
        } else {
          map.flyTo([r.lat, r.lng], 17, { duration: 0.8 });
        }

        // After fly, open popup (with slight delay for cluster to resolve)
        setTimeout(function () {
          if (marker) {
            // Spiderfy the cluster if needed
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

        // Keep mobile drawer open — map offset handles visibility
      });

      listEl.appendChild(li);
    });

    // Fit map to filtered markers
    var coords = filtered.map(function (r) {
      return [r.lat, r.lng];
    });
    if (coords.length) {
      map.fitBounds(coords, getMapPadding());
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
        r.area.toLowerCase().indexOf(searchTerm) !== -1;
      return matchesArea && matchesSearch;
    });
    checkedVisible = filtered.filter(function (r) {
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

      // Group by area, sorted
      var areaOrder = Object.keys(AREA_COLORS);
      var groups = {};
      selected.forEach(function (r) {
        if (!groups[r.area]) groups[r.area] = [];
        groups[r.area].push(r);
      });

      // Sort restaurants within each group
      Object.keys(groups).forEach(function (area) {
        groups[area].sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
      });

      // Sorted area keys
      var sortedAreas = Object.keys(groups).sort(function (a, b) {
        var ai = areaOrder.indexOf(a);
        var bi = areaOrder.indexOf(b);
        if (ai === -1) ai = 999;
        if (bi === -1) bi = 999;
        return ai - bi;
      });

      // Assign sequential numbers
      var num = 1;
      var numberedItems = [];
      sortedAreas.forEach(function (area) {
        groups[area].forEach(function (r) {
          numberedItems.push({ num: num++, restaurant: r, area: area });
        });
      });

      // Build markers JS for the print map
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

      // Build bounds
      var boundsJs =
        "m.fitBounds([" +
        numberedItems
          .map(function (item) {
            return "[" + item.restaurant.lat + "," + item.restaurant.lng + "]";
          })
          .join(",") +
        "],{padding:[50,50]});";

      // Build list HTML grouped by area
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
          // Left column: number, name, address, phone
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
          // Right column: burger name, description
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

  // ── Mobile three-stop snap drawer ─────────────

  var dragHandle = document.getElementById("dragHandle");
  var isMobileView = window.innerWidth <= 768;

  function calcDrawerStops() {
    var vh = window.innerHeight;
    var sidebarHeight = sidebar.offsetHeight || Math.round(vh * 0.9);
    var halfVisible = Math.round(vh * 0.5);
    var fullVisible = sidebarHeight; // show it all (90vh)
    drawerStops = [
      sidebarHeight - PEEK_HEIGHT, // peek: most of drawer hidden
      sidebarHeight - halfVisible,  // half: 50vh visible
      0,                            // full: all visible
    ];
  }

  function snapDrawerTo(stopIndex) {
    currentStop = Math.max(0, Math.min(stopIndex, drawerStops.length - 1));
    sidebar.classList.remove("dragging");
    sidebar.style.setProperty("--drawer-offset", drawerStops[currentStop] + "px");

    // Haptic-style flash on drag handle
    sidebar.classList.add("snap-flash");
    setTimeout(function () {
      sidebar.classList.remove("snap-flash");
    }, 200);
  }

  // Drag state
  var dragStartY = 0;
  var dragStartOffset = 0;
  var dragStartTime = 0;
  var isDragging = false;

  function getCurrentOffset() {
    return drawerStops[currentStop] || 0;
  }

  function onDragStart(clientY) {
    isDragging = true;
    dragStartY = clientY;
    dragStartOffset = getCurrentOffset();
    dragStartTime = Date.now();
    sidebar.classList.add("dragging");
  }

  var RUBBER_BAND_MAX = 30;

  function onDragMove(clientY, e) {
    if (!isDragging) return;
    var deltaY = clientY - dragStartY;
    var rawOffset = dragStartOffset + deltaY;
    var newOffset;
    if (rawOffset > drawerStops[0]) {
      // Rubber-band past peek: diminishing resistance
      var overscroll = rawOffset - drawerStops[0];
      newOffset = drawerStops[0] + RUBBER_BAND_MAX * (1 - Math.exp(-overscroll / 80));
    } else {
      newOffset = Math.max(0, rawOffset);
    }
    sidebar.style.setProperty("--drawer-offset", newOffset + "px");
    if (e) e.preventDefault();
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    var currentOffsetStr = sidebar.style.getPropertyValue("--drawer-offset");
    var currentOffset = parseInt(currentOffsetStr, 10) || 0;

    // If in rubber-band zone (past peek), snap back to peek
    if (currentOffset > drawerStops[0]) {
      snapDrawerTo(0);
      return;
    }

    var elapsed = (Date.now() - dragStartTime) / 1000;
    // positive velocity = dragging down (offset increasing = less visible)
    var velocity = (currentOffset - dragStartOffset) / elapsed;

    var VELOCITY_THRESHOLD = 300; // px/s

    var targetStop;
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      if (velocity > 0) {
        // Flick down → less visible (lower stop index = higher offset)
        targetStop = Math.max(currentStop - 1, 0);
      } else {
        // Flick up → more visible (higher stop index = lower offset)
        targetStop = Math.min(currentStop + 1, drawerStops.length - 1);
      }
    } else {
      // Snap to nearest stop
      var minDist = Infinity;
      targetStop = currentStop;
      for (var i = 0; i < drawerStops.length; i++) {
        var dist = Math.abs(currentOffset - drawerStops[i]);
        if (dist < minDist) {
          minDist = dist;
          targetStop = i;
        }
      }
    }

    snapDrawerTo(targetStop);
  }

  // Touch events — only drag handle initiates drawer drag
  dragHandle.addEventListener("touchstart", function (e) {
    onDragStart(e.touches[0].clientY);
  }, { passive: true });

  dragHandle.addEventListener("touchmove", function (e) {
    onDragMove(e.touches[0].clientY, e);
  }, { passive: false });

  dragHandle.addEventListener("touchend", onDragEnd);

  // Mouse events (for desktop testing)
  dragHandle.addEventListener("mousedown", function (e) {
    onDragStart(e.clientY);
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    onDragMove(e.clientY, e);
  });

  document.addEventListener("mouseup", onDragEnd);

  // Map click on mobile: snap to peek
  map.on("click", function () {
    if (window.innerWidth <= 768 && currentStop > 0) {
      snapDrawerTo(0);
    }
  });

  // Peek on load for mobile
  if (isMobileView) {
    calcDrawerStops();
    snapDrawerTo(0); // peek position
    setTimeout(function () {
      map.invalidateSize();
      if (allCoords.length) {
        map.fitBounds(allCoords, {
          paddingTopLeft: [20, 20],
          paddingBottomRight: [20, PEEK_HEIGHT],
        });
      }
    }, 350);
  }

  // Recalculate on resize / orientation change
  window.addEventListener("resize", function () {
    map.invalidateSize();
    if (window.innerWidth <= 768) {
      calcDrawerStops();
      snapDrawerTo(currentStop);
    }
  });

  // ── Utility ────────────────────────────────────

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();

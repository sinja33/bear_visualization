let map = L.map('map').setView([46.1, 14.7], 8.5);

// Base map
// LIGHT BASEMAP (default)
const lightMap = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { maxZoom: 19 }
).addTo(map);

// DARK BASEMAP (initially *not* added)
const darkMap = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    maxZoom: 19,
    attribution: '&copy; CARTO'
  }
);


let municipalityLayer = null;
let bearLayer = null;
let lineLayer = null;
let bearData = [];
let activeBear = null;
let sliderMinDate = null;
let sliderMaxDate = null;
let animationTimer = null;
let isPlaying = false;


// ---------- MUNICIPALITIES ----------
fetch("data/slovenia_municipalities.geojson")
  .then(res => res.json())
  .then(geojson => {
    municipalityLayer = L.geoJSON(geojson, {
      style: {
        color: "#1e1e1e",
        weight: 0.4,
        fillColor: "#bdaf92ff",
        fillOpacity: 0.45
      },
      pane: 'tilePane',
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(feature.properties.OB_UIME, {
          sticky: false,
          direction: "top",
          opacity: 0.9,
          className: "municipality-tooltip"
        });
      }
    }).addTo(map);
  });

// ---------- BEAR DATA ----------
fetch("data/bear_points.json")
  .then(res => res.json())
  .then(json => {
    bearData = json;

    // compute real min/max dates from JSON
    const dates = bearData.map(d => new Date(d.time));
    sliderMinDate = new Date(Math.min(...dates));
    sliderMaxDate = new Date(Math.max(...dates));

    // initialize slider based on actual ranges
    setupMonthlySlider();

    renderBears();
  });

function setupMonthlySlider() {
  const slider = document.getElementById("timeSlider");

  // Calculate how many months between min and max
  let months =
    (sliderMaxDate.getFullYear() - sliderMinDate.getFullYear()) * 12 +
    (sliderMaxDate.getMonth() - sliderMinDate.getMonth());

  slider.min = 0;
  slider.max = months;
  slider.step = 1;
  slider.value = 0;

  updateMonthlyWindow();
}


function updateMonthlyWindow() {
  const slider = document.getElementById("timeSlider");
  const monthIndex = Number(slider.value);

  // Start date = minDate plus monthIndex months
  let start = new Date(
    sliderMinDate.getFullYear(),
    sliderMinDate.getMonth() + monthIndex,
    1
  );

  // End date = last day of same month
  let end = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0 // day 0 = last day of previous month
  );

  // Write to input boxes
  document.getElementById("startDate").value =
    start.toISOString().slice(0, 10);

  document.getElementById("endDate").value =
    end.toISOString().slice(0, 10);

  renderBears();
}

function startAnimation() {
  if (isPlaying) return;
  isPlaying = true;

  animationTimer = setInterval(() => {
    const slider = document.getElementById("timeSlider");
    if (Number(slider.value) >= Number(slider.max)) {
      pauseAnimation();
      return;
    }
    slider.value = Number(slider.value) + 1;
    updateMonthlyWindow();
  }, 500); // 0.7 seconds per month – adjust speed here
}

function pauseAnimation() {
  isPlaying = false;
  clearInterval(animationTimer);
}

// ---------- MAIN RENDER FUNCTION ----------
function renderBears() {
  if (bearLayer) map.removeLayer(bearLayer);
  if (lineLayer) map.removeLayer(lineLayer);

  bearLayer = L.layerGroup();
  lineLayer = L.layerGroup();

  const startDate = document.getElementById("startDate").value || "0000-01-01";
  const endDate = document.getElementById("endDate").value || "9999-12-31";

  let filtered = bearData.filter(p =>
    p.time >= startDate &&
    p.time <= endDate &&
    (!activeBear || p.bear_id === activeBear)
  );

  let bears = [...new Set(filtered.map(p => p.bear_id))];
  updateLegend(bears);

  // Group points by bear for lines
  let grouped = {};
  filtered.forEach(p => {
    if (!grouped[p.bear_id]) grouped[p.bear_id] = [];
    grouped[p.bear_id].push(p);
  });

  // Draw paths if toggle on
  if (document.getElementById("togglePaths").checked) {
    Object.keys(grouped).forEach(bear => {
      let pts = grouped[bear].map(p => [p.lat, p.lon]);
      if (pts.length > 1) {
        L.polyline(pts, {
          color: stringToColor(bear),
          weight: 2,
          opacity: 0.9
        }).addTo(lineLayer);
      }
    });

    lineLayer.addTo(map);
  }

  document.getElementById("toggleDarkMap").addEventListener("change", function () {
    if (this.checked) {
      map.removeLayer(lightMap);
      map.addLayer(darkMap);
    } else {
      map.removeLayer(darkMap);
      map.addLayer(lightMap);
    }
  });


  // Draw points
  filtered.forEach(p => {
    let color = stringToColor(p.bear_id);

    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 5,
      color: color,
      fillColor: color,
      fillOpacity: 0.9,
      weight: 1
    }).addTo(bearLayer);

    marker.bindTooltip(
      `<div class="bear-tooltip">
        <strong>Bear:</strong> ${p.bear_id.charAt(0).toUpperCase() + p.bear_id.slice(1)}<br>
        Time: ${p.time}<br>
        Lat: ${p.lat}<br>
        Lon: ${p.lon}
       </div>`,
      {
        direction: "top",
        offset: [0, -8],
        opacity: 1,
        sticky: true,
        className: "bear-tooltip-container"
      }
    );

    // Hover effects
    marker.on("mouseover", () => {
      // Enlarge hovered point
      marker.setStyle({ radius: 10 });

      // Dim other points
      bearLayer.eachLayer(m => {
        if (m !== marker)
          m.setStyle({ fillOpacity: 0.5, opacity: 0.5 });
      });

      // 🔹 NEW: dim all movement paths when hovering a point
      if (lineLayer) {
        lineLayer.eachLayer(l => {
          l.setStyle({ opacity: 0.3 });
        });
      }
    });

    marker.on("mouseout", () => {
      // Restore hovered point
      marker.setStyle({ radius: 5 });

      // Restore all points
      bearLayer.eachLayer(m => {
        m.setStyle({ fillOpacity: 0.9, opacity: 1 });
      });

      // 🔹 NEW: restore all movement paths
      if (lineLayer) {
        lineLayer.eachLayer(l => {
          l.setStyle({ opacity: 0.9 });
        });
      }
    });

    // Click to zoom
    marker.on("click", () => {
      map.setView([p.lat, p.lon], 13);
    });
  });

  bearLayer.addTo(map);
}

// ---------- TIME SLIDER ----------
document.getElementById("timeSlider")
  .addEventListener("input", updateMonthlyWindow);

document.getElementById("startDate").addEventListener("change", renderBears);
document.getElementById("endDate").addEventListener("change", renderBears);
document.getElementById("togglePaths").addEventListener("change", renderBears);
document.getElementById("playButton").addEventListener("click", startAnimation);
document.getElementById("pauseButton").addEventListener("click", pauseAnimation);


// ---------- LEGEND ----------
function updateLegend(bears) {
  const legend = document.getElementById("legend");
  legend.innerHTML = "<strong>Bear IDs</strong><br><br>";

  legend.innerHTML += `
    <div class="legend-item" data-bear="ALL">
      <span class="color-box" style="background:gray"></span>
      Show All
    </div>
  `;

  bears.forEach(bear => {
    legend.innerHTML += `
      <div class="legend-item" data-bear="${bear}">
        <span class="color-box" style="background:${stringToColor(bear)}"></span>
        ${bear.charAt(0).toUpperCase() + bear.slice(1)}
      </div>
    `;
  });

  document.querySelectorAll(".legend-item").forEach(item => {
    item.onclick = () => {
      const selected = item.dataset.bear;

      if (selected === "ALL") {
        activeBear = null;
      } else {
        activeBear = activeBear === selected ? null : selected;
      }

      document.querySelectorAll(".legend-item").forEach(i =>
        i.style.background = ""
      );
      if (activeBear)
        item.style.background = "rgba(255,255,255,0.2)";

      renderBears();
    };
  });
}

// ---------- SIMPLE COLOR GENERATOR ----------
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 70%, 55%)`;
}

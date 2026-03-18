const grid = document.getElementById("cardsGrid");
const emptyState = document.getElementById("emptyState");

const totalTutorsEl = document.getElementById("totalTutors");
const resultsCountEl = document.getElementById("resultsCount");
const avgRatingEl = document.getElementById("avgRating");
const resultsPillCountEl = document.getElementById("resultsPillCount");
const activeFiltersEl = document.getElementById("activeFilters");

const form = document.getElementById("filtersForm");
const resetBtn = document.getElementById("resetBtn");

const locateBtn = document.getElementById("locateBtn");
const within5kmEl = document.getElementById("within5km");
const mapHintEl = document.getElementById("mapHint");

const tutors = [
  // Add approximate coordinates so we can filter/plot by distance.
  { id: 1, name: "Rahul Sharma", subject: "Maths", classLevels: ["9th", "10th", "11th"], location: "Noida Sector 62", qualification: "B.Tech (IIT)", fees: 3500, rating: 4.8, lat: 28.6289, lng: 77.3730 },
  { id: 2, name: "Ananya Verma", subject: "English", classLevels: ["6th", "7th", "8th", "9th"], location: "Ghaziabad", qualification: "M.A. English", fees: 2500, rating: 4.6, lat: 28.6692, lng: 77.4538 },
  { id: 3, name: "Mohit Singh", subject: "Physics", classLevels: ["11th", "12th"], location: "Delhi Rohini", qualification: "M.Sc Physics", fees: 5000, rating: 4.7, lat: 28.7496, lng: 77.0565 },
  { id: 4, name: "Priya Kapoor", subject: "Chemistry", classLevels: ["10th", "11th", "12th"], location: "Noida Sector 50", qualification: "M.Tech, B.Ed", fees: 4200, rating: 4.5, lat: 28.5708, lng: 77.3601 },
  { id: 5, name: "Sana Khan", subject: "Biology", classLevels: ["9th", "10th", "11th", "12th"], location: "Delhi Jamia Nagar", qualification: "M.Sc Biology", fees: 3800, rating: 4.4, lat: 28.5610, lng: 77.2800 },
  { id: 6, name: "Arjun Mehta", subject: "Computer", classLevels: ["8th", "9th", "10th", "11th", "12th"], location: "Noida", qualification: "BCA, Full-stack", fees: 3200, rating: 4.3, lat: 28.5355, lng: 77.3910 },
  { id: 7, name: "Neha Gupta", subject: "Science", classLevels: ["6th", "7th", "8th"], location: "Greater Noida", qualification: "B.Sc, B.Ed", fees: 2200, rating: 4.2, lat: 28.4744, lng: 77.5030 },
  { id: 8, name: "Vikram Joshi", subject: "Maths", classLevels: ["6th", "7th", "8th"], location: "Delhi Dwarka", qualification: "B.Sc Maths", fees: 2000, rating: 4.1, lat: 28.5921, lng: 77.0460 },
  { id: 9, name: "Isha Patel", subject: "Physics", classLevels: ["10th", "11th", "12th"], location: "Noida Sector 18", qualification: "B.Tech, 6+ yrs exp", fees: 5400, rating: 4.9, lat: 28.5700, lng: 77.3260 },
];

// --- Map + location (Leaflet / OpenStreetMap) ---
const RADIUS_KM = 5;
let map;
let userMarker;
let radiusCircle;
let tutorMarkersLayer;
let userPos = null; // { lat, lng }

function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2));
  return R * c;
}

function canUseMap() {
  return typeof window.L !== "undefined" && document.getElementById("map");
}

function initMapIfNeeded() {
  if (!canUseMap() || map) return;

  const defaultCenter = { lat: 28.5700, lng: 77.3260 }; // Noida-ish default
  map = L.map("map", { zoomControl: true }).setView([defaultCenter.lat, defaultCenter.lng], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  tutorMarkersLayer = L.layerGroup().addTo(map);
}

function setUserOnMap(pos) {
  userPos = pos;
  initMapIfNeeded();
  if (!map) return;

  const latlng = [pos.lat, pos.lng];
  if (!userMarker) {
    userMarker = L.marker(latlng).addTo(map).bindPopup("Your location");
  } else {
    userMarker.setLatLng(latlng);
  }

  const meters = RADIUS_KM * 1000;
  if (!radiusCircle) {
    radiusCircle = L.circle(latlng, {
      radius: meters,
      color: "#7c5cff",
      weight: 2,
      fillColor: "#2d63ff",
      fillOpacity: 0.10,
    }).addTo(map);
  } else {
    radiusCircle.setLatLng(latlng);
    radiusCircle.setRadius(meters);
  }

  map.setView(latlng, 13, { animate: true });
  mapHintEl.textContent = `Showing tutors within ${RADIUS_KM} km (if enabled).`;
}

function updateTutorMarkers(items) {
  if (!map || !tutorMarkersLayer) return;
  tutorMarkersLayer.clearLayers();

  items.forEach((t) => {
    if (typeof t.lat !== "number" || typeof t.lng !== "number") return;
    const m = L.marker([t.lat, t.lng]);
    const dist = userPos ? haversineKm(userPos, { lat: t.lat, lng: t.lng }) : null;
    const distLine = dist != null ? `<div style="opacity:.85;margin-top:4px;">~${dist.toFixed(1)} km away</div>` : "";
    m.bindPopup(`<strong>${t.name}</strong><br>${t.subject} • ₹${money(t.fees)}/month${distLine}`);
    m.addTo(tutorMarkersLayer);
  });
}

async function requestLocation() {
  initMapIfNeeded();
  if (!("geolocation" in navigator)) {
    mapHintEl.textContent = "Geolocation is not supported in this browser.";
    return;
  }

  mapHintEl.textContent = "Requesting location permission…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserOnMap(p);
      applyFilters();
    },
    () => {
      mapHintEl.textContent = "Location permission denied. You can still browse tutors without the 5 km filter.";
      userPos = null;
      applyFilters();
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function svgAvatarDataUri(label) {
  const safe = String(label || "U").slice(0, 3);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7c5cff"/>
          <stop offset="1" stop-color="#2d63ff"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="44" fill="url(#g)"/>
      <circle cx="124" cy="36" r="34" fill="rgba(255,255,255,.16)"/>
      <circle cx="40" cy="128" r="38" fill="rgba(0,0,0,.12)"/>
      <text x="80" y="92" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="54" font-weight="900" fill="rgba(255,255,255,.92)">${safe}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function ratingBadge(rating) {
  const cls = rating >= 4.6 ? "good" : rating >= 4.3 ? "warn" : "";
  return `<span class="badge ${cls}">★ ${rating.toFixed(1)}</span>`;
}

function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString("en-IN");
}

function renderCards(items) {
  grid.innerHTML = items
    .map((t) => {
      const avatar = svgAvatarDataUri(initials(t.name));
      const levels = t.classLevels.join(", ");
      return `
        <article class="card" data-id="${t.id}">
          <div class="card-top">
            <div class="avatar">
              <img alt="${t.name}" src="${avatar}" loading="lazy" />
            </div>
            <div>
              <h3 class="card-name">${t.name}</h3>
              <p class="card-sub">${t.subject} • ${levels}</p>
            </div>
          </div>

          <div class="badge-row">
            ${ratingBadge(t.rating)}
            <span class="badge">${t.location}</span>
          </div>

          <div class="card-body">
            <div class="meta">
              <div class="meta-item">
                <div class="meta-k">Qualification</div>
                <div class="meta-v">${t.qualification}</div>
              </div>
              <div class="meta-item">
                <div class="meta-k">Fees</div>
                <div class="meta-v">₹${money(t.fees)} <small>/month</small></div>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn-outline" type="button" data-action="profile">View Profile</button>
            <button class="btn-solid" type="button" data-action="contact">Contact</button>
          </div>
        </article>
      `;
    })
    .join("");

  emptyState.hidden = items.length !== 0;
}

function getFilters() {
  const fd = new FormData(form);
  const q = String(fd.get("q") || "").trim().toLowerCase();
  const subject = String(fd.get("subject") || "").trim().toLowerCase();
  const cls = String(fd.get("class") || "").trim().toLowerCase();
  const location = String(fd.get("location") || "").trim().toLowerCase();
  const fees = Number(fd.get("fees") || 0);
  const rating = Number(fd.get("rating") || 0);

  return { q, subject, cls, location, fees, rating };
}

function matchesTutor(t, f) {
  const hay = [
    t.name,
    t.subject,
    t.location,
    t.qualification,
    ...t.classLevels,
    String(t.fees),
  ]
    .join(" ")
    .toLowerCase();

  if (f.q && !hay.includes(f.q)) return false;
  if (f.subject && t.subject.toLowerCase() !== f.subject) return false;
  if (f.cls && !t.classLevels.some((x) => x.toLowerCase() === f.cls)) return false;
  if (f.location && !t.location.toLowerCase().includes(f.location)) return false;
  if (f.fees > 0 && t.fees > f.fees) return false;
  if (f.rating > 0 && t.rating < f.rating) return false;

  // Distance filter (optional)
  const within5km = Boolean(within5kmEl?.checked);
  if (within5km && userPos && typeof t.lat === "number" && typeof t.lng === "number") {
    const d = haversineKm(userPos, { lat: t.lat, lng: t.lng });
    if (d > RADIUS_KM) return false;
  }
  return true;
}

function updateStats(items) {
  totalTutorsEl.textContent = String(tutors.length);
  resultsCountEl.textContent = String(items.length);
  resultsPillCountEl.textContent = String(items.length);

  const avg = items.length ? items.reduce((s, t) => s + t.rating, 0) / items.length : 0;
  avgRatingEl.textContent = avg.toFixed(1);
}

function updateActiveFiltersPill(f) {
  const parts = [];
  if (f.subject) parts.push(`Subject: ${capitalize(f.subject)}`);
  if (f.cls) parts.push(`Class: ${f.cls.toUpperCase()}`);
  if (f.location) parts.push(`Location: ${capitalizeWords(f.location)}`);
  if (f.fees > 0) parts.push(`Max: ₹${money(f.fees)}`);
  if (f.rating > 0) parts.push(`Rating: ${f.rating.toFixed(1)}+`);
  if (f.q) parts.push(`Search: “${truncate(f.q, 18)}”`);

  activeFiltersEl.textContent = parts.length ? parts.join(" • ") : "No filters";
}

function truncate(s, n) {
  const v = String(s || "");
  return v.length > n ? `${v.slice(0, n - 1)}…` : v;
}
function capitalize(s) {
  const v = String(s || "");
  return v ? v[0].toUpperCase() + v.slice(1) : v;
}
function capitalizeWords(s) {
  return String(s || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function applyFilters() {
  const f = getFilters();
  const items = tutors.filter((t) => matchesTutor(t, f));
  renderCards(items);
  updateStats(items);
  updateActiveFiltersPill(f);
  updateTutorMarkers(items);
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  applyFilters();
});

form?.addEventListener("input", () => {
  // Live filtering feels modern; keep it fast and smooth.
  applyFilters();
});

resetBtn?.addEventListener("click", () => {
  form.reset();
  applyFilters();
});

locateBtn?.addEventListener("click", () => requestLocation());
within5kmEl?.addEventListener("change", () => applyFilters());

grid?.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const card = e.target.closest(".card");
  const id = Number(card?.getAttribute("data-id"));
  const tutor = tutors.find((t) => t.id === id);
  if (!tutor) return;

  const action = btn.getAttribute("data-action");
  if (action === "profile") {
    // You can map this to `tutor-profile.html?id=...` later
    window.location.href = "tutor-profile.html";
  } else if (action === "contact") {
    alert(`Contact request sent for ${tutor.name} (demo).`);
  }
});

// Initial render
initMapIfNeeded();
applyFilters();


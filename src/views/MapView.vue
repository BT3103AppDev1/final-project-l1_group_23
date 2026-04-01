<template>
  <div class="map-page">
    <!-- Header (same as CommunityView) -->
    <header>
      <div class="logo-section">
        <span class="logo-nus">NUS</span><span class="logo-text">CanteenPulse</span>
      </div>
      <nav class="nav-links">
        <RouterLink to="/community" active-class="active">🏠 Community</RouterLink>
        <RouterLink to="/map" active-class="active">🗺 Map</RouterLink>
        <RouterLink to="/recommended" active-class="active">⭐ Recommended</RouterLink>
        <RouterLink to="/favourites" active-class="active">♡ Favourites</RouterLink>
        <RouterLink to="/rewards" active-class="active">🎁 Rewards</RouterLink>
      </nav>
      <div class="user-controls">
        <button class="logout-btn" @click="logout">↪ Logout</button>
      </div>
    </header>

    <div class="page-body">
      <!-- Left Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-inner">
          <h2 class="sidebar-title">🗺 Campus Map</h2>
          <p class="sidebar-sub">Find your way to a canteen</p>

          <!-- Route planner -->
          <div class="route-planner">
            <div class="field-group">
              <label>Start Point</label>
              <select v-model="startCanteenId">
                <option value="">— Choose start canteen —</option>
                <option v-for="c in canteens" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="swap-row">
              <div class="route-line"></div>
              <button class="swap-btn" @click="swapPoints" title="Swap">⇅</button>
              <div class="route-line"></div>
            </div>

            <div class="field-group">
              <label>Destination</label>
              <select v-model="destCanteenId">
                <option value="">— Choose destination —</option>
                <option v-for="c in canteens" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <button
              class="btn-route"
              :disabled="!startCanteenId || !destCanteenId || startCanteenId === destCanteenId || routeLoading"
              @click="showRoute"
            >
              <span v-if="routeLoading">⏳ Finding route...</span>
              <span v-else>View Route</span>
            </button>

            <p v-if="startCanteenId && destCanteenId && startCanteenId === destCanteenId" class="route-warn">
              Start and destination must be different.
            </p>
            <p v-if="routeError" class="route-warn">{{ routeError }}</p>

            <!-- Active route info card -->
            <div v-if="activeRoute" class="route-card">
              <div class="route-card-header">
                <span class="route-badge">Route</span>
                <button class="clear-btn" @click="clearRoute">✕ Clear</button>
              </div>
              <div class="route-segment">
                <span class="dot start-dot"></span>
                <span class="route-name">{{ activeRoute.start.name }}</span>
              </div>
              <div class="route-connector"></div>
              <div class="route-segment">
                <span class="dot end-dot"></span>
                <span class="route-name">{{ activeRoute.dest.name }}</span>
              </div>
              <div class="route-meta">
                <span>📏 ~{{ activeRoute.distanceKm }} km</span>
                <span>🚶 ~{{ activeRoute.walkMins }} min walk</span>
              </div>
              <button
                class="btn-details"
                @click="$router.push({ name: 'CanteenDetail', params: { id: activeRoute.dest.id } })"
              >
                View Canteen Details →
              </button>
            </div>
          </div>

          <!-- Canteen list -->
          <div class="canteen-list">
            <h3 class="list-title">All Canteens</h3>
            <div
              class="list-item"
              v-for="c in sortedCanteens"
              :key="c.id"
              @click="focusCanteen(c)"
              :class="{ 'list-item--active': selectedCanteenId === c.id }"
            >
              <span class="crowd-dot" :class="getCrowdClass(c)"></span>
              <div class="list-item-info">
                <span class="list-item-name">{{ c.name }}</span>
                <span class="list-item-crowd" :class="getCrowdClass(c)">
                  {{ getCrowdLabel(c) }} · {{ getOccupancyDisplay(c) }}%
                </span>
              </div>
              <span class="list-item-seats">{{ c.occupiedSeats }}/{{ c.totalSeats }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Map container -->
      <div class="map-container">
        <div id="leaflet-map"></div>

        <!-- Legend -->
        <div class="map-legend">
          <span class="legend-title">Crowd Level</span>
          <span class="legend-item"><span class="legend-dot low"></span>Low</span>
          <span class="legend-item"><span class="legend-dot medium"></span>Medium</span>
          <span class="legend-item"><span class="legend-dot high"></span>High</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '@/firebase'
import { RouterLink } from 'vue-router'

// Real NUS canteen coordinates (lat, lng)
const CANTEEN_COORDS = {
  'pgp-aircon':        [1.2910, 103.7807],
  'frontier':          [1.2966, 103.7806],
  'central-square-yih':[1.2986, 103.7749],
  'fine-food-utown':   [1.3043, 103.7745],
  'the-deck':          [1.2952, 103.7739],
  'flavours-utown':    [1.3040, 103.7751],
}

// Walking speed ~5 km/h
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default {
  name: 'MapView',
  components: { RouterLink },

  data() {
    return {
      canteens: [],
      loading: true,
      unsubscribe: null,
      map: null,
      markers: {},
      routeLine: null,
      startCanteenId: '',
      destCanteenId: '',
      activeRoute: null,
      selectedCanteenId: null,
      routeLoading: false,
      routeError: null,
    }
  },

  computed: {
    sortedCanteens() {
      return [...this.canteens].sort(
        (a, b) => this.getOccupancyPercent(a) - this.getOccupancyPercent(b),
      )
    },
  },

  async mounted() {
    await this.loadLeaflet()
    this.initMap()
    this.subscribeToCanteens()
  },

  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
    if (this.map) this.map.remove()
  },

  methods: {
    // ── Leaflet dynamic import ────────────────────────────────────────────────
    async loadLeaflet() {
      if (window.L) return
      // Load Leaflet CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
      // Load Leaflet JS
      await new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
        script.onload = resolve
        document.head.appendChild(script)
      })
    },

    // ── Map initialisation ────────────────────────────────────────────────────
    initMap() {
      const L = window.L
      this.map = L.map('leaflet-map', {
        center: [1.2966, 103.7764], // NUS centre
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map)
    },

    // ── Firestore real-time ───────────────────────────────────────────────────
    subscribeToCanteens() {
      this.unsubscribe = onSnapshot(collection(db, 'canteens'), (snap) => {
        this.canteens = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        this.loading = false
        this.refreshMarkers()
      })
    },

    // ── Markers ───────────────────────────────────────────────────────────────
    refreshMarkers() {
      const L = window.L
      if (!L || !this.map) return

      // Remove old markers
      Object.values(this.markers).forEach((m) => m.remove())
      this.markers = {}

      this.canteens.forEach((c) => {
        const coords = CANTEEN_COORDS[c.id]
        if (!coords) return

        const pct = this.getOccupancyPercent(c)
        const color = pct >= 70 ? '#ef4444' : pct >= 40 ? '#f97316' : '#22c55e'
        const label = this.getCrowdLabel(c)

        // Custom circle marker
        const marker = L.circleMarker(coords, {
          radius: 14,
          fillColor: color,
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.92,
        })

        // Popup
        const popupHtml = `
          <div style="font-family:Arial,sans-serif;min-width:180px;">
            <div style="font-weight:800;font-size:1rem;color:#0A1C3E;margin-bottom:4px;">${c.name}</div>
            <div style="color:${color};font-weight:700;font-size:0.85rem;margin-bottom:6px;">● ${label} (${Math.round(pct)}%)</div>
            <div style="background:#f3f4f6;border-radius:6px;height:6px;margin-bottom:6px;">
              <div style="background:${color};height:6px;border-radius:6px;width:${Math.min(pct,100)}%;"></div>
            </div>
            <div style="font-size:0.8rem;color:#666;">${c.occupiedSeats} / ${c.totalSeats} seats occupied</div>
            <button onclick="window.__canteenNav('${c.id}')"
              style="margin-top:10px;width:100%;background:#0A1C3E;color:white;border:none;padding:8px;border-radius:6px;cursor:pointer;font-weight:700;font-size:0.85rem;">
              View Details →
            </button>
          </div>
        `
        marker.bindPopup(popupHtml, { maxWidth: 220 })

        marker.on('click', () => {
          this.selectedCanteenId = c.id
        })

        marker.addTo(this.map)
        this.markers[c.id] = marker
      })

      // Global bridge for popup button
      window.__canteenNav = (id) => {
        this.$router.push({ name: 'CanteenDetail', params: { id } })
      }
    },

    // ── Focus a canteen on the map ────────────────────────────────────────────
    focusCanteen(canteen) {
      const coords = CANTEEN_COORDS[canteen.id]
      if (!coords || !this.map) return
      this.selectedCanteenId = canteen.id
      this.map.flyTo(coords, 17, { animate: true, duration: 0.8 })
      const marker = this.markers[canteen.id]
      if (marker) setTimeout(() => marker.openPopup(), 800)
    },

    // ── Route drawing (OSRM real walking path) ────────────────────────────────
    async showRoute() {
      const L = window.L
      if (!this.startCanteenId || !this.destCanteenId) return
      if (this.startCanteenId === this.destCanteenId) return

      const start = this.canteens.find((c) => c.id === this.startCanteenId)
      const dest  = this.canteens.find((c) => c.id === this.destCanteenId)
      const startCoords = CANTEEN_COORDS[this.startCanteenId]
      const destCoords  = CANTEEN_COORDS[this.destCanteenId]
      if (!startCoords || !destCoords) return

      // Remove existing route
      if (this.routeLine) {
        this.routeLine.remove()
        this.routeLine = null
      }
      this.activeRoute  = null
      this.routeError   = null
      this.routeLoading = true

      try {
        // OSRM public API — foot profile, returns GeoJSON
        const url =
          `https://router.project-osrm.org/route/v1/foot/` +
          `${startCoords[1]},${startCoords[0]};${destCoords[1]},${destCoords[0]}` +
          `?overview=full&geometries=geojson`

        const res  = await fetch(url)
        const data = await res.json()

        if (data.code !== 'Ok' || !data.routes?.length) {
          throw new Error('No route found')
        }

        const route = data.routes[0]
        // GeoJSON coords are [lng, lat] — flip to [lat, lng] for Leaflet
        const latlngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

        this.routeLine = L.polyline(latlngs, {
          color: '#F37021',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(this.map)

        this.map.fitBounds(this.routeLine.getBounds(), { padding: [60, 60] })

        const distanceKm = (route.distance / 1000).toFixed(2)
        const walkMins   = Math.round(route.duration / 60)

        this.activeRoute = { start, dest, distanceKm, walkMins }

      } catch (err) {
        this.routeError = 'Could not load walking route. Please try again.'
        // Fallback: straight dashed line with estimated distance
        this.routeLine = L.polyline([startCoords, destCoords], {
          color: '#F37021',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 8',
        }).addTo(this.map)
        this.map.fitBounds([startCoords, destCoords], { padding: [60, 60] })
        const dist = calcDistance(startCoords[0], startCoords[1], destCoords[0], destCoords[1])
        this.activeRoute = {
          start, dest,
          distanceKm: dist.toFixed(2),
          walkMins: Math.round((dist / 5) * 60),
        }
      } finally {
        this.routeLoading = false
      }
    },

    clearRoute() {
      if (this.routeLine) {
        this.routeLine.remove()
        this.routeLine = null
      }
      this.activeRoute = null
      this.routeError = null
      this.startCanteenId = ''
      this.destCanteenId = ''
    },

    swapPoints() {
      const tmp = this.startCanteenId
      this.startCanteenId = this.destCanteenId
      this.destCanteenId = tmp
    },

    // ── Helpers ───────────────────────────────────────────────────────────────
    getOccupancyPercent(c) {
      if (!c.totalSeats) return 0
      return Math.min((c.occupiedSeats / c.totalSeats) * 100, 100)
    },
    getOccupancyDisplay(c) {
      return Math.round(this.getOccupancyPercent(c))
    },
    getCrowdClass(c) {
      const p = this.getOccupancyPercent(c)
      if (p >= 70) return 'high'
      if (p >= 40) return 'medium'
      return 'low'
    },
    getCrowdLabel(c) {
      const p = this.getOccupancyPercent(c)
      if (p >= 70) return 'High Crowd'
      if (p >= 40) return 'Medium Crowd'
      return 'Low Crowd'
    },
    async logout() {
      await signOut(auth)
      this.$router.push({ name: 'Landing' })
    },
  },
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.map-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  background: #f0f2f5;
}

/* ── Header (matches CommunityView) ── */
header {
  background-color: #0A1C3E;
  padding: 12px 40px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  flex-shrink: 0;
}
.logo-section { display: flex; align-items: center; gap: 2px; }
.logo-nus  { color: #F37021; font-weight: 800; font-size: 1.2rem; }
.logo-text { font-weight: 700; font-size: 1.2rem; color: white; }
.nav-links { display: flex; gap: 6px; }
.nav-links a {
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  transition: 0.2s;
  cursor: pointer;
}
.nav-links a:hover, .nav-links a.active { color: white; background: rgba(255,255,255,0.15); }
.logout-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.35);
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 6px;
  transition: 0.2s;
}
.logout-btn:hover { color: white; background: rgba(255,255,255,0.12); }

/* ── Page body ── */
.page-body {
  display: flex;
  flex: 1;
  height: calc(100vh - 57px);
  overflow: hidden;
}

/* ── Sidebar ── */
.sidebar {
  width: 340px;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-inner {
  padding: 24px 20px;
  overflow-y: auto;
  height: 100%;
}

.sidebar-title { font-size: 1.25rem; font-weight: 800; color: #0A1C3E; }
.sidebar-sub   { font-size: 0.85rem; color: #888; margin-top: 2px; margin-bottom: 20px; }

/* ── Route planner ── */
.route-planner {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-group label { font-size: 0.8rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.04em; }
.field-group select {
  padding: 9px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  color: #333;
  outline: none;
  cursor: pointer;
}
.field-group select:focus { border-color: #0A1C3E; }

.swap-row { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
.route-line { flex: 1; height: 1px; background: #d1d5db; border-top: 1px dashed #d1d5db; }
.swap-btn {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: 0.2s;
  flex-shrink: 0;
}
.swap-btn:hover { background: #f3f4f6; border-color: #0A1C3E; }

.btn-route {
  width: 100%;
  margin-top: 14px;
  background: #F37021;
  color: white;
  border: none;
  padding: 11px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-route:hover:not(:disabled) { background: #d45d1a; }
.btn-route:disabled { opacity: 0.4; cursor: not-allowed; }

.route-warn { font-size: 0.8rem; color: #f97316; margin-top: 8px; text-align: center; }

/* Active route card */
.route-card {
  margin-top: 14px;
  background: white;
  border-radius: 10px;
  padding: 14px;
  border: 1.5px solid #F37021;
}
.route-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.route-badge {
  background: #F37021;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.clear-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 2px 6px;
}
.clear-btn:hover { color: #ef4444; }

.route-segment { display: flex; align-items: center; gap: 10px; }
.dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.start-dot { background: #0A1C3E; }
.end-dot   { background: #F37021; }
.route-name { font-size: 0.88rem; font-weight: 600; color: #333; }

.route-connector {
  width: 2px;
  height: 18px;
  background: repeating-linear-gradient(to bottom, #ccc 0, #ccc 4px, transparent 4px, transparent 8px);
  margin: 4px 0 4px 5px;
}

.route-meta {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  font-size: 0.82rem;
  color: #666;
  font-weight: 600;
}

.btn-details {
  width: 100%;
  margin-top: 12px;
  background: #0A1C3E;
  color: white;
  border: none;
  padding: 9px;
  border-radius: 7px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-details:hover { background: #162d56; }

/* ── Canteen list ── */
.list-title { font-size: 0.85rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  margin-bottom: 4px;
}
.list-item:hover { background: #f3f4f6; }
.list-item--active { background: #eff6ff; border: 1.5px solid #bfdbfe; }

.crowd-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.crowd-dot.low    { background: #22c55e; }
.crowd-dot.medium { background: #f97316; }
.crowd-dot.high   { background: #ef4444; }

.list-item-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.list-item-name   { font-size: 0.9rem; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.list-item-crowd  { font-size: 0.75rem; font-weight: 600; margin-top: 1px; }
.list-item-crowd.low    { color: #22c55e; }
.list-item-crowd.medium { color: #f97316; }
.list-item-crowd.high   { color: #ef4444; }

.list-item-seats { font-size: 0.75rem; color: #999; font-weight: 600; white-space: nowrap; }

/* ── Map ── */
.map-container {
  flex: 1;
  position: relative;
}
#leaflet-map {
  width: 100%;
  height: 100%;
}

/* ── Legend ── */
.map-legend {
  position: absolute;
  bottom: 24px;
  right: 16px;
  background: white;
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  z-index: 500;
  font-size: 0.82rem;
}
.legend-title { font-weight: 700; color: #333; margin-right: 2px; }
.legend-item { display: flex; align-items: center; gap: 5px; color: #555; font-weight: 600; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.legend-dot.low    { background: #22c55e; }
.legend-dot.medium { background: #f97316; }
.legend-dot.high   { background: #ef4444; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .page-body { flex-direction: column; height: auto; overflow: auto; }
  .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid #e5e7eb; }
  .sidebar-inner { overflow-y: visible; }
  .map-container { height: 50vh; }
  .nav-links { display: none; }
}
</style>
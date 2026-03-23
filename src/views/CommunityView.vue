<template>
  <div class="page-wrapper">

    <!-- ── Navigation Bar ── -->
    <nav class="navbar">
      <div class="nav-brand">
        <span class="brand-nus">NUS</span><span class="brand-pulse">CanteenPulse</span>
      </div>
      <div class="nav-links">
        <a class="nav-link active" href="#">🏠 Community</a>
        <a class="nav-link" href="#">🗺 Map</a>
        <a class="nav-link" href="#">⭐ Recommended</a>
        <a class="nav-link" href="#">♡ Favourites</a>
        <a class="nav-link" href="#">🎁 Rewards</a>
      </div>
      <div class="nav-right">
        <button class="btn-logout" @click="logout">↪ Logout</button>
      </div>
    </nav>

    <div class="community-page">

      <!-- ── Hero greeting ── -->
      <div class="hero-row">
        <div class="hero-text">
          <h1 class="hero-title">
            Hey there, <span class="hero-nus">NUS!</span>
          </h1>
          <p class="hero-sub">Let's find you the best spot to eat 🌟</p>
        </div>
        <div class="hero-mascot">🦁</div>
      </div>

      <!-- ── Search bar ── -->
      <div class="search-row">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Search canteens, food, or location..."
          />
        </div>
        <button class="btn-search">Search</button>
      </div>

      <!-- ── Sorting / Filter bar ── -->
      <div class="filter-bar">
        <button
          class="filter-btn"
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          🍽 All Canteens
        </button>
        <button
          class="filter-btn"
          :class="{ active: activeSort === 'lowest' }"
          @click="setSort('lowest')"
        >
          ↓ Lowest Crowd
        </button>
        <button
          class="filter-btn"
          :class="{ active: activeSort === 'highest' }"
          @click="setSort('highest')"
        >
          ↑ Highest Crowd
        </button>
        <button
          class="filter-btn"
          :class="{ active: activeSort === 'alpha' }"
          @click="setSort('alpha')"
        >
          🔤 A–Z
        </button>
        <div class="filter-right">
          <span class="filter-label">♡ All Levels</span>
        </div>
      </div>

      <!-- ── Loading state ── -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading canteens...</p>
      </div>

      <!-- ── Canteen grid ── -->
      <div v-else class="canteen-grid">
        <div
          class="canteen-card"
          v-for="canteen in filteredCanteens"
          :key="canteen.id"
          @click="$router.push('/canteen/' + canteen.id)"
        >
          <!-- Card image area with favourite button -->
          <div class="card-image" :style="{ background: getCardGradient(canteen) }">
            <div class="card-image-label">{{ canteen.name[0] }}</div>
            <button class="fav-btn" @click.stop>♡</button>
          </div>

          <!-- Card body -->
          <div class="card-body">
            <div class="card-title-row">
              <span class="card-name">{{ canteen.name }}</span>
              <span class="card-seats">
                {{ canteen.occupiedSeats }} / {{ canteen.totalSeats }}
              </span>
            </div>

            <div class="crowd-row">
              <span class="crowd-dot" :class="getCrowdClass(canteen)">●</span>
              <span class="crowd-text" :class="getCrowdClass(canteen)">
                {{ getCrowdLabel(canteen) }} ({{ getOccupancyPercent(canteen) }}%)
              </span>
            </div>

            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :class="getCrowdClass(canteen)"
                :style="{ width: getOccupancyPercent(canteen) + '%' }"
              ></div>
            </div>

            <p class="updated-text">Updated just now</p>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredCanteens.length === 0" class="empty-state">
          No canteens match your search.
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { collection, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '@/firebase'

export default {
  name: 'CommunityView',

  data() {
    return {
      canteens: [],
      loading: true,
      unsubscribe: null,
      searchQuery: '',
      activeFilter: 'all',
      activeSort: 'lowest',
    }
  },

  computed: {
    filteredCanteens() {
      let list = [...this.canteens]

      // Search filter
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase()
        list = list.filter((c) => c.name.toLowerCase().includes(q))
      }

      // Sorting (F-REQ-09)
      if (this.activeSort === 'lowest') {
        list.sort((a, b) => this.getOccupancyPercent(a) - this.getOccupancyPercent(b))
      } else if (this.activeSort === 'highest') {
        list.sort((a, b) => this.getOccupancyPercent(b) - this.getOccupancyPercent(a))
      } else if (this.activeSort === 'alpha') {
        list.sort((a, b) => a.name.localeCompare(b.name))
      }

      return list
    },
  },

  created() {
    // Real-time listener — crowd levels update instantly (F-REQ-03)
    this.unsubscribe = onSnapshot(collection(db, 'canteens'), (snap) => {
      this.canteens = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      this.loading = false
    })
  },

  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  },

  methods: {
    getOccupancyPercent(canteen) {
      if (!canteen.totalSeats) return 0
      return Math.min(Math.round((canteen.occupiedSeats / canteen.totalSeats) * 100), 100)
    },

    getCrowdClass(canteen) {
      const pct = this.getOccupancyPercent(canteen)
      if (pct >= 70) return 'high'
      if (pct >= 40) return 'medium'
      return 'low'
    },

    getCrowdLabel(canteen) {
      const pct = this.getOccupancyPercent(canteen)
      if (pct >= 70) return 'High Crowd'
      if (pct >= 40) return 'Medium Crowd'
      return 'Low Crowd'
    },

    // Each canteen card gets a unique gradient based on its name
    getCardGradient(canteen) {
      const gradients = [
        'linear-gradient(135deg, #1e3a6e, #2d5299)',
        'linear-gradient(135deg, #7c3aed, #4f46e5)',
        'linear-gradient(135deg, #0f766e, #0891b2)',
        'linear-gradient(135deg, #b45309, #d97706)',
        'linear-gradient(135deg, #be123c, #e11d48)',
        'linear-gradient(135deg, #166534, #15803d)',
      ]
      const idx = canteen.name.charCodeAt(0) % gradients.length
      return gradients[idx]
    },

    setFilter(f) { this.activeFilter = f },
    setSort(s) { this.activeSort = s },

    async logout() {
      await signOut(auth)
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrapper {
  min-height: 100vh;
  background: #f4f6fb;
  font-family: 'DM Sans', Arial, sans-serif;
}

/* ── Navbar ── */
.navbar {
  display: flex;
  align-items: center;
  background: #1e3a6e;
  padding: 0 32px;
  height: 56px;
  gap: 8px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.nav-brand {
  font-size: 1.15rem;
  font-weight: 900;
  margin-right: 16px;
  white-space: nowrap;
}
.brand-nus   { color: #e87722; }
.brand-pulse { color: white; }

.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
}

.nav-link {
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.nav-link:hover, .nav-link.active {
  background: rgba(255,255,255,0.12);
  color: white;
}

.nav-right { margin-left: auto; }

.btn-logout {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.35);
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-logout:hover { background: rgba(255,255,255,0.12); }

/* ── Community page body ── */
.community-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 28px 60px;
}

/* ── Hero ── */
.hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}

.hero-title {
  font-size: 2.6rem;
  font-weight: 900;
  color: #1e3a6e;
  line-height: 1.1;
}
.hero-nus { color: #e87722; }

.hero-sub {
  color: #666;
  font-size: 1rem;
  margin-top: 6px;
}

.hero-mascot {
  font-size: 4rem;
  line-height: 1;
}

/* ── Search ── */
.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 14px;
  gap: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.search-icon { font-size: 1rem; color: #aaa; }

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.95rem;
  font-family: inherit;
  padding: 12px 0;
  color: #333;
  background: transparent;
}

.btn-search {
  background: #e87722;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-search:hover { background: #d4681a; }

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.filter-btn {
  background: white;
  border: 1px solid #e2e8f0;
  color: #555;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.filter-btn:hover { border-color: #1e3a6e; color: #1e3a6e; }
.filter-btn.active {
  background: #1e3a6e;
  border-color: #1e3a6e;
  color: white;
}

.filter-right { margin-left: auto; }
.filter-label {
  font-size: 0.85rem;
  color: #888;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
}

/* ── Loading ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: #999;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #1e3a6e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Canteen grid ── */
.canteen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

/* ── Canteen card ── */
.canteen-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}
.canteen-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.13);
}

.card-image {
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image-label {
  font-size: 4rem;
  font-weight: 900;
  color: rgba(255,255,255,0.2);
  user-select: none;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.fav-btn:hover { background: rgba(255,255,255,0.35); }

.card-body {
  padding: 16px 18px 18px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.card-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1a202c;
  line-height: 1.3;
}

.card-seats {
  font-size: 0.8rem;
  color: #999;
  white-space: nowrap;
  margin-left: 8px;
}

.crowd-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.crowd-dot { font-size: 0.7rem; }
.crowd-text { font-size: 0.82rem; font-weight: 600; }

/* Crowd colour classes (F-REQ-03) */
.low    { color: #16a34a; }
.medium { color: #ea580c; }
.high   { color: #dc2626; }

.progress-bar-bg {
  background: #f1f5f9;
  border-radius: 999px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.progress-bar-fill.low    { background: #22c55e; }
.progress-bar-fill.medium { background: #f97316; }
.progress-bar-fill.high   { background: #ef4444; }

.updated-text {
  font-size: 0.75rem;
  color: #bbb;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  padding: 60px 0;
  font-size: 1rem;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .canteen-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: none; }
}
@media (max-width: 560px) {
  .canteen-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 1.8rem; }
}
</style>
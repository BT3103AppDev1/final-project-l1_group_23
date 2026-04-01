<template>
  <div class="page-wrapper">
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
        <button class="logout-btn" @click="handleLogout">↪ Logout</button>
      </div>
    </header>

    <main>
      <div class="hero-wrapper">
        <div class="hero-text-block">
          <h1>🏆 Top <span class="nus">Recommendations</span></h1>
          <p>Based on real-time crowd data — least crowded first</p>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Fetching real-time crowd data...</p>
      </div>

      <div v-else-if="error && !canteens.length" class="loading-state">
        <p style="color:#e74c3c;">⚠️ {{ error }}</p>
        <button class="search-button" @click="fetchCanteens" style="margin-top:12px;">Retry</button>
      </div>

      <div v-else class="canteen-grid">
        <div
          class="canteen-card"
          v-for="(canteen, index) in sortedCanteens"
          :key="canteen.id"
          :class="{ 'is-top': index === 0 }"
          @click="$router.push({ name: 'CanteenDetail', params: { id: canteen.id } })"
        >
          <div v-if="index === 0" class="top-ribbon">🏆 Top Pick</div>

          <div class="canteen-image-container">
            <img
              :src="getLocalImage(canteen.name)"
              :alt="canteen.name"
              @error="(e) => (e.target.src = baseUrl + 'Img/pgp.jpg')"
            />
            <div class="card-actions">
              <button
                class="card-action-btn"
                :class="{ liked: favStore.isFavourite(canteen.id) }"
                @click.stop="favStore.toggle(canteen.id)"
              >♥</button>
            </div>
          </div>

          <div class="canteen-info">
            <div class="canteen-title">{{ canteen.name }}</div>
            <div class="status-line">
              <span class="status-level" :class="getCrowdClass(canteen)">
                <span class="status-dot" :class="getCrowdClass(canteen)"></span>
                {{ getCrowdLabel(canteen) }} ({{ getOccupancyDisplay(canteen) }}%)
              </span>
              <span class="status-count">{{ canteen.occupiedSeats }} / {{ canteen.totalSeats }}</span>
            </div>
            <div class="progress-bar-container">
              <div
                class="progress-bar-fill"
                :class="getCrowdClass(canteen)"
                :style="{ width: getOccupancyPercent(canteen) + '%' }"
              ></div>
            </div>
            <div class="updated-time">Updated just now</div>
          </div>
        </div>

        <div v-if="sortedCanteens.length === 0" class="no-results">
          No canteen data available right now.
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { collection, onSnapshot } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '@/firebase'
import { RouterLink } from 'vue-router'
import { useFavouritesStore } from '@/stores/favourites'

export default {
  name: 'RecommendedView',
  components: { RouterLink },
  setup() {
    const favStore = useFavouritesStore()
    return { favStore }
  },
  data() {
    const baseUrl = import.meta.env.BASE_URL
    return {
      canteens: [],
      loading: true,
      error: null,
      unsubscribe: null,
      baseUrl,
      imageMap: {
        'PGP Aircon Canteen':         baseUrl + 'Img/pgp.jpg',
        'Frontier (Science Canteen)': baseUrl + 'Img/Frontier.jpg',
        'Central Square @ YIH':       baseUrl + 'Img/YIH.jpg',
        'Fine Food @ UTown':          baseUrl + 'Img/FineFood.jpg',
        'The Deck':                   baseUrl + 'Img/deck.jpg',
        'Flavours @ UTown':           baseUrl + 'Img/Flavours.jpg',
        'TechnoEdge':                 baseUrl + 'Img/TechnoEdge.jpg',
        'The Terrace @ COM3':         baseUrl + 'Img/Terrace.jpg',
      },
    }
  },
  computed: {
    sortedCanteens() {
      return [...this.canteens].sort(
        (a, b) => this.getOccupancyPercent(a) - this.getOccupancyPercent(b)
      )
    },
  },
  created() {
    this.fetchCanteens()
  },
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    fetchCanteens() {
      this.loading = true
      this.error = null
      this.unsubscribe = onSnapshot(
        collection(db, 'canteens'),
        (snap) => {
          this.canteens = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          this.loading = false
        },
        (err) => {
          console.error(err)
          this.error = 'Live data unavailable.'
          this.loading = false
        }
      )
    },
    getLocalImage(name) {
      return this.imageMap[name] || this.baseUrl + 'Img/pgp.jpg'
    },
    getOccupancyPercent(canteen) {
      if (!canteen.totalSeats) return 0
      return Math.min((canteen.occupiedSeats / canteen.totalSeats) * 100, 100)
    },
    getOccupancyDisplay(canteen) {
      return Math.round(this.getOccupancyPercent(canteen))
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
    async handleLogout() {
      await signOut(auth)
      this.$router.push({ name: 'Landing' })
    },
  },
}
</script>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(160deg, #dce8f5 0%, #f0e8e0 100%);
  font-family: Arial, sans-serif;
}

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
  z-index: 100;
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
}
.nav-links a:hover,
.nav-links a.active { color: white; background: rgba(255,255,255,0.15); }
.user-controls { display: flex; align-items: center; }
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

main { padding: 0 40px 60px; display: flex; flex-direction: column; align-items: center; }

.hero-wrapper {
  margin: 40px 0 32px;
  width: 100%;
  max-width: 1100px;
  text-align: center;
}
.hero-text-block h1 { font-size: 2.4rem; font-weight: 800; color: #0A1C3E; margin-bottom: 6px; }
.nus { color: #F37021; }
.hero-text-block p { font-size: 1.1rem; color: #555; }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; color: #999; }
.spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #0A1C3E; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.canteen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; width: 100%; max-width: 1100px; }

.canteen-card { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.07); cursor: pointer; position: relative; transition: transform 0.25s ease, box-shadow 0.25s ease; }
.canteen-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
.canteen-card.is-top { border: 2px solid #F37021; }

.top-ribbon {
  position: absolute;
  top: 10px; left: 10px;
  background: #F37021;
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  z-index: 2;
}

.canteen-image-container { position: relative; height: 185px; }
.canteen-image-container img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
.canteen-card:hover img { transform: scale(1.05); }

.card-actions { position: absolute; top: 10px; right: 10px; }
.card-action-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.92); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: 0.2s; color: #ccc; }
.card-action-btn:hover { background: white; }
.card-action-btn.liked { color: #e74c3c; }

.canteen-info { padding: 16px; }
.canteen-title { font-weight: 700; font-size: 1rem; margin-bottom: 10px; color: #2A2A2A; }
.status-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; align-items: center; }
.status-level { display: flex; align-items: center; font-weight: 600; }
.status-count { color: #888; font-weight: 700; font-size: 12px; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.progress-bar-container { height: 7px; background: #eee; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s ease; }

.low    { color: #2ecc71; }
.medium { color: #e67e22; }
.high   { color: #e74c3c; }
.progress-bar-fill.low    { background: #2ecc71; }
.progress-bar-fill.medium { background: #e67e22; }
.progress-bar-fill.high   { background: #e74c3c; }
.status-dot.low    { background: #2ecc71; }
.status-dot.medium { background: #e67e22; }
.status-dot.high   { background: #e74c3c; }

.updated-time { font-size: 11px; color: #aaa; text-align: right; }
.no-results { grid-column: 1 / -1; font-size: 1rem; color: #888; text-align: center; padding: 60px 0; }

@media (max-width: 900px) {
  .canteen-grid { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: none; }
}
@media (max-width: 600px) {
  .canteen-grid { grid-template-columns: 1fr; }
  main { padding: 0 16px 40px; }
  .hero-text-block h1 { font-size: 1.8rem; }
}
</style>

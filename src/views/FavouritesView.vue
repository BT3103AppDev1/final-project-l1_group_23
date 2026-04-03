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
        <RouterLink to="/settings" active-class="active">⚙️ Settings</RouterLink>
      </nav>
      <div class="user-controls">
        <button class="logout-btn" @click="logout">↪ Logout</button>
      </div>
    </header>

    <main>
      <div class="page-header">
        <h1>❤️ My Favourites</h1>
        <p class="page-sub">Quick access to your go-to food spots</p>
      </div>

      <div v-if="loading" class="status-block">
        <div class="spinner"></div>
        <p>Loading your favourites...</p>
      </div>

      <div v-else-if="favouriteCanteens.length === 0" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>No favourites yet</h3>
        <p>
          Browse canteens and tap the <span class="heart-inline">♥</span> button to save your go-to
          spots here.
        </p>
        <RouterLink to="/community" class="browse-btn">Browse Canteens</RouterLink>
      </div>

      <div v-else class="canteen-grid">
        <div
          class="canteen-card"
          v-for="canteen in favouriteCanteens"
          :key="canteen.id"
          @click="goToCanteen(canteen)"
        >
          <div class="canteen-image-container">
            <img :src="getLocalImage(canteen.name)" :alt="canteen.name" />
            <div class="card-actions">
              <button
                class="card-action-btn liked"
                @click.stop="favStore.toggle(canteen.id)"
                title="Remove from favourites"
              >
                ♥
              </button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">{{ canteen.name }}</div>
            <div class="status-line">
              <span class="status-level" :class="getCrowdClass(canteen)">
                <span class="status-dot" :class="getCrowdClass(canteen)"></span>
                {{ getCrowdLabel(canteen) }} ({{ getOccupancyDisplay(canteen) }}%)
              </span>
              <span class="status-count"
                >{{ canteen.occupiedSeats }} / {{ canteen.totalSeats }}</span
              >
            </div>
            <div class="progress-bar-container">
              <div
                class="progress-bar-fill"
                :class="getCrowdClass(canteen)"
                :style="{ width: getOccupancyPercent(canteen) + '%' }"
              ></div>
            </div>
            <div class="updated-time">Updated {{ relativeTime(canteen.lastUpdated) }}</div>
          </div>
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
  name: 'FavouritesView',
  components: { RouterLink },

  setup() {
    const favStore = useFavouritesStore()
    const baseUrl = import.meta.env.BASE_URL
    return { favStore, baseUrl }
  },

  data() {
    return {
      canteens: [],
      loading: true,
      unsubscribe: null,
      imageMap: {},
    }
  },

  computed: {
    favouriteCanteens() {
      return this.canteens.filter((c) => this.favStore.isFavourite(c.id))
    },
  },

  async created() {
    this.imageMap = {
      'PGP Aircon Canteen': this.baseUrl + 'Img/pgp.jpg',
      'Frontier (Science Canteen)': this.baseUrl + 'Img/Frontier.jpg',
      'Central Square @ YIH': this.baseUrl + 'Img/YIH.jpg',
      'Fine Food @ UTown': this.baseUrl + 'Img/FineFood.jpg',
      'The Deck': this.baseUrl + 'Img/deck.jpg',
      'Flavours @ UTown': this.baseUrl + 'Img/Flavours.jpg',
      TechnoEdge: this.baseUrl + 'Img/TechnoEdge.jpg',
      'The Terrace @ COM3': this.baseUrl + 'Img/Terrace.jpg',
      'Business Canteen (BIZ2)': this.baseUrl + 'Img/pgp.jpg',
      'MD6 Canteen (Medicine)': this.baseUrl + 'Img/pgp.jpg',
    }
    await this.favStore.load()
    this.unsubscribe = onSnapshot(collection(db, 'canteens'), (snap) => {
      this.canteens = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      this.loading = false
    })
  },

  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  },

  methods: {
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
    relativeTime(ts) {
      if (!ts) return 'just now'
      const date = ts.toDate ? ts.toDate() : new Date(ts)
      const mins = Math.floor((Date.now() - date.getTime()) / 60000)
      if (mins < 1) return 'just now'
      if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
      const hrs = Math.floor(mins / 60)
      return `about ${hrs} hour${hrs > 1 ? 's' : ''} ago`
    },
    goToCanteen(canteen) {
      this.$router.push({ name: 'CanteenDetail', params: { id: canteen.id } })
    },
    async logout() {
      await signOut(auth)
      this.$router.push({ name: 'Landing' })
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-wrapper {
  min-height: 100vh;
  background: #f0f2f8;
  font-family: Arial, sans-serif;
}

header {
  background-color: #0a1c3e;
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

.logo-section {
  display: flex;
  align-items: center;
  gap: 2px;
}
.logo-nus {
  color: #f37021;
  font-weight: 800;
  font-size: 1.2rem;
}
.logo-text {
  font-weight: 700;
  font-size: 1.2rem;
  color: white;
}

.nav-links {
  display: flex;
  gap: 6px;
}
.nav-links a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  transition: 0.2s;
}
.nav-links a:hover,
.nav-links a.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
}

.user-controls {
  display: flex;
  align-items: center;
}
.logout-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 6px;
  transition: 0.2s;
}
.logout-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.12);
}

main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 60px;
}

.page-header {
  margin-bottom: 28px;
}
.page-header h1 {
  font-size: 2rem;
  font-weight: 900;
  color: #1a1a2e;
}
.page-sub {
  color: #888;
  font-size: 0.9rem;
  margin-top: 4px;
}

.status-block {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e7eb;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}
.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
}
.empty-state h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 10px;
}
.empty-state p {
  font-size: 0.92rem;
  max-width: 340px;
  margin: 0 auto 24px;
}
.heart-inline {
  color: #e74c3c;
}
.browse-btn {
  display: inline-block;
  background: #f97316;
  color: #fff;
  text-decoration: none;
  padding: 10px 26px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: background 0.14s;
}
.browse-btn:hover {
  background: #e0621a;
}

.canteen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
}

.canteen-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.canteen-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
}

.canteen-image-container {
  position: relative;
  height: 185px;
}
.canteen-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.canteen-card:hover img {
  transform: scale(1.05);
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}
.card-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  color: #ccc;
}
.card-action-btn:hover {
  transform: scale(1.15);
  background: white;
}
.card-action-btn.liked {
  color: #e74c3c;
}

.canteen-info {
  padding: 16px;
}
.canteen-title {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 10px;
  color: #2a2a2a;
}

.status-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
  align-items: center;
}
.status-level {
  display: flex;
  align-items: center;
  font-weight: 600;
}
.status-count {
  color: #888;
  font-weight: 700;
  font-size: 12px;
}
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.progress-bar-container {
  height: 7px;
  background: #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}
.updated-time {
  font-size: 11px;
  color: #bbb;
  text-align: right;
}

.low {
  color: #2ecc71;
}
.medium {
  color: #e67e22;
}
.high {
  color: #e74c3c;
}
.progress-bar-fill.low {
  background: #2ecc71;
}
.progress-bar-fill.medium {
  background: #e67e22;
}
.progress-bar-fill.high {
  background: #e74c3c;
}
.status-dot.low {
  background: #2ecc71;
}
.status-dot.medium {
  background: #e67e22;
}
.status-dot.high {
  background: #e74c3c;
}

@media (max-width: 900px) {
  .canteen-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .nav-links {
    display: none;
  }
}
@media (max-width: 600px) {
  .canteen-grid {
    grid-template-columns: 1fr;
  }
  main {
    padding: 24px 16px 40px;
  }
}
</style>

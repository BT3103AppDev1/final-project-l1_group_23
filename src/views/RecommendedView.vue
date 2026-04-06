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

    <div class="hero-banner">
      <div class="hero-center">
        <div class="hero-title">
          <span class="trophy">🏆</span>
          <h1>Top Recommendations</h1>
        </div>
        <p class="hero-sub">Based on real-time crowd data for the best dining experience</p>
      </div>
      <div class="ranking-note">
        <strong
          >Canteens<br />Ranked in descending<br />order according to<br />occupancy level</strong
        >
        <div class="arrow">↗</div>
      </div>
    </div>

    <div v-if="loading" class="status-block">
      <div class="spinner"></div>
      <p>Fetching real-time crowd data...</p>
    </div>

    <div v-else-if="error && !canteens.length" class="status-block">
      <p class="err">⚠️ {{ error }}</p>
      <button class="retry-btn" @click="fetchCanteens">Retry</button>
    </div>

    <div v-else class="content-area">
      <div class="section-row">
        <div class="left-label">
          <span class="badge-choice">#1 CHOICE</span>
          <span class="label-bold">Best Place Right Now</span>
        </div>
        <div class="right-label" v-if="sortedCanteens.length > 1">
          Also Great: <strong>Runners Up</strong>
        </div>
      </div>

      <div class="cards-grid">
        <div
          v-for="(canteen, index) in sortedCanteens"
          :key="canteen.id"
          class="canteen-card"
          :class="{ 'is-top': index === 0 }"
          @click="goToCanteen(canteen)"
        >
          <div v-if="index === 0" class="top-ribbon">Top Pick</div>
          <div class="img-wrap">
            <img
              :src="getLocalImage(canteen.name)"
              :alt="canteen.name"
              class="card-img"
              @error="(e) => (e.target.src = baseUrl + 'Img/pgp.jpg')"
            />
            <button class="fav-btn" @click.stop="favStore.toggle(canteen.id)">
              {{ favStore.isFavourite(canteen.id) ? '❤️' : '🤍' }}
            </button>
          </div>
          <div class="card-body">
            <h3 class="canteen-name">{{ canteen.name }}</h3>
            <div class="crowd-row">
              <span class="dot" :class="crowdClass(canteen.pct)"></span>
              <span class="crowd-lbl" :class="crowdClass(canteen.pct)">
                {{ crowdLabel(canteen.pct) }} ({{ canteen.pct }}%)
              </span>
              <span class="capacity">{{ canteen.occupiedSeats }} / {{ canteen.totalSeats }}</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="crowdClass(canteen.pct)"
                :style="{ width: canteen.pct + '%' }"
              ></div>
            </div>
            <p class="updated-time">Updated {{ relativeTime(canteen.lastUpdated) }}</p>
          </div>
        </div>
      </div>

      <div v-if="!sortedCanteens.length" class="status-block">
        <p>No canteen data available right now.</p>
      </div>
    </div>
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
    const baseUrl = import.meta.env.BASE_URL
    return { favStore, baseUrl }
  },

  data() {
    return {
      canteens: [],
      loading: true,
      error: null,
      unsubscribe: null,
      imageMap: {},
    }
  },

  computed: {
    sortedCanteens() {
      return [...this.canteens].sort((a, b) => a.pct - b.pct)
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
          this.canteens = snap.docs.map((d) => {
            const data = d.data()
            const occupied = data.occupiedSeats ?? 0
            const total = data.totalSeats ?? 1
            return {
              id: d.id,
              name: data.name ?? 'Unknown Canteen',
              occupiedSeats: occupied,
              totalSeats: total,
              pct: Math.min(100, Math.round((occupied / total) * 100)),
              lastUpdated: data.lastUpdated ?? null,
            }
          })
          this.loading = false
        },
        (err) => {
          console.error(err)
          this.error = 'Live data unavailable — please try again.'
          this.loading = false
        },
      )
    },

    getLocalImage(name) {
      return this.imageMap[name] || this.baseUrl + 'Img/pgp.jpg'
    },

    crowdClass(pct) {
      if (pct >= 70) return 'high'
      if (pct >= 40) return 'mid'
      return 'low'
    },

    crowdLabel(pct) {
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
  align-items: center;  /* ← ensures all links sit on the same baseline */
}
.nav-links a {
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  transition: 0.2s;
  display: flex;           /* ← makes each link a flex container */
  align-items: center;     /* ← vertically centres emoji + text inside each link */
  gap: 4px;
  line-height: 1;          /* ← prevents line-height from inflating link height */
}
.nav-links a span,
.nav-links a {
  vertical-align: middle;  /* ← normalises emoji rendering across browsers */
}
.nav-links a:hover,
.nav-links a.active { color: white; background: rgba(255,255,255,0.15); }

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

.hero-banner {
  background: linear-gradient(135deg, #c43a0c 0%, #e8601e 40%, #f48c3a 75%, #f8ab55 100%);
  padding: 28px 48px 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 120px;
  overflow: hidden;
}
.hero-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 68% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 55%);
  pointer-events: none;
}
.hero-center {
  text-align: center;
  flex: 1;
  position: relative;
  z-index: 1;
}
.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 5px;
}
.trophy {
  font-size: 2rem;
}
.hero-title h1 {
  font-size: 1.95rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.18);
}
.hero-sub {
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.86rem;
}
.ranking-note {
  position: absolute;
  right: 36px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 0.73rem;
  padding: 9px 13px;
  border-radius: 10px;
  text-align: center;
  line-height: 1.5;
  max-width: 155px;
}
.arrow {
  font-size: 1.4rem;
  margin-top: 3px;
}

.content-area {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 24px 48px;
}
.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}
.left-label {
  display: flex;
  align-items: center;
  gap: 9px;
}
.badge-choice {
  background: #fef08a;
  color: #78350f;
  font-size: 0.69rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
}
.label-bold {
  font-weight: 700;
  font-size: 0.93rem;
  color: #111;
}
.right-label {
  font-size: 0.88rem;
  color: #555;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.canteen-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition:
    transform 0.17s,
    box-shadow 0.17s;
}
.canteen-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.13);
}
.canteen-card.is-top {
  border: 2px solid #e8601e;
}

.top-ribbon {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #e8601e;
  color: #fff;
  font-size: 0.67rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  z-index: 2;
}
.img-wrap {
  position: relative;
  height: 148px;
  overflow: hidden;
  background: #e5e7eb;
}
.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.canteen-card:hover .card-img {
  transform: scale(1.05);
}

.fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.88);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  z-index: 3;
  transition: transform 0.14s;
}
.fav-btn:hover {
  transform: scale(1.18);
}

.card-body {
  padding: 11px 13px 13px;
}
.canteen-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 7px;
}
.crowd-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.low {
  background: #2ecc71;
}
.dot.mid {
  background: #e67e22;
}
.dot.high {
  background: #e74c3c;
}
.crowd-lbl {
  font-size: 0.74rem;
  font-weight: 600;
}
.crowd-lbl.low {
  color: #16a34a;
}
.crowd-lbl.mid {
  color: #b45309;
}
.crowd-lbl.high {
  color: #dc2626;
}
.capacity {
  margin-left: auto;
  font-size: 0.7rem;
  color: #bbb;
}
.bar-track {
  height: 5px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 6px;
}
.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}
.bar-fill.low {
  background: #2ecc71;
}
.bar-fill.mid {
  background: #e67e22;
}
.bar-fill.high {
  background: #e74c3c;
}
.updated-time {
  font-size: 0.67rem;
  color: #ccc;
  text-align: right;
}

.status-block {
  text-align: center;
  padding: 56px 20px;
  color: #888;
}
.err {
  color: #dc2626;
  margin-bottom: 10px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #e8601e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto 10px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.retry-btn {
  background: #e8601e;
  color: #fff;
  border: none;
  padding: 7px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 580px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .hero-title h1 {
    font-size: 1.45rem;
  }
  .ranking-note,
  .nav-links {
    display: none;
  }
}
</style>

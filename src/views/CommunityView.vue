<template>
  <div class="page-wrapper">
    <header>
      <div class="logo-section">
        <span class="logo-nus">NUS</span><span class="logo-text">CanteenPulse</span>
      </div>
      <nav class="nav-links">
        <a href="#" class="active">🏠 Community</a>
        <a href="#">🗺 Map</a>
        <a href="#">⭐ Recommended</a>
        <a href="#">♡ Favourites</a>
        <a href="#">🎁 Rewards</a>
      </nav>
      <div class="user-controls">
        <button class="logout-btn" @click="logout">↪ Logout</button>
      </div>
    </header>

    <main>
      <div class="hero-wrapper">
        <div class="hero-text-block">
          <h1>Hey there, <span class="nus">NUS!</span></h1>
          <p>Let's find you the best spot to eat</p>
          <div class="search-container">
            <i class="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search canteens, food, or location..."
              v-model="searchQuery"
              @input="handleInput"
              @keyup.enter="handleSearch"
            >
            <button class="search-button" @click="handleSearch">Search</button>
          </div>
        </div>
        <div class="bubble-and-lion">
          <div class="speech-bubble">Hungry? Let's go!</div>
          <img class="nus-lion-img" src="/Img/lion.jpg" alt="NUS Lion">
        </div>
      </div>

      <div class="filters">
        <button class="filter-btn" :class="{ active: activeSort === 'all' }" @click="setSort('all')">🍽 All Canteens</button>
        <button class="filter-btn" :class="{ active: activeSort === 'lowest' }" @click="setSort('lowest')">↓ Lowest Crowd</button>
        <button class="filter-btn" :class="{ active: activeSort === 'highest' }" @click="setSort('highest')">↑ Highest Crowd</button>
        <button class="filter-btn" :class="{ active: activeSort === 'alpha' }" @click="setSort('alpha')">🔤 A–Z</button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading canteens...</p>
      </div>

      <div v-else class="canteen-grid">
        <div
          class="canteen-card"
          v-for="canteen in filteredCanteens"
          :key="canteen.id"
          @click="$router.push('/canteen/' + canteen.id)"
        >
          <div class="canteen-image-container">
            <img
              :src="getLocalImage(canteen.name)"
              :alt="canteen.name"
            />
            <div class="card-actions">
              <button
                class="card-action-btn"
                :class="{ liked: favourites.includes(canteen.id) }"
                @click.stop="toggleFavourite(canteen.id)"
              >♥</button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">{{ canteen.name }}</div>
            <div class="status-line">
              <span class="status-level" :class="getCrowdClass(canteen)">
                <span class="status-dot" :class="getCrowdClass(canteen)"></span>
                {{ getCrowdLabel(canteen) }} ({{ getOccupancyPercent(canteen) }}%)
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
        <div v-if="filteredCanteens.length === 0" class="no-results">
          No canteens match your search.
        </div>
      </div>
    </main>
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
      activeSearch: '',
      activeSort: 'lowest',
      favourites: [],
      imageMap: {
        'PGP Aircon Canteen': '/Img/Pgpairconcanteen.jpg',
        'Frontier': '/Img/Frontier.jpg',
        'Central Square @ YIH': '/Img/YIH.jpg',
        'Fine Food @ UTown': '/Img/FineFood.jpg',
        'The Deck': '/Img/deck.jpg',
        'Flavours @ UTown': '/Img/Flavours.jpg',
      },
    }
  },
  computed: {
    filteredCanteens() {
      let list = [...this.canteens]
      if (this.activeSearch.trim()) {
        const q = this.activeSearch.toLowerCase()
        list = list.filter((c) => c.name.toLowerCase().includes(q))
      }
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
      return this.imageMap[name] || '/Img/pgp.jpg'
    },
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
    getCardGradient(canteen) {
      const gradients = [
        'linear-gradient(135deg, #1e3a6e, #2d5299)',
        'linear-gradient(135deg, #7c3aed, #4f46e5)',
        'linear-gradient(135deg, #0f766e, #0891b2)',
        'linear-gradient(135deg, #b45309, #d97706)',
        'linear-gradient(135deg, #be123c, #e11d48)',
        'linear-gradient(135deg, #166534, #15803d)',
      ]
      return gradients[canteen.name.charCodeAt(0) % gradients.length]
    },
    setSort(s) { this.activeSort = s },
    toggleFavourite(id) {
      const idx = this.favourites.indexOf(id)
      if (idx === -1) this.favourites.push(id)
      else this.favourites.splice(idx, 1)
    },
    handleSearch() {
      this.activeSearch = this.searchQuery.trim()
    },
    handleInput() {
      if (this.searchQuery === '') {
        this.activeSearch = ''
      }
    },
    async logout() {
      await signOut(auth)
      this.$router.push('/')
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
.nav-links a:hover, .nav-links a.active { color: white; background: rgba(255,255,255,0.15); }
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
  position: relative;
  margin: 40px 0 0;
  width: 100%;
  max-width: 1100px;
  display: flex;
  justify-content: center;
}
.hero-text-block { display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; }
.hero-text-block h1 { font-size: 3rem; font-weight: 800; color: #0A1C3E; margin-bottom: 4px; }
.nus { color: #F37021; }
.hero-text-block p { font-size: 1.1rem; color: #555; margin-bottom: 16px; }
.search-container {
  width: 620px;
  max-width: 90%;
  background: white;
  padding: 6px 6px 6px 16px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
}
.search-container input { border: none; flex: 1; padding: 10px 8px; outline: none; font-size: 15px; background: transparent; }
.search-button { background: #F37021; color: white; border: none; padding: 12px 28px; border-radius: 30px; cursor: pointer; font-weight: 700; font-size: 15px; transition: 0.2s; }
.search-button:hover { background: #d45d1a; }

.bubble-and-lion {
  position: absolute;
  left: calc(50% + 160px);
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 3;
}
.speech-bubble { background: white; padding: 5px 12px; border-radius: 14px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.12); color: #2A2A2A; white-space: nowrap; margin-bottom: -18px; }
.nus-lion-img { width: 110px; height: 110px; object-fit: contain; display: block; margin-bottom: 35px; }

.filters { display: flex; gap: 10px; margin-top: 28px; margin-bottom: 32px; flex-wrap: wrap; justify-content: center; }
.filter-btn { background: white; border: 1.5px solid #e0e0e0; padding: 9px 20px; border-radius: 24px; cursor: pointer; font-size: 13px; font-weight: 500; transition: 0.2s; }
.filter-btn:hover { border-color: #0A1C3E; color: #0A1C3E; }
.filter-btn.active { color: #1a73e8; border-color: #1a73e8; font-weight: 600; }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; color: #999; }
.spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #0A1C3E; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.canteen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; width: 100%; max-width: 1100px; }

.canteen-card { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.07); cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease; }
.canteen-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }

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
  .bubble-and-lion { display: none; }
  .nav-links { display: none; }
}
@media (max-width: 600px) {
  .canteen-grid { grid-template-columns: 1fr; }
  main { padding: 0 16px 40px; }
  .hero-text-block h1 { font-size: 2rem; }
}
</style>

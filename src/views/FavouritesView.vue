<template>
  <div class="recommended-page">
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-nus">NUS</span>
        <span class="brand-pulse">CanteenPulse</span>
      </div>

      <div class="navbar-links">
        <RouterLink to="/community" class="nav-link">
          <span class="nav-icon">⊞</span> Community
        </RouterLink>
        <RouterLink to="/map" class="nav-link"> <span class="nav-icon">⊕</span> Map </RouterLink>
        <RouterLink to="/recommended" class="nav-link active">
          <span class="nav-icon">☆</span> Recommended
        </RouterLink>
        <RouterLink to="/favourites" class="nav-link">
          <span class="nav-icon">♡</span> Favourites
        </RouterLink>
        <RouterLink to="/rewards" class="nav-link">
          <span class="nav-icon">⚑</span> Rewards
        </RouterLink>
      </div>

      <div class="navbar-right">
        <RouterLink to="/settings" class="nav-link icon-only">⚙</RouterLink>
        <button class="logout-btn" @click="handleLogout">↪ Logout</button>
      </div>
    </nav>

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
        >
          <div v-if="index === 0" class="top-ribbon">Top Pick</div>

          <div class="img-wrap">
            <img
              :src="canteen.imageUrl"
              :alt="canteen.name"
              class="card-img"
              @error="(e) => (e.target.src = fallbackImg)"
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
              <span class="capacity">{{ canteen.current }} / {{ canteen.max }}</span>
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

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { db, auth } from '@/firebase'
import { collection, onSnapshot, query, orderBy, setDoc, doc, Timestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useFavouritesStore } from '@/favourites'

const router = useRouter()
const favStore = useFavouritesStore()

const canteens = ref([])
const loading = ref(true)
const error = ref(null)
let unsub = null

const fallbackImg = '/lion.jpg'

const NUS_CANTEENS = [
  {
    id: 'pgp-aircon',
    name: 'PGP Aircon Canteen',
    maxCapacity: 300,
    imageUrl: '/pgp.jpg',
  },
  {
    id: 'frontier',
    name: 'Frontier (Science Canteen)',
    maxCapacity: 700,
    imageUrl: '/Frontier.jpg',
  },
  {
    id: 'central-square-yih',
    name: 'Central Square @ YIH',
    maxCapacity: 314,
    imageUrl: '/YIH.jpg',
  },
  {
    id: 'the-deck',
    name: 'The Deck',
    maxCapacity: 1018,
    imageUrl: '/deck.jpg',
  },
  {
    id: 'technoedge',
    name: 'TechnoEdge',
    maxCapacity: 600,
    imageUrl: '/lion.jpg',
  },
  {
    id: 'terrace-com3',
    name: 'The Terrace @ COM3',
    maxCapacity: 400,
    imageUrl: '/lion.jpg',
  },
  {
    id: 'flavours-utown',
    name: 'Flavours @ UTown',
    maxCapacity: 500,
    imageUrl: '/Flavours.jpg',
  },
  {
    id: 'fine-food-utown',
    name: 'Fine Food @ UTown',
    maxCapacity: 450,
    imageUrl: '/FineFood.jpg',
  },
  {
    id: 'pgp-canteen',
    name: "Prince George's Park Canteen",
    maxCapacity: 350,
    imageUrl: '/pgp.jpg',
  },
  {
    id: 'biz-canteen',
    name: 'Business Canteen (BIZ2)',
    maxCapacity: 300,
    imageUrl: '/lion.jpg',
  },
  {
    id: 'terrace-fass',
    name: 'Arts Canteen (FASS)',
    maxCapacity: 400,
    imageUrl: '/lion.jpg',
  },
  {
    id: 'medicine-md6',
    name: 'MD6 Canteen (Medicine)',
    maxCapacity: 200,
    imageUrl: '/lion.jpg',
  },
  {
    id: 'yst-cafe',
    name: 'YST Conservatory Café',
    maxCapacity: 120,
    imageUrl: '/lion.jpg',
  },
  {
    id: 'utown-market',
    name: 'UTown Market',
    maxCapacity: 400,
    imageUrl: '/lion.jpg',
  },
]

const sortedCanteens = computed(() => [...canteens.value].sort((a, b) => a.pct - b.pct))

function fetchCanteens() {
  loading.value = true
  error.value = null

  try {
    const q = query(collection(db, 'canteens'), orderBy('name'))

    unsub = onSnapshot(
      q,
      async (snap) => {
        const existingIds = snap.docs.map((d) => d.id)

        for (const c of NUS_CANTEENS) {
          if (!existingIds.includes(c.id)) {
            await setDoc(doc(db, 'canteens', c.id), {
              name: c.name,
              imageUrl: c.imageUrl,
              maxCapacity: c.maxCapacity,
              currentOccupancy: 0,
              lastUpdated: Timestamp.now(),
            })
          }
        }

        canteens.value = snap.docs
          .map((d) => {
            const data = d.data()
            const current = data.currentOccupancy ?? 0
            const max = data.maxCapacity ?? 1
            const local = NUS_CANTEENS.find((c) => c.id === d.id)

            return {
              id: d.id,
              name: data.name ?? local?.name ?? 'Unknown Canteen',
              imageUrl: local?.imageUrl || data.imageUrl || fallbackImg,
              current,
              max,
              pct: Math.min(100, Math.round((current / max) * 100)),
              lastUpdated: data.lastUpdated?.toDate?.() ?? new Date(),
            }
          })
          .filter((canteen) => canteen.imageUrl !== '/lion.jpg' && canteen.id !== 'pgp-canteen')

        loading.value = false
      },
      (err) => {
        console.error('Firestore error:', err)
        canteens.value = NUS_CANTEENS.map((c) => ({
          ...c,
          current: 0,
          pct: 0,
          lastUpdated: new Date(),
        })).filter((canteen) => canteen.imageUrl !== '/lion.jpg' && canteen.id !== 'pgp-canteen')

        error.value = 'Live data unavailable — showing offline list.'
        loading.value = false
      },
    )
  } catch (err) {
    console.error(err)
    error.value = 'Something went wrong.'
    loading.value = false
  }
}

function crowdClass(pct) {
  if (pct <= 33) return 'low'
  if (pct <= 66) return 'mid'
  return 'high'
}

function crowdLabel(pct) {
  if (pct <= 33) return 'Low Crowd'
  if (pct <= 66) return 'Moderate Crowd'
  return 'High Crowd'
}

function relativeTime(date) {
  if (!date) return 'unknown'
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  return `about ${hrs} hour${hrs > 1 ? 's' : ''} ago`
}

async function handleLogout() {
  await signOut(auth)
  router.push('/')
}

onMounted(fetchCanteens)
onUnmounted(() => unsub?.())
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.recommended-page {
  min-height: 100vh;
  background: #f0f0f0;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.navbar {
  background: #1a2035;
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 50px;
  gap: 0;
}

.navbar-brand {
  font-size: 1rem;
  font-weight: 800;
  margin-right: 18px;
  flex-shrink: 0;
}
.brand-nus {
  color: #f97316;
}
.brand-pulse {
  color: #fff;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 0.8rem;
  padding: 5px 11px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition:
    background 0.14s,
    color 0.14s;
  white-space: nowrap;
}
.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.nav-link.active {
  background: #f97316;
  color: #fff;
  font-weight: 600;
}
.nav-link.icon-only {
  padding: 5px 9px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.76rem;
  padding: 4px 11px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.14s;
}
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
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
  margin: 0;
  letter-spacing: -0.4px;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.18);
}

.hero-sub {
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.86rem;
  margin: 0;
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
  padding: 20px 20px 48px;
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
  letter-spacing: 0.4px;
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
  background: rgba(255, 255, 255, 0.82);
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
  margin: 0 0 7px;
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
  background: #22c55e;
}
.dot.mid {
  background: #f59e0b;
}
.dot.high {
  background: #ef4444;
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
  background: #22c55e;
}
.bar-fill.mid {
  background: #f59e0b;
}
.bar-fill.high {
  background: #ef4444;
}

.updated-time {
  font-size: 0.67rem;
  color: #ccc;
  margin: 0;
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
  font-size: 0.84rem;
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
  .navbar-links {
    display: none;
  }
}
</style>

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
      <div class="rewards-wrapper">
        <h1 class="page-title">Community Rewards</h1>
        <p class="page-subtitle">Level up by helping the community!</p>

        <div v-if="store.loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your rewards...</p>
        </div>

        <div v-else class="rewards-content">
          <!-- Top Row: Status Card + How to Earn side by side -->
          <div class="top-row">
            <!-- Current Status Card -->
            <div class="status-card" :class="store.tier.toLowerCase()">
              <!-- Top: status label left, contributions right -->
              <div class="status-top">
                <p class="status-label">🏅 CURRENT STATUS</p>
                <p class="contributions-inline">
                  CONTRIBUTIONS <span class="contributions-num">{{ store.updateCount }}</span>
                </p>
              </div>

              <!-- Body: lion left, tier info right -->
              <div class="status-body">
                <div class="lion-wrapper">
                  <img :src="baseUrl + 'Img/lion.jpg'" alt="NUS Lion" class="lion-img" />
                </div>
                <div class="tier-info">
                  <h2 class="tier-name" :class="store.tier.toLowerCase()">{{ store.tier }}</h2>
                  <p class="updates-needed" v-if="store.nextTier">
                    {{ store.updatesNeeded }} updates to {{ store.nextTier }}
                  </p>
                  <p class="updates-needed" v-else>You've reached the highest tier! 🎉</p>
                  <div class="progress-bar-bg">
                    <div
                      class="progress-bar-fill"
                      :class="store.tier.toLowerCase()"
                      :style="{ width: store.progressPercent + '%' }"
                    ></div>
                  </div>
                  <p class="progress-label">{{ Math.round(store.progressPercent) }}%</p>
                </div>
              </div>
            </div>

            <!-- How to Earn -->
            <div class="how-to-earn">
              <h3>📈 How to earn</h3>
              <div class="earn-item">
                <span class="earn-dot orange"></span>
                <span>Check in when you find a seat</span>
              </div>
              <div class="earn-item">
                <span class="earn-dot blue"></span>
                <span>Check out when you leave</span>
              </div>
              <div class="earn-item">
                <span class="earn-dot grey"></span>
                <span>Your updates help the whole campus find food faster!</span>
              </div>
            </div>
          </div>

          <!-- Tier Requirements -->
          <div class="tiers-section">
            <h3 class="tiers-title">Tier Requirements</h3>
            <div class="tiers-grid">
              <div
                class="tier-card"
                v-for="tier in tiers"
                :key="tier.name"
                :class="[tier.name.toLowerCase(), { active: store.tier === tier.name }]"
              >
                <p class="tier-card-name" :class="tier.name.toLowerCase()">{{ tier.name }}</p>
                <p class="tier-card-range">{{ tier.range }}</p>
                <p class="tier-card-label">UPDATES</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'
import { useRewardsStore } from '@/stores/rewards'

export default {
  name: 'RewardsView',
  components: { RouterLink },
  setup() {
    const store = useRewardsStore()
    return { store }
  },
  data() {
    return {
      baseUrl: import.meta.env.BASE_URL,
      tiers: [
        { name: 'Bronze', range: '0 – 4' },
        { name: 'Silver', range: '5 – 14' },
        { name: 'Gold', range: '15 – 29' },
        { name: 'Platinum', range: '30+' },
      ],
    }
  },
  created() {
    this.store.subscribe()
  },
  beforeUnmount() {
    this.store.cleanup()
  },
  methods: {
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
  background: linear-gradient(160deg, #fef3e8 0%, #fde8d8 50%, #f0e8f8 100%);
  font-family: Arial, sans-serif;
}

/* ── Header ── */
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
  align-items: center;
}
.nav-links a {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
}
.nav-links a span,
.nav-links a { vertical-align: middle; }
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

/* ── Main Layout ── */
main {
  padding: 40px;
  display: flex;
  justify-content: center;
}

.rewards-wrapper {
  width: 100%;
  max-width: 900px;
}

.page-title {
  font-size: 2rem;
  font-weight: 900;
  color: #0a1c3e;
  text-align: center;
}
.page-subtitle {
  font-size: 1rem;
  color: #888;
  text-align: center;
  margin-bottom: 32px;
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
  border-top-color: #0a1c3e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Content ── */
.rewards-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Top Row ── */
.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: stretch;
}

/* ── Status Card ── */
.status-card {
  border-radius: 20px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fde8c8 0%, #fbd6a0 100%);
}
.status-card.bronze {
  background: linear-gradient(135deg, #fde8c8 0%, #f5c882 100%);
}
.status-card.silver {
  background: linear-gradient(135deg, #e8ecf0 0%, #c8d0d8 100%);
}
.status-card.gold {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}
.status-card.platinum {
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
}

.status-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.status-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #7a5c2e;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.contributions-inline {
  font-size: 0.7rem;
  font-weight: 700;
  color: #7a5c2e;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
}
.contributions-num {
  font-size: 1.1rem;
  font-weight: 900;
  color: #0a1c3e;
}

.status-body {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.lion-wrapper {
  flex-shrink: 0;
}
.lion-img {
  width: 70px;
  height: 70px;
  object-fit: contain;
  border-radius: 12px;
}

.tier-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tier-name {
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}
.tier-name.bronze {
  color: #c07828;
}
.tier-name.silver {
  color: #5e6e7e;
}
.tier-name.gold {
  color: #b8860b;
}
.tier-name.platinum {
  color: #007a8a;
}

.updates-needed {
  font-size: 0.85rem;
  color: #555;
}

.progress-bar-bg {
  background: rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
  width: 180px;
  max-width: 100%;
}
.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}
.progress-bar-fill.bronze {
  background: #cd7f32;
}
.progress-bar-fill.silver {
  background: #9e9e9e;
}
.progress-bar-fill.gold {
  background: #d4a017;
}
.progress-bar-fill.platinum {
  background: #00bcd4;
}

.progress-label {
  font-size: 0.8rem;
  color: #777;
}

/* ── How to Earn ── */
.how-to-earn {
  background: #0a1c3e;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
}
.how-to-earn h3 {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}
.earn-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}
.earn-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.earn-dot.orange {
  background: #f37021;
}
.earn-dot.blue {
  background: #60a0ff;
}
.earn-dot.grey {
  background: #888;
}

/* ── Tier Requirements ── */
.tiers-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.tiers-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0a1c3e;
  margin-bottom: 16px;
}
.tiers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.tier-card {
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  border: 2px solid transparent;
  transition: 0.2s;
}

/* Tier card background colours matching the mockup */
.tier-card.bronze {
  background: #fff4e6;
  border-color: #f5c882;
}
.tier-card.silver {
  background: #f5f5f5;
  border-color: #ccc;
}
.tier-card.gold {
  background: #fffbea;
  border-color: #f5d76e;
}
.tier-card.platinum {
  background: #e8f8fb;
  border-color: #b2ebf2;
}

.tier-card.active {
  border-width: 2.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.tier-card.bronze.active {
  border-color: #cd7f32;
}
.tier-card.silver.active {
  border-color: #9e9e9e;
}
.tier-card.gold.active {
  border-color: #d4a017;
}
.tier-card.platinum.active {
  border-color: #00bcd4;
}

.tier-card-name {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 8px;
}
.tier-card-name.bronze {
  color: #cd7f32;
}
.tier-card-name.silver {
  color: #9e9e9e;
}
.tier-card-name.gold {
  color: #c9a208;
}
.tier-card-name.platinum {
  color: #00bcd4;
}

.tier-card-range {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0a1c3e;
}
.tier-card-label {
  font-size: 0.7rem;
  color: #999;
  letter-spacing: 1px;
  margin-top: 2px;
}

/* ── Responsive ── */
@media (max-width: 700px) {
  .top-row {
    grid-template-columns: 1fr;
  }
  .tiers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  main {
    padding: 20px;
  }
}
</style>

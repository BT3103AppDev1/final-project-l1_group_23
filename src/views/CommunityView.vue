<template>
  <div class="page-wrapper">
    <header>
      <div class="logo-section">
        <span class="logo-nus">NUS</span><span class="logo-text">CanteenPulse</span>
      </div>
      <nav class="nav-links">
        <a href="#" class="active"><i class="fas fa-users"></i> Community</a>
        <a href="#"><i class="fas fa-map-marker-alt"></i> Map</a>
        <a href="#"><i class="fas fa-star"></i> Recommended</a>
        <a href="#"><i class="fas fa-heart"></i> Favourites</a>
        <a href="#"><i class="fas fa-gift"></i> Rewards</a>
      </nav>
      <div class="user-controls">
        <i class="fas fa-cog"></i>
        <button class="logout-btn" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>

    <main>
      <div class="hero-wrapper">
        <div class="hero-text-block">
          <h1>Hey there, <span class="nus">NUS!</span></h1>
          <p>Let's find you the best spot to eat</p>
          <div class="search-container">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search canteens, food, or location...">
            <button class="search-button">Search</button>
            
            <div class="bubble-and-lion">
              <div class="speech-bubble">Hungry? Let's go!</div>
              <img class="nus-lion-img" src="/Img/lion.jpg" alt="NUS Lion">
            </div>
          </div>
        </div>
      </div>

      <div class="filters">
        <button class="filter-btn active"><i class="fas fa-utensils"></i> All Canteens</button>
        <button class="filter-btn"><i class="fas fa-sort-amount-down"></i> Lowest Crowd <i class="fas fa-chevron-down"></i></button>
        <button class="filter-btn"><i class="fas fa-layer-group"></i> All Levels <i class="fas fa-chevron-down"></i></button>
      </div>

      <div class="canteen-grid">
        <div class="canteen-card" v-for="i in 6" :key="i">
          <div class="canteen-image-container">
            <img src="/Img/pgp.jpg" alt="PGP">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">PGP Aircon Canteen</div>
            <div class="status-line">
              <span class="status-level low"><span class="status-dot low"></span> Low Crowd (16%)</span>
              <span class="status-count">50 / 308</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill low" style="width: 16%;"></div></div>
            <div class="updated-time">Updated 18 minutes ago</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { auth } from '@/firebase'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

:global(body) {
  margin: 0;
  background: linear-gradient(160deg, #dce8f5 0%, #f0e8e0 100%) !important;
  min-height: 100vh;
}

header {
  background-color: #0A1C3E;
  color: white;
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
.logo-nus { color: #F37021; font-weight: 800; font-size: 1.2rem; }
.logo-text { font-weight: 700; font-size: 1.2rem; color: white; }
.nav-links { display: flex; gap: 6px; }
.nav-links a {
  color: rgba(255,255,255,0.65);
  text-decoration: none;
  font-size: 14px;
  padding: 6px 14px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.nav-links a.active { color: white; background-color: rgba(255,255,255,0.15); }

main {
  padding: 0 40px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-wrapper {
  margin: 60px 0 20px;
  width: 100%;
  max-width: 1100px;
}

.hero-text-block h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  color: #0A1C3E;
}
.nus { color: #F37021; }

.search-container {
  width: 650px;
  max-width: 95%;
  background: white;
  padding: 8px 8px 8px 20px;
  border-radius: 50px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  margin: 30px auto;
  position: relative; /* Context for the Lion */
}

.search-container input {
  border: none;
  flex: 1;
  outline: none;
  font-size: 16px;
}

.search-button {
  background: #F37021;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 700;
}

/* LION POSITIONING */
.bubble-and-lion {
  position: absolute;
  right: 20px; /* Aligns relative to the search container edge */
  bottom: 25px; /* Pulls it up so it overlaps the bar */
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10; /* Ensures it sits ABOVE the search bar */
  pointer-events: none; /* Allows clicking the search button underneath */
}

.speech-bubble {
  background: white;
  padding: 8px 15px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: #333;
  margin-bottom: -10px; /* Overlap with lion */
  margin-right: 60px; /* Shifted left relative to lion */
  position: relative;
}

/* The Little Triangle for the Bubble */
.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  right: 20%;
  border-width: 8px 8px 0;
  border-style: solid;
  border-color: white transparent transparent;
}

.nus-lion-img {
  width: 120px; /* Slightly larger */
  height: auto;
  object-fit: contain;
}

/* FILTERS & GRID (Rest of your styles) */
.filters { display: flex; gap: 10px; margin-bottom: 40px; }
.filter-btn {
  background: white;
  border: 1px solid #eee;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-btn.active { background: #eef4ff; color: #1a73e8; border-color: #d0e0ff; }

.canteen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  width: 100%;
}
.canteen-card { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
.canteen-image-container { height: 200px; }
.canteen-image-container img { width: 100%; height: 100%; object-fit: cover; }
.canteen-info { padding: 20px; }
.progress-bar-container { height: 8px; background: #f0f0f0; border-radius: 4px; margin: 10px 0; }
.progress-bar-fill { height: 100%; border-radius: 4px; }
.progress-bar-fill.low { background: #2ecc71; }
.updated-time { font-size: 12px; color: #999; text-align: right; }
</style>

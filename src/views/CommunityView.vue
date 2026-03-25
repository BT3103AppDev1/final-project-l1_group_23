<template>
  <div>
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
        <i class="fas fa-sign-out-alt"></i> Logout
      </div>
    </header>

    <main>
      <div class="hero">
        <h1>Hey there, <span class="nus">NUS!</span></h1>
        <p>Let's find you the best spot to eat ⭐</p>
        <div class="bubble-and-lion">
          <div class="speech-bubble">Hungry? Let's go!</div>
          <div class="nus-lion">
            <img src="/Img/lion.jpg" alt="NUS Lion">
          </div>
        </div>
      </div>

      <div class="search-container">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Search canteens, food, or location...">
        <button class="search-button">Search</button>
      </div>

      <div class="filters">
        <button class="filter-btn active"><i class="fas fa-utensils"></i> All Canteens</button>
        <button class="filter-btn"><i class="fas fa-sort-amount-down"></i> Lowest Crowd <i class="fas fa-chevron-down"></i></button>
        <button class="filter-btn"><i class="fas fa-layer-group"></i> All Levels <i class="fas fa-chevron-down"></i></button>
      </div>

      <div class="canteen-grid">
        <div class="canteen-card">
          <div class="canteen-image-container">
            <img src="/Img/pgp.jpg" alt="PGP">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
              <button class="card-action-btn"><i class="fas fa-cog"></i></button>
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

        <div class="canteen-card">
          <div class="canteen-image-container">
            <img src="/Img/Frontier.jpg" alt="Frontier">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
              <button class="card-action-btn"><i class="fas fa-cog"></i></button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">Frontier</div>
            <div class="status-line">
              <span class="status-level low"><span class="status-dot low"></span> Low Crowd (21%)</span>
              <span class="status-count">150 / 700</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill low" style="width: 21%;"></div></div>
            <div class="updated-time">Updated about 4 hours ago</div>
          </div>
        </div>

        <div class="canteen-card">
          <div class="canteen-image-container">
            <img src="/Img/YIH.jpg" alt="Central Square">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
              <button class="card-action-btn"><i class="fas fa-cog"></i></button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">Central Square @ YIH</div>
            <div class="status-line">
              <span class="status-level low"><span class="status-dot low"></span> Low Crowd (32%)</span>
              <span class="status-count">100 / 314</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill low" style="width: 32%;"></div></div>
            <div class="updated-time">Updated about 4 hours ago</div>
          </div>
        </div>

        <div class="canteen-card">
          <div class="canteen-image-container">
            <img src="/Img/FineFood.jpg" alt="Fine Food">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
              <button class="card-action-btn"><i class="fas fa-cog"></i></button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">Fine Food @ UTown</div>
            <div class="status-line">
              <span class="status-level medium"><span class="status-dot medium"></span> Medium Crowd (42%)</span>
              <span class="status-count">250 / 600</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill medium" style="width: 42%;"></div></div>
            <div class="updated-time">Updated about 4 hours ago</div>
          </div>
        </div>

        <div class="canteen-card">
          <div class="canteen-image-container">
            <img src="/Img/deck.jpg" alt="The Deck">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
              <button class="card-action-btn"><i class="fas fa-cog"></i></button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">The Deck</div>
            <div class="status-line">
              <span class="status-level high"><span class="status-dot high"></span> High Crowd (79%)</span>
              <span class="status-count">800 / 1018</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill high" style="width: 79%;"></div></div>
            <div class="updated-time">Updated about 4 hours ago</div>
          </div>
        </div>

        <div class="canteen-card">
          <div class="canteen-image-container">
            <img src="/Img/Flavours.jpg" alt="Flavours">
            <div class="card-actions">
              <button class="card-action-btn favorite"><i class="fas fa-heart"></i></button>
              <button class="card-action-btn"><i class="fas fa-cog"></i></button>
            </div>
          </div>
          <div class="canteen-info">
            <div class="canteen-title">Flavours @ UTown</div>
            <div class="status-line">
              <span class="status-level high"><span class="status-dot high"></span> High Crowd (80%)</span>
              <span class="status-count">400 / 500</span>
            </div>
            <div class="progress-bar-container"><div class="progress-bar-fill high" style="width: 80%;"></div></div>
            <div class="updated-time">Updated about 4 hours ago</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

:root {
    --primary-blue: #0A1C3E;
    --accent-orange: #F37021;
    --text-main: #2A2A2A;
    --text-muted: #888888;
    --green: #2ecc71;
    --orange: #e67e22;
    --red: #e74c3c;
}
* { box-sizing: border-box; }
body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(160deg, #dce8f5 0%, #f0e8e0 100%);
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
    transition: 0.2s;
}
.nav-links a:hover { color: white; }
.nav-links a.active { color: white; background-color: rgba(255,255,255,0.15); }
.user-controls { display: flex; align-items: center; gap: 16px; font-size: 14px; cursor: pointer; color: rgba(255,255,255,0.8); }
main { padding: 0 40px 60px; display: flex; flex-direction: column; align-items: center; }
.hero { text-align: center; position: relative; margin: 50px 0 30px; width: 100%; }
.hero h1 { font-size: 3rem; font-weight: 800; margin: 0 0 8px; color: #0A1C3E; }
.hero p { font-size: 1.1rem; color: #555; margin: 0; }
.nus { color: #F37021; }
.bubble-and-lion { position: absolute; top: 10px; right: 5%; display: flex; align-items: center; gap: 10px; }
.speech-bubble { background: white; padding: 8px 16px; border-radius: 18px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.12); color: #2A2A2A; }
.nus-lion { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #F37021; flex-shrink: 0; }
.nus-lion img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.search-container { width: 620px; max-width: 90%; background: white; padding: 6px 6px 6px 16px; border-radius: 40px; display: flex; align-items: center; box-shadow: 0 6px 20px rgba(0,0,0,0.08); margin-bottom: 24px; }
.search-container i { color: #bbb; margin-right: 4px; }
.search-container input { border: none; flex: 1; padding: 10px 8px; outline: none; font-size: 15px; background: transparent; }
.search-button { background: #F37021; color: white; border: none; padding: 12px 28px; border-radius: 30px; cursor: pointer; font-weight: 700; font-size: 15px; transition: 0.2s; }
.search-button:hover { background: #d45d1a; }
.filters { display: flex; gap: 10px; margin-bottom: 36px; }
.filter-btn { background: white; border: 1.5px solid #e0e0e0; padding: 9px 20px; border-radius: 24px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
.filter-btn.active { color: #1a73e8; border-color: #1a73e8; font-weight: 600; }
.canteen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; width: 100%; max-width: 1100px; }
.canteen-card { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.07); transition: transform 0.25s ease, box-shadow 0.25s ease; }
.canteen-card:hover { transform: translateY(-5px); box-shadow: 0 10px 28px rgba(0,0,0,0.12); }
.canteen-image-container { position: relative; height: 150px; }
.canteen-image-container img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 8px; }
.card-action-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(255,255,255,0.92); cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); transition: 0.2s; }
.card-action-btn:hover { background: white; }
.favorite { color: #e74c3c; }
.canteen-info { padding: 16px; }
.canteen-title { font-weight: 700; font-size: 1rem; margin-bottom: 12px; color: #2A2A2A; }
.status-line { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; align-items: center; }
.status-level { display: flex; align-items: center; font-weight: 600; background-color: transparent !important; }
.status-count { color: #888888; font-weight: 700; font-size: 12px; }
.status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
.progress-bar-container { height: 7px; background: #eee; border-radius: 10px; margin-bottom: 10px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 10px; }
.low { color: #2ecc71; }
.medium { color: #e67e22; }
.high { color: #e74c3c; }
.progress-bar-fill.low { background-color: #2ecc71; }
.progress-bar-fill.medium { background-color: #e67e22; }
.progress-bar-fill.high { background-color: #e74c3c; }
.status-dot.low { background-color: #2ecc71; }
.status-dot.medium { background-color: #e67e22; }
.status-dot.high { background-color: #e74c3c; }
.updated-time { font-size: 11px; color: #aaa; text-align: right; }
</style>

<template>
  <div class="landing">
    <div class="hero">
      <!-- Auth error message shown when redirected from a protected route -->
      <div v-if="authError" class="auth-error">
        {{ authError }}
      </div>

      <h1><span class="nus">NUS</span> CanteenPulse</h1>
      <p>Real-time visibility into campus canteen crowds. Never struggle to find a seat again.</p>
      <div class="buttons">
        <button class="btn-primary" @click="$router.push('/register')">Sign Up Now</button>
        <button class="btn-secondary" @click="$router.push('/login')">Login</button>
      </div>
    </div>
    <footer>Built for NUS canteen crowd visibility</footer>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  name: 'LandingView',
  setup() {
    const route = useRoute()
    const authError = route.query.authError || null
    return { authError }
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
}

.landing {
  min-height: 100vh;
  background-color: #1e3a6e;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 60px 40px;
  gap: 24px;
}

h1 {
  font-size: 6rem;
  color: white;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1.1;
}

.nus {
  color: #e87722;
}

p {
  color: white;
  font-size: 1.3rem;
  max-width: 480px;
  line-height: 1.6;
}

.buttons {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.btn-primary {
  background-color: #e87722;
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
}

.btn-primary:hover {
  background-color: #d4681a;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
  padding: 16px 40px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: bold;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

footer {
  color: rgba(255, 255, 255, 0.6);
  padding: 24px;
  font-size: 0.9rem;
}

/* Error banner for auth redirect */
.auth-error {
  background-color: #ffe0e0;
  color: #c0392b;
  border: 1px solid #c0392b;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  max-width: 480px;
  width: 100%;
  text-align: center;
}
</style>

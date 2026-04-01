<template>
  <div class="login-page">
    <div class="card">
      <h2>Welcome back</h2>
      <p class="subtitle">Log in to CanteenPulse</p>

      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="e0123456@u.nus.edu" />
      </div>

      <div class="form-group">
        <label>
          Password
          <span class="forgot">Forgot password?</span>
        </label>
        <input type="password" v-model="password" />
      </div>

      <p class="error" v-if="errorMessage">{{ errorMessage }}</p>

      <button class="btn-primary" @click="login">Log in</button>

      <p class="register-link">
        Don't have an account? <span @click="$router.push('/register')">Sign up</span>
      </p>
    </div>
    <footer>Built for NUS canteen crowd visibility</footer>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    }
  },
  methods: {
    async login() {
      this.errorMessage = ''

      if (!this.email || !this.password) {
        this.errorMessage = 'Please fill in all fields'
        return
      }

      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push({ name: 'Community' })
      } catch (error) {
        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-credential'
        ) {
          this.errorMessage = 'Wrong password / email, try again'
        } else {
          this.errorMessage = 'Something went wrong, please try again'
        }
      }
    },
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-family: Arial, sans-serif;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  margin-top: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.8rem;
  color: #1e3a6e;
  font-weight: bold;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

.forgot {
  color: #e87722;
  cursor: pointer;
  font-weight: normal;
}

input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: #1e3a6e;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-bottom: 12px;
  text-align: center;
}

.btn-primary {
  width: 100%;
  background-color: #e87722;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 8px;
}

.btn-primary:hover {
  background-color: #d4681a;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  font-size: 0.95rem;
  color: #666;
}

.register-link span {
  color: #e87722;
  cursor: pointer;
  font-weight: bold;
}

footer {
  color: #999;
  padding: 24px;
  font-size: 0.9rem;
}
</style>

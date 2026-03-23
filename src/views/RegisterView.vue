<template>
  <div class="register-page">
    <div class="card">
      <h2>Create an account</h2>
      <p class="subtitle">Enter your details to join CanteenPulse</p>

      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="e0123456@u.nus.edu" />
      </div>

      <div class="form-group">
        <label>Username</label>
        <input type="text" v-model="username" placeholder="johndoe" />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="password" />
      </div>

      <div class="form-group">
        <label>Confirm Password</label>
        <input type="password" v-model="confirmPassword" />
      </div>

      <p class="error" v-if="errorMessage">{{ errorMessage }}</p>

      <button class="btn-primary" @click="register">Sign Up</button>

      <p class="login-link">
        Already have an account? <span @click="$router.push('/login')">Log in</span>
      </p>
    </div>
    <footer>Built for NUS canteen crowd visibility</footer>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export default {
  name: 'RegisterView',
  data() {
    return {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
    }
  },
  methods: {
    async register() {
      this.errorMessage = ''

      if (!this.email || !this.username || !this.password || !this.confirmPassword) {
        this.errorMessage = 'Please fill in all fields'
        return
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match'
        return
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
        const user = userCredential.user

        await setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          email: this.email,
          username: this.username,
          currentCheckInCanteenId: null,
          favouriteCanteenIds: [],
          updateCount: 0,
          tier: 'Bronze',
          createdAt: new Date(),
        })

        this.$router.push('/community')
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = 'Email already exists'
        } else if (error.code === 'auth/weak-password') {
          this.errorMessage = 'Password should be at least 6 characters'
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

.register-page {
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
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
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
  background-color: #1e3a6e;
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
  background-color: #162d56;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 0.95rem;
  color: #666;
}

.login-link span {
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

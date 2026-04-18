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
        <label>Password</label>
        <input type="password" v-model="password" />
      </div>

      <p class="error" v-if="errorMessage">{{ errorMessage }}</p>

      <button class="btn-primary" @click="login">Log in</button>

      <div class="divider"><span>or</span></div>

      <button class="btn-google" @click="loginWithGoogle">
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
        />
        Continue with Google
      </button>

      <p class="register-link">
        Don't have an account? <span @click="$router.push('/register')">Sign up</span>
      </p>
    </div>
    <footer>Built for NUS canteen crowd visibility</footer>
  </div>
</template>

<script>
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

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

    async loginWithGoogle() {
      this.errorMessage = ''
      const provider = new GoogleAuthProvider()
      try {
        const userCredential = await signInWithPopup(auth, provider)
        const user = userCredential.user

        // Check if this Google user already has a Firestore document
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists()) {
          // First time Google login — create their profile
          const username = user.email.split('@')[0]
          await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            email: user.email,
            username: username,
            currentCheckInCanteenId: null,
            favouriteCanteenIds: [],
            updateCount: 0,
            tier: 'Bronze',
            createdAt: new Date(),
          })
        }

        this.$router.push({ name: 'Community' })
      } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
          // User closed popup — do nothing
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

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #ddd;
}

.divider span {
  color: #999;
  font-size: 0.9rem;
}

.btn-google {
  width: 100%;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-google:hover {
  background-color: #f5f5f5;
}

.btn-google img {
  width: 20px;
  height: 20px;
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

<template>
  <div class="not-found">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Page Not Found</h2>
      <p class="error-message">Oops! The page you're looking for doesn't exist.</p>
      <button class="btn-home" @click="$router.push('/')">Back to Home</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background-color: #1e3a6e;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: #e87722;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.error-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.btn-home {
  background-color: #e87722;
  color: white;
  border: none;
  padding: 14px 36px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
}

.btn-home:hover {
  background-color: #d4681a;
}
</style>

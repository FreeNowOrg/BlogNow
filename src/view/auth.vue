<template lang="pug">
form
  label
    strong username
    input(v-model='username')
  label
    strong password
    input(v-model='password')
  .btn
    button(@click='handleLogin') Login
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
const username = ref('')
const password = ref('')

function handleLogin() {
  axios.post('/api/user/sign-in', {
    username: username.value,
    password: password.value,
  })
}
</script>

<style scoped lang="sass"></style>
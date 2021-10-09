<template lang="pug">
.auth-container
  form(:class='{ "loadin-cover": loading }', v-if='!userData')
    label
      strong username
      input(v-model='username')
    label
      strong password
      input(v-model='password')
    .btn
      button(@click.prevent='handleLogin') Login
  .user-info(v-else)
    h1 hello, {{ userData.username }}~
    .card
      pre {{ userData }}
      .btn
        button(@click='handleLogout') Logout

  .info-area
    .info.error(v-if='error')
      .title Login faild
      p {{ error }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { getUserDataByLogin, userData } from '../components/userData'
import { setTitle } from '../utils/setTitle'
import Cookies from 'js-cookie'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

function handleLogin() {
  loading.value = true
  error.value = ''

  getUserDataByLogin({
    username: username.value,
    password: password.value,
  })
    .then(
      () => {},
      (e): any => {
        error.value = e.message
      }
    )
    .finally(() => {
      loading.value = false
    })
}

function handleLogout() {
  Cookies.remove('BLOGNOW_TOKEN')
  location.reload()
}

onMounted(() => {
  setTitle('Authorization')
})
</script>

<style scoped lang="sass">
form
  text-align: center
  label
    display: block
    margin-bottom: 1rem
    strong
      display: block
</style>
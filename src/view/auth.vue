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
    pre {{ userData }}

  .info-area
    .info.tips(v-if='token')
      .title Login OK
      p Your token is <code>{{ token }}</code>
    .info.error(v-if='error')
      .title Login faild
      p {{ error }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { getUserDataByLogin, userData } from '../components/userData'
import { setTitle } from '../utils/setTitle'

const username = ref('')
const password = ref('')
const loading = ref(false)
const token = ref('')
const error = ref('')

function handleLogin() {
  loading.value = true
  token.value = ''
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
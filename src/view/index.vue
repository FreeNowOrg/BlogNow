<template lang="pug">
h1 Blog Now

.card.align-center
  p(v-if='!userData')
    router-link.button(to='/auth') Login
  p(v-else) Welcome, {{ userData.username }}~

.card
  router-link(to='/archive') Archive
</template>

<script>
import { onMounted } from 'vue'
import { setTitle } from '../utils/setTitle'
import { userData } from '../components/userData'

onMounted(() => {
  setTitle()
})
</script>

<style lang="sass"></style>

<template lang="pug">
main
  header
    .site-name
      router-link(to='/') Home
  article
    router-view
</template>

<script lang="ts">
import {} from 'vue'
import { userData, getUserDataByToken } from './components/userData'
;(() => {
  if (!userData.value) {
    console.log('init user')
    getUserDataByToken().then((i) => console.info(i))
  }
})()
</script>

<style scoped lang="sass">
main
  article
    z-index: 1
    min-height: 100vh
    padding: 60px 1rem 100px 1rem
    box-sizing: border-box
    position: relative
</style>
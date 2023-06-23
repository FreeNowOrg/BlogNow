<template lang="pug">
#error-container
  .body-inner
    article.404-page
      h1 404
      p This page has been lost.
      p 
        router-link.button(to='/') ← Take me home
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { setTitle } from '../utils/setTitle'
onMounted(() => {
  setTitle('404', 'Error')
})
</script>

<style scoped lang="sass">
#error-container
  margin-top: calc(60px + 1rem)
</style>

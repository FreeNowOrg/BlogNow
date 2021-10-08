<template lang="pug">
main
  article
    router-view
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { getUserDataByToken } from './components/userData'

onMounted(() => {
  getUserDataByToken()
})
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
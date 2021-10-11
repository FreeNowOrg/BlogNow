<template lang="pug">
#full-container
  global-header
  .router-view
    router-view
  global-footer
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'

import { userData, initUserData } from './components/userData'

onMounted(() => {
  if (!userData.value) {
    console.log('init user')
    initUserData().then((i) => console.info(i))
  }
})
</script>

<style scoped lang="sass">
#full-container
  display: flex
  flex-direction: column
  min-height: 100vh

  .router-view
    flex: 1
</style>

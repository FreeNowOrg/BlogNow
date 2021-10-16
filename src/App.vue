<template lang="pug">
#full-container
  n-progress
  global-header
  #init-view(v-if='globalInitErrors.length || !userData || !siteMeta')
    global-placeholder
  #router-view(v-else)
    router-view
  global-footer
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'

import {
  userData,
  initUserData,
  siteMeta,
  getSiteMeta,
  globalInitErrors,
} from './utils'
import GlobalPlaceholder from './components/GlobalPlaceholder.vue'
import NProgress from './components/NProgress.vue'

onMounted(() => {
  if (!userData.value) {
    initUserData()
  }
  if (!siteMeta.value) {
    getSiteMeta()
  }
})
</script>

<style scoped lang="sass">
#full-container
  display: flex
  flex-direction: column
  min-height: 100vh

  #init-view,
  #router-view
    flex: 1
</style>

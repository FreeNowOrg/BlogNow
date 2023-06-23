<template lang="pug">
#full-container
  n-progress
  global-header
  #router-view(v-if='SITE_ENV === "dev" || globalInitDone')
    router-view
  #init-view(v-else)
    global-placeholder
  global-footer
  float-toolbox
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { SITE_ENV } from './config'

import GlobalHeader from './components/GlobalHeader.vue'
import GlobalFooter from './components/GlobalFooter.vue'

import { initUserData, getSiteMeta, globalInitDone } from './utils'
import GlobalPlaceholder from './components/GlobalPlaceholder.vue'
import NProgress from './components/NProgress.vue'
import FloatToolbox from './components/FloatToolbox.vue'

onMounted(() => {
  initUserData()
  getSiteMeta()
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

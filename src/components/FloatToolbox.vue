<template lang="pug">
#rightside
  #rightside-config-detail(:class="{isHidden: isHidden}")
  #rightside-config
    button#settings(title="Settings" type="button" @click="toggleSettings") S
    button#to-top(title="Back to top" type="button" @click="backToTop") T
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
const isHidden = ref(true)
function toggleSettings() {
  isHidden.value = !isHidden.value
}
function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<style scoped lang="sass">
#rightside
  position: fixed
  right: -35px
  bottom: 20px
  z-index: 100

  button
    width: 30px
    height: 30px
    display: block
    margin-bottom: 2px
    text-align: center
    background-color: var(--theme-accent-color)
    color: var(--theme-accent-link-color)

  &:hover
    background-color: var(--theme-secondary-color)

#rightside-config-detail
  transform: translateX(35px)
  transition: transform .4s

  &:not(.isHidden)
    transform: translateX(0)
</style>

<template lang="pug">
#float-toolbox(:class="{ 'is-hidden': lastScrollPos - 50 < 0 }")
  #float-toolbox-config-detail(:class="{ 'is-hidden': isHidden }")
  #float-toolbox-config
    button#settings(title="Settings" type="button" @click="isHidden = !isHidden") S
    button#to-top(title="Back to top" type="button" @click="backToTop") T
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
const isHidden = ref(true)
const lastScrollPos = ref(0)
onMounted(() => {
  document.addEventListener('scroll', () => {
    lastScrollPos.value = window.scrollY
  })
})
function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<style scoped lang="sass">
#float-toolbox
  position: fixed
  right: -35px
  bottom: 20px
  z-index: 5
  transition: right .4s

  &:not(.is-hidden)
    right: 0

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

#float-toolbox-config-detail
  transform: translateX(-35px)
  transition: transform .4s

  &:not(.is-hidden)
    transform: none
</style>

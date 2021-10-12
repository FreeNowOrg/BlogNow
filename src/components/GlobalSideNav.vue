<template lang="pug">
aside#global-side-nav(:class="{active: active}")
  #global-side-nav-top
  #global-side-nav-bottom
    ul#global-side-nav-items
      li(v-for="item in sidebarItems") {{ item }}
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { initUserData } from './userData'
const active = ref(false)
const sidebarItems = ref<any[]>([])
onMounted(() => {
  initUserData().then((data) => {
    sidebarItems.value = [] // TODO: where to store the items?
  })
})
</script>
<style scoped lang="sass">
#global-side-nav
  position: fixed
  z-index: 100
  width: 300px
  left: -300px
  transition: left .8s ease-in
  background-color: var(--theme-background-color)

  &.active
    left: 0

#global-side-nav-top
  height: 120px
  background-color: var(--theme-secondary-color)
  box-shadow: var(--theme-box-shadow)
  margin-bottom: 4px

#global-side-nav-bottom
  ul
    list-style: none
    margin: 0
    padding: 0

    li
      display: block

      &:hover
        background-color: var(--theme-accent-color)
</style>

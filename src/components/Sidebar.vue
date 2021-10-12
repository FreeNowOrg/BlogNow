<template lang="pug">
aside#sidebar(:class="{active: active}")
  #sidebar-top
  #sidebar-bottom
    ul#sidebar-items
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
#sidebar
  position: fixed
  z-index: 100
  width: 300px
  left: -300px
  transition: left .8s ease-in
  background-color: var(--theme-background-color)

  &.active
    left: 0

#sidebar-top
  height: 120px
  background-color: var(--theme-secondary-color)
  box-shadow: var(--theme-box-shadow)
  margin-bottom: 4px

#sidebar-bottom
  ul
    list-style: none
    margin: 0
    padding: 0

    li
      display: block

      &:hover
        background-color: var(--theme-accent-color)
</style>

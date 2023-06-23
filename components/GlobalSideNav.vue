<template lang="pug">
aside#global-side-nav(:class='{ "is-hidden": isHidden }')
  .backdrop(@click='isHidden = true')
  .inner
    #global-side-nav-top
    #global-side-nav-bottom
      ul#global-side-nav-items
        li(v-for='item in sidebarItems') {{ item }}
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
// import { userData } from '../utils'
const router = useRouter()
const isHidden = ref(true) // maybe need to move outside
const sidebarItems = ref<any[]>([])
router.afterEach(() => (isHidden.value = true))
onMounted(() => {
  document.addEventListener('keypress', ({ key }) => {
    if (key == 'Escape') isHidden.value = true
  })
})
watch(isHidden, (val) => {
  if (!val) {
    document.body.classList.add('global-side-nav-show', 'lock-scroll')
  } else {
    document.body.classList.remove('global-side-nav-show', 'lock-scroll')
  }
})
</script>
<style scoped lang="sass">
#global-side-nav
  z-index: 10

  .backdrop
    position: fixed
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    background-color: rgba(0, 0, 0, 0.1)
    z-index: 10

  .inner
    position: fixed
    top: 0
    left: 0
    width: calc(1rem + 240px)
    max-width: 80vw
    height: 100vh
    transition: left .8s ease-in
    background-color: var(--theme-background-color)

.is-hidden
  .backdrop
    display: none

  .inner
    left: -300px

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

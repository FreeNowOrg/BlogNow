<template lang="pug">
#home-container
  header#home-header
    .inner
      h1.home-site-name Blog Now
      .meta-data
        p Blah, Blah, Blah, Blah, Blah...

  main#home-main.responsive
    .main-flex
      #home-post-list.flex-1
        .home-post-card.card(v-for='item in 10') Post\#{{ item }}
      global-aside
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { setTitle } from '../utils/setTitle'
import { userData } from '../components/userData'
import GlobalAside from '../components/GlobalAside.vue'

const components = defineComponent({ GlobalAside })

onMounted(() => {
  setTitle()
})
</script>

<style lang="sass">
#home-main
  margin-top: 2rem
  margin-bottom: 3rem

#home-post-list
  display: flex
  flex-direction: column
  gap: 1rem

#home-header
  position: relative
  text-align: center
  color: #fff
  height: 100vh
  overflow: hidden
  z-index: 1
  &::before,
  &::after
    content: ""
    display: block
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
  &::before
    background-image: url(https://blog.wjghj.cn/_statics/images/uploads/cc848d0f-00ed-4c2e-be9d-aec88d410cfc.jpeg)
    background-size: cover
    background-position: center
    // position: fixed
    z-index: 0
  &::after
    background-color: rgba(0, 0, 0, 0.5)
    z-index: 1
  .inner
    position: absolute
    top: calc(50% + 60px)
    left: 0
    transform: translateY(-50%)
    width: 100%
    z-index: 2

#home-main
  background-color: #fff
  position: relative
  z-index: 1
</style>

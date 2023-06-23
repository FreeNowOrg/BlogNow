<template lang="pug"></template>

<script setup lang="ts">
import {} from 'vue'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 介入路由事件
router.beforeEach(() => {
  nprogress.start()
})

router.afterEach(() => {
  nprogress.done()
})

// 介入 Axios 事件
axios.interceptors.request.use((config) => {
  nprogress.start()
  return config
})

axios.interceptors.response.use(
  (res) => {
    nprogress.done()
    return res
  },
  (err) => {
    nprogress.done()
    return Promise.reject(err)
  }
)
</script>

<style lang="sass">
#nprogress
  .bar
    background-color: var(--theme-secondary-color)

  .spinner
    .spinner-icon
      border-top-color: var(--theme-secondary-color)
      border-left-color: var(--theme-secondary-color)
</style>

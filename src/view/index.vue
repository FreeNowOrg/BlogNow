<template lang="pug">
#home-container
  header#home-header
    .inner
      h1.home-site-name Blog Now
      .meta-data
        p Blah, Blah, Blah, Blah, Blah...

  main#home-main.body-inner
    .main-flex
      #home-post-list.flex-1(v-if='siteCache.recents.length > 0')
        .home-post-card.card(
          v-for='(item, index) in siteCache.recents',
          style='padding: 0'
        )
          .thumb
            router-link(:to='{ name: "post", params: { uuid: item.uuid } }')
              img.cover(
                :src='"https://api.daihan.top/api/acg?_random=" + item.uuid'
              )
          .meta
            router-link.title(
              :to='{ name: "post", params: { uuid: item.uuid } }'
            ) {{ item.title }}
            .time Created at {{ new Date(item.created_at).toLocaleString() }}
            p.preview {{ item.content.length > 120 ? item.content.slice(0, 120) + "..." : item.content }}
      #home-post-list.flex-1.no-data(v-else)
        .card
          .loading
            placeholder
      global-aside
</template>

<script setup lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { userData } from '../components/userData'
import { setTitle, getRecentPosts, siteCache } from '../utils'
import GlobalAside from '../components/GlobalAside.vue'

const components = defineComponent({ GlobalAside })
const posts = ref<any[]>([])

onMounted(() => {
  setTitle()
  getRecentPosts()
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
    background-image: url(https://api.daihan.top/api/acg)
    background-position: center
    background-size: cover
    background-attachment: fixed
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

#home-post-list
  gap: 1.5rem
  .home-post-card
    display: flex
    height: 240px
    border-radius: 1rem
    overflow: hidden
    gap: 1.5rem
    &:nth-of-type(2n + 1)
      flex-direction: row-reverse
    .thumb
      position: relative
      width: 45%
      height: 100%
      overflow: hidden
      a
        height: 100%
        .cover
          width: 100%
          height: 100%
          max-width: 100%
          object-fit: cover
          transition: all 0.4s ease
    &:hover
      .cover
        transform: scale(1.1)
    .meta
      padding: 2rem 0
      .title
        font-size: 1.4rem
        font-weight: 600
        --color: var(--theme-accent-color)

#home-main
  background-color: #fff
  position: relative
  z-index: 1
</style>

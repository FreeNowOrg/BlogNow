<template lang="pug">
#home-container
  header#home-header
    .inner
      h1.home-site-name Blog Now
      .meta-data
        p Blah, Blah, Blah, Blah, Blah...
    a#jump-btn.pointer.plain(@click='handleJumpToMain')
      icon
        angle-down

  main#home-main.body-inner
    .main-flex
      #home-post-list.flex-1(v-if='recents.length > 0')
        .home-post-card.card(
          v-for='(item, index) in recents',
          style='padding: 0'
        )
          .post-cover
            router-link.plain.title(
              :to='{ name: item.slug ? "post-slug" : "post-uuid", params: { slug: item.slug, uuid: item.uuid } }'
            )
              img.cover-img(
                :src='item.cover || "https://api.daihan.top/api/acg?_random=" + item.uuid'
              )
          .post-meta
            router-link.title(
              :to='{ name: item.slug ? "post-slug" : "post-uuid", params: { slug: item.slug, uuid: item.uuid } }'
            ) {{ item.title }}
            .author
              user-link(:user='item.author')
            .time Created at {{ new Date(item.created_at).toLocaleString() }}
            p.preview {{ item.content.length > 120 ? item.content.slice(0, 120) + "..." : item.content }}
      #home-post-list.flex-1.no-data(v-else)
        .card
          .loading
            placeholder
      global-aside
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setTitle, getRecentPosts } from '../utils'
import { AngleDown } from '@vicons/fa'
import scrollTo from 'animated-scroll-to'
import GlobalAside from '../components/GlobalAside.vue'
import UserLink from '../components/UserLink.vue'
import type { ApiResponsePost } from '../types'

const recents = ref<ApiResponsePost[]>([])

function handleJumpToMain() {
  scrollTo(document.getElementById('home-main') as HTMLElement, {
    verticalOffset: -(60 + 16),
  })
}

onMounted(() => {
  setTitle()
  getRecentPosts().then((list) => {
    recents.value = list
  })
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
    top: calc(50% + 30px)
    left: 0
    transform: translateY(-50%)
    width: 100%
    z-index: 2
  #jump-btn
    --color: #fff
    position: absolute
    z-index: 2
    bottom: 2rem
    left: 50%
    width: 100%
    transform: translateX(-50%)
    font-size: 2rem
    animation: jumpbtn 0.85s ease 0s infinite alternate

@keyframes jumpbtn
  from
    bottom: 1rem
    opacity: 0.4
  to
    bottom: 2rem
    opacity: 1

#home-post-list
  gap: 1.5rem
  .home-post-card
    display: flex
    height: 240px
    border-radius: 1rem
    overflow: hidden

    &:nth-of-type(2n + 1)
      flex-direction: row-reverse
    .post-cover
      position: relative
      width: 45%
      height: 100%
      overflow: hidden
      a
        height: 100%
        .cover-img
          width: 100%
          height: 100%
          max-width: 100%
          object-fit: cover
          transition: all 0.4s ease
    &:hover
      .cover-img
        transform: scale(1.1)
        // filter: blur(1px)
    .post-meta
      padding: 2rem 1rem
      flex: 1
      .title
        font-size: 1.4rem
        font-weight: 600
        --color: var(--theme-accent-color)

@media screen and (max-width: 900px)
  #home-post-list
    .home-post-card
      flex-direction: column !important
      height: 400px

      .post-cover
        width: 100%

#home-main
  position: relative
  z-index: 1
</style>

<style lang="sass">
#global-header
  transition: all 0.24s ease
[data-at-top='true'][data-route='home']
  #global-header
    background-color: transparent
    box-shadow: none
    a
      --color: #fff
</style>

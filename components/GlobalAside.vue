<template lang="pug">
aside#global-aside
  hr#global-aside-hr

  slot(name='top')

  .card.site-card.align-center
    .avatar
      img(src='https://www.wjghj.cn/public/icons/wiki-wordmark.svg')
    strong.title Site Name
    p.desc This is a blog built by BlogNow engine.
    .stats.flex.gap-1
      .flex-1
        .key Posts
        .val {{ siteMeta?.total_posts || "-" }}
      .flex-1
        .key Tags
        .val {{ siteMeta?.total_tags || "-" }}
      .flex-1
        .key Users
        .val {{ siteMeta?.total_users || "-" }}
  .card.site-style
    h4 Announcement
    p Lorem ipsum dolor sit amet, consectetur adipisicing elit.

  slot(name='default')
</template>

<script setup lang="ts">
import {} from 'vue'
import { siteMeta } from '../utils'
</script>

<style scoped lang="sass">
#global-aside-hr
  display: none

#global-aside
  display: flex
  flex-direction: column
  gap: 1.5rem

  .site-card
    .avatar
      img
        width: 110px
        border-radius: 1em
        box-shadow: 0 0 1rem rgba(0, 0, 0, 0.05)
    .title
      display: block
      font-size: 1.4rem
      margin: 1rem 0 0.4rem 0
    .stats
      .key
        font-weight: 400
      .val
        font-weight: 600
        font-size: 1.125rem

@media screen and(max-width: 900px)
  #global-aside-hr
    display: block
</style>

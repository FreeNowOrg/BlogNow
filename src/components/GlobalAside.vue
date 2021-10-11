<template lang="pug">
aside#global-aside
  slot(name='top')

  .card.site-card.align-center
    .avatar
      img(src='https://www.wjghj.cn/public/icons/wiki-wordmark.svg')
    strong.title Site Name
    p.desc This is a blog built by BlogNow engine.
    .stats.flex.gap-1
      .flex-1
        .key Posts
        .val -
      .flex-1
        .key Tags
        .val -
      .flex-1
        .key Users
        .val -
  .card
    h4 Announcement
    p Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

  slot(name='default')
</template>

<script setup lang="ts">
import {} from 'vue'
</script>

<style scoped lang="sass">
#global-aside
  display: flex
  flex-direction: column
  gap: 1.5rem

  .site-card
    .avatar
      img
        width: 110px
        border-radius: 50%
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.2)
    .title
      display: block
      font-size: 1.4rem
      margin: 1rem 0 0.4rem 0
    .stats
      .key
        font-weight: 600
</style>

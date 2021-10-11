<template lang="pug">
nav#global-header.flex.gap-1
  .item.site-logo-area.flex.flex-center
    router-link.plain(to='/')
      .logo-placeholder LOGO

  .item.links-area.flex.flex-1.gap-1
    router-link(to='/') Home
    router-link(to='/archives') Archives
    router-link(to='/-/about') About

  .item.user-area
    router-link.plain(to='/auth')
      .avatar-placeholder You
</template>

<script setup lang="ts">
import {} from 'vue'
</script>

<style scoped lang="sass">
#global-header
  position: fixed
  z-index: 10
  width: 100%
  height: 60px
  top: 0
  left: 0
  padding: 0 2rem
  background-color: #fff
  align-items: center
  box-shadow: 0 2px 0 #f8f8f8

  a
    --color: var(--theme-text-color)

  .site-logo-area
    .logo-placeholder
      border: 1px solid #888
      border-radius: 6px
      padding: 0.5rem

  .links-area
    justify-content: flex-end

  .user-area
    .avatar-placeholder
      display: inline-block
      border-radius: 50%
      box-shadow: 0 0 0 2px #aaa
      width: 2rem
      height: 2rem
      background-color: #fff
      line-height: 2rem
      text-align: center
</style>

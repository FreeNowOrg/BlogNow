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
    global-header-user-dropdown
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import GlobalHeaderUserDropdown from './GlobalHeaderUserDropdown.vue'

onMounted(() => {
  document.addEventListener('scroll', () => {
    document.body.setAttribute(
      'data-at-top',
      `${document.documentElement.scrollTop < 60}`
    )
  })
  document.body.setAttribute(
    'data-at-top',
    `${document.documentElement.scrollTop < 60}`
  )
})
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

  .side-nav-toggler
    --color: #888
    display: inline-block
    width: 40px
    height: 40px
    line-height: 45px
    text-align: center
    border-radius: 50%

    &:hover,
    &.is-active
      background-color: rgba(0, 0, 0, 0.05)

  .global-site-logo
    .desc
      font-size: 0.6rem
      font-weight: 600
      color: #222
      text-align: right

    img
      display: block
      height: 1.8rem
      width: auto


@media screen and (max-width: 800px)
  .global-header
    .nav-links > .item
      display: none
</style>

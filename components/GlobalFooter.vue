<template lang="pug">
footer#global-footer
  .top
    .body-inner.flex-auto.gap-1
      section.flex-1
        h4 Discovery
        ul
          li
            router-link(to='/archives') Archives
          li
            router-link(to='/tags') Tags
          li
            router-link(to='/-/about') About

      section.flex-1
        h4 Follow us
        ul
          li Free Now Organization
            ul
              li
                e-link(href='https://github.com/FreeNowOrg') @FreeNowOrg

      section.flex-1
        h4 Friend links
        p Come to GitHub issues to exchange friend links~

  .bottom
    .body-inner
      .flex-auto.gap-1
        p.flex-1
          | Powered by
          |
          e-link(:href='GITHUB_URL') BlogNow
          |
          | (
          em v{{ VERSION }}
          | )
        p &copy;{{ COPYRIGHT_STR }} FreeNowOrg
</template>

<script setup lang="ts">
import {} from 'vue'
import { VERSION, COPYRIGHT_STR, GITHUB_URL } from '../config'
</script>

<style scoped lang="sass">
#global-footer
  color: #fff
  a
    --color: #eee
    font-weight: 600
  p
    margin: 0.2rem 0
    line-height: 1.6
  .top
    background-color: var(--theme-accent-color)
    padding: 1rem 0 2rem 0
  .bottom
    padding: 1rem 0 0.4rem 0
    background-color: var(--theme-accent-color-darken)
  h4
    position: relative
    margin: 1rem 0 0.5rem 0
    padding-bottom: 0.2rem
    border-bottom: 2px solid
    font-size: 1.1rem
  ul
    padding-left: 1rem
    margin: 0.2rem 0
    a
      display: inline
      font-weight: 400
</style>

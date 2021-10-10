<template lang="pug">
nav#global-header.flex.gap-1
  .item.site-logo-area.flex.flex-center
    router-link(to='/') LOGO
  .item.links-area.flex.flex-1.gap-1
    router-link(to='/archive') Archive
  .item.user-area
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

  .links-area
    justify-content: flex-end

  .user-area
    .avatar-placeholder
      display: inline-block
      border-radius: 50%
      box-shadow: 0 0 0 2px #aaa
      width: 40px
      height: 40px
      background-color: #fff
      line-height: 40px
      text-align: center
</style>
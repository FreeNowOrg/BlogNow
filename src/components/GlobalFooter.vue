<template lang="pug">
footer#global-footer
  .top
    .responsive
      p global footer
  .bottom
    .responsive
      p Powered by BlogNow
</template>

<script setup lang="ts">
import {} from 'vue'
</script>

<style scoped lang="sass">
#global-footer
  color: #fff
  p
    margin: 0.2rem 0
    line-height: 1.6
  .top
    background-color: var(--theme-accent-color)
    padding: 1rem 0 2rem 0
  .bottom
    padding: 1rem 0 0.4rem 0
    background-color: var(--theme-accent-color-darken)
</style>

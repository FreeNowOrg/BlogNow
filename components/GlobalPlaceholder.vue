<template lang="pug">
#global-init-container
  #on-loading.body-inner.align-center(v-if='!globalInitErrors.length')
    placeholder
    h1 Application is initializing
    .info-area
      p.user
        .is-loading(v-if='userData.uuid === undefined') Init user data{{ dot }}
        .is-ok(v-else) User data - OK
      p.site
        .is-loading(v-if='!siteMeta') Init site meta{{ dot }}
        .is-ok(v-else) Site meta - OK
  #on-error.body-inner(v-else)
    .align-center
      .icon-area
        icon
          error-filled
      h1 Application error
      p.desc
        | You can
        |
        a.button(href='') reload the page
        | , or contact site admin.
    .error-area.card
      details
        .flex.flex-column.gap-1
          .info.error(v-for='item in globalInitErrors')
            .title(v-if='item.title') {{ item.title }}
            p {{ item.content }}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { userData, siteMeta, globalInitErrors } from '../utils'
import { ErrorFilled } from '@vicons/material'

const dot = ref('.')
setInterval(() => {
  if (dot.value.length >= 6) {
    dot.value = '.'
  } else {
    dot.value += '.'
  }
}, 1000)
</script>

<style scoped lang="sass">
#global-init-container
  padding-top: 60px
  margin-bottom: 2rem

  #on-error
    .icon-area
      font-size: 140px
      color: #f74680
      margin: 2rem auto
</style>

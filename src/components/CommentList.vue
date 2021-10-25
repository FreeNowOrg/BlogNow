<template lang="pug">
.comment-list-container
  slot(name='before')
  ul.comment-list.flex.flex-column.gap-1
    slot(name='start')
    li.comment-item(v-for='item in comments')
      .user
        img.avatar(:src='getAvatar(item.author.avatar)')
        router-link.username(:to='`@${item.author.username}`') {{ item.author.username }}
      .content
        .content-main {{ item.content }}
        .time
          .created_at {{ new Date(item.created_at).toLocaleString() }}

    slot(name='end')
  slot(name='after')
</template>

<script setup lang="ts">
import {} from 'vue'
import { getAvatar } from '../utils'
import type { ApiResponseComment } from '../types'
const props = defineProps<{
  comments: ApiResponseComment[]
}>()
</script>

<style scoped lang="sass">
.comment-list
  list-style: none
  padding: 0

  .comment-item
    z-index: 1
    .user
      > *
        vertical-align: middle
      .avatar
        width: 1.4rem
        height: 1.4rem
        display: inline-block
        border-radius: 50%
        margin-right: 0.4rem

    .content
      --bg-color: #fef1f6
      background-color: var(--bg-color)
      position: relative
      margin-top: 1rem
      border-radius: 6px
      box-shadow: var(--theme-box-shadow)
      padding: 0 1rem
      &::before
        content: ''
        display: block
        position: absolute
        border-top: 1rem solid var(--bg-color)
        border-right: 1rem solid var(--bg-color)
        top: -0.5rem
        left: calc(1.4rem + 0.4rem)
        transform: rotate(45deg)
        box-shadow: -2px -2px 6px var(--theme-box-shadow-color)
        z-index: 1
      .content-main
        position: relative
        background-color: var(--bg-color)
        padding: 1rem 0
        z-index: 1
      .time
        padding-bottom: 1rem
        font-size: 0.75rem
        font-style: italic
        opacity: 0.6
</style>

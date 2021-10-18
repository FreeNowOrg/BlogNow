<template lang="pug">
#post-author.card
  .flex.flex-column.gap-1
    .top.flex.gap-1
      .left
        router-link.avatar.plain(:to='`/@${user.username}`')
          img(:src='getAvatar(user.avatar)')
      .right.flex-1
        router-link.username(:to='`/@${user.username}`') {{ user.username }}
        .special-title(v-if='user.title', title='Special title') {{ user.title }}
        .btn
          a.button Follow
    .bottom
      ul.posts-list
        li.post-placeholder(v-for='item in 10') {{ item }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { getAvatar } from '../utils'
import type { ApiResponseUser } from '../types'
const props = defineProps<{ user: ApiResponseUser }>()
</script>

<style scoped lang="sass">
.top
  .left
    display: flex
    align-items: center

.avatar
  box-shadow: 0 0 0 rgba(0, 0, 0, 0)
  &:hover
    box-shadow: 0 0 0 2px rgba(var(--theme-accent-color--rgb), 0.2)
  border-radius: 50%
  width: 60px
  height: 60px
  overflow: hidden
  img
    width: 100%
    height: 100%

.username
  font-size: 1.25rem
  font-weight: 600
  margin-bottom: 0.5rem

.special-title
  display: inline-block
  font-size: 0.6rem
  background-color: orange
  color: #fff
  padding: 0.2rem 0.4rem
  border-radius: 4px
  margin-bottom: 0.5rem

.posts-list
  list-style: none
  margin: 0
  padding: 0.5rem
  display: flex
  gap: 0.5rem
  flex-wrap: nowrap
  width: 100%
  overflow: auto

  .post-placeholder
    background-color: #eee
    border-radius: 8px
    display: inline-block
    min-width: 80px
    width: 80px
    height: 80px
    flex: 1
    text-align: center
    line-height: 80px
</style>

<template lang="pug">
ul.posts-list
  li.post-item(v-for='item in posts')
    .flex.gap-1
      .left
        router-link.thumb.plain(
          :to='{ name: item.slug ? "post-slug" : "post-uuid", params: { slug: item.slug, uuid: item.uuid } }'
        )
          img(
            :src='item.cover || "https://api.daihan.top/api/acg?_random=" + item.uuid'
          )
      .right.flex-1.flex.flex-column
        .title
          router-link(
            :to='{ name: item.slug ? "post-slug" : "post-uuid", params: { slug: item.slug, uuid: item.uuid } }'
          ) {{ item.title }}
        .author-link(v-if='!item.author.not_exist')
          img.avatar(:src='getAvatar(item.author.avatar)')
          router-link(:to='`/@${item.author.username}`') {{ item.author.nickname || item.author.username }}
        .post-date
          span.created-date(title='Created date')
            icon
              calendar-alt
            time {{ new Date(item.created_at).toLocaleString() }}
          span.edited-date(v-if='item.editor_uuid', title='Edited date')
            | &nbsp;·&nbsp;
            icon
              pen-nib
            time {{ new Date(item.edited_at).toLocaleString() }}
      .actions
        router-link.edit-btn(
          :to='{ name: "edit-post", params: { uuid: item.uuid } }',
          v-if='userData.uuid === item.author_uuid || userData.authority >= 4'
        )
          icon
            pen
        router-link.delete-btn(
          v-if='userData.uuid === item.author_uuid || userData.authority >= 3'
        )
          icon
            trash-alt
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { CalendarAlt, PenNib, Pen, TrashAlt } from '@vicons/fa'
import { getAvatar, userData } from '../utils'
import type { ApiResponsePost } from '../types'
const props = defineProps<{ posts: ApiResponsePost[] }>()
</script>

<style scoped lang="sass">
.posts-list
  position: relative
  list-style: none
  padding: 0
  display: flex
  flex-direction: column
  gap: 2rem
  &::before
    content: ''
    display: block
    position: absolute
    height: 100%
    width: 0.2rem
    top: 0
    left: 1rem
    background-color: rgba(var(--theme-accent-color--rgb), 0.5)
  .post-item
    position: relative
    padding-left: 2rem
    &::before
      content: ''
      display: block
      position: absolute
      width: 1rem
      height: 1rem
      border-radius: 50%
      box-shadow: 0 0 0 4px rgba(var(--theme-accent-color--rgb), 0.5) inset
      left: calc(1rem - 0.5rem + 2px)
      top: 0
      background-color: #fff
      transition: all 0.24s ease
    &:hover::before
      box-shadow: 0 0 0 4px rgba(var(--theme-accent-color--rgb), 1) inset
    .thumb
      width: 100px
      height: 100px
      display: block
      border-radius: 6px
      overflow: hidden
      img
        width: 100%
        height: 100%
        transition: all 0.24s ease
        object-fit: cover
      &:hover img
        transform: scale(1.1)
    .right
      gap: 0.4rem
    .title
      font-size: 1.25rem
      font-weight: 600
    .post-date
      font-size: 0.6rem
    .author-link
      display: inline-block
      font-size: 0.8rem
      .avatar
        vertical-align: middle
        width: 1.4rem
        height: 1.4rem
        border-radius: 50%
        margin-right: 0.5em
      a
        vertical-align: middle
    .actions
      display: flex
      flex-direction: column
      gap: 0.4rem
      justify-content: center
      .delete-btn
        --color: #b00
</style>

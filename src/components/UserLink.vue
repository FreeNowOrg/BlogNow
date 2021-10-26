<template lang="pug">
span.userlink
  img.avatar(:src='getAvatar(user.avatar)')
  router-link.username(:to='`/@${user.username}`', v-if='!user.not_exist') @{{ user.nickname || user.username }}
  a.pointer.plain.username(v-else) {{ "<not-exist>" }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { ApiResponseUser } from '../types'
import { getAvatar } from '../utils'
const props = defineProps<{
  user: ApiResponseUser
}>()
</script>

<style scoped lang="sass">
.userlink
  .avatar,
  .username
    vertical-align: middle
  .avatar
    display: inline-block
    width: 1.4em
    height: 1.4em
    border-radius: 50%
    margin-right: 0.4rem
</style>

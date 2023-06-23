<template lang="pug">
.comment-edit
  .login-area(v-if='!isLoggedIn')
    p
      | Please
      |
      router-link(:to='{ name: "auth", query: { backto: $route.path } }') login
      |
      | to comment.
  .info-area(v-else-if='userData.authority < 1')
    p Permission denied. Please contact site admin.
  .comment-edit-main(v-else, :class='{ "loading-cover": submitLoading }')
    .user-area
      user-link(:user='userData')
    .edit-area
      textarea.site-style(v-model='content')
    .btn-area
      button(@click='handleSubmit') Submit
</template>

<script setup lang="ts">
import axios from 'axios'
import { defineProps, defineEmits, ref } from 'vue'
import { API_BASE } from '../config'
import type { ApiResponse, ApiResponseComment } from '../types'
import { isLoggedIn, userData } from '../utils'
import UserLink from './UserLink.vue'

const props = defineProps<{
  target_type: 'post' | 'user' | 'comment'
  target_uuid: string
}>()
const content = ref('')
const submitLoading = ref(false)

const emits = defineEmits({
  created(comment: ApiResponseComment) {
    return comment
  },
  error(e: any) {
    return e
  },
})

function handleSubmit() {
  if (submitLoading.value || !content.value) {
    return
  }
  submitLoading.value = true
  axios
    .post(`${API_BASE}/comment/${props.target_type}/${props.target_uuid}`, {
      content: content.value,
    })
    .then(
      ({ data }: any) => {
        emits('created', data.body.comment)
        content.value = ''
      },
      (e) => emits('error', e)
    )
    .finally(() => {
      submitLoading.value = false
    })
}
</script>

<style scoped lang="sass">
.edit-area
  textarea
    width: 100%
    min-height: 4em
    resize: vertical
</style>

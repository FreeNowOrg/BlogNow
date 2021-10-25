<template lang="pug">
.comment-edit
  .login-area(v-if='!isLoggedIn')
    p Please login to comment.
  .info-area(v-else-if='userData.authority < 1')
    p Permission denied. Please contact site admin.
  .edit-area(v-else)
    textarea.site-style(v-model='input')
    button(@click='handleSubmit') Submit
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import { isLoggedIn, userData } from '../utils'

const props = defineProps<{
  target_type: 'post' | 'user' | 'comment'
  target_uuid: string
}>()
const input = ref('')

const emits = defineEmits({
  submit() {},
})

function handleSubmit() {}
</script>

<style scoped lang="sass">
.edit-area
  textarea
    width: 100%
    resize: vertical
</style>

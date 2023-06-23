<template lang="pug">
#quick-edit.card
  .site-style
    h3 Quick create post
  #editor(:class='{ "loading-cover": submitLoading }')
    #edit-area
      label
        strong Title
        input.site-style(v-model='title', @blur='handleSaveDraft')
      label
        strong Content
      textarea.site-style(v-model='content', @blur='handleSaveDraft')
    #btn-area
      button(@click='handleSubmit') Submit
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, defineEmits, watch, onMounted } from 'vue'
import { API_BASE } from '../config'
import type { ApiResponse } from '../types'

const title = ref('')
const content = ref('')
const submitLoading = ref(false)

const emits = defineEmits({
  created: (payload: { uuid: string; slug?: string }) => payload,
  error: (e: any) => e,
})

function handleSubmit() {
  if (submitLoading.value) {
    return
  }
  submitLoading.value = true

  axios
    .post<ApiResponse<{ uuid: string }>>(`${API_BASE}/post/new`, {
      title: title.value,
      content: content.value,
    })
    .then(
      ({ data }) => {
        title.value = ''
        content.value = ''
        handleSaveDraft()
        emits('created', data.body)
      },
      (e) => {
        emits('error', e)
      }
    )
    .finally(() => {
      submitLoading.value = false
    })
}

function handleSaveDraft() {
  localStorage.setItem(
    'BLOGNOW_QUICK_DRAFT',
    JSON.stringify({
      title: title.value,
      content: content.value,
    })
  )
}

onMounted(() => {
  const draftRaw = localStorage.getItem('BLOGNOW_QUICK_DRAFT') || ''
  try {
    const draft = JSON.parse(draftRaw)
    title.value = draft?.title ?? ''
    content.value = draft?.content ?? ''
  } catch (e) {}
})
</script>

<style scoped lang="sass">
#quick-edit
  #edit-area
    textarea
      min-height: 4rem
      height: 35vh
      resize: vertical
</style>

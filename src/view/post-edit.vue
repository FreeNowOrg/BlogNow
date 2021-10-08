<template lang="pug">
.post-edit-container(:class='{ "loading-cover": loading }')
  h1 {{ isCreate ? "Create new post" : "Edit post" }}
  .edit-area
    .title-input
      input(v-model='title')
    .content-input
      textarea(v-model='content')
  .btn-area
    button(@click='handleSubmit') Publish
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const uuid = route.params.uuid
const isCreate = !uuid
const title = ref('My post')
const content = ref('')
const loading = ref(false)

function getPost() {
  loading.value = true
  axios
    .get('/api/post', {
      params: {
        uuid,
      },
    })
    .then(
      ({ data }: any) => {
        title.value = data.body.post.title
        content.value = data.body.post.content
      },
      (err) => {
        if (err?.response?.status === 404) {
          location.href = '/post/new'
        }
      }
    )
    .finally(() => {
      loading.value = false
    })
}

function handleSubmit() {
  if (isCreate) {
    handleCreate()
  } else {
    handleUpdate()
  }
}

function handleCreate() {
  loading.value = true
  axios
    .post('/api/post', {
      title: 'Post title',
      content: content.value,
    })
    .then(console.info)
    .finally(() => {
      loading.value = false
    })
}

function handleUpdate() {
  loading.value = true
  axios
    .patch('/api/post', {
      title: 'Post title',
      content: content.value,
    })
    .then(console.info)
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  console.log({ isCreate })
  if (!isCreate) {
    getPost()
  }
})
</script>

<style scoped lang="sass"></style>
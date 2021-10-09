<template lang="pug">
.post-edit-container(:class='{ "loading-cover": loading }')
  h1 {{ isCreate ? "Create new post" : "Edit post" }}
  .edit-area
    .title-input
      input(v-model='title')
    .content-input
      textarea(v-model='content')
  .btn-area
    button(@click='handleSubmit') {{ isCreate ? "Publish" : "Update" }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setTitle } from '../utils/setTitle'

const route = useRoute()
const router = useRouter()

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
          router.push('/post/new')
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
      title: title.value,
      content: content.value,
    })
    .then(({ data }) => {
      router.push({ name: 'post', params: { uuid: data.body.uuid } })
    })
    .finally(() => {
      loading.value = false
    })
}

function handleUpdate() {
  loading.value = true
  axios
    .patch('/api/post', {
      post_uuid: uuid,
      title: title.value,
      content: content.value,
    })
    .then(() => {
      router.push({ name: 'post', params: { uuid } })
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  console.log({ isCreate })
  if (!isCreate) {
    getPost()
  }
  setTitle('Edit', 'Post')
})
</script>

<style scoped lang="sass">
.edit-area
  input, textarea
    width: 100%
  textarea
    resize: vertical
    min-height: 8rem
</style>

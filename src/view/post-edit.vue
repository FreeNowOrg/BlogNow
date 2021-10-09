<template lang="pug">
.post-edit-container(:class='{ "loading-cover": loading }')
  .info.warn(v-if='!userData || userData.authority < 2')
    .title {{ userData ? "No permision" : "Please login" }}
    p(v-if='!userData')
      router-link(:to='{ name: "auth", query: { backto: $route.path } }') Login
    p(v-else) Please contact site admin

  h1 {{ isCreate ? "Create new post" : "Edit post" }}
  .edit-area
    .title-input(style='margin-bottom: 1rem')
      label
        strong Title
        input(v-model='title')

    //- Wide
    .content-input.flex.gap-1
      .text-area.flex-1
        label(for='content')
          strong Content
        textarea#content(v-model='content')
      .preview-area.flex-1
        #post-content(v-html='contentHtml')

    .btn-area
      button(@click='handleSubmit') {{ isCreate ? "Publish" : "Update" }}
  .info.error(v-if='error')
    .title Submit faild
    p {{ error }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrMsg } from '../utils/getErrMsg'
import { userData } from '../components/userData'
import { md } from '../utils/md'
import { setTitle } from '../utils/setTitle'

const route = useRoute()
const router = useRouter()

const uuid = route.params.uuid
const isCreate = !uuid
const title = ref('My post')
const content = ref('')
const loading = ref(false)
const error = ref('')
const contentHtml = computed(() =>
  md.render(`# ${title.value}\n\n${content.value}`)
)

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
  error.value = ''
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
    .then(
      ({ data }: any) => {
        router.push({ name: 'post', params: { uuid: data.body.uuid } })
      },
      (e) => {
        error.value = getErrMsg(e)
      }
    )
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
    .then(
      () => {
        router.push({ name: 'post', params: { uuid } })
      },
      (e) => {
        error.value = getErrMsg(e)
      }
    )
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
    min-height: 70vh
    padding: 1rem 0.4rem
  #post-content
    height: 70vh
    overflow: auto

  .btn-area
    position: sticky
    bottom: 0
    background-color: #fff
    margin-top: 1rem
    padding: 1rem
    box-shadow: 0px -4px 8px #efefef
</style>

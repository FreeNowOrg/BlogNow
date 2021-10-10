<template lang="pug">
#post-edit-container
  main#edit-main
    .body-inner
      h1 {{ isCreate ? "Create new post" : "Edit post" }}
      .bread-crumb(v-if='uuid')
        router-link(:to='{ name: "post", params: { uuid } }') ← back to post
      .edit-area(:class='{ "loading-cover": loading }')
        .title-input(style='margin-bottom: 1rem')
          label
            strong Title
            input(v-model='title')

        //- Wide
        .content-input.flex.gap-1
          .text-area.flex-1
            label(for='content')
              strong Content
            v-md-editor#content(
              v-model='content',
              height='70vh',
              left-toolbar='undo redo | h bold italic strikethrough quote tip | ul ol table hr | link image code | emoji',
              right-toolbar='preview toc fullscreen | save',
              :disabled-menus='["image/upload-image", "h/h1"]',
              @save='handleSubmit'
            )

    .btn-area
      .info.warn(v-if='!userData || userData.authority < 2')
        .title {{ userData ? "No permision" : "Authority error" }}
        p(v-if='!userData')
          | Please
          |
          router-link(:to='{ name: "auth", query: { backto: $route.path } }') Login
        p(v-else) Please contact site admin
      .info.error(v-if='error')
        .title Submit faild
          a.pointer(style='float: right', @click='error = ""') ×
        p {{ error }}
      button(@click='handleSubmit', :disabled='loading') {{ isCreate ? "Publish" : "Update" }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getErrMsg } from '../utils/getErrMsg'
import { userData } from '../components/userData'
import { setTitle } from '../utils/setTitle'

const route = useRoute()
const router = useRouter()

const uuid = route.params.uuid
const isCreate = !uuid
const title = ref('My post')
const content = ref('')
const loading = ref(false)
const error = ref('')

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
        router.push({
          name: 'post',
          params: { uuid },
          query: { noCache: 1 },
        })
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
#post-edit-container
  margin-top: calc(60px + 1rem)
.edit-area
  input
    width: 100%
    padding: 0.4em 0.75em
    font-size: 1.4rem
    line-height: 1em
    border: none
    border-radius: 0.5em
    background-color: rgba(0, 0, 0, 0.025)
    outline: none
    &:hover
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.25)
    &:focus
      box-shadow: 0 0 0 2px var(--theme-accent-color)

.btn-area
  position: sticky
  bottom: 0
  background-color: #fff
  margin-top: 1rem
  padding: 1rem
  box-shadow: 0px -4px 8px #efefef
  z-index: 20
</style>

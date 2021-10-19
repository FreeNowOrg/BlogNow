<template lang="pug">
#edit-post-container
  main#edit-main
    .body-inner
      h1 {{ isCreate ? "Create new post" : "Edit post" }}
      .bread-crumb(v-if='uuid')
        router-link(:to='{ name: "post-uuid", params: { uuid } }') ← back to post
      .edit-area(:class='{ "loading-cover": loading }')
        //- title
        .title-area
          label
            strong Title
            input.title-input(v-model='title')

        //- content
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

        //- slug
        .slug-area
          label
            strong Slug
            input.slug-input.site-style(
              v-model='slug',
              @blur='slug = slugify(slug, { lower: true })'
            )

    .btn-area
      .info.warn(v-if='!canEdit')
        .title {{ isLoggedIn ? "No permision" : "Authority error" }}
        p(v-if='!isLoggedIn')
          | Please
          |
          router-link(:to='{ name: "auth", query: { backto: $route.path } }') Login
        p(v-else) Please contact site admin
      .info.error(v-if='error')
        .title Submit failed
          a.pointer(style='float: right', @click='error = ""') ×
        p {{ error }}
      button(v-if='canEdit', @click='handleSubmit', :disabled='loading') {{ isCreate ? "Publish" : "Update" }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import slugify from 'slugify'
import { getErrMsg, getPost, isLoggedIn, setTitle, userData } from '../utils'
import { API_BASE } from '../config'

const route = useRoute()
const router = useRouter()

const uuid = route.params.uuid as string
const isCreate = !uuid
const title = ref('My post')
const content = ref('')
const slug = ref('')
const loading = ref(false)
const error = ref('')

const canEdit = computed(() => isLoggedIn && userData.value.authority >= 2)

function fetchPost() {
  loading.value = true
  getPost('uuid', uuid, true)
    .then(
      (post) => {
        setTitle(`Edit ${post.title}`)
        title.value = post.title
        content.value = post.content
        slug.value = post.slug
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
    .post(`${API_BASE}/post/new`, {
      title: title.value,
      content: content.value,
      slug: slug.value,
    })
    .then(
      ({ data }: any) => {
        router.push({
          name: data.body.slug ? 'post-slug' : 'post-uuid',
          params: { uuid: data.body.uuid, slug: data.body.slug },
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

function handleUpdate() {
  loading.value = true
  axios
    .patch(`${API_BASE}/post/uuid/${uuid}`, {
      title: title.value,
      content: content.value,
      slug: slug.value,
    })
    .then(
      ({ data }: any) => {
        router.push({
          name: data.body.slug ? 'post-slug' : 'post-uuid',
          params: { uuid: data.body.uuid, slug: data.body.slug },
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
    fetchPost()
  }
  setTitle('Edit post')
})
</script>

<style scoped lang="sass">
#edit-post-container
  margin-top: calc(60px + 1rem)
.edit-area
  > div
    margin-bottom: 1rem
  .title-input
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

// Make edit area wide
.body-inner
  padding: 0 1rem
  max-width: unset
</style>

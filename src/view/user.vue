<template lang="pug">
#user-container
  .body-inner
    h1 User
    .card
      h3 Filter
      pre {{ filter }}
      h3 User
      ul
        li
          strong isMe
          span &nbsp;{{ isMe }}
        li
          strong notFound
          span &nbsp;{{ notFound }}
      pre {{ user }}
      h3 Posts
      pre {{ posts }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE } from '../config'
import type { DbPostDoc, DbUserDoc } from '../types/Database'
import { getUser, setTitle, userData } from '../utils'

const route = useRoute()

type UserSelector = 'uuid' | 'uid' | 'username'
const filter = computed(() => {
  const selector = (route.name as string).split('-')[1] as UserSelector
  const target = route.params[selector] as string
  return { selector, targrt: selector === 'uid' ? parseInt(target) : target }
})

const user = ref<DbUserDoc>()
const posts = ref<DbPostDoc[]>([])
const postLoading = ref(false)
const notFound = ref(false)
const isMe = computed(() => userData.value.uuid === user.value?.uuid)

function init() {
  user.value = undefined
  posts.value = []
  notFound.value = false
  postLoading.value = true
  getUser(filter.value.selector, filter.value.targrt).then(
    (data) => {
      user.value = data
      setTitle(data.username, 'User')
      return initUserPosts()
    },
    (e) => {
      if (e?.response?.status === 404) {
        notFound.value = true
      }
    }
  )
}

function initUserPosts() {
  axios
    .get(
      `${API_BASE}/user/${filter.value.selector}/${filter.value.targrt}/posts`
    )
    .then(({ data }: any) => {
      posts.value = data.body.posts
    })
    .finally(() => {
      postLoading.value = false
    })
}

watch(filter, () => {
  if (filter.value.selector) init()
})

onMounted(() => {
  init()
  setTitle('User')
})
</script>

<style scoped lang="sass">
#user-container
  padding-top: 60px
</style>

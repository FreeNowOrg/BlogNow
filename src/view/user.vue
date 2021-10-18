<template lang="pug">
#user-container
  header#user-header
    .inner

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
      ul
        li
          strong postLoading
          span &nbsp;{{ postLoading }}
      pre {{ posts }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE } from '../config'
import type { DbPostDoc, DbUserDoc } from '../types/Database'
import { getUser, isLoggedIn, setTitle, userData } from '../utils'

const [route, router] = [useRoute(), useRouter()]

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
const isMe = computed(
  () => isLoggedIn.value && userData.value.uuid === user.value?.uuid
)

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
      user.value = {
        authority: 4,
        avatar:
          'https://gravatar.loli.net/avatar/7e17d0b4b93472b346ab2a698442660d',
        created_at: '2021-10-09T11:27:47.682Z',
        gender: 'other',
        nickname: '',
        slogan: '',
        title: '最最最伟大的总执事',
        uid: 10000,
        username: 'XiaoYuJunDesu',
        uuid: '2083c0b2-c4bf-49c9-9b4e-b1345727daca',
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

const bgImg = computed(
  () =>
    `url(https://api.daihan.top/api/acg?_random=${
      user.value?.uuid || route.params.uuid
    })`
)

router.afterEach((to, from) => {
  if ((to.name as string)?.startsWith('user') && to !== from) init()
})

onMounted(() => {
  init()
  setTitle('User')
})
</script>

<style scoped lang="sass">
// #user-container
//   padding-top: 60px
#user-header
  position: relative
  text-align: center
  color: #fff
  height: 300px
  background-image: v-bind(bgImg)
  background-position: center
  background-size: cover
  background-attachment: fixed
  &::before
    content: ""
    display: block
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background-color: rgba(0, 0, 0, 0.5)
    z-index: 0
  .inner
    position: absolute
    top: 50%
    left: 0
    transform: translateY(-50%)
    width: 100%
</style>

<style lang="sass">
#global-header
  transition: all 0.24s ease
[data-at-top='true'][data-route^='user']
  #global-header
    background-color: transparent
    box-shadow: none
    a
      --color: #fff
</style>

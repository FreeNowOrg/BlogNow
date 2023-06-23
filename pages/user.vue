<template lang="pug">
#user-container
  nav#user-header

  header#user-info.body-inner.flex.flex-auto.gap-1
    .avatar
      img(:src='getAvatar(user?.avatar, { width: 200 })')
    .user-meta.flex-1
      h1.nickname(v-if='!notFound && !user') Loading user...
      h1.nickname(v-if='user') {{ user.nickname || user.username }}
      h1.nickname(v-if='notFound') User not found
      .username(v-if='user?.nickname') @{{ user.username }}
      .uuid(v-if='user') UID{{ user.uid }}

  main#user-main.body-inner
    .main-flex
      article.card
        #user-loading.loading(v-if='!user && !notFound')
          placeholder
        #user-not-found(v-if='notFound') User not found

        #user-content(v-if='!notFound && user')
          #user-details
            p.pre {{ user.slogan || "-" }}
          hr
          #user-posts
            h3 Posts by user
            #post-loading.loading(v-if='postLoading')
              placeholder
            post-list(v-else :posts='posts')

      global-aside
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_BASE } from '../config'
import { getAvatar, getUser, isLoggedIn, setTitle, userData } from '../utils'
import GlobalAside from '../components/GlobalAside.vue'
import PostList from '../components/PostList.vue'
import type { ApiResponsePost, ApiResponseUser } from '../types'

const [route, router] = [useRoute(), useRouter()]

type UserSelector = 'uuid' | 'uid' | 'username'

const user = ref<ApiResponseUser>()
const posts = ref<ApiResponsePost[]>([])
const postLoading = ref(false)
const notFound = ref(false)
const isMe = computed(
  () => isLoggedIn.value && userData.value.uuid === user.value?.uuid
)
const filter = computed(() => {
  const selector = (route.name as string).split('-')[1] as UserSelector
  const target = route.params[selector] as string
  return {
    selector,
    target,
  }
})

function init() {
  user.value = undefined
  posts.value = []
  notFound.value = false
  postLoading.value = true

  getUser(filter.value.selector, filter.value.target).then(
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
      `${API_BASE}/user/${filter.value.selector}/${filter.value.target}/posts`
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
#user-header
  position: relative
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

#user-info
  position: relative
  margin-bottom: 1rem
  .avatar
    position: absolute
    top: -60px
    img
      width: 120px
      height: 120px
      border-radius: 50%
      box-shadow: 0 0 0 4px #fff
  .user-meta
    margin-left: calc(120px + 1rem)
    .nickname
      font-size: 2rem
      margin: 1rem 0 0 0
      font-weight: 600
    .uuid
      font-size: 0.75rem
      color: #ccc

@media screen and (max-width:900px)
  #user-header
    height: 25vh
  #user-info
    text-align: center
    .avatar
      position: absolute
      left: 50%
      transform: translateX(-50%)
      img
        box-shadow: 0 0 0 6px #fff
    .user-meta
      margin-left: 0
      margin-top: calc(60px + 1rem)
      .nickname
        margin: 0

pre
  white-space: break-spaces
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
    .logo-placeholder
      background-color: rgba(0, 0, 0, 0.25)
</style>

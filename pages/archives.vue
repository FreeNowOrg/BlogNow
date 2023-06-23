<template lang="pug">
#archive-container
  main#archive-main
    .main-flex.body-inner
      article#archive-post-list
        #post-content.card
          h1 Recent posts
          .loading(v-if='posts.length < 1')
            placeholder
          post-list(:posts='posts')

          .next-btn.align-center(v-if='hasNext')
            a.button(@click='handleLoadMore') {{ nextLoading ? "Loading..." : "Load more" }}

      global-aside
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setTitle } from '../utils/setTitle'
import GlobalAside from '../components/GlobalAside.vue'
import { getPostList, getRecentPosts } from '../utils'
import type { ApiResponsePost } from '../types'
import PostList from '../components/PostList.vue'

const posts = ref<ApiResponsePost[]>([])
const hasNext = ref(false)
const nextLoading = ref(false)

function init() {
  getRecentPosts(true).then((list) => {
    posts.value = list
    hasNext.value = true
  })
}

function handleLoadMore() {
  if (nextLoading.value) return
  nextLoading.value = true
  getPostList({ offset: posts.value.length })
    .then((list) => {
      posts.value.push(...list)
    })
    .finally(() => {
      nextLoading.value = false
    })
}

onMounted(() => {
  init()
  setTitle('Archives')
})
</script>

<style scoped lang="sass">
#archive-main
  margin-top: calc(60px + 1rem)
</style>

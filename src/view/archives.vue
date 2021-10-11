<template lang="pug">
#archive-container
  main#archive-main
    .main-flex.body-inner
      #archive-post-list.flex-1
        .card
          h1 Posts
          .loading(v-if='posts.length < 1')
            placeholder
          ul
            li(v-for='item in posts')
              .title {{ item.title }}
              .link
                router-link(
                  :to='{ name: "post", params: { slug: item.slug || undefined, uuid: item.slug ? undefined : item.uuid } }'
                ) view
      global-aside
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setTitle } from '../utils/setTitle'
import { API_BASE } from '../config'
import GlobalAside from '../components/GlobalAside.vue'
import { getRecentPosts } from '../utils'

const posts = ref<any[]>([])

function init() {
  getRecentPosts(true).then((list) => {
    posts.value = list
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

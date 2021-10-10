<template lang="pug">
#archive-container
  main#archive-main
    .main-flex
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
                  :to='{ name: "post", params: { uuid: item.uuid } }'
                ) view
      global-aside
</template>

<script setup lang="ts">
import { onMounted, ref, defineComponent } from 'vue'
import axios from 'axios'
import { setTitle } from '../utils/setTitle'
import { API_BASE } from '../config'
import GlobalAside from '../components/GlobalAside.vue'

const components = defineComponent({ GlobalAside })

const posts = ref([])

function init() {
  axios
    .get(`${API_BASE}/post`, { params: { limit: 25, offset: 0 } })
    .then(({ data }: any) => {
      posts.value = data.body.posts
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

<template lang="pug">
.archive-container
  .loading(v-if='!posts.length')
    | loading post list...
  .archive-main(v-else)
    h1 Archive
    ul
      li(v-for='item in posts')
        strong {{ item.title }}
        i by {{ item.author_uuid }}
        i ({{ new Date(item.created_at).toLocaleString() }})
        router-link(:to='{ name: "post", params: { uuid: item.uuid } }') view
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'

const posts = ref([])

function init() {
  axios
    .get('/api/post', { params: { limit: 25, offset: 0 } })
    .then(({ data }: any) => {
      posts.value = data.body.posts
    })
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="sass"></style>

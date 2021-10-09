<template lang="pug">
.archive-container
  .loading(v-if='!posts.length')
    | loading post list...
  .archive-main(v-else)
    h1 Archive
    ul.post-list.card
      li.post-card.card(v-for='item in posts')
        .title
          strong {{ item.title }}
        .author by {{ item.author_uuid }}
        .created-time ({{ new Date(item.created_at).toLocaleString() }})
        .visit-link
          router-link(:to='{ name: "post", params: { uuid: item.uuid } }') view →
    .card
      details
        pre {{ posts }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { setTitle } from '../utils/setTitle'

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
  setTitle('Archives')
})
</script>

<style scoped lang="sass"></style>

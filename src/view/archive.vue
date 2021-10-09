<template lang="pug">
.archive-container
  .loading(v-if='!posts.length')
    | loading post list...
  .archive-main(v-else)
    h1 Archive
    .post-list.flex-list.card
      .list-item.header
        .key Title
        .val Author
        .val Create
        .val Link
      .post-card.list-item.card(v-for='item in posts')
        .key.title
          strong {{ item.title }}
        .author @{{ item.author_uuid }}
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
import { API_BASE } from '../config'

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

<style scoped lang="sass"></style>

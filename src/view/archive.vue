<template lang="pug">
.loading(v-if='!posts.length')
  | loading...

.archive-container(v-if='posts.length')
  h1 Archive
  pre {{ posts }}
</template>

<script setup lang="ts">
import { onMounted, ref } from '@vue/runtime-core'
import axios from 'axios'
import { useRoute } from 'vue-router'
const route = useRoute()

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

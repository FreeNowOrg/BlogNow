<template lang="pug">
.loading(v-if='!post')
  | loading...

.post-container(v-if='post')
  h1 Post {{ $route.params.uuid }}
  pre {{ post }}
</template>

<script setup lang="ts">
import { onMounted, ref } from '@vue/runtime-core'
import axios from 'axios'
import { useRoute } from 'vue-router'
const route = useRoute()

const post = ref(null)

function init() {
  axios
    .get('/api/post', {
      params: {
        uuid: route.params.uuid,
      },
    })
    .then(({ data }: any) => {
      post.value = data.body
    })
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="sass"></style>

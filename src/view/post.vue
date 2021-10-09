<template lang="pug">
.post-container
  .loading(v-if='!post')
    h1 {{ uuid }}
    .card loading post...
  .post-main(v-if='post')
    h1 {{ post.title }}
    .btn-area
      router-link(:to='{ name: "post-edit", params: { uuid: post.uuid } }') {{ userData && userData.authority >= 2 ? "edit post" : "view source" }}
    .card.pre {{ post.content }}
    .card
      details
        pre {{ post }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { userData } from '../components/userData'
import { setTitle } from '../utils/setTitle'
const route = useRoute()

const uuid = ref(route.params.uuid)
const post = ref(null)

function init() {
  axios
    .get('/api/post', {
      params: {
        uuid: uuid.value,
      },
    })
    .then(({ data }: any) => {
      setTitle(data.body.post.title)
      post.value = data.body.post
    })
}

onMounted(() => {
  init()
  setTitle('Post')
})
</script>

<style scoped lang="sass"></style>

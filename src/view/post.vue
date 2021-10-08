<template lang="pug">
.post-container
  .loading(v-if='!post')
    | loading post...
  .post-main(v-if='post')
    h1 Post {{ uuid }}
    pre {{ post }}
    .btn
      router-link(
        :to='{ name: "post-edit", params: { uuid } }',
        v-if='userData && userData.authority >= 2'
      ) edit
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { userData } from '../components/userData'
const route = useRoute()

const uuid = route.params.uuid
const post = ref(null)

function init() {
  axios
    .get('/api/post', {
      params: {
        uuid,
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

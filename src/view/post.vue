<template lang="pug">
.post-container
  .loading(v-if='!post')
    h1 {{ uuid }}
    .card loading post...
  .post-main(v-if='post')
    h1 {{ post.title }}
    p.meta-area.card.flex.gap-1.flex-center
      .author
        | @{{ post.author_uuid }}
      .created-time
        span Created at&nbsp;
        time {{ new Date(post.created_at).toLocaleString() }}
      .edited-time(v-if='post.edited_at')
        | (
        span @{{ post.editor_uuid }} edited at&nbsp;
        time {{ new Date(post.edited_at).toLocaleString() }}
        | )
      .edit-link
        router-link(:to='{ name: "post-edit", params: { uuid: post.uuid } }') {{ userData && userData.authority >= 2 ? "edit post" : "view source" }}
    #post-content.card
      v-md-editor(v-model='post.content', mode='preview')
    .card
      details
        pre {{ post }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { userData } from '../components/userData'
import { setTitle } from '../utils/setTitle'
import { API_BASE } from '../config'

const route = useRoute()

const uuid = ref(route.params.uuid)
const post = ref<any>(null)

function init() {
  axios
    .get(`${API_BASE}/post`, {
      params: {
        uuid: uuid.value,
      },
    })
    .then(({ data }: any) => {
      setTitle(data.body.post.title)
      post.value = data.body.post
    })
}

// const postHtml = computed(() => md.render(post.value?.content))

onMounted(() => {
  init()
  setTitle('Post')
})
</script>

<style scoped lang="sass"></style>

<template lang="pug">
.post-container
  header#post-header
    .inner
      h1#post-title {{ post ? psot.title : "Post title" }}
      #post-meta(v-if='post')
        .author @Author
        .date Created at <time>time</time>
      #post-meta(v-else)
        .foo Loading post...

  main#post-main.responsive
    .bread-crumb.card
      router-link(to='/') Home
      | &nbsp;|&nbsp;
      router-link(to='/archive') Posts
      | &nbsp;> yyyy > MM > dd

    .main-flex
      article#post-content.card
        .loading(v-if='!post')
          placeholder
        v-md-editor(v-if='post', v-model='post.content', mode='preview')
      global-aside
    .card
      details
        pre {{ post }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { userData } from '../components/userData'
import GlobalAside from '../components/GlobalAside.vue'
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

<style scoped lang="sass">
#post-header
  position: relative
  text-align: center
  color: #fff
  height: 400px
  background-image: url(https://blog.wjghj.cn/_statics/images/uploads/cc848d0f-00ed-4c2e-be9d-aec88d410cfc.jpeg)
  &::before
    content: ""
    display: block
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    background-color: rgba(0, 0, 0, 0.5)
    z-index: 0
  .inner
    position: absolute
    top: 50%
    left: 0
    transform: translateY(-50%)
    width: 100%

#post-main
  margin: 3rem 0 4rem 0
</style>

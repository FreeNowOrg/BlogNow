<template lang="pug">
#post-container
  header#post-header
    .inner
      h1#post-title {{ post ? post.title : "Post title" }}
      #post-meta(v-if='post')
        .author @Author
        .date Created at <time>time</time>
      #post-meta(v-else)
        .foo Loading post...
      #edit-links
        router-link(:to='{ name: "post-edit", params: { uuid } }') {{ userData && userData.authority >= 2 ? "Edit post" : "View source" }}

  main#post-main.body-inner
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
        .after(v-if='post')
          hr
          p Article after
      global-aside
        template(#top)
          .card.author-card Author
        template(#default)
          .card 123
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
import { getPost } from '../utils'

const route = useRoute()

const uuid = ref(route.params.uuid as string)
const post = ref<any>(null)

function init() {
  getPost({ uuid: uuid.value }, !!route.query.noCache).then((data) => {
    setTitle(data.title)
    post.value = data
  })
}

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
  background-image: url(https://api.daihan.top/api/acg)
  background-position: center
  background-size: cover
  background-attachment: fixed
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
    a
      --color: #a3cfff

    #post-meta
      margin-bottom: 1rem

#post-main
  margin: 3rem auto 4rem
</style>

<template lang="pug">
#post-container
  header#post-header
    .inner
      h1#post-title {{ post ? post.title : "Post title" }}
      #post-meta(v-if='post')
        .create-date Created at <time>{{ new Date(post.created_at).toLocaleString() }}</time>
        .edited-date(v-if='post.edited_at') Edited at <time>{{ new Date(post.edited_at).toLocaleString() }}</time>
      #post-meta(v-if='!post')
        .foo Loading post...

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
        v-md-editor(
          v-if='post',
          v-model='post.content',
          mode='preview',
          ref='article'
        )

        #post-after(v-if='post')
          hr
          p Article after

        #post-tools-container
          #post-tools
            //- @note Please use the RegExp constructor instead of literal
            router-link.plain(
              :to='`${$route.path.replace(new RegExp("/$"), "")}/edit`'
            )
              icon
                edit-filled
              .tooltip {{ userData && userData.authority >= 2 ? "Edit this post" : "View source" }}
            button
              icon
                menu-filled
              .tooltip Toggle menu
            button
              icon
                delete-filled
              .tooltip Delete this post
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
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { EditFilled, MenuFilled, DeleteFilled } from '@vicons/material'
import { userData } from '../components/userData'
import GlobalAside from '../components/GlobalAside.vue'
import { setTitle } from '../utils/setTitle'
import { getPost } from '../utils'
import type { DbPostDoc } from '../types/Database'

const route = useRoute()

let search = ref({} as { key: 'uuid' | 'pid' | 'slug'; val: string })
if (route.params.uuid) {
  search.value.key = 'uuid'
  search.value.val = route.params.uuid as string
} else if (route.params.pid) {
  search.value.key = 'pid'
  search.value.val = route.params.pid as string
} else if (route.params.slug) {
  search.value.key = 'slug'
  search.value.val = route.params.slug as string
}

const post = ref<DbPostDoc | null>(null)
const bgImg = ref(
  `url(https://api.daihan.top/api/acg?_random=${
    post.value?.uuid || route.params.uuid
  })`
)

function init() {
  getPost(search.value.key, search.value.val, !!route.query.noCache).then(
    (data) => {
      setTitle(data.title)
      post.value = data
    }
  )
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
  background-image: v-bind(bgImg)
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

#post-content
  padding: 2rem
  position: relative

#post-tools-container
  position: absolute
  left: 0
  top: 0
  width: 0
  height: 100%
  #post-tools
    position: sticky
    top: 60px
    display: flex
    flex-direction: column
    gap: 1rem
    margin-left: -1rem
    padding-top: 2rem
    padding-bottom: 4rem
    a,
    button
      position: relative
      display: block
      border-radius: 50%
      background-color: var(--theme-accent-color)
      --color: #fff
      color: #fff
      box-shadow: 0 0 6px #aaa
      width: 2rem
      height: 2rem
      line-height: 2rem
      padding: 0
      text-align: center
      .tooltip
        display: block
        position: absolute
        left: 2rem
        top: 0
        font-size: 0.85rem
        background-color: #f8f8f8
        color: var(--theme-text-color)
        white-space: pre
        box-shadow: 0 0 6px #ccc
        padding: 0.2rem 0.4rem
        border-radius: 4px
        opacity: 0
        pointer-events: none
        transition: all 0.24s ease
      &:hover
        .tooltip
          pointer-events: unset
          left: 2.4rem
          opacity: 1
</style>

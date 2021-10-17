<template lang="pug">
#post-container
  header#post-header
    .inner
      h1#post-title {{ post ? post.title : notFound ? "Post Not Found" : "Post title" }}
      #post-meta(v-if='post')
        .create-date Created at <time>{{ new Date(post.created_at).toLocaleString() }}</time>
        .edited-date(v-if='post.edited_at') Edited at <time>{{ new Date(post.edited_at).toLocaleString() }}</time>
      #post-meta(v-if='!post')
        .desc {{ notFound ? "Oops..." : "Loading post..." }}

  main#post-main.body-inner
    .bread-crumb.card
      router-link(to='/') 
        icon
          home-filled
        | Home
      | &nbsp;|&nbsp;
      router-link(to='/archive') Posts
      | &nbsp;> yyyy > MM > dd

    .main-flex
      article#post-content.card
        .loading(v-if='!post && !notFound')
          placeholder

        v-md-editor(
          v-if='post',
          v-model='post.content',
          mode='preview',
          @change='updateMenu'
        )

        #post-not-found(v-if='notFound')
          .align-center
            h2 That's four-oh-four
            .flex.flex-column.gap-1
              router-link.big-link.plain(
                v-if='userData && userData.authority >= 2',
                to='/post/new'
              )
                .icon(style='font-size: 5rem')
                  icon
                    post-add-filled
                .desc Add new post
              .flex.gap-1
                router-link.big-link.plain(to='/')
                  .icon(style='font-size: 4rem')
                    icon
                      home-filled
                  .desc Take me home
                router-link.big-link.plain(to='/archives')
                  .icon(style='font-size: 4rem')
                    icon
                      folder-open-filled
                  .desc View all posts

        #post-after(v-if='post')
          hr
          p Article after

        #post-tools-container
          #post-tools(v-if='post')
            //- @note Please use the RegExp constructor instead of literal
            router-link.plain.tool-btn(
              :to='{ name: "edit-post", params: { uuid: post.uuid } }'
            )
              icon
                edit-filled
              .tooltip {{ userData && userData.authority >= 2 ? "Edit this post" : "View source" }}
            button#post-float-menu-btn.tool-btn(
              v-if='titles.length >= 3',
              @click.stop='menuShow = !menuShow'
            )
              icon
                menu-filled
              .tooltip(v-if='!menuShow') Toggle menu
              transition(
                name='fade',
                mode='out-in',
                enter-active-class='fadeInUp',
                leave-active-class='fadeOutDown'
              )
                ul#post-float-menu(
                  v-show='menuShow',
                  @click.stop='',
                  :class='{ "menu-show": menuShow }'
                )
                  li(v-for='item in titles', :indent='item.indent')
                    a.plain(
                      @click='handleAnchorClick(item.line)',
                      :style='{ "padding-left": `calc(0.4rem + ${item.indent * 0.8}rem)` }'
                    ) {{ item.title }}
            button.tool-btn
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DeleteFilled,
  EditFilled,
  FolderOpenFilled,
  HomeFilled,
  MenuFilled,
  PostAddFilled,
} from '@vicons/material'
import scrollTo from 'animated-scroll-to'
import GlobalAside from '../components/GlobalAside.vue'
import { getPost, setTitle, userData } from '../utils'
import type { DbPostDoc } from '../types/Database'

const route = useRoute()
const router = useRouter()

const filter = computed(() => {
  const selector = (route.name as string).split('-')[1] as
    | 'uuid'
    | 'pid'
    | 'slug'
  const target = route.params[selector] as string
  return { selector, targrt: selector === 'pid' ? parseInt(target) : target }
})

const post = ref<DbPostDoc | null>(null)
const bgImg = computed(
  () =>
    `url(https://api.daihan.top/api/acg?_random=${
      post.value?.uuid || route.params.uuid
    })`
)
const notFound = ref(false)
const menuShow = ref(false)

function init() {
  post.value = null
  notFound.value = false
  getPost(
    filter.value.selector,
    filter.value.targrt,
    !!route.query.noCache
  ).then(
    (data) => {
      setTitle(data.title)
      post.value = data
    },
    (e) => {
      if (e.response.status === 404) {
        notFound.value = true
      }
    }
  )
}

const titles = ref<{ title: string; line: string; indent: number }[]>([])
function updateMenu(text: string, html: string) {
  const el = document.createElement('div')
  el.innerHTML = html
  const anchors = el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const list = Array.from(anchors) as HTMLHeadingElement[]

  const hTags = Array.from(new Set(list.map((title) => title.tagName))).sort()

  titles.value = list.map((el) => {
    return {
      title: el.innerText,
      line: el.getAttribute('data-v-md-line') as string,
      indent: hTags.indexOf(el.tagName),
    }
  })
}

function handleAnchorClick(line: string) {
  const el = document.querySelector(`[data-v-md-line="${line}"]`) as Element
  scrollTo(el, {
    verticalOffset: -100,
  })
  menuShow.value = false
}

watch(filter, () => {
  if (filter.value.targrt) init()
})

onMounted(() => {
  init()
  setTitle('Post')
  document.addEventListener('click', () => {
    menuShow.value = false
  })
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

#post-not-found
  .big-link
    flex: 1
    padding: 4rem 0
    border: 4px dashed
    border-radius: 0.6rem
    display: block
    --color: #aaa
    transition: all 0.2s ease
    &:hover
      --color: var(--theme-accent-color)

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
    .tool-btn
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

      #post-float-menu
        position: absolute
        list-style: none
        padding: 0.4rem
        text-align: left
        display: flex-block
        flex-direction: column
        left: 2.4rem
        top: -4rem
        white-space: wrap-word
        width: 14rem
        max-height: 50vh
        overflow: auto
        background-color: #fff
        border-radius: 8px
        box-shadow: 0 0 6px #ccc
        gap: 0.4rem
        li
          padding: 0
          margin: 0
          transition: all 0.2s ease
          border-radius: 4px
          a
            display: block
            padding: 0.2rem
          &:hover
            background-color: var(--theme-tag-color)
</style>

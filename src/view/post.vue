<template lang="pug">
#post-container
  header#post-header
    .inner
      h1#post-title {{ post ? post.title : notFound ? "Post Not Found" : "Blog Post" }}
      #post-meta(v-if='post')
        .create-date Created at <time>{{ new Date(post.created_at).toLocaleString() }}</time>
        .edited-date(v-if='post.edited_at !== post.created_at') Edited at <time>{{ new Date(post.edited_at).toLocaleString() }}</time>
      #post-meta(v-if='!post')
        .desc {{ notFound ? "Oops..." : "Now loading" + dots }}

  main#post-main.body-inner
    .bread-crumb.card
      icon
        home
      router-link(to='/') 
        | Home
      icon
        grip-lines-vertical
      router-link(to='/archive') Posts
      icon 
        angle-right
      | {{ notFound ? "404" : post ? post.title : "loading" + dots }}

    .main-flex
      article.card
        .loading(v-if='!post && !notFound')
          placeholder

        #post-content
          v-md-editor(
            v-if='post',
            v-model='post.content',
            mode='preview',
            @change='handleContentUpdated'
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
                    edit
                .desc Add new post
              .flex.gap-1
                router-link.big-link.plain(to='/')
                  .icon(style='font-size: 4rem')
                    icon
                      home
                  .desc Take me home
                router-link.big-link.plain(to='/archives')
                  .icon(style='font-size: 4rem')
                    icon
                      folder-open
                  .desc View all posts

        #post-after(v-if='post')
          hr
          #comment-area
            h4 Latest commets
            .loading(v-if='commentsLoading && comments.length < 1')
              placeholder
            #comments-main(v-else)
              comment-edit(
                target_type='post',
                :target_uuid='post.uuid',
                :author_uuid='post.author_uuid',
                @created='handleCommentCreated'
              )
              .desc Total {{ total_comments }} {{ total_comments > 1 ? "comments" : "comment" }}
              comment-list(:comments='comments')

        #post-tools-container
          #post-tools(v-if='post')
            router-link.plain.tool-btn(
              :to='{ name: "edit-post", params: { uuid: post.uuid } }'
            )
              icon
                pen(v-if='userData.authority >= 2')
                code-icon(v-else)
              .tooltip {{ userData.authority >= 2 ? "Edit this post" : "View source" }}
            button#post-float-menu-btn.tool-btn(
              v-if='titles.length >= 3',
              @click.stop='menuShow = !menuShow'
            )
              icon
                bars
              .tooltip(v-if='!menuShow') Toggle menu
              transition(
                name='fade',
                mode='out-in',
                enter-active-class='fadeInUp',
                leave-active-class='fadeOutDown'
              )
                #post-float-menu.flex.flex-column(
                  v-show='menuShow',
                  @click.stop='',
                  :class='{ "menu-show": menuShow }'
                )
                  strong Table of Contents
                  ul.flex-1
                    li(v-for='item in titles', :indent='item.indent')
                      a.plain(
                        @click='handleAnchorClick(item.line)',
                        :style='{ "padding-left": `calc(0.4rem + ${item.indent * 0.8}rem)` }'
                      ) {{ item.title }}
            button.tool-btn
              icon
                trash-alt
              .tooltip Delete this post
      global-aside
        template(#top)
          author-card(
            v-if='post',
            :author='post.author',
            :editor='post.editor'
          )
        template(#default)
          .card.site-style(v-if='post')
            h4 Meta data
            .flex-list
              .list-item
                .key UUID
                .val {{ post.uuid }}
              .list-item
                .key Post ID
                .val {{ post.pid }}
              .list-item
                .key Slug
                .val {{ post.slug }}
              .list-item
                .key Created at
                .val {{ new Date(post.created_at).toLocaleString() }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AngleRight,
  Bars,
  Code as CodeIcon,
  Edit,
  FolderOpen,
  GripLinesVertical,
  Home,
  Pen,
  TrashAlt,
} from '@vicons/fa'
import scrollTo from 'animated-scroll-to'
import AuthorCard from '../components/AuthorCard.vue'
import CommentEdit from '../components/CommentEdit.vue'
import CommentList from '../components/CommentList.vue'
import GlobalAside from '../components/GlobalAside.vue'
import { getPost, setTitle, userData } from '../utils'
import type {
  ApiResponse,
  ApiResponseComment,
  ApiResponseCommentList,
  ApiResponsePost,
} from '../types'
import axios from 'axios'
import { API_BASE } from '../config'
import Placeholder from '../components/Placeholder.vue'

const [route, router] = [useRoute(), useRouter()]

const dots = ref('.')
setInterval(() => {
  if (dots.value.length >= 6) {
    dots.value = '.'
  } else {
    dots.value += '.'
  }
}, 1000)

const post = ref<ApiResponsePost>()
const bgImg = computed(
  () =>
    `url(https://api.daihan.top/api/acg?_random=${
      post.value?.uuid || route.params.uuid
    })`
)
const notFound = ref(false)
const menuShow = ref(false)
const filter = computed(() => {
  const selector = (route.name as string).split('-')[1] as
    | 'uuid'
    | 'pid'
    | 'slug'
  const target = route.params[selector] as string
  return { selector, target }
})

function init() {
  post.value = undefined
  notFound.value = false

  getPost(
    filter.value.selector,
    filter.value.target,
    !!route.query.noCache
  ).then(
    (data) => {
      setTitle(data.title)
      post.value = data
      initComments()
    },
    (e) => {
      if (e?.response?.status === 404) {
        notFound.value = true
      }
    }
  )
}

// TOC
const titles = ref<{ title: string; line: string; indent: number }[]>([])
async function handleContentUpdated(text: string, html: string) {
  // handle update menu
  const el = document.createElement('div')
  el.innerHTML = html
  const anchors = el.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const list = Array.from(anchors) as HTMLHeadingElement[]

  const hTags = Array.from(new Set(list.map((title) => title.tagName))).sort()

  titles.value = list.map((el) => ({
    title: el.innerText,
    line: el.getAttribute('data-v-md-line') as string,
    indent: hTags.indexOf(el.tagName),
  }))

  // handle internal links
  await nextTick()
  const $content = document.getElementById('post-content')
  const $links = $content?.querySelectorAll('a')
  $links?.forEach((item) => {
    item.addEventListener('click', function (e) {
      const href = this.getAttribute('href') || ''
      const target = this.target
      if (target !== '_blank' && href.startsWith('/')) {
        e.preventDefault()
        router.push(href)
      }
    })
  })
}

function handleAnchorClick(line: string) {
  const el = document.querySelector(`[data-v-md-line="${line}"]`) as Element
  scrollTo(el, {
    verticalOffset: -100,
  })
  menuShow.value = false
}

// Comments
const comments = ref<ApiResponseComment[]>([])
const total_comments = ref(0)
const commentsLoading = ref(false)
function initComments() {
  if (!post.value || commentsLoading.value) {
    return
  }
  commentsLoading.value = true
  axios
    .get<ApiResponse<ApiResponseCommentList>>(
      `${API_BASE}/comment/post/${post.value.uuid}`,
      {
        params: {
          sort: '!_id',
        },
      }
    )
    .then(({ data }) => {
      comments.value = data.body.comments
      total_comments.value = data.body.total_comments
    })
    .finally(() => {
      commentsLoading.value = false
    })
}
function handleCommentCreated(data: ApiResponseComment) {
  comments.value.unshift(data)
  total_comments.value++
}

router.afterEach((to, from) => {
  if ((to.name as string)?.startsWith('post') && to !== from) init()
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

article
  padding: 2rem
  position: relative

#post-content
  min-height: 8em
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
      background-color: #fff
      --color: var(--theme-accent-color)
      color: var(--theme-accent-color)
      box-shadow: 0 0 6px #ccc
      width: 2rem
      height: 2rem
      line-height: 2rem
      padding: 0
      text-align: center
      transition: box-shadow 0.24s ease
      &:hover
        box-shadow: 0 0 8px #aaa
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
          left: 2.4rem
          opacity: 1

      #post-float-menu
        position: absolute
        width: 14rem
        max-height: 50vh
        left: 2.4rem
        top: -4rem
        background-color: #fff
        border-radius: 8px
        box-shadow: 0 0 6px #ccc
        cursor: auto
        strong
          color: #252525
        ul
          overflow: auto
          height: 100%
          list-style: none
          padding: 0.4rem
          display: flex-block
          margin: 0
          text-align: left
          flex-direction: column
          white-space: wrap-word
          gap: 0.4rem
          li
            padding: 0
            margin: 0
            transition: all 0.2s ease
            border-radius: 4px
            a
              display: block
              padding: 0.2rem
              cursor: pointer
            &:hover
              background-color: var(--theme-tag-color)
</style>

<style lang="sass">
#global-header
  transition: all 0.24s ease
[data-at-top='true'][data-route^='post']
  #global-header
    background-color: transparent
    box-shadow: none
    a
      --color: #fff
</style>

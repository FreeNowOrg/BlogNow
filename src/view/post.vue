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
      icon
        home
      router-link(to='/') 
        | Home
      | &nbsp;|&nbsp;
      router-link(to='/archive') Posts
      icon 
        angle-right
      | yyyy
      icon 
        angle-right
      | MM
      icon 
        angle-right
      | dd

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
          p Article after

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
          author-card(v-if='post', :user='post.author')
        template(#default)
          .card 123
    .card
      details
        pre {{ post }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AngleRight,
  Bars,
  Code as CodeIcon,
  Edit,
  FolderOpen,
  Home,
  Pen,
  TrashAlt,
} from '@vicons/fa'
import scrollTo from 'animated-scroll-to'
import AuthorCard from '../components/AuthorCard.vue'
import GlobalAside from '../components/GlobalAside.vue'
import { getPost, setTitle, userData, isLoggedIn } from '../utils'
import type { ApiResponsePost } from '../types'

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

const post = ref<ApiResponsePost>()
const bgImg = computed(
  () =>
    `url(https://api.daihan.top/api/acg?_random=${
      post.value?.uuid || route.params.uuid
    })`
)
const notFound = ref(false)
const menuShow = ref(false)

function init() {
  post.value = undefined
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
      if (e?.response?.status === 404) {
        notFound.value = true
      }
      post.value = {
        _id: '61619b2f2accbb55b9387121',
        uuid: '6b1d96fe-6cf1-4bd7-aec0-211557d0bf73',
        pid: 5,
        slug: 'markdown-demo',
        title: 'Markdown demo',
        content:
          '# h1 Heading 8-)\n## h2 Heading\n### h3 Heading\n#### h4 Heading\n##### h5 Heading\n###### h6 Heading\n\n\n## Horizontal Rules\n\n___\n\n---\n\n***\n\n\n## Typographic replacements\n\nEnable typographer option to see result.\n\n(c) (C) (r) (R) (tm) (TM) (p) (P) +-\n\ntest.. test... test..... test?..... test!....\n\n!!!!!! ???? ,,  -- ---\n\n"Smartypants, double quotes" and \'single quotes\'\n\n\n## Emphasis\n\n**This is bold text**\n\n__This is bold text__\n\n*This is italic text*\n\n_This is italic text_\n\n~~Strikethrough~~\n\n\n## Blockquotes\n\n\n> Blockquotes can also be nested...\n>> ...by using additional greater-than signs right next to each other...\n> > > ...or with spaces between arrows.\n\n\n## Lists\n\nUnordered\n\n+ Create a list by starting a line with `+`, `-`, or `*`\n+ Sub-lists are made by indenting 2 spaces:\n  - Marker character change forces new list start:\n    * Ac tristique libero volutpat at\n    + Facilisis in pretium nisl aliquet\n    - Nulla volutpat aliquam velit\n+ Very easy!\n\nOrdered\n\n1. Lorem ipsum dolor sit amet\n2. Consectetur adipiscing elit\n3. Integer molestie lorem at massa\n\n\n1. You can use sequential numbers...\n1. ...or keep all the numbers as `1.`\n\nStart numbering with offset:\n\n57. foo\n1. bar\n\n\n## Code\n\nInline `code`\n\nIndented code\n\n    // Some comments\n    line 1 of code\n    line 2 of code\n    line 3 of code\n\n\nBlock code "fences"\n\n```\nSample text here...\n```\n\nSyntax highlighting\n\n``` js\nvar foo = function (bar) {\n  return bar++;\n};\n\nconsole.log(foo(5));\n```\n\n## Tables\n\n| Option | Description |\n| ------ | ----------- |\n| data   | path to data files to supply the data that will be passed into templates. |\n| engine | engine to be used for processing templates. Handlebars is the default. |\n| ext    | extension to be used for dest files. |\n\nRight aligned columns\n\n| Option | Description |\n| ------:| -----------:|\n| data   | path to data files to supply the data that will be passed into templates. |\n| engine | engine to be used for processing templates. Handlebars is the default. |\n| ext    | extension to be used for dest files. |\n\n\n## Links\n\n[link text](http://dev.nodeca.com)\n\n[link with title](http://nodeca.github.io/pica/demo/ "title text!")\n\nAutoconverted link https://github.com/nodeca/pica (enable linkify to see)\n\n\n## Images\n\n![Minion](https://octodex.github.com/images/minion.png)\n![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")\n\nLike links, Images also have a footnote style syntax\n\n![Alt text][id]\n\nWith a reference later in the document defining the URL location:\n\n[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"\n\n\n## Plugins\n\nThe killer feature of `markdown-it` is very effective support of\n[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).\n\n\n### [Emojies](https://github.com/markdown-it/markdown-it-emoji)\n\n> Classic markup: :wink: :crush: :cry: :tear: :laughing: :yum:\n>\n> Shortcuts (emoticons): :-) :-( 8-) ;)\n\nsee [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.\n\n\n### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)\n\n- 19^th^\n- H~2~O\n\n\n### [\\<ins>](https://github.com/markdown-it/markdown-it-ins)\n\n++Inserted text++\n\n\n### [\\<mark>](https://github.com/markdown-it/markdown-it-mark)\n\n==Marked text==\n\n\n### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)\n\nFootnote 1 link[^first].\n\nFootnote 2 link[^second].\n\nInline footnote^[Text of inline footnote] definition.\n\nDuplicated footnote reference[^second].\n\n[^first]: Footnote **can have markup**\n\n    and multiple paragraphs.\n\n[^second]: Footnote text.\n\n\n### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)\n\nTerm 1\n\n:   Definition 1\nwith lazy continuation.\n\nTerm 2 with *inline markup*\n\n:   Definition 2\n\n        { some code, part of Definition 2 }\n\n    Third paragraph of definition 2.\n\n_Compact style:_\n\nTerm 1\n  ~ Definition 1\n\nTerm 2\n  ~ Definition 2a\n  ~ Definition 2b\n\n\n### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)\n\nThis is HTML abbreviation example.\n\nIt converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.\n\n*[HTML]: Hyper Text Markup Language\n\n### [Custom containers](https://github.com/markdown-it/markdown-it-container)\n\n::: warning\n*here be dragons*\n:::\n',
        created_at: '2021-10-09T13:37:51.220Z',
        author_uuid: '2083c0b2-c4bf-49c9-9b4e-b1345727daca',
        edited_at: '2021-10-11T17:24:58.449Z',
        editor_uuid: '2083c0b2-c4bf-49c9-9b4e-b1345727daca',
        author: {
          authority: 4,
          avatar:
            'https://gravatar.loli.net/avatar/7e17d0b4b93472b346ab2a698442660d',
          created_at: '2021-10-09T11:27:47.682Z',
          gender: 'other',
          nickname: '',
          slogan: '',
          title: '最最最伟大的总执事',
          uid: 10000,
          username: 'XiaoYuJunDesu',
          uuid: '2083c0b2-c4bf-49c9-9b4e-b1345727daca',
          _id: '61617cb3b3eef4b26cc7d6d3',
        },
        editor: {
          authority: 4,
          avatar:
            'https://gravatar.loli.net/avatar/7e17d0b4b93472b346ab2a698442660d',
          created_at: '2021-10-09T11:27:47.682Z',
          gender: 'other',
          nickname: '',
          slogan: '',
          title: '最最最伟大的总执事',
          uid: 10000,
          username: 'XiaoYuJunDesu',
          uuid: '2083c0b2-c4bf-49c9-9b4e-b1345727daca',
          _id: '61617cb3b3eef4b26cc7d6d3',
        },
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

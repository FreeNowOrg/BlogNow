<template lang="pug">
#float-toolbox
  #toolbox-show-btn.fixed-container(:class='{ "is-hide": isHide }')
    .btn-group
      a.plain.pointer(@click='isHide = false', title='Show toolbox')
        icon
          plus-circle

  #toolbox-main.fixed-container(:class='{ "is-hide": isHide }')
    .btn-group
      //- Settings
      a.plain.pointer(
        title='Settings',
        type='button',
        @click='showMore = !showMore'
      )
        Icon
          cog
    .btn-group(v-if='userData?.authority >= 1')
      //- Quick create
      a.plain.pointer(@click='showEdit = !showEdit', title='Quick create post')
        icon(
          :style='`transition: all 0.2s ease;${showEdit ? "transform: rotate(45deg)" : ""}`'
        )
          plus
    .btn-group
      //- Theme toggle
      a.plain.pointer(
        @click='theme === "light" ? (theme = "dark") : (theme = "light")',
        :title='`Switch to ${theme === "light" ? "dark" : "light"} mode`'
      )
        icon
          moon(v-if='theme === "light"')
          sun(v-else)
    .btn-group
      //- Back to top
      a#back-to-top.plain.pointer(title='Back to top', @click='backToTop')
        icon
          arrow-up
      //- Hide
      a.plain.pointer(@click='isHide = true', title='Hide toolbox')
        icon
          minus-circle

  #quick-actions-container
    quick-edit(v-show='showEdit', @created='handleQuickCreated')
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import {
  ArrowUp,
  Cog,
  Sun,
  Moon,
  Plus,
  PlusCircle,
  MinusCircle,
} from '@vicons/fa'
import QuickEdit from './QuickEdit.vue'
import { useRouter } from 'vue-router'
import { userData } from '../utils'
import scrollTo from 'animated-scroll-to'

const router = useRouter()

const theme = ref<'light' | 'dark'>('light')
const isHide = ref(false)
const showMore = ref(false)
const showEdit = ref(false)

function handleQuickCreated({ uuid }: { uuid: string }) {
  showEdit.value = false
  router.push({ name: 'post-uuid', params: { uuid } })
}

watch(isHide, (val) => {
  if (val) {
    localStorage.setItem('BLOGNOW_TOOLBOX_STATE', 'hide')
  } else {
    localStorage.setItem('BLOGNOW_TOOLBOX_STATE', 'show')
  }
})

function backToTop() {
  scrollTo(0, { maxDuration: 800 })
}

onMounted(() => {
  isHide.value = localStorage.getItem('BLOGNOW_TOOLBOX_STATE') === 'hide'
})
</script>

<style scoped lang="sass">
#float-toolbox
  position: absolute
  z-index: 5
  bottom: 0
  left: 0
  width: 100%

  .fixed-container
    position: fixed
    background-color: var(--theme-accent-color)
    box-shadow: 0 0 6px #aaa
    padding: 0.2rem
    border-radius: 2em
    font-size: 1.4rem
    right: 1rem
    bottom: 1rem
    transition: all 0.45s ease
    opacity: 1

    &#toolbox-main.is-hide
      opacity: 0
      pointer-events: none

    &#toolbox-show-btn:not(.is-hide)
      box-shadow: none

    .btn-group
      display: inline-flex
      // flex-direction: column
      // gap: 0.4rem
      a
        --color: #fff
        margin: 0 0.2rem
        position: relative
        &::before
          content: attr(title)
          display: block
          position: absolute
          color: #252525
          left: 0
          bottom: 1.8rem
          transform: translateX(-50%)
          font-size: 1rem
          background-color: #fff
          box-shadow: var(--theme-box-shadow)
          padding: 0.2rem
          border-radius: 4px
          white-space: nowrap
          opacity: 0
          pointer-events: none
          transition: all 0.24s ease
        &:hover::before
          opacity: 1
          bottom: 2.2rem

#quick-actions-container
  position: fixed
  left: 0
  bottom: 3.5rem
  margin: 0 1rem
  width: calc(100% - 2rem)
  z-index: 10

[data-at-top='true']
  #back-to-top
    display: none !important

@media screen and (max-width: 800px)
  #float-toolbox
    .fixed-container
      right: 50%
      transform: translateX(50%)
</style>

<style lang="sass">
@keyframes spin-animation
  from
    transform: rotate(0)
  to
    transform: rotate(360deg)

.spin
  animation: spin-animation 2.4s linear infinite
  display: inline-block
</style>

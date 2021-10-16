<template lang="pug">
nav#global-header.flex.gap-1
  .item.site-logo-area.flex.flex-center
    router-link.plain(to='/')
      .logo-placeholder LOGO

  .item.links-area.flex.flex-1.gap-1
    router-link(to='/') Home
    router-link(to='/archives') Archives
    router-link(to='/-/about') About

  .item.user-area
    .user-dropdown(@click.stop='')
      a.pointer.plain.dropdown-btn(
        :class='{ "is-show": userDropdownShow }',
        @click='userDropdownShow = !userDropdownShow'
      )
        .avatar
          img(:src='avatar')
        .angle
          icon
            keyboard-arrow-down-round
      transition(
        name='fade',
        mode='out-in',
        enter-active-class='fadeInUp',
        leave-active-class='fadeOutDown'
      )
        .dropdown-content(v-show='userDropdownShow')
          ul
            //- notLogIn
            li(v-if='!userData')
              .nav-user-card
                .top
                  .banner-bg
                  img.avatar(:src='avatar')
                .details
                  a.user-name Anonymous
                  .uid Please login~

            //- isLogedIn
            li(v-if='userData')
              .nav-user-card
                .top
                  .banner-bg
                  router-link.plain.name(to='/user/@me')
                    img.avatar(:src='avatar')
                .details
                  router-link.plain.user-name(to='/user/@me') {{ userData.username }}
                  .uid {{ userData.email }}
            li(v-if='userData')
              router-link.plain(to='/user/@me/posts') My Posts
            li(v-if='userData')
              router-link.plain(to='/post/new') Add new post

            li(v-if='$route.path !== "/auth"')
              router-link.plain(to='/auth') {{ userData ? "Logout" : "Login" }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userData } from '../utils'
import { KeyboardArrowDownRound } from '@vicons/material'

const userDropdownShow = ref(false)
const router = useRouter()
const avatar = ref(
  `${userData?.value || 'https://gravatar.loli.net/avatar/'}?d=identicon`
)

router.beforeEach(() => {
  userDropdownShow.value = false
})

onMounted(() => {
  document.body.addEventListener('click', () => {
    userDropdownShow.value = false
  })
})
</script>

<style scoped lang="sass">
#global-header
  position: fixed
  z-index: 10
  width: 100%
  height: 60px
  top: 0
  left: 0
  padding: 0 2rem
  background-color: #fff
  align-items: center
  box-shadow: 0 2px 0 #f8f8f8

  a
    --color: var(--theme-text-color)

  .site-logo-area
    .logo-placeholder
      border: 1px solid #888
      border-radius: 6px
      padding: 0.5rem

  .links-area
    justify-content: flex-end

  .side-nav-toggler
    --color: #888
    display: inline-block
    width: 40px
    height: 40px
    line-height: 45px
    text-align: center
    border-radius: 50%

    &:hover,
    &.is-active
      background-color: rgba(0, 0, 0, 0.05)

  .global-site-logo
    .desc
      font-size: 0.6rem
      font-weight: 600
      color: #222
      text-align: right

    img
      display: block
      height: 1.8rem
      width: auto

  .user-area
    .avatar
      font-size: 1.6rem
    .avatar img,
    img.avatar
      border-radius: 50%

    .user-dropdown
      font-size: 1rem
      position: relative
      .dropdown-btn
        position: relative
        display: inline-flex
        align-items: center
        .avatar
          margin-right: 0.4rem
          img
            width: 2rem
            height: 2rem
            box-shadow: 0 0 0 2px #fff
        .angle svg
          transition: all 0.12s ease
        // .angle
        //   transition: all 0.12s ease
        //   transform: rotateZ(90deg)
        &:hover
          .avatar
            img
              box-shadow: 0 0 0 2px rgba(var(--theme-accent-color--rgb), 0.5)
        &.is-show
          .avatar
            img
              box-shadow: 0 0 0 2px var(--theme-accent-color)
          .angle svg
            transform: rotateZ(180deg)
          // .angle
          //   transform: rotateZ(270deg)

      .dropdown-content
        position: absolute
        top: 2rem
        right: 0
        padding: 0
        padding-top: 0.4rem
        width: 200px

        ul
          list-style: none
          padding: 4px
          background-color: #fff
          box-shadow: 0 0 4px #aaa
          border-radius: 4px

          li > *
            padding: 0.5rem

          li a
            display: block
            cursor: pointer
            --color: var(--theme-link-color)

            &:hover
              background-color: var(--theme-tag-color)

  .nav-user-card
    border-bottom: 1px solid
    position: relative

    .banner-bg
      position: absolute
      top: -4px
      left: -4px
      height: 3rem
      width: calc(100% + 8px)
      background-color: rgba(var(--theme-accent-color--rgb), 0.1)
      z-index: 0

    a
      display: inline !important

    .avatar
      position: relative
      width: 68px
      height: 68px
      box-shadow: 0 0 0 4px #fff
      z-index: 1

    .details
      .user-name
        font-size: 1rem

      .uid
        font-size: 0.8rem
        color: #aaa

@media screen and (max-width: 800px)
  .global-header
    .nav-links > .item
      display: none
</style>

<style lang="sass">
// Animate
.fadeInUp
  animation: fadeInUp 0.24s ease

.fadeOutDown
  animation: fadeOutDown 0.4s ease

@keyframes fadeInUp
  0%
    opacity: 0
    transform: translate3d(0, 1rem, 0)

  to
    opacity: 1
    transform: translateZ(0)

@keyframes fadeOutDown
  0%
    opacity: 1

  to
    opacity: 0
    transform: translate3d(0, 1rem, 0)
</style>

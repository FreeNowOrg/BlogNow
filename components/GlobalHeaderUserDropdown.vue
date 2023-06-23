<template lang="pug">
.user-dropdown(@click.stop='')
  a.pointer.plain.dropdown-btn(
    :class='{ "is-show": userDropdownShow }',
    @click='userDropdownShow = !userDropdownShow'
  )
    img.avatar(:src='getAvatar(userData.avatar)')
    .angle
      icon
        angle-down
  transition(
    name='fade',
    mode='out-in',
    enter-active-class='fadeInUp',
    leave-active-class='fadeOutDown'
  )
    .dropdown-content(v-show='userDropdownShow')
      ul
        //- User Card
        //- Is logged in
        li(v-if='isLoggedIn')
          .nav-user-card
            .top
              .banner-bg
              router-link.plain.name(:to='`/@${userData.username}`')
                img.avatar(:src='getAvatar(userData.avatar)')
            .details
              router-link.plain.user-name(:to='`/@${userData.username}`') {{ userData.nickname || userData.username }}
              .uid {{ userData.title }}
        //- Not logged in
        li(v-else)
          .nav-user-card
            .top
              .banner-bg
              img.avatar(:src='getAvatar(userData.avatar)')
            .details
              router-link.plain.name(to='/auth') Guest
              .uid Welcome to the blog~

        //- Links
        li(v-if='isLoggedIn')
          router-link.plain(to='/post/new') Add new post
        li(v-if='userData.authority >= 4')
          router-link.plain(to='/dashboard') Admin dashboard
        li(v-if='$route.name !== "auth"')
          router-link.plain(
            :to='{ name: "auth", query: { backto: $route.path } }'
          ) {{ isLoggedIn ? "Logout" : "Login" }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAvatar, userData, isLoggedIn } from '../utils'
import { AngleDown } from '@vicons/fa'
import { useRouter } from 'vue-router'
const router = useRouter()

const userDropdownShow = ref(false)

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
.user-dropdown
  font-size: 1rem
  position: relative

  img.avatar
    border-radius: 50%

  .dropdown-btn
    position: relative
    display: inline-flex
    align-items: center
    > *
      vertical-align: middle
    img.avatar
      margin-right: 0.4rem
      width: 2rem
      height: 2rem
      box-shadow: 0 0 0 2px #fff

    .angle svg
      transition: all 0.12s ease
    // .angle
    //   transition: all 0.12s ease
    //   transform: rotateZ(90deg)
    &:hover
      img.avatar
        box-shadow: 0 0 0 2px rgba(var(--theme-accent-color--rgb), 0.5)
    &.is-show
      img.avatar
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

      a
        --color: var(--theme-link-color) !important
        display: block
        cursor: pointer

        &:hover
          background-color: var(--theme-tag-color)

  .nav-user-card
    border-bottom: 1px solid
    position: relative

    a
      display: inline !important

    .top
      margin-bottom: 0.4rem
      .banner-bg
        position: absolute
        top: -4px
        left: -4px
        height: 3rem
        width: calc(100% + 8px)
        background-color: rgba(var(--theme-accent-color--rgb), 0.1)
        z-index: 0

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

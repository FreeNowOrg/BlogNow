<template lang="pug">
#auth-container
  .body-inner
    form#auth-form.card(v-if='!userData', :class='{ "loadin-cover": loading }')
      #logo-area
        .logo-placeholder LOGO

      #info-area
        .info.error(v-if='errorMsg')
          .title {{ errorTitle }}
          p {{ errorMsg }}

      #tabber-area
        .tabber
          .tabber-tabs
            .tab.flex-1
              a.pointer(
                @click='tab = "login"',
                :class='{ "tab-active": tab === "login" }'
              ) Login
            .tab.flex-1
              a.pointer(
                @click='tab = "register"',
                :class='{ "tab-active": tab === "register" }'
              ) Register

      #login(v-if='tab === "login"')
        label
          strong Username
          input.site-style(v-model='username')
        label
          strong Password
          input.site-style(
            v-model='password',
            type='password',
            autocomplete='current-password'
            )
        .btn
          button(@click.prevent='handleLogin') Login

      #register(v-else)
        p You can't regist at this time

    #user-info(v-else)
      h1 hello, {{ userData.username }}~
      .card
        pre {{ userData }}
        .btn
          button(@click='handleLogout') Logout
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { userLogin, userData } from '../components/userData'
import { setTitle } from '../utils/setTitle'
import { useRoute, useRouter } from 'vue-router'

const [route, router] = [useRoute(), useRouter()]

const username = ref('')
const password = ref('')
const loading = ref(false)
const tab = ref('login')
const errorTitle = ref('')
const errorMsg = ref('')

function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  userLogin({
    username: username.value,
    password: password.value,
  })
    .then(
      () => {
        if (route.query.backto) {
          router.push(route.query.backto as string)
        }
      },
      (e): any => {
        errorTitle.value = 'Login failed'
        errorMsg.value = e.message
      }
    )
    .finally(() => {
      loading.value = false
    })
}

function handleLogout() {
  window.Cookies.remove('BLOG_NOW_TOKEN')
  location.reload()
}

function handleRegister() { }

onMounted(() => {
  setTitle('Authorization')
})
</script>

<style scoped lang="sass">
#auth-container
  margin-top: calc(60px + 1rem)
  margin-bottom: 3rem

#logo-area
  margin: 2rem auto
  .logo-placeholder
    display: inline-block
    width: 80px
    height: 80px
    background-color: var(--theme-accent-color)
    border-radius: 50%
    box-shadow: 0 0 0 4px #fff inset, 0 0 0 4px var(--theme-accent-color)
    font-size: 20px
    line-height: 80px
    font-weight: 600
    color: #fff
    user-select: none


#tabber-area
  margin: 2rem 1rem
  font-size: 1.5rem

form
  text-align: center
  width: 400px
  max-width: 100%
  margin: 0 auto
  input
    width: 100%
  label
    display: block
    margin-bottom: 1rem
    strong
      text-align: left
      display: block
      margin-bottom: 6px
</style>

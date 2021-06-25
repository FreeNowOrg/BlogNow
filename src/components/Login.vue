<template lang="pug">
form#login
  label
    | username
    input#username(v-model='username')
  label
    | password
    input#password(type='password', v-model='password')
  button(@click.prevent='login') login
  button(@click.prevent='register') register
</template>

<script>
import axios from 'axios'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    login() {
      axios
        .post('/api/user?action=login', {
          username: this.username,
          password: this.password,
        })
        .then((data) => {
          console.log(data)
          localStorage.setItem(data.data.uuid, data.data.token)
        }, console.error)
    },
    register() {
      axios
        .post('/api/user?action=register', {
          username: this.username,
          password: this.password,
        })
        .then((data) => {
          console.log(data)
          localStorage.setItem(data.data.uuid, data.data.token)
        }, console.error)
    },
  },
})
</script>

<style lang="stylus"></style>

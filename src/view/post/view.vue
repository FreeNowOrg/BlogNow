<template lang="pug">
.loading(v-if="loading")
  | loading...

.postContainer(v-if="!loading")
  article(v-if="!errorCode")
    h1 {{ post.title }}
    .content {{ post.content }}
  article.error(v-if="errorCode")
    error-page(:title="error.status" :description="error.data.message")

  router-link(:to="$route.params.pid==='1' ? '/post/2' : '/post/1'") Goto {{ $route.params.pid==='1' ? '/post/2' : '/post/1' }}
</template>

<script lang="ts">
import axios from 'axios'
import ErrorPage from '../../components/ErrorPage.vue'

export default {
  components: {
    ErrorPage,
  },
  data() {
    return {
      loading: false,
      errorCode: 0,
      errorMsg: '',
      post: {},
    }
  },
  methods: {
    getPost(pid: string) {
      this.post = {}
      this.errorCode = 0
      this.loading = true

      axios
        .get(`/api/post`, {
          params: {
            pid,
          },
        })
        .then(
          ({ data }) => {
            console.log('Post data', data)
            this.post = data
          },
          ({ response }) => {
            console.warn('Post fetch error', response)
            this.errorCode = response.status
            this.errorMsg = response.data.message || ''
          }
        )
        .finally(() => {
          this.loading = false
        })
    },
  },
  beforeRouteUpdate({ name, params }) {
    if (name === 'post-view') this.getPost(params.pid as string)
  },
  created() {
    this.getPost(this.$route.params.pid as string)
  },
}
</script>

<style scoped lang="stylus"></style>

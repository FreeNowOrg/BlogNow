<template lang="pug">
.404-page
  h1 404
  p This page has been lost.
  p 
    router-link(to='/') Take me home
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { setTitle } from '../utils/setTitle'
onMounted(() => {
  setTitle('404', 'Error')
})
</script>

<style scoped lang="sass"></style>
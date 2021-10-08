<template lang="pug">
h1 hello, world
</template>

<script>
import { onMounted } from 'vue'
import { setTitle } from '../utils/setTitle'

onMounted(() => {
  setTitle()
})
</script>

<style lang="sass"></style>

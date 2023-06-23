<template lang="pug">
svg.spinner(
  xmlns='http://www.w3.org/2000/svg',
  version='1.1',
  width='400',
  height='300'
)
  g.group
    circle.circle(r='36')
</template>

<script></script>

<style scoped lang="sass">
.spinner
  max-width: 100%
  .group
    transform: translate(50%, 50%)
    .circle
      fill: none
      stroke: var(--theme-accent-color)
      stroke-width: 5
      stroke-dasharray: 236
      stroke-linecap: round
      animation: loading-round 1.2s infinite linear, loading-dash 2s infinite linear alternate

@keyframes loading-round
  0%
    transform: rotate(0deg)

  100%
    transform: rotate(720deg)

@keyframes loading-dash
  0%
    stroke-dashoffset: 236

  100%
    stroke-dashoffset: 0
</style>

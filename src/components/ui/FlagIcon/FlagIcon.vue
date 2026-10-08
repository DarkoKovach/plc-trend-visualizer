<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  code: 'gb' | 'no'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const flagClass = computed(() => `inline-block rounded-sm overflow-hidden ${props.class}`)
</script>

<template>
  <!-- UK Flag -->
  <svg
    v-if="code === 'gb'"
    :class="flagClass"
    viewBox="0 0 60 30"
    xmlns="http://www.w3.org/2000/svg"
  >
    <clipPath id="gb-clip">
      <rect width="60" height="30" />
    </clipPath>
    <g clip-path="url(#gb-clip)">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        stroke="#C8102E"
        stroke-width="4"
        clip-path="url(#gb-diag)"
      />
      <clipPath id="gb-diag">
        <path d="M30,15 L60,30 L60,15 L30,0 L0,0 L0,15 L30,30 L60,30 L60,15 Z" />
      </clipPath>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" stroke-width="10" />
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" stroke-width="6" />
    </g>
  </svg>

  <!-- Norway Flag -->
  <svg
    v-else-if="code === 'no'"
    :class="flagClass"
    viewBox="0 0 22 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="22" height="16" fill="#BA0C2F" />
    <rect x="6" width="4" height="16" fill="#fff" />
    <rect y="6" width="22" height="4" fill="#fff" />
    <rect x="7" width="2" height="16" fill="#00205B" />
    <rect y="7" width="22" height="2" fill="#00205B" />
  </svg>
</template>

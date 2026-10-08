<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import { badgeVariants, type BadgeVariants } from './Badge.variants'

interface Props {
  variant?: BadgeVariants['variant']
  size?: BadgeVariants['size']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  class: '',
})

const classes = computed(() =>
  cn(badgeVariants({ variant: props.variant, size: props.size }), props.class)
)
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>

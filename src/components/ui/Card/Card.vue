<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import { cardVariants, type CardVariants } from './Card.variants'

interface Props {
  variant?: CardVariants['variant']
  padding?: CardVariants['padding']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  class: '',
})

const classes = computed(() =>
  cn(cardVariants({ variant: props.variant, padding: props.padding }), props.class)
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

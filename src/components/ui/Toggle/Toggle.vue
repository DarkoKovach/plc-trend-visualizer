<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'

interface Props {
  modelValue: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md',
  class: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sizeClasses = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    translate: 'translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    translate: 'translate-x-5',
  },
  lg: {
    track: 'h-7 w-14',
    thumb: 'h-6 w-6',
    translate: 'translate-x-7',
  },
}

const currentSize = computed(() => sizeClasses[props.size])

const trackClasses = computed(() =>
  cn(
    'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
    currentSize.value.track,
    props.modelValue ? 'bg-cyan-600' : 'bg-slate-600',
    props.disabled && 'opacity-50 cursor-not-allowed',
    props.class
  )
)

const thumbClasses = computed(() =>
  cn(
    'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
    currentSize.value.thumb,
    props.modelValue ? currentSize.value.translate : 'translate-x-0'
  )
)

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="trackClasses"
    @click="toggle"
  >
    <span :class="thumbClasses" />
  </button>
</template>

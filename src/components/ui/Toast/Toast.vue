<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/cn'

interface Props {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  class: '',
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(false)
let timeoutId: ReturnType<typeof setTimeout>

const typeStyles = {
  info: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
  success: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  warning: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
  error: 'bg-red-500/20 border-red-500/50 text-red-300',
}

const toastClasses = computed(() =>
  cn(
    'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300',
    typeStyles[props.type],
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
    props.class
  )
)

function close() {
  isVisible.value = false
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  // Trigger enter animation
  requestAnimationFrame(() => {
    isVisible.value = true
  })

  // Auto-dismiss
  if (props.duration > 0) {
    timeoutId = setTimeout(close, props.duration)
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<template>
  <div :class="toastClasses" role="alert">
    <span class="text-sm font-medium">{{ message }}</span>
    <button
      type="button"
      class="ml-auto rounded p-1 transition-colors hover:bg-white/10"
      aria-label="Dismiss"
      @click="close"
    >
      <X class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/cn'

interface Props {
  title?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  class: '',
})
</script>

<template>
  <aside :class="cn('flex h-full flex-col border-r border-slate-700 bg-slate-800/30', props.class)">
    <!-- Sidebar header -->
    <div v-if="title" class="shrink-0 border-b border-slate-700 px-4 py-3">
      <h2 class="text-sm font-semibold text-slate-300">
        {{ title }}
      </h2>
    </div>

    <!-- Sidebar content -->
    <div class="flex-1 overflow-y-auto p-4">
      <slot />
    </div>

    <!-- Sidebar footer -->
    <div v-if="$slots.footer" class="shrink-0 border-t border-slate-700 p-4">
      <slot name="footer" />
    </div>
  </aside>
</template>

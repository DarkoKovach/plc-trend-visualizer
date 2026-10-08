<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/cn'
import { CHART_COLORS } from '@/core/types'
import type { PlcVariable } from '@/core/types'

interface Props {
  /** Selected variables with their color assignments */
  variables: PlcVariable[]
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const emit = defineEmits<{
  remove: [variableId: string]
}>()

const { t } = useI18n()

const containerClasses = computed(() => cn('flex flex-wrap gap-3', props.class))
</script>

<template>
  <div :class="containerClasses">
    <div
      v-for="(variable, index) in variables"
      :key="variable.id"
      class="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5"
    >
      <!-- Color indicator -->
      <div class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: CHART_COLORS[index] }" />

      <!-- Variable name -->
      <span class="font-mono text-sm font-medium text-slate-300">
        {{ variable.name }}
      </span>

      <!-- Unit -->
      <span v-if="variable.unit" class="text-xs text-slate-500"> ({{ variable.unit }}) </span>

      <!-- Remove button -->
      <button
        type="button"
        class="ml-1 rounded p-0.5 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
        :aria-label="`Remove ${variable.name} from chart`"
        @click="emit('remove', variable.id)"
      >
        <svg
          class="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="variables.length === 0" class="text-sm text-slate-500">{{ t('chart.legend.noSelection') }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/cn'
import { SingleChart } from '@/components/charts/SingleChart'
import { useVariableSelection } from '@/composables'
import { MOCK_VARIABLES } from '@/core/data'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const { t } = useI18n()
const { selectedIds, deselect } = useVariableSelection()

// Get full variable objects for selected IDs
const selectedVariables = computed(() => {
  return selectedIds.value
    .map((id) => MOCK_VARIABLES.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => v !== undefined)
})

function handleClose(variableId: string) {
  deselect(variableId)
}

const containerClasses = computed(() => cn('relative h-full', props.class))

// Determine grid layout based on number of selected variables
// Responsive: stack on mobile, 2-column on tablet+
const gridClasses = computed(() => {
  const count = selectedVariables.value.length
  if (count === 1) return 'grid-cols-1 grid-rows-1'
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1'
  if (count === 3) return 'grid-cols-1 sm:grid-cols-2 grid-rows-3 sm:grid-rows-2'
  return 'grid-cols-1 sm:grid-cols-2 grid-rows-4 sm:grid-rows-2' // 4 variables
})
</script>

<template>
  <div :class="containerClasses">
    <!-- 2x2 Chart Grid -->
    <div v-if="selectedVariables.length > 0" :class="['grid h-full gap-3', gridClasses]">
      <SingleChart
        v-for="(variable, index) in selectedVariables"
        :key="variable.id"
        :variable="variable"
        :color-index="index"
        @close="handleClose"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="absolute inset-0 flex items-center justify-center">
      <div class="text-center">
        <div class="mb-3 text-4xl">📊</div>
        <p class="text-sm text-slate-400">
          {{ t('chart.emptyState.title') }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{ t('chart.emptyState.subtitle') }}
        </p>
      </div>
    </div>
  </div>
</template>

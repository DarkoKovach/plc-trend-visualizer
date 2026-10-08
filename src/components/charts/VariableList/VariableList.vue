<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/cn'
import { VariableCard } from '@/components/charts/VariableCard'
import { usePlcStream, useVariableSelection, useAnalytics } from '@/composables'
import type { PlcVariable } from '@/core/types'

interface Props {
  variables: PlcVariable[]
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const { t } = useI18n()
const { latestValues } = usePlcStream()
const { toggleSelection, selectionCount, isMaxSelected } = useVariableSelection()
const { trackVariableSelected, trackVariableDeselected, trackMaxSelectionReached } = useAnalytics()

const containerClasses = computed(() => cn('flex flex-col gap-2 overflow-y-auto', props.class))

function handleSelect(variableId: string) {
  const result = toggleSelection(variableId)

  if (result === true) {
    trackVariableSelected(variableId)
  } else if (result === false) {
    trackVariableDeselected(variableId)
  } else {
    trackMaxSelectionReached()
  }
}

function getLatestValue(variableId: string) {
  return latestValues.value.get(variableId)
}
</script>

<template>
  <div :class="containerClasses">
    <!-- Header -->
    <div class="mb-2 flex items-center justify-between px-1">
      <h2 class="text-sm font-semibold text-slate-300">{{ t('variableList.title') }}</h2>
      <span class="text-xs text-slate-500">{{ t('variableList.selected', { count: selectionCount }) }}</span>
    </div>

    <!-- Variable list -->
    <div class="flex flex-col gap-1.5">
      <VariableCard
        v-for="variable in variables"
        :key="variable.id"
        :variable="variable"
        :latest-value="getLatestValue(variable.id)"
        @select="handleSelect"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="variables.length === 0"
      class="flex items-center justify-center py-8 text-sm text-slate-500"
    >
      {{ t('variableList.noVariables') }}
    </div>

    <!-- Selection hint -->
    <p
      v-if="!isMaxSelected && selectionCount === 0"
      class="py-2 text-center text-xs text-slate-500"
    >
      {{ t('variableList.hint') }}
    </p>
  </div>
</template>

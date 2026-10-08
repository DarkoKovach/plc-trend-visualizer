<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui'
import type { PlcVariable, DataPoint } from '@/core/types'
import { useVariableSelection } from '@/composables'

interface Props {
  variable: PlcVariable
  latestValue?: DataPoint
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  latestValue: undefined,
})

const emit = defineEmits<{
  select: [variableId: string]
}>()

const { isSelected, getColor } = useVariableSelection()

const selected = computed(() => isSelected(props.variable.id))
const color = computed(() => getColor(props.variable.id))

const cardClasses = computed(() =>
  cn(
    'group flex items-center justify-between gap-3 rounded-lg border p-3 transition-all duration-150 cursor-pointer',
    selected.value
      ? 'bg-slate-800/80 border-current'
      : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60 hover:border-slate-600',
    props.class
  )
)

const formattedValue = computed(() => {
  if (!props.latestValue) return '—'

  const value = props.latestValue.value

  switch (props.variable.dataType) {
    case 'BOOL':
      return value === 1 ? 'TRUE' : 'FALSE'
    case 'INT':
      return Math.round(value).toString()
    case 'REAL':
      return value.toFixed(2)
    default:
      return String(value)
  }
})

const dataTypeBadgeVariant = computed(() => {
  switch (props.variable.dataType) {
    case 'BOOL':
      return 'bool' as const
    case 'INT':
      return 'int' as const
    case 'REAL':
      return 'real' as const
    default:
      return 'default' as const
  }
})

function handleClick() {
  emit('select', props.variable.id)
}
</script>

<template>
  <div
    :class="cardClasses"
    :style="selected ? { borderColor: color } : {}"
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <!-- Selection indicator -->
      <div
        class="h-2 w-2 shrink-0 rounded-full transition-all"
        :class="selected ? 'scale-100' : 'scale-0'"
        :style="{ backgroundColor: color }"
      />

      <!-- Variable info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span
            class="truncate font-mono text-sm font-medium"
            :class="selected ? 'text-slate-100' : 'text-slate-300'"
          >
            {{ variable.name }}
          </span>
          <Badge :variant="dataTypeBadgeVariant" size="sm">
            {{ variable.dataType }}
          </Badge>
        </div>

        <p v-if="variable.description" class="mt-0.5 truncate text-xs text-slate-500">
          {{ variable.description }}
        </p>
      </div>
    </div>

    <!-- Value display -->
    <div class="shrink-0 text-right">
      <span
        class="font-mono text-sm font-semibold"
        :class="[
          selected ? 'text-slate-100' : 'text-slate-300',
          variable.dataType === 'BOOL' && latestValue?.value === 1 && 'text-emerald-400',
          variable.dataType === 'BOOL' && latestValue?.value === 0 && 'text-slate-500',
        ]"
      >
        {{ formattedValue }}
      </span>
      <span v-if="variable.unit" class="ml-1 text-xs text-slate-500">
        {{ variable.unit }}
      </span>
    </div>
  </div>
</template>

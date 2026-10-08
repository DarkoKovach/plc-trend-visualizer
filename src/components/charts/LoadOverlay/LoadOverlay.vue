<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/lib/cn'
import { Card } from '@/components/ui'
import { usePlcStream, useDevTools, useAnalytics } from '@/composables'
import { Activity, Gauge, Zap } from 'lucide-vue-next'
import type { SimulationFrequency } from '@/core/types'
import { FREQUENCY_HZ } from '@/core/types'

interface Props {
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

const { t } = useI18n()
const { currentFrequency, setFrequency, dataPointCount, isRunning } = usePlcStream()
const { fps, fpsStatus } = useDevTools()
const { trackFrequencyChanged } = useAnalytics()

const frequencies: SimulationFrequency[] = ['low', 'medium', 'high']

function handleFrequencyChange(freq: SimulationFrequency) {
  setFrequency(freq)
  trackFrequencyChanged(freq)
}

const fpsStatusColor = computed(() => {
  switch (fpsStatus.value) {
    case 'good':
      return 'text-emerald-400'
    case 'warning':
      return 'text-amber-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
})

const containerClasses = computed(() =>
  cn('flex flex-wrap items-center gap-2 sm:gap-4', props.class)
)
</script>

<template>
  <Card :class="containerClasses" padding="sm" variant="elevated">
    <!-- FPS Display -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <Gauge class="h-4 w-4 text-slate-500" />
      <span class="xs:inline hidden text-xs text-slate-400">{{ t('loadOverlay.fps') }}:</span>
      <span class="font-mono text-sm font-semibold" :class="fpsStatusColor">
        {{ fps }}
      </span>
    </div>

    <!-- Separator - hide on very small screens -->
    <div class="hidden h-4 w-px bg-slate-700 sm:block" />

    <!-- Data Points - hide label on small screens -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <Activity class="h-4 w-4 text-slate-500" />
      <span class="hidden text-xs text-slate-400 sm:inline">{{ t('loadOverlay.data') }}:</span>
      <span class="font-mono text-sm text-slate-300">
        {{ dataPointCount.toLocaleString() }}
      </span>
    </div>

    <!-- Separator -->
    <div class="hidden h-4 w-px bg-slate-700 sm:block" />

    <!-- Frequency Controls -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <Zap class="hidden h-4 w-4 text-slate-500 sm:block" />
      <span class="hidden text-xs text-slate-400 lg:inline">{{ t('loadOverlay.frequency') }}:</span>

      <div class="flex gap-1">
        <button
          v-for="freq in frequencies"
          :key="freq"
          type="button"
          class="rounded px-1.5 py-1 text-xs font-medium transition-colors sm:px-2"
          :class="[
            currentFrequency === freq
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300',
          ]"
          @click="handleFrequencyChange(freq)"
        >
          {{ FREQUENCY_HZ[freq] }}
        </button>
      </div>
      <span class="text-xs text-slate-500">Hz</span>
    </div>

    <!-- Running Status - push to right -->
    <div class="ml-auto flex items-center gap-1.5 sm:gap-2">
      <span
        class="h-2 w-2 shrink-0 rounded-full"
        :class="isRunning ? 'animate-pulse bg-emerald-500' : 'bg-slate-600'"
      />
      <span
        class="hidden text-xs sm:inline"
        :class="isRunning ? 'text-emerald-400' : 'text-slate-500'"
      >
        {{ isRunning ? t('loadOverlay.streaming') : t('loadOverlay.stopped') }}
      </span>
    </div>
  </Card>
</template>

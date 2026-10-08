<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onUnmounted, markRaw, computed, nextTick } from 'vue'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { cn } from '@/lib/cn'
import { usePlcStream } from '@/composables'
import type { PlcVariable } from '@/core/types'
import { CHART_COLORS } from '@/core/types'

interface Props {
  /** Variables to display on this chart */
  variables: PlcVariable[]
  /** Chart title */
  title?: string
  /** Sync key for cursor synchronization across charts */
  syncKey?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  syncKey: 'plc-sync',
  class: '',
})

const containerRef = ref<HTMLDivElement>()
const chartRef = shallowRef<uPlot | null>(null)
const { getHistory } = usePlcStream()

// Track animation frame for batching
let rafId: number | null = null
let pendingUpdate = false

/**
 * Build uPlot data array from variable histories
 * Format: [[timestamps], [values1], [values2], ...]
 */
function buildChartData(): uPlot.AlignedData {
  if (props.variables.length === 0) {
    return [[]]
  }

  const firstVariable = props.variables[0]
  if (!firstVariable) {
    return [[]]
  }

  // Get history for first variable to establish time axis
  const firstHistory = getHistory(firstVariable.id)

  if (firstHistory.length === 0) {
    // Return empty data structure
    const data: number[][] = [[]]
    props.variables.forEach(() => data.push([]))
    return data as uPlot.AlignedData
  }

  // Build time axis (convert to seconds for uPlot)
  const timestamps = firstHistory.map((p) => p.timestamp / 1000)

  // Build value arrays for each variable
  const series: number[][] = props.variables.map((variable) => {
    const history = getHistory(variable.id)
    return history.map((p) => p.value)
  })

  return [timestamps, ...series] as uPlot.AlignedData
}

/**
 * Build uPlot options
 */
function buildChartOptions(width: number, height: number): uPlot.Options {
  const series: uPlot.Series[] = [
    {
      // Time axis
      label: 'Time',
    },
    // Variable series
    ...props.variables.map((variable, index) => ({
      label: variable.name,
      stroke: CHART_COLORS[index % CHART_COLORS.length],
      width: 2,
      points: { show: false },
      spanGaps: true,
    })),
  ]

  return {
    width,
    height,
    series,
    cursor: {
      sync: {
        key: props.syncKey,
        scales: ['x', null],
        filters: { pub: () => true, sub: () => true },
      },
      drag: { x: false, y: false },
    },
    scales: {
      x: {
        time: true,
      },
      y: {
        auto: true,
      },
    },
    axes: [
      {
        stroke: '#64748b', // slate-500
        grid: { stroke: '#334155', width: 1 }, // slate-700
        ticks: { stroke: '#475569', width: 1 }, // slate-600
        font: '11px Inter, system-ui, sans-serif',
        labelFont: '11px Inter, system-ui, sans-serif',
        values: (_self, ticks) => {
          // Format time as relative seconds ago
          const now = Date.now() / 1000
          return ticks.map((t) => {
            const diff = Math.round(now - t)
            if (diff <= 0) return 'now'
            return `-${diff}s`
          })
        },
      },
      {
        stroke: '#64748b',
        grid: { stroke: '#334155', width: 1 },
        ticks: { stroke: '#475569', width: 1 },
        font: '11px Inter, system-ui, sans-serif',
        labelFont: '11px Inter, system-ui, sans-serif',
        size: 50,
      },
    ],
    legend: {
      show: false, // We use our own legend component
    },
    padding: [10, 10, 0, 0],
  }
}

/**
 * Initialize or recreate the chart
 */
function initChart() {
  if (!containerRef.value) return

  // Destroy existing chart
  if (chartRef.value) {
    chartRef.value.destroy()
    chartRef.value = null
  }

  if (props.variables.length === 0) return

  const rect = containerRef.value.getBoundingClientRect()
  const width = Math.max(rect.width, 200)
  const height = Math.max(rect.height, 150)

  const options = buildChartOptions(width, height)
  const data = buildChartData()

  // Create chart and mark as raw to prevent Vue reactivity
  const chart = new uPlot(options, data, containerRef.value)
  chartRef.value = markRaw(chart)
}

/**
 * Update chart data (called via RAF for batching)
 */
function updateChart() {
  if (!chartRef.value || props.variables.length === 0) return

  const data = buildChartData()
  chartRef.value.setData(data)
}

/**
 * Schedule a chart update on next animation frame
 */
function scheduleUpdate() {
  if (pendingUpdate) return

  pendingUpdate = true
  rafId = requestAnimationFrame(() => {
    updateChart()
    pendingUpdate = false
    rafId = null
  })
}

/**
 * Handle container resize
 */
function handleResize() {
  if (!chartRef.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  chartRef.value.setSize({
    width: Math.max(rect.width, 200),
    height: Math.max(rect.height, 150),
  })
}

// Watch for variable changes - reinitialize chart
watch(
  () => props.variables.map((v) => v.id).join(','),
  async () => {
    await nextTick()
    initChart()
  }
)

// Set up periodic updates (chart will be updated from the data in history buffers)
let updateInterval: ReturnType<typeof setInterval>

onMounted(() => {
  initChart()

  // Update chart at 60fps
  updateInterval = setInterval(scheduleUpdate, 16)

  // Handle resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }

  if (updateInterval) {
    clearInterval(updateInterval)
  }

  if (chartRef.value) {
    chartRef.value.destroy()
  }

  window.removeEventListener('resize', handleResize)
})

const containerClasses = computed(() => cn('relative w-full h-full min-h-[200px]', props.class))
</script>

<template>
  <div :class="containerClasses">
    <!-- Chart title -->
    <div v-if="title" class="absolute top-2 left-3 z-10 text-xs font-medium text-slate-400">
      {{ title }}
    </div>

    <!-- Chart container -->
    <div ref="containerRef" class="h-full w-full" />
  </div>
</template>

<style>
/* uPlot dark theme overrides */
.uplot {
  font-family: Inter, system-ui, sans-serif;
}

.uplot .u-legend {
  display: none; /* We use our own legend */
}

.uplot .u-cursor-x,
.uplot .u-cursor-y {
  border-color: rgba(148, 163, 184, 0.3); /* slate-400 with opacity */
}
</style>

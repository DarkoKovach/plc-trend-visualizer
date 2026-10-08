<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onUnmounted, markRaw, computed, nextTick } from 'vue'
import uPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/cn'
import { usePlcStream, useChartInterpolation, useAxisScaling } from '@/composables'
import type { PlcVariable } from '@/core/types'
import { CHART_COLORS, FREQUENCY_HZ, TREND_TIME_WINDOW_SECONDS } from '@/core/types'
import { Button } from '@/components/ui'

interface Props {
  /** Variable to display on this chart */
  variable: PlcVariable
  /** Color index for consistent coloring */
  colorIndex?: number
  /** Sync key for cursor synchronization across charts */
  syncKey?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  colorIndex: 0,
  syncKey: 'plc-sync',
  class: '',
})

const emit = defineEmits<{
  close: [variableId: string]
}>()

const containerRef = ref<HTMLDivElement>()
const chartRef = shallowRef<uPlot | null>(null)
const { getHistory, getLastEvictedPoint, currentFrequency } = usePlcStream()

// Tooltip state
const tooltipVisible = ref(false)
const tooltipValue = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)

// Set up interpolation for smooth 60fps rendering
const dataIntervalMs = computed(() => 1000 / FREQUENCY_HZ[currentFrequency.value])
const interpolation = useChartInterpolation(getHistory, getLastEvictedPoint, dataIntervalMs.value)

// Set up smooth Y-axis scaling
const yAxisScaling = useAxisScaling({
  padding: 0.15, // 15% buffer
  stabilityPeriod: 2000, // 2 seconds before contracting
  transitionDuration: 150, // 150ms fast animation for responsiveness
  minRange: 0.1, // Minimum range of 0.1 unit
})

// Get chart color based on index
const chartColor = computed(() => CHART_COLORS[props.colorIndex % CHART_COLORS.length])

/**
 * Calculate simple moving average for trend line
 */
function calculateMovingAverage(values: number[], windowSize: number = 5): number[] {
  if (values.length < windowSize) {
    return values.map(() => values.reduce((a, b) => a + b, 0) / values.length)
  }

  const result: number[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const window = values.slice(start, i + 1)
    const avg = window.reduce((a, b) => a + b, 0) / window.length
    result.push(avg)
  }
  return result
}

/**
 * Build uPlot data array from interpolated history
 * Format: [[timestamps], [values], [movingAverage]]
 */
function buildChartData(): uPlot.AlignedData {
  // Use interpolated history for smooth rendering
  const history = interpolation.getInterpolatedHistory(props.variable.id)

  // Use RAW history for Y-axis scaling to ensure all values are captured
  const rawHistory = getHistory(props.variable.id)

  if (history.length === 0) {
    return [[], [], []]
  }

  const timestamps = history.map((p) => p.timestamp / 1000)
  const values = history.map((p) => p.value)

  // Calculate moving average for trend line (window of 5 points)
  const movingAvg = calculateMovingAverage(values, 5)

  // Update Y-axis scaling with RAW data range (not interpolated)
  // This ensures we always capture the full range of actual data
  if (rawHistory.length > 0) {
    const rawValues = rawHistory.map((p) => p.value)
    const dataMin = Math.min(...rawValues)
    const dataMax = Math.max(...rawValues)
    yAxisScaling.updateScale(dataMin, dataMax)
  }

  return [timestamps, values, movingAvg] as uPlot.AlignedData
}

/**
 * Build uPlot options
 */
function buildChartOptions(width: number, height: number): uPlot.Options {
  // Calculate time window for X-axis (20 seconds)
  const now = Date.now() / 1000
  const timeWindowStart = now - TREND_TIME_WINDOW_SECONDS

  return {
    width,
    height,
    series: [
      { label: 'Time' },
      {
        label: props.variable.name,
        stroke: chartColor.value,
        width: 2,
        // Show data points (markers) for trend visibility
        points: {
          show: true,
          size: 4,
          fill: chartColor.value,
        },
        spanGaps: true,
      },
      {
        // Moving average trend line
        label: 'Trend',
        stroke: chartColor.value,
        width: 1,
        dash: [4, 4], // Dashed line
        alpha: 0.5,
        points: { show: false },
        spanGaps: true,
      },
    ],
    cursor: {
      sync: {
        key: props.syncKey,
        scales: ['x', null],
        filters: { pub: () => true, sub: () => true },
      },
      drag: { x: false, y: false },
      points: {
        size: 8,
        fill: chartColor.value,
        stroke: chartColor.value,
      },
    },
    hooks: {
      setCursor: [
        (u: uPlot) => {
          const idx = u.cursor.idx
          if (idx === null || idx === undefined) {
            tooltipVisible.value = false
            return
          }

          // Get the value at cursor position (series 1 is our data)
          const value = u.data[1]?.[idx]
          if (value === undefined || value === null) {
            tooltipVisible.value = false
            return
          }

          // Get cursor position in pixels
          const left = u.cursor.left
          const top = u.cursor.top

          if (left === undefined || top === undefined || left < 0 || top < 0) {
            tooltipVisible.value = false
            return
          }

          // Format the value with unit
          const formattedValue = formatValue(value, props.variable.dataType)
          const unit = props.variable.unit || ''
          tooltipValue.value = `${formattedValue}${unit ? ' ' + unit : ''}`

          // Position tooltip near the cursor point
          tooltipX.value = left + 12
          tooltipY.value = top - 8
          tooltipVisible.value = true
        },
      ],
    },
    scales: {
      x: {
        time: true,
        min: timeWindowStart,
        max: now,
      },
      y: {
        auto: false,
        range: (_u, _dataMin, _dataMax) => {
          const range = yAxisScaling.displayRange.value
          return [range.min, range.max]
        },
      },
    },
    axes: [
      {
        stroke: '#64748b',
        grid: { stroke: '#334155', width: 1 },
        ticks: { stroke: '#475569', width: 1 },
        font: '10px Inter, system-ui, sans-serif',
        labelFont: '10px Inter, system-ui, sans-serif',
        values: (_self, ticks) => {
          const currentTime = Date.now() / 1000
          return ticks.map((t) => {
            const diff = Math.round(currentTime - t)
            if (diff <= 0) return 'now'
            return `-${diff}s`
          })
        },
      },
      {
        stroke: '#64748b',
        grid: { stroke: '#334155', width: 1 },
        ticks: { stroke: '#475569', width: 1 },
        font: '10px Inter, system-ui, sans-serif',
        labelFont: '10px Inter, system-ui, sans-serif',
        size: 50,
        // Format Y-axis values nicely
        values: (_self, ticks) => {
          return ticks.map((v) => {
            if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`
            if (Math.abs(v) >= 100) return v.toFixed(0)
            if (Math.abs(v) >= 10) return v.toFixed(1)
            return v.toFixed(2)
          })
        },
      },
    ],
    legend: { show: false },
    padding: [8, 8, 0, 0],
  }
}

function initChart() {
  if (!containerRef.value) return

  if (chartRef.value) {
    chartRef.value.destroy()
    chartRef.value = null
  }

  const rect = containerRef.value.getBoundingClientRect()
  const width = Math.max(rect.width, 100)
  const height = Math.max(rect.height, 80)

  const options = buildChartOptions(width, height)
  const data = buildChartData()

  const chart = new uPlot(options, data, containerRef.value)
  chartRef.value = markRaw(chart)

  // Don't pre-initialize Y-axis from variable min/max - let it auto-scale from actual data
  // This provides better UX as the chart immediately shows the relevant range

  // Start tracking this variable for interpolation
  interpolation.trackVariable(props.variable.id)
  interpolation.start()
}

function updateChart() {
  if (!chartRef.value) return

  const data = buildChartData()

  // Use the smooth current time from interpolation for X-axis window
  // This is the KEY to smooth scrolling - the time window moves smoothly at 60fps
  // instead of jumping when new data arrives
  const latestTimestamp = interpolation.currentTime.value
  const timeWindowStart = latestTimestamp - TREND_TIME_WINDOW_SECONDS

  // Update both X and Y scales, then set data
  chartRef.value.setScale('x', { min: timeWindowStart, max: latestTimestamp })

  // Update Y scale from our smooth scaling controller
  const yRange = yAxisScaling.displayRange.value
  chartRef.value.setScale('y', { min: yRange.min, max: yRange.max })

  chartRef.value.setData(data)
}

function handleResize() {
  if (!chartRef.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const newWidth = Math.max(rect.width, 100)
  const newHeight = Math.max(rect.height, 80)

  // Resize the chart
  chartRef.value.setSize({
    width: newWidth,
    height: newHeight,
  })
}

function handleClose() {
  emit('close', props.variable.id)
}

// ResizeObserver for container size changes (grid layout changes)
let resizeObserver: ResizeObserver | null = null

// Watch for variable changes
watch(
  () => props.variable.id,
  async (_newId, oldId) => {
    // Untrack old variable, track new one
    if (oldId) {
      interpolation.untrackVariable(oldId)
    }
    // Reset Y-axis scaling for new variable
    yAxisScaling.reset()
    await nextTick()
    initChart()
  }
)

// Watch interpolation updates to trigger chart redraws at 60fps
watch(
  () => interpolation.updateTrigger.value,
  () => {
    updateChart()
  }
)

// Watch frequency changes to update interpolation interval
watch(dataIntervalMs, (newInterval) => {
  interpolation.setDataInterval(newInterval)
})

onMounted(() => {
  initChart()

  // Use ResizeObserver to detect container size changes (grid layout changes)
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Debounce resize handling
      requestAnimationFrame(handleResize)
    })
    resizeObserver.observe(containerRef.value)
  }

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  interpolation.untrackVariable(props.variable.id)
  interpolation.stop()
  yAxisScaling.destroy()
  if (chartRef.value) chartRef.value.destroy()
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  window.removeEventListener('resize', handleResize)
})

const containerClasses = computed(() =>
  cn('relative rounded-lg border border-slate-700 bg-slate-800/50 overflow-hidden', props.class)
)

/**
 * Format a value for display based on data type
 */
function formatValue(value: number, dataType: string): string {
  if (dataType === 'BOOL') {
    return value ? 'ON' : 'OFF'
  }
  if (dataType === 'REAL') {
    return value.toFixed(2)
  }
  return String(Math.round(value))
}

// Format current value for display
// Depends on interpolation.updateTrigger to be reactive at 60fps
const currentValue = computed(() => {
  // Touch updateTrigger to make this reactive
  void interpolation.updateTrigger.value

  const history = getHistory(props.variable.id)
  if (history.length === 0) return '—'

  const latest = history[history.length - 1]
  if (!latest) return '—'

  return formatValue(latest.value, props.variable.dataType)
})

// Calculate average value from visible history
// Depends on interpolation.updateTrigger to be reactive at 60fps
const averageValue = computed(() => {
  // Touch updateTrigger to make this reactive
  void interpolation.updateTrigger.value

  const history = getHistory(props.variable.id)
  if (history.length === 0) return '—'

  const sum = history.reduce((acc, p) => acc + p.value, 0)
  const avg = sum / history.length

  return formatValue(avg, props.variable.dataType)
})
</script>

<template>
  <div :class="containerClasses">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-700/50 px-3 py-2">
      <div class="flex min-w-0 items-center gap-2">
        <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: chartColor }" />
        <span class="truncate text-xs font-medium text-slate-200">
          {{ variable.name }}
        </span>
        <span class="text-[10px] text-slate-500 uppercase">
          {{ variable.dataType }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <!-- Current / Average values -->
        <div class="flex items-center gap-1 font-mono text-sm">
          <span class="font-semibold text-slate-100">{{ currentValue }}</span>
          <span class="text-slate-500">/</span>
          <span class="text-slate-400">{{ averageValue }}</span>
          <span class="text-[10px] font-normal text-slate-500">avg</span>
          <span v-if="variable.unit" class="ml-0.5 text-xs font-normal text-slate-500">
            {{ variable.unit }}
          </span>
        </div>
        <Button variant="ghost" size="sm" class="h-6 w-6 p-0" @click="handleClose">
          <X class="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>

    <!-- Chart container -->
    <div ref="containerRef" class="relative h-[calc(100%-36px)] w-full">
      <!-- Hover tooltip -->
      <div
        v-show="tooltipVisible"
        ref="tooltipRef"
        class="pointer-events-none absolute z-10 rounded border border-slate-600 bg-slate-900/95 px-2 py-1 font-mono text-xs font-medium whitespace-nowrap text-slate-100 shadow-lg"
        :style="{ left: `${tooltipX}px`, top: `${tooltipY}px` }"
      >
        {{ tooltipValue }}
      </div>
    </div>
  </div>
</template>

<style>
.uplot {
  font-family: Inter, system-ui, sans-serif;
}

.uplot .u-legend {
  display: none;
}

.uplot .u-cursor-x,
.uplot .u-cursor-y {
  border-color: rgba(148, 163, 184, 0.3);
}
</style>

/**
 * usePlcStream - Bridges RxJS data streams to Vue reactivity
 *
 * Provides reactive access to PLC data with automatic cleanup.
 * Uses shallowRef for performance with frequently updating arrays.
 */

import { shallowRef, ref, onMounted, onUnmounted, triggerRef, readonly, computed } from 'vue'
import { Subject } from 'rxjs'
import { takeUntil, sampleTime, filter } from 'rxjs/operators'
import { PlcSimulator, getDataPipeline, resetDataPipeline, RingBuffer } from '@/core'
import type { PlcVariable, PlcDataUpdate, DataPoint, SimulationFrequency } from '@/core/types'
import { FREQUENCY_HZ, MAX_HISTORY_POINTS } from '@/core/types'

// Singleton simulator instance
let simulator: PlcSimulator | null = null

// Reactive state
const isRunning = ref(false)
const currentFrequency = ref<SimulationFrequency>('medium')
const latestValues = shallowRef<Map<string, DataPoint>>(new Map())
const dataPointCount = ref(0)

// History buffers for each variable
const historyBuffers = new Map<string, RingBuffer<DataPoint>>()

// Track last evicted point per variable for smooth left-edge interpolation
const lastEvictedPoints = new Map<string, DataPoint>()

/**
 * Get or create a history buffer for a variable
 */
function getHistoryBuffer(variableId: string): RingBuffer<DataPoint> {
  let buffer = historyBuffers.get(variableId)
  if (!buffer) {
    buffer = new RingBuffer<DataPoint>(MAX_HISTORY_POINTS)
    historyBuffers.set(variableId, buffer)
  }
  return buffer
}

/**
 * Main composable for PLC data stream management
 */
export function usePlcStream() {
  const destroy$ = new Subject<void>()

  /**
   * Initialize and start the simulator
   */
  const startSimulation = (frequency: SimulationFrequency = 'medium'): void => {
    if (!simulator) {
      simulator = new PlcSimulator()
    }

    const pipeline = getDataPipeline()
    currentFrequency.value = frequency

    // Connect simulator to pipeline
    simulator.start((update: PlcDataUpdate) => {
      pipeline.push(update)
      dataPointCount.value++

      // Store in history buffer, tracking evicted point for smooth interpolation
      const buffer = getHistoryBuffer(update.variableId)

      // If buffer is full, the oldest point will be evicted - save it
      if (buffer.isFull) {
        const oldestPoint = buffer.toArray()[0]
        if (oldestPoint) {
          lastEvictedPoints.set(update.variableId, oldestPoint)
        }
      }

      buffer.push(update.point)

      // Update latest values map
      const newMap = new Map(latestValues.value)
      newMap.set(update.variableId, update.point)
      latestValues.value = newMap
      triggerRef(latestValues)
    }, frequency)

    isRunning.value = true
  }

  /**
   * Stop the simulation
   */
  const stopSimulation = (): void => {
    if (simulator) {
      simulator.stop()
    }
    isRunning.value = false
  }

  /**
   * Change simulation frequency
   */
  const setFrequency = (frequency: SimulationFrequency): void => {
    currentFrequency.value = frequency
    // Clear evicted points - they have wrong timing for the new frequency
    lastEvictedPoints.clear()
    if (simulator && isRunning.value) {
      simulator.setFrequency(frequency)
    }
  }

  /**
   * Get current frequency in Hz
   */
  const frequencyHz = computed(() => FREQUENCY_HZ[currentFrequency.value])

  /**
   * Get all variable definitions
   */
  const getVariables = (): PlcVariable[] => {
    if (!simulator) {
      simulator = new PlcSimulator()
    }
    return simulator.getVariables()
  }

  /**
   * Get history data for a variable
   */
  const getHistory = (variableId: string): DataPoint[] => {
    const buffer = historyBuffers.get(variableId)
    return buffer ? buffer.toArray() : []
  }

  /**
   * Get the last evicted point for a variable (for smooth left-edge interpolation)
   */
  const getLastEvictedPoint = (variableId: string): DataPoint | undefined => {
    return lastEvictedPoints.get(variableId)
  }

  /**
   * Get latest value for a variable
   */
  const getLatestValue = (variableId: string): DataPoint | undefined => {
    return latestValues.value.get(variableId)
  }

  /**
   * Reset all data
   */
  const reset = (): void => {
    historyBuffers.clear()
    lastEvictedPoints.clear()
    latestValues.value = new Map()
    dataPointCount.value = 0
    if (simulator) {
      simulator.reset()
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    destroy$.next()
    destroy$.complete()
  })

  return {
    // State
    isRunning: readonly(isRunning),
    currentFrequency: readonly(currentFrequency),
    frequencyHz,
    latestValues: readonly(latestValues),
    dataPointCount: readonly(dataPointCount),

    // Methods
    startSimulation,
    stopSimulation,
    setFrequency,
    getVariables,
    getHistory,
    getLastEvictedPoint,
    getLatestValue,
    reset,
  }
}

/**
 * Composable for subscribing to a specific variable's data stream
 * Used by chart components for real-time updates
 */
export function useVariableStream(variableId: string) {
  const destroy$ = new Subject<void>()
  const history = shallowRef<DataPoint[]>([])
  const latestValue = ref<DataPoint | undefined>()

  onMounted(() => {
    const pipeline = getDataPipeline()

    // Subscribe to variable updates at 60fps
    pipeline.dataStream$
      .pipe(
        filter((update) => update.variableId === variableId),
        sampleTime(16), // ~60fps
        takeUntil(destroy$)
      )
      .subscribe((update) => {
        latestValue.value = update.point

        // Get current history from buffer
        const buffer = getHistoryBuffer(variableId)
        history.value = buffer.toArray()
        triggerRef(history)
      })
  })

  onUnmounted(() => {
    destroy$.next()
    destroy$.complete()
  })

  return {
    history: readonly(history),
    latestValue: readonly(latestValue),
  }
}

/**
 * Cleanup function for testing
 */
export function cleanupPlcStream(): void {
  if (simulator) {
    simulator.stop()
    simulator = null
  }
  resetDataPipeline()
  historyBuffers.clear()
  lastEvictedPoints.clear()
  latestValues.value = new Map()
  dataPointCount.value = 0
  isRunning.value = false
}

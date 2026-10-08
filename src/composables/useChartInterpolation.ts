/**
 * useChartInterpolation - Provides smooth 60fps interpolation for chart data
 *
 * Receives data at 10Hz from PLC stream, outputs interpolated data at 60fps
 * for smooth chart rendering without visible "jumps" between data points.
 *
 * Key insight: Both data arrival AND time window movement must be smooth.
 * - New data point values are interpolated from previous to current
 * - The time window (X-axis) slides smoothly at 60fps using a smooth clock
 * - This ensures data "slides off" the left edge smoothly, not in jumps
 */

import { shallowRef, triggerRef, onUnmounted, readonly } from 'vue'
import type { DataPoint } from '@/core/types'
import { TREND_TIME_WINDOW_SECONDS } from '@/core/types'

interface InterpolationState {
  /** Previous data point (start of interpolation) */
  prev: DataPoint | null
  /** Target data point (end of interpolation) */
  target: DataPoint | null
  /** Timestamp when target was received */
  targetReceivedAt: number
  /** Expected interval between data points in ms */
  interval: number
}

/**
 * Linear interpolation between two values
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/**
 * Clamp value between 0 and 1
 */
function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t))
}

/**
 * Create an interpolation controller for smooth chart updates
 */
export function useChartInterpolation(
  getHistory: (variableId: string) => DataPoint[],
  getLastEvictedPoint: (variableId: string) => DataPoint | undefined,
  dataIntervalMs: number = 100 // 10Hz = 100ms
) {
  // Per-variable interpolation state
  const stateMap = new Map<string, InterpolationState>()

  // Track if RAF loop is running
  let rafId: number | null = null
  let isRunning = false

  // Smooth clock for X-axis window - advances at 60fps for butter-smooth scrolling
  // This is the key to making data "slide off" the left edge smoothly
  let lastFrameTime = 0
  const smoothCurrentTime = shallowRef(Date.now() / 1000) // in seconds for uPlot

  // Reactive trigger for updates
  const updateTrigger = shallowRef(0)

  /**
   * Get or create interpolation state for a variable
   */
  function getState(variableId: string): InterpolationState {
    let state = stateMap.get(variableId)
    if (!state) {
      state = {
        prev: null,
        target: null,
        targetReceivedAt: 0,
        interval: dataIntervalMs,
      }
      stateMap.set(variableId, state)
    }
    return state
  }

  /**
   * Sync raw history to interpolated buffer, keeping most points as-is
   * but interpolating the final segment
   */
  function syncHistory(variableId: string): void {
    const rawHistory = getHistory(variableId)
    const state = getState(variableId)

    if (rawHistory.length === 0) {
      return
    }

    // Get the last two raw points for interpolation
    const lastRawPoint = rawHistory[rawHistory.length - 1]
    const prevRawPoint = rawHistory.length > 1 ? rawHistory[rawHistory.length - 2] : null

    // Detect new data point arrival
    if (lastRawPoint && (!state.target || lastRawPoint.timestamp !== state.target.timestamp)) {
      // New target received
      state.prev = state.target ?? prevRawPoint ?? null
      state.target = lastRawPoint
      state.targetReceivedAt = performance.now()
    }
  }

  /**
   * Get interpolated value for current frame
   */
  function getInterpolatedValue(variableId: string): number | null {
    const state = getState(variableId)

    if (!state.target) {
      return null
    }

    if (!state.prev) {
      return state.target.value
    }

    // Calculate interpolation progress
    const elapsed = performance.now() - state.targetReceivedAt
    const t = clamp01(elapsed / state.interval)

    // Use ease-out for smoother feel at the end
    const easedT = 1 - Math.pow(1 - t, 2)

    return lerp(state.prev.value, state.target.value, easedT)
  }

  /**
   * Get interpolated timestamp for current frame
   * This makes the X-axis timeline move smoothly
   */
  function getInterpolatedTimestamp(variableId: string): number | null {
    const state = getState(variableId)

    if (!state.target) {
      return null
    }

    if (!state.prev) {
      return state.target.timestamp
    }

    // Calculate interpolation progress (linear for time)
    const elapsed = performance.now() - state.targetReceivedAt
    const t = clamp01(elapsed / state.interval)

    // Linear interpolation for timestamp (no easing - time should flow uniformly)
    return lerp(state.prev.timestamp, state.target.timestamp, t)
  }

  /**
   * Build interpolated history array for chart rendering
   *
   * Handles BOTH edges smoothly:
   * - RIGHT EDGE: Interpolates the newest point's value and timestamp
   * - LEFT EDGE: Uses last evicted point (if available) to always have a segment
   *              crossing the window boundary for smooth interpolation
   */
  function getInterpolatedHistory(variableId: string): DataPoint[] {
    const rawHistory = getHistory(variableId)

    if (rawHistory.length === 0) {
      return []
    }

    if (rawHistory.length === 1) {
      return [...rawHistory]
    }

    // Get the current time window boundaries (in milliseconds to match data timestamps)
    const windowEndMs = smoothCurrentTime.value * 1000
    const windowStartMs = windowEndMs - TREND_TIME_WINDOW_SECONDS * 1000

    const result: DataPoint[] = []

    // Check if we need to use the last evicted point for left-edge interpolation
    const firstPoint = rawHistory[0]
    const evictedPoint = getLastEvictedPoint(variableId)

    // If the first point in buffer is inside the window and we have an evicted point,
    // create a synthetic segment for left-edge interpolation
    if (
      firstPoint &&
      evictedPoint &&
      firstPoint.timestamp >= windowStartMs &&
      evictedPoint.timestamp < windowStartMs
    ) {
      // Interpolate point at window start using evicted point -> first point segment
      const t =
        (windowStartMs - evictedPoint.timestamp) / (firstPoint.timestamp - evictedPoint.timestamp)
      const edgeValue = lerp(evictedPoint.value, firstPoint.value, t)
      result.push({
        timestamp: windowStartMs,
        value: edgeValue,
      })
    }

    // Process all segments (pairs of consecutive points)
    for (let i = 0; i < rawHistory.length - 1; i++) {
      const curr = rawHistory[i]
      const next = rawHistory[i + 1]

      if (!curr || !next) continue

      // Case 1: Segment crosses left edge (curr outside, next inside)
      if (curr.timestamp < windowStartMs && next.timestamp >= windowStartMs) {
        // Interpolate point at window start
        const t = (windowStartMs - curr.timestamp) / (next.timestamp - curr.timestamp)
        const edgeValue = lerp(curr.value, next.value, t)
        result.push({
          timestamp: windowStartMs,
          value: edgeValue,
        })
        // Don't add curr (it's outside), next will be added in next iteration or as middle point
      }
      // Case 2: Current point is inside window
      else if (curr.timestamp >= windowStartMs) {
        result.push(curr)
      }
      // Case 3: Both points outside window (before) - skip
      // Case 4: Both points outside window (after) - shouldn't happen with our data
    }

    // Handle RIGHT EDGE interpolation
    // Add interpolated final point with both value and timestamp interpolated
    const interpolatedValue = getInterpolatedValue(variableId)
    const interpolatedTime = getInterpolatedTimestamp(variableId)
    const lastRaw = rawHistory[rawHistory.length - 1]

    if (lastRaw && interpolatedValue !== null && interpolatedTime !== null) {
      result.push({
        timestamp: interpolatedTime,
        value: interpolatedValue,
      })
    } else if (lastRaw) {
      result.push(lastRaw)
    }

    return result
  }

  /**
   * Animation frame loop - runs at 60fps
   * Updates smooth clock and triggers reactive updates for chart redraws
   */
  function tick(frameTime: number): void {
    if (!isRunning) return

    // Update smooth clock - this is what makes the X-axis slide smoothly
    // On first frame, initialize lastFrameTime
    if (lastFrameTime === 0) {
      lastFrameTime = frameTime
      smoothCurrentTime.value = Date.now() / 1000
    } else {
      // Advance smooth time by the actual frame delta
      const deltaMs = frameTime - lastFrameTime
      lastFrameTime = frameTime

      // Advance time smoothly (deltaMs is typically ~16.67ms at 60fps)
      smoothCurrentTime.value += deltaMs / 1000
    }

    // Sync all tracked variables
    for (const variableId of stateMap.keys()) {
      syncHistory(variableId)
    }

    // Trigger reactive update
    updateTrigger.value++
    triggerRef(updateTrigger)

    rafId = requestAnimationFrame(tick)
  }

  /**
   * Start tracking a variable for interpolation
   */
  function trackVariable(variableId: string): void {
    getState(variableId)
    syncHistory(variableId)
  }

  /**
   * Stop tracking a variable
   */
  function untrackVariable(variableId: string): void {
    stateMap.delete(variableId)
  }

  /**
   * Start the interpolation loop
   */
  function start(): void {
    if (isRunning) return
    isRunning = true
    // Reset clock state for fresh start
    lastFrameTime = 0
    smoothCurrentTime.value = Date.now() / 1000
    rafId = requestAnimationFrame(tick)
  }

  /**
   * Stop the interpolation loop
   */
  function stop(): void {
    isRunning = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    lastFrameTime = 0
  }

  /**
   * Update the data interval (when frequency changes)
   */
  function setDataInterval(ms: number): void {
    for (const state of stateMap.values()) {
      state.interval = ms
      // Reset interpolation state to avoid stale timing
      state.prev = null
      state.target = null
      state.targetReceivedAt = 0
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
    stateMap.clear()
  })

  return {
    /** Get interpolated history for a variable (use this for chart rendering) */
    getInterpolatedHistory,
    /** Start tracking a variable */
    trackVariable,
    /** Stop tracking a variable */
    untrackVariable,
    /** Start the interpolation loop */
    start,
    /** Stop the interpolation loop */
    stop,
    /** Update data interval when frequency changes */
    setDataInterval,
    /** Reactive trigger - watch this to re-render at 60fps */
    updateTrigger,
    /** Smooth current time in seconds - use this for X-axis window bounds */
    currentTime: readonly(smoothCurrentTime),
  }
}

/**
 * useAxisScaling - Provides smooth, stable Y-axis scaling for trend charts
 *
 * Industrial automation best practices:
 * - Expand quickly when values exceed range (safety)
 * - Contract slowly to avoid jittery scaling
 * - Add padding/buffer above and below data range
 * - Only narrow range after values are stable for a period
 */

import { ref, computed } from 'vue'

export interface ScaleRange {
  min: number
  max: number
}

export interface AxisScalingOptions {
  /** Padding as percentage of range (0.1 = 10%) */
  padding?: number
  /** How long values must be stable before contracting (ms) */
  stabilityPeriod?: number
  /** Smooth transition duration for scale changes (ms) */
  transitionDuration?: number
  /** Minimum range to prevent zooming in too far */
  minRange?: number
}

const DEFAULT_OPTIONS: Required<AxisScalingOptions> = {
  padding: 0.15, // 15% padding
  stabilityPeriod: 2000, // 2 seconds (reduced for better UX)
  transitionDuration: 200, // 200ms - faster animation for responsiveness
  minRange: 0.1, // Minimum range of 0.1 unit
}

/**
 * Creates a Y-axis scale controller with smooth, stable scaling
 */
export function useAxisScaling(options: AxisScalingOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }

  // Current display range (what's shown on screen)
  const displayRange = ref<ScaleRange>({ min: 0, max: 100 })

  // Target range (where we're animating to)
  const targetRange = ref<ScaleRange>({ min: 0, max: 100 })

  // Track when data first became stable within the current range
  let stableStartTime: number | null = null
  let isInitialized = false

  /**
   * Calculate the ideal range for given data with padding
   */
  function calculateIdealRange(dataMin: number, dataMax: number): ScaleRange {
    const dataRange = dataMax - dataMin
    const effectiveRange = Math.max(dataRange, config.minRange)
    const padding = effectiveRange * config.padding

    return {
      min: dataMin - padding,
      max: dataMax + padding,
    }
  }

  /**
   * Lerp factor for smooth animation (called at 60fps)
   * Higher = faster response, lower = smoother
   */
  const LERP_SPEED = 0.15

  /**
   * Linear interpolation
   */
  function lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t
  }

  /**
   * Update display range towards target (called each frame)
   */
  function updateDisplayRange(): void {
    const current = displayRange.value
    const target = targetRange.value

    // If very close to target, snap to it
    const minDiff = Math.abs(current.min - target.min)
    const maxDiff = Math.abs(current.max - target.max)
    const range = target.max - target.min
    const threshold = range * 0.001 // 0.1% threshold

    if (minDiff < threshold && maxDiff < threshold) {
      displayRange.value = { ...target }
      return
    }

    // Lerp towards target
    displayRange.value = {
      min: lerp(current.min, target.min, LERP_SPEED),
      max: lerp(current.max, target.max, LERP_SPEED),
    }
  }

  /**
   * Update the scale based on new data
   * @param dataMin - Minimum value in the visible time window (all visible data points)
   * @param dataMax - Maximum value in the visible time window (all visible data points)
   */
  function updateScale(dataMin: number, dataMax: number): void {
    const now = performance.now()
    const currentTarget = targetRange.value

    // Initialize on first call with actual data range
    if (!isInitialized) {
      const initialRange = calculateIdealRange(dataMin, dataMax)
      displayRange.value = initialRange
      targetRange.value = initialRange
      isInitialized = true
      stableStartTime = now
      return
    }

    // Check if ANY data exceeds the current TARGET range (not display, which may be animating)
    const exceedsTarget = dataMin < currentTarget.min || dataMax > currentTarget.max

    if (exceedsTarget) {
      // Reset stability tracking - data exceeded range
      stableStartTime = null

      // Calculate ideal range for ALL visible data
      const idealRange = calculateIdealRange(dataMin, dataMax)

      // Expand target to encompass ALL visible data
      targetRange.value = {
        min: Math.min(idealRange.min, currentTarget.min),
        max: Math.max(idealRange.max, currentTarget.max),
      }
    } else {
      // Data is within current target range - track stability
      if (stableStartTime === null) {
        stableStartTime = now
      }

      // Check if stable long enough to consider contracting
      const stableDuration = now - stableStartTime
      if (stableDuration > config.stabilityPeriod) {
        // Calculate ideal range that would fit ALL visible data with padding
        const idealRange = calculateIdealRange(dataMin, dataMax)

        const currentSize = currentTarget.max - currentTarget.min
        const idealSize = idealRange.max - idealRange.min

        // Contract if we can reduce by at least 20%
        if (idealSize < currentSize * 0.8) {
          targetRange.value = idealRange
          // Reset stability timer for next potential contraction
          stableStartTime = now
        }
      }
    }

    // Always update display towards target (smooth animation)
    updateDisplayRange()
  }

  /**
   * Force set the range (for initialization) - only use for known fixed ranges
   */
  function setRange(min: number, max: number): void {
    const range = calculateIdealRange(min, max)
    displayRange.value = range
    targetRange.value = range
    isInitialized = true
    stableStartTime = performance.now()
  }

  /**
   * Reset the scaling state
   */
  function reset(): void {
    displayRange.value = { min: 0, max: 100 }
    targetRange.value = { min: 0, max: 100 }
    stableStartTime = null
    isInitialized = false
  }

  /**
   * Cleanup (no-op now, kept for API compatibility)
   */
  function destroy(): void {
    // No cleanup needed - we no longer use RAF
  }

  return {
    /** Current display range (reactive) */
    displayRange: computed(() => displayRange.value),
    /** Update scale with new data bounds */
    updateScale,
    /** Force set a specific range */
    setRange,
    /** Reset to defaults */
    reset,
    /** Cleanup resources */
    destroy,
  }
}

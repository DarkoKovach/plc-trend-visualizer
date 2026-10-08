/**
 * useDevTools - Development-only tools composable
 *
 * Provides FPS monitoring, analytics, and debugging tools.
 * Completely disabled in production builds via tree-shaking.
 */

import { ref, readonly, onMounted, onUnmounted, computed } from 'vue'
import { FpsMonitor, Analytics, ANALYTICS_EVENTS, getFpsStatus } from '@/core/devtools'
import type { AnalyticsEvent } from '@/core/devtools'

// DevTools state (only initialized in dev mode)
const isEnabled = import.meta.env.DEV
const isOpen = ref(false)
const fps = ref(0)
const fpsMonitor = isEnabled ? new FpsMonitor() : null
const analytics = isEnabled ? new Analytics() : null

// Activity log for display
const activityLog = ref<AnalyticsEvent[]>([])

/**
 * Main DevTools composable
 */
export function useDevTools() {
  /**
   * FPS status for color coding
   */
  const fpsStatus = computed(() => getFpsStatus(fps.value))

  /**
   * Start FPS monitoring
   */
  const startMonitoring = (): void => {
    if (!isEnabled || !fpsMonitor) return

    fpsMonitor.start((currentFps) => {
      const previousFps = fps.value
      fps.value = currentFps

      // Track FPS drops
      if (analytics) {
        if (previousFps >= 30 && currentFps < 30) {
          analytics.track(ANALYTICS_EVENTS.FPS_DROP, { fps: currentFps })
        } else if (previousFps < 30 && currentFps >= 30) {
          analytics.track(ANALYTICS_EVENTS.FPS_RECOVERED, { fps: currentFps })
        }
      }
    })
  }

  /**
   * Stop FPS monitoring
   */
  const stopMonitoring = (): void => {
    if (!isEnabled || !fpsMonitor) return
    fpsMonitor.stop()
  }

  /**
   * Track an analytics event
   */
  const trackEvent = (event: string, data?: Record<string, unknown>): void => {
    if (!isEnabled || !analytics) return

    analytics.track(event, data)

    // Update activity log
    activityLog.value = analytics.getLog().slice(-20) // Keep last 20 events
  }

  /**
   * Toggle DevTools visibility
   */
  const toggleDevTools = (): void => {
    isOpen.value = !isOpen.value

    if (analytics) {
      if (isOpen.value) {
        analytics.track(ANALYTICS_EVENTS.DEVTOOLS_OPENED)
      } else {
        analytics.track(ANALYTICS_EVENTS.DEVTOOLS_CLOSED)
      }
    }
  }

  /**
   * Export activity log as JSON
   */
  const exportLog = (): string => {
    if (!analytics) return '[]'

    if (isEnabled) {
      analytics.track(ANALYTICS_EVENTS.LOG_EXPORTED)
    }

    return analytics.exportLog()
  }

  /**
   * Download log as file
   */
  const downloadLog = (): void => {
    const log = exportLog()
    const blob = new Blob([log], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devtools-log-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Clear activity log
   */
  const clearLog = (): void => {
    if (!analytics) return
    analytics.clearLog()
    activityLog.value = []
  }

  /**
   * Get analytics statistics
   */
  const getStats = () => {
    if (!analytics) return { eventCount: 0, eventTypes: {} }
    return analytics.getStats()
  }

  // Auto-start monitoring on mount
  onMounted(() => {
    if (isEnabled) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    if (isEnabled) {
      stopMonitoring()
    }
  })

  return {
    // State
    isEnabled,
    isOpen,
    fps: readonly(fps),
    fpsStatus,
    activityLog: readonly(activityLog),

    // Methods
    startMonitoring,
    stopMonitoring,
    trackEvent,
    toggleDevTools,
    exportLog,
    downloadLog,
    clearLog,
    getStats,

    // Event constants for external use
    ANALYTICS_EVENTS,
  }
}

/**
 * Shorthand for tracking common events
 */
export function useAnalytics() {
  const { trackEvent, ANALYTICS_EVENTS } = useDevTools()

  return {
    trackVariableSelected: (variableId: string) =>
      trackEvent(ANALYTICS_EVENTS.VARIABLE_SELECTED, { variableId }),

    trackVariableDeselected: (variableId: string) =>
      trackEvent(ANALYTICS_EVENTS.VARIABLE_DESELECTED, { variableId }),

    trackMaxSelectionReached: () => trackEvent(ANALYTICS_EVENTS.MAX_SELECTION_REACHED),

    trackFrequencyChanged: (frequency: string) =>
      trackEvent(ANALYTICS_EVENTS.FREQUENCY_CHANGED, { frequency }),

    trackSimulationStarted: (frequency: string) =>
      trackEvent(ANALYTICS_EVENTS.SIMULATION_STARTED, { frequency }),

    trackSimulationStopped: () => trackEvent(ANALYTICS_EVENTS.SIMULATION_STOPPED),
  }
}

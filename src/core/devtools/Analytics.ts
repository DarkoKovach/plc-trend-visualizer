/**
 * Analytics - Event tracking and activity log
 *
 * Framework-agnostic analytics tracking with activity log.
 * In development: logs to console and maintains in-memory log.
 * In production: would POST to analytics endpoint.
 *
 * This is a stub implementation demonstrating the architecture.
 * The endpoint connection is not implemented but the code structure
 * shows how it would be integrated.
 */

export interface AnalyticsEvent {
  /** Unix timestamp */
  timestamp: number
  /** Event name */
  event: string
  /** Optional event data */
  data?: Record<string, unknown>
}

export interface AnalyticsConfig {
  /** Maximum events to keep in log */
  maxLogSize?: number
  /** Enable console logging in dev mode */
  enableConsoleLog?: boolean
  /**
   * Analytics endpoint URL (not implemented - for future use)
   * When implemented, events would be batched and POSTed here
   */
  endpointUrl?: string
}

const DEFAULT_CONFIG: Required<AnalyticsConfig> = {
  maxLogSize: 100,
  enableConsoleLog: true,
  endpointUrl: '',
}

/**
 * Analytics class for event tracking
 */
export class Analytics {
  private log: AnalyticsEvent[] = []
  private config: Required<AnalyticsConfig>

  constructor(config: AnalyticsConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Track an event
   * @param event Event name (e.g., 'variable_selected', 'frequency_changed')
   * @param data Optional event data
   */
  track(event: string, data?: Record<string, unknown>): void {
    const analyticsEvent: AnalyticsEvent = {
      timestamp: Date.now(),
      event,
      data,
    }

    // Add to log
    this.log.push(analyticsEvent)

    // Trim log if over limit
    if (this.log.length > this.config.maxLogSize) {
      this.log.shift()
    }

    // Console log in development
    if (this.config.enableConsoleLog && import.meta.env?.DEV) {
      console.debug('[Analytics]', event, data ?? '')
    }

    // Future: Send to endpoint
    // This is where we would batch and POST events
    // Example implementation (not active):
    //
    // if (this.config.endpointUrl) {
    //   this.sendToEndpoint(analyticsEvent)
    // }
  }

  /**
   * Get the activity log
   * @returns Copy of the event log
   */
  getLog(): AnalyticsEvent[] {
    return [...this.log]
  }

  /**
   * Export log as JSON string
   * Useful for debugging or manual export
   */
  exportLog(): string {
    return JSON.stringify(this.log, null, 2)
  }

  /**
   * Clear the activity log
   */
  clearLog(): void {
    this.log = []
  }

  /**
   * Get log statistics
   */
  getStats(): { eventCount: number; eventTypes: Record<string, number> } {
    const eventTypes: Record<string, number> = {}

    for (const event of this.log) {
      eventTypes[event.event] = (eventTypes[event.event] || 0) + 1
    }

    return {
      eventCount: this.log.length,
      eventTypes,
    }
  }

  // Future: Endpoint integration
  // This method shows the intended architecture for production use
  //
  // private async sendToEndpoint(event: AnalyticsEvent): Promise<void> {
  //   if (!this.config.endpointUrl) return
  //
  //   try {
  //     await fetch(this.config.endpointUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(event),
  //     })
  //   } catch (error) {
  //     console.warn('[Analytics] Failed to send event:', error)
  //   }
  // }
}

/**
 * Predefined event names for consistency
 */
export const ANALYTICS_EVENTS = {
  // Variable selection
  VARIABLE_SELECTED: 'variable_selected',
  VARIABLE_DESELECTED: 'variable_deselected',
  MAX_SELECTION_REACHED: 'max_selection_reached',

  // Simulation
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_STOPPED: 'simulation_stopped',
  FREQUENCY_CHANGED: 'frequency_changed',

  // UI interactions
  DEVTOOLS_OPENED: 'devtools_opened',
  DEVTOOLS_CLOSED: 'devtools_closed',
  LOG_EXPORTED: 'log_exported',

  // Performance
  FPS_DROP: 'fps_drop',
  FPS_RECOVERED: 'fps_recovered',
} as const

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]

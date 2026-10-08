/**
 * FpsMonitor - RAF-based FPS tracking
 *
 * Uses requestAnimationFrame timing to measure actual render performance.
 * Framework-agnostic, provides callbacks for FPS updates.
 */

export type FpsCallback = (fps: number) => void

export class FpsMonitor {
  private frameCount = 0
  private lastTime = 0
  private rafId: number | null = null
  private callback: FpsCallback | null = null
  private currentFps = 0
  private updateIntervalMs: number

  /**
   * Create a new FPS monitor
   * @param updateIntervalMs How often to calculate and report FPS (default: 1000ms)
   */
  constructor(updateIntervalMs: number = 1000) {
    this.updateIntervalMs = updateIntervalMs
  }

  /**
   * Start monitoring FPS
   * @param callback Function to call with FPS updates
   */
  start(callback: FpsCallback): void {
    this.stop() // Stop any existing monitoring
    this.callback = callback
    this.frameCount = 0
    this.lastTime = performance.now()
    this.measureFrame()
  }

  /**
   * Internal frame measurement loop
   */
  private measureFrame = (): void => {
    this.frameCount++
    const now = performance.now()
    const elapsed = now - this.lastTime

    if (elapsed >= this.updateIntervalMs) {
      // Calculate FPS
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed)
      this.frameCount = 0
      this.lastTime = now

      // Report to callback
      if (this.callback) {
        this.callback(this.currentFps)
      }
    }

    // Schedule next frame
    this.rafId = requestAnimationFrame(this.measureFrame)
  }

  /**
   * Stop monitoring FPS
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.callback = null
  }

  /**
   * Get the current FPS value without waiting for callback
   */
  getCurrentFps(): number {
    return this.currentFps
  }

  /**
   * Check if monitoring is active
   */
  isRunning(): boolean {
    return this.rafId !== null
  }
}

/**
 * FPS status classification
 */
export function getFpsStatus(fps: number): 'good' | 'warning' | 'critical' {
  if (fps >= 55) return 'good'
  if (fps >= 30) return 'warning'
  return 'critical'
}

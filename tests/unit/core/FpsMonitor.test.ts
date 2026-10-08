import { describe, it, expect, vi, afterEach } from 'vitest'
import { FpsMonitor } from '@/core/devtools/FpsMonitor'

// Note: FpsMonitor uses requestAnimationFrame and performance.now
// which need to be available in the test environment

describe('FpsMonitor', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create an FPS monitor with default interval', () => {
      const monitor = new FpsMonitor()
      expect(monitor).toBeDefined()
      expect(monitor.getCurrentFps()).toBe(0)
    })

    it('should create an FPS monitor with custom interval', () => {
      const monitor = new FpsMonitor(500)
      expect(monitor).toBeDefined()
    })
  })

  describe('start/stop', () => {
    it('should start monitoring when start is called', () => {
      const monitor = new FpsMonitor()
      const callback = vi.fn()

      // Mock RAF
      const mockRaf = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((_cb) => {
        return 1
      })

      monitor.start(callback)
      expect(mockRaf).toHaveBeenCalled()
      monitor.stop()
    })

    it('should stop monitoring when stop is called', () => {
      const monitor = new FpsMonitor()
      const callback = vi.fn()
      const mockCancel = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})
      vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1)

      monitor.start(callback)
      monitor.stop()

      expect(mockCancel).toHaveBeenCalled()
    })
  })

  describe('getCurrentFps', () => {
    it('should return 0 initially', () => {
      const monitor = new FpsMonitor()
      expect(monitor.getCurrentFps()).toBe(0)
    })
  })

  describe('isRunning', () => {
    it('should return false before start', () => {
      const monitor = new FpsMonitor()
      expect(monitor.isRunning()).toBe(false)
    })

    it('should return true after start', () => {
      const monitor = new FpsMonitor()
      vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1)

      monitor.start(() => {})
      expect(monitor.isRunning()).toBe(true)
      monitor.stop()
    })

    it('should return false after stop', () => {
      const monitor = new FpsMonitor()
      vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 1)
      vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {})

      monitor.start(() => {})
      monitor.stop()
      expect(monitor.isRunning()).toBe(false)
    })
  })
})

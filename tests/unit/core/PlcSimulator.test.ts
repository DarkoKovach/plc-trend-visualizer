import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PlcSimulator, MOCK_VARIABLES } from '@/core/data'
import type { PlcVariable, PlcDataUpdate } from '@/core/types'

describe('PlcSimulator', () => {
  let simulator: PlcSimulator

  beforeEach(() => {
    vi.useFakeTimers()
    simulator = new PlcSimulator()
  })

  afterEach(() => {
    simulator.stop()
    vi.useRealTimers()
  })

  describe('MOCK_VARIABLES', () => {
    it('should have 20 mock variables', () => {
      expect(MOCK_VARIABLES).toHaveLength(20)
    })

    it('should have all required properties on each variable', () => {
      for (const variable of MOCK_VARIABLES) {
        expect(variable).toHaveProperty('id')
        expect(variable).toHaveProperty('name')
        expect(variable).toHaveProperty('dataType')
        expect(['BOOL', 'INT', 'REAL']).toContain(variable.dataType)
      }
    })

    it('should have unique IDs', () => {
      const ids = MOCK_VARIABLES.map((v: PlcVariable) => v.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(MOCK_VARIABLES.length)
    })

    it('should have a mix of data types', () => {
      const types = MOCK_VARIABLES.map((v: PlcVariable) => v.dataType)
      expect(types).toContain('BOOL')
      expect(types).toContain('INT')
      expect(types).toContain('REAL')
    })
  })

  describe('constructor', () => {
    it('should default to medium frequency', () => {
      expect(simulator.frequency).toBe('medium')
    })
  })

  describe('start/stop', () => {
    it('should start and stop without errors', () => {
      expect(() => {
        simulator.start((_update: PlcDataUpdate) => {
          // callback
        })
      }).not.toThrow()

      expect(() => {
        simulator.stop()
      }).not.toThrow()
    })

    it('should generate data when running', () => {
      const updates: PlcDataUpdate[] = []
      simulator.start((update: PlcDataUpdate) => {
        updates.push(update)
      })

      // Advance time to trigger updates
      vi.advanceTimersByTime(200)

      expect(updates.length).toBeGreaterThan(0)
    })

    it('should not generate data after stop', () => {
      const updates: PlcDataUpdate[] = []
      simulator.start((update: PlcDataUpdate) => {
        updates.push(update)
      })

      vi.advanceTimersByTime(100)
      const countBeforeStop = updates.length

      simulator.stop()

      vi.advanceTimersByTime(500)
      expect(updates.length).toBe(countBeforeStop)
    })
  })

  describe('setFrequency', () => {
    it('should change frequency to low (2 Hz)', () => {
      simulator.setFrequency('low')
      expect(simulator.frequency).toBe('low')
    })

    it('should change frequency to medium (10 Hz)', () => {
      simulator.setFrequency('medium')
      expect(simulator.frequency).toBe('medium')
    })

    it('should change frequency to high (20 Hz)', () => {
      simulator.setFrequency('high')
      expect(simulator.frequency).toBe('high')
    })
  })

  describe('data updates', () => {
    it('should provide valid data updates', () => {
      let lastUpdate: PlcDataUpdate | null = null
      simulator.start((update: PlcDataUpdate) => {
        lastUpdate = update
      })

      vi.advanceTimersByTime(200)

      expect(lastUpdate).not.toBeNull()
      expect(lastUpdate!.variableId).toBeDefined()
      expect(lastUpdate!.point.timestamp).toBeGreaterThan(0)
      expect(typeof lastUpdate!.point.value).toBe('number')
    })

    it('should generate updates for different variables', () => {
      const seenVariables = new Set<string>()
      simulator.start((update: PlcDataUpdate) => {
        seenVariables.add(update.variableId)
      })

      vi.advanceTimersByTime(2000)

      // Should have seen multiple variables
      expect(seenVariables.size).toBeGreaterThan(1)
    })
  })
})

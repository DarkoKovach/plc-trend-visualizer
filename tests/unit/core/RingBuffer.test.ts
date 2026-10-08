import { describe, it, expect, beforeEach } from 'vitest'
import { RingBuffer } from '@/core/chart/RingBuffer'

describe('RingBuffer', () => {
  let buffer: RingBuffer<number>

  beforeEach(() => {
    buffer = new RingBuffer<number>(5)
  })

  describe('constructor', () => {
    it('should create an empty buffer with specified capacity', () => {
      expect(buffer.length).toBe(0)
      expect(buffer.isEmpty).toBe(true)
      expect(buffer.isFull).toBe(false)
    })

    it('should handle capacity of 1', () => {
      const smallBuffer = new RingBuffer<string>(1)
      smallBuffer.push('test')
      expect(smallBuffer.length).toBe(1)
    })

    it('should throw error for non-positive capacity', () => {
      expect(() => new RingBuffer(0)).toThrow()
      expect(() => new RingBuffer(-1)).toThrow()
    })
  })

  describe('push', () => {
    it('should add items to the buffer', () => {
      buffer.push(1)
      buffer.push(2)
      buffer.push(3)

      expect(buffer.length).toBe(3)
      expect(buffer.toArray()).toEqual([1, 2, 3])
    })

    it('should overwrite oldest items when capacity is exceeded', () => {
      buffer.push(1)
      buffer.push(2)
      buffer.push(3)
      buffer.push(4)
      buffer.push(5)
      buffer.push(6) // This should overwrite 1

      expect(buffer.length).toBe(5)
      expect(buffer.toArray()).toEqual([2, 3, 4, 5, 6])
    })

    it('should maintain correct order after multiple overwrites', () => {
      for (let i = 1; i <= 10; i++) {
        buffer.push(i)
      }

      expect(buffer.toArray()).toEqual([6, 7, 8, 9, 10])
    })
  })

  describe('peek', () => {
    it('should return undefined for empty buffer', () => {
      expect(buffer.peek()).toBeUndefined()
    })

    it('should return the most recent item without removing it', () => {
      buffer.push(1)
      buffer.push(2)
      buffer.push(3)

      // peek returns the most recent (last pushed) item
      expect(buffer.peek()).toBe(3)
      expect(buffer.length).toBe(3)
    })

    it('should return correct newest after wraparound', () => {
      for (let i = 1; i <= 7; i++) {
        buffer.push(i)
      }

      // peek returns the most recent item
      expect(buffer.peek()).toBe(7)
    })
  })

  describe('toArray', () => {
    it('should return empty array for empty buffer', () => {
      expect(buffer.toArray()).toEqual([])
    })

    it('should return items in insertion order (oldest first)', () => {
      buffer.push(10)
      buffer.push(20)
      buffer.push(30)

      expect(buffer.toArray()).toEqual([10, 20, 30])
    })

    it('should return correct order after wraparound', () => {
      for (let i = 1; i <= 8; i++) {
        buffer.push(i)
      }

      // Buffer has capacity 5, so [4, 5, 6, 7, 8] should remain
      expect(buffer.toArray()).toEqual([4, 5, 6, 7, 8])
    })

    it('should return a new array instance each time', () => {
      buffer.push(1)
      const arr1 = buffer.toArray()
      const arr2 = buffer.toArray()

      expect(arr1).not.toBe(arr2)
      expect(arr1).toEqual(arr2)
    })
  })

  describe('clear', () => {
    it('should empty the buffer', () => {
      buffer.push(1)
      buffer.push(2)
      buffer.push(3)

      buffer.clear()

      expect(buffer.length).toBe(0)
      expect(buffer.isEmpty).toBe(true)
      expect(buffer.toArray()).toEqual([])
    })

    it('should allow reuse after clearing', () => {
      buffer.push(1)
      buffer.push(2)
      buffer.clear()
      buffer.push(10)
      buffer.push(20)

      expect(buffer.toArray()).toEqual([10, 20])
    })
  })

  describe('isFull', () => {
    it('should return false when buffer is not full', () => {
      buffer.push(1)
      buffer.push(2)

      expect(buffer.isFull).toBe(false)
    })

    it('should return true when buffer reaches capacity', () => {
      for (let i = 1; i <= 5; i++) {
        buffer.push(i)
      }

      expect(buffer.isFull).toBe(true)
    })

    it('should remain true after overwrites', () => {
      for (let i = 1; i <= 10; i++) {
        buffer.push(i)
      }

      expect(buffer.isFull).toBe(true)
    })
  })

  describe('isEmpty', () => {
    it('should return true for new buffer', () => {
      expect(buffer.isEmpty).toBe(true)
    })

    it('should return false after adding items', () => {
      buffer.push(1)
      expect(buffer.isEmpty).toBe(false)
    })

    it('should return true after clearing', () => {
      buffer.push(1)
      buffer.clear()
      expect(buffer.isEmpty).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle objects', () => {
      const objBuffer = new RingBuffer<{ id: number; name: string }>(3)

      objBuffer.push({ id: 1, name: 'a' })
      objBuffer.push({ id: 2, name: 'b' })
      objBuffer.push({ id: 3, name: 'c' })
      objBuffer.push({ id: 4, name: 'd' })

      const result = objBuffer.toArray()
      expect(result).toEqual([
        { id: 2, name: 'b' },
        { id: 3, name: 'c' },
        { id: 4, name: 'd' },
      ])
    })

    it('should handle rapid push operations', () => {
      const largeBuffer = new RingBuffer<number>(100)

      for (let i = 0; i < 1000; i++) {
        largeBuffer.push(i)
      }

      expect(largeBuffer.length).toBe(100)
      // peek returns the most recent (999)
      expect(largeBuffer.peek()).toBe(999)
      // toArray first element should be oldest (900)
      expect(largeBuffer.toArray()[0]).toBe(900)
    })
  })
})

/**
 * RingBuffer - Fixed-size circular buffer for time-series data
 *
 * Optimized for O(1) insertion and automatic eviction of oldest data.
 * Used to maintain the last N data points for trend charts without
 * array growth or expensive shift operations.
 *
 * @example
 * const buffer = new RingBuffer<DataPoint>(50)
 * buffer.push({ timestamp: Date.now(), value: 42 })
 * const data = buffer.toArray() // Returns up to 50 points in chronological order
 */
export class RingBuffer<T> {
  private buffer: (T | undefined)[]
  private head = 0
  private count = 0

  /**
   * Create a new RingBuffer with the specified capacity
   * @param capacity Maximum number of elements to store
   */
  constructor(private readonly capacity: number) {
    if (capacity <= 0) {
      throw new Error('RingBuffer capacity must be positive')
    }
    this.buffer = new Array(capacity)
  }

  /**
   * Add an element to the buffer.
   * If the buffer is full, the oldest element is overwritten.
   * @param item The item to add
   */
  push(item: T): void {
    this.buffer[this.head] = item
    this.head = (this.head + 1) % this.capacity
    if (this.count < this.capacity) {
      this.count++
    }
  }

  /**
   * Convert the buffer to an array in chronological order (oldest first)
   * @returns Array of all elements in insertion order
   */
  toArray(): T[] {
    if (this.count === 0) {
      return []
    }

    const result: T[] = new Array(this.count)

    if (this.count < this.capacity) {
      // Buffer not full yet, elements are at indices 0 to count-1
      for (let i = 0; i < this.count; i++) {
        result[i] = this.buffer[i] as T
      }
    } else {
      // Buffer is full, oldest element is at head
      for (let i = 0; i < this.capacity; i++) {
        const index = (this.head + i) % this.capacity
        result[i] = this.buffer[index] as T
      }
    }

    return result
  }

  /**
   * Get the most recent element without removing it
   * @returns The most recent element, or undefined if buffer is empty
   */
  peek(): T | undefined {
    if (this.count === 0) {
      return undefined
    }
    const index = (this.head - 1 + this.capacity) % this.capacity
    return this.buffer[index]
  }

  /**
   * Get the number of elements currently in the buffer
   */
  get length(): number {
    return this.count
  }

  /**
   * Check if the buffer is empty
   */
  get isEmpty(): boolean {
    return this.count === 0
  }

  /**
   * Check if the buffer is at capacity
   */
  get isFull(): boolean {
    return this.count === this.capacity
  }

  /**
   * Clear all elements from the buffer
   */
  clear(): void {
    this.buffer = new Array(this.capacity)
    this.head = 0
    this.count = 0
  }

  /**
   * Get the maximum capacity of the buffer
   */
  getCapacity(): number {
    return this.capacity
  }
}

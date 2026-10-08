/**
 * Signal pattern generators for PLC data simulation
 *
 * These functions generate realistic data patterns for different
 * PLC variable types without any Vue dependencies.
 */

/**
 * Generate a sinusoidal pattern (e.g., temperature cycling)
 * @param time Current time in seconds
 * @param amplitude Peak amplitude
 * @param frequency Cycles per second
 * @param offset DC offset
 * @param noise Random noise amplitude (0-1)
 */
export function sinPattern(
  time: number,
  amplitude: number,
  frequency: number,
  offset: number,
  noise: number = 0.05
): number {
  const base = Math.sin(time * frequency * 2 * Math.PI) * amplitude + offset
  const noiseValue = (Math.random() - 0.5) * 2 * noise * amplitude
  return base + noiseValue
}

/**
 * Generate a noisy signal (e.g., sensor readings with measurement noise)
 * @param baseValue The base/target value
 * @param noiseAmplitude Maximum noise deviation
 * @param drift Slow drift factor (0-1)
 * @param time Current time for drift calculation
 */
export function noisySignal(
  baseValue: number,
  noiseAmplitude: number,
  drift: number = 0,
  time: number = 0
): number {
  const noise = (Math.random() - 0.5) * 2 * noiseAmplitude
  const driftValue = Math.sin(time * 0.1) * drift * baseValue
  return baseValue + noise + driftValue
}

/**
 * Generate a counter pattern (incrementing integer)
 * @param current Current value
 * @param maxValue Maximum value before rollover
 * @param incrementChance Probability of increment per tick (0-1)
 */
export function counterPattern(
  current: number,
  maxValue: number,
  incrementChance: number = 0.8
): number {
  if (Math.random() < incrementChance) {
    return current >= maxValue ? 0 : current + 1
  }
  return current
}

/**
 * Generate a random setpoint pattern (step changes)
 * @param current Current value
 * @param min Minimum value
 * @param max Maximum value
 * @param changeChance Probability of change per tick (0-1)
 */
export function setpointPattern(
  current: number,
  min: number,
  max: number,
  changeChance: number = 0.02
): number {
  if (Math.random() < changeChance) {
    // Generate a new setpoint (integer)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  return current
}

/**
 * Generate a boolean toggle pattern (e.g., limit switches, alarms)
 * @param current Current boolean state (0 or 1)
 * @param toggleChance Probability of toggle per tick (0-1)
 */
export function boolTogglePattern(current: number, toggleChance: number = 0.05): number {
  if (Math.random() < toggleChance) {
    return current === 0 ? 1 : 0
  }
  return current
}

/**
 * Generate a pulse pattern (brief on/off signals)
 * @param current Current state
 * @param pulseChance Chance to start a pulse
 * @param pulseEndChance Chance to end a pulse once started
 */
export function pulsePattern(
  current: number,
  pulseChance: number = 0.03,
  pulseEndChance: number = 0.3
): number {
  if (current === 1) {
    // Currently pulsing, chance to end
    return Math.random() < pulseEndChance ? 0 : 1
  } else {
    // Currently off, chance to start pulse
    return Math.random() < pulseChance ? 1 : 0
  }
}

/**
 * Generate a ramp pattern (gradually increasing/decreasing)
 * @param current Current value
 * @param min Minimum value
 * @param max Maximum value
 * @param direction Current direction (1 for up, -1 for down)
 * @param step Step size per tick
 */
export function rampPattern(
  current: number,
  min: number,
  max: number,
  direction: number,
  step: number
): { value: number; direction: number } {
  let newValue = current + direction * step
  let newDirection = direction

  if (newValue >= max) {
    newValue = max
    newDirection = -1
  } else if (newValue <= min) {
    newValue = min
    newDirection = 1
  }

  return { value: newValue, direction: newDirection }
}

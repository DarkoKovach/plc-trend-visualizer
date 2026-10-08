/**
 * PLC Data Types
 * Framework-agnostic type definitions for PLC variable data
 */

/**
 * Supported PLC data types
 * - BOOL: Boolean (true/false) - limit switches, alarms, digital I/O
 * - INT: 16-bit signed integer - counters, setpoints, discrete values
 * - REAL: 32-bit floating point - temperatures, pressures, analog measurements
 */
export type PlcDataType = 'BOOL' | 'INT' | 'REAL'

/**
 * PLC Variable definition
 * Represents metadata about a single PLC variable
 */
export interface PlcVariable {
  /** Unique identifier for the variable */
  id: string
  /** Human-readable name (e.g., "Tank_Level", "Motor_Running") */
  name: string
  /** PLC data type */
  dataType: PlcDataType
  /** Engineering unit (e.g., "°C", "bar", "m³/h") */
  unit?: string
  /** Minimum expected value (for scaling) */
  min?: number
  /** Maximum expected value (for scaling) */
  max?: number
  /** Optional description */
  description?: string
}

/**
 * Single data point with timestamp
 */
export interface DataPoint {
  /** Unix timestamp in milliseconds */
  timestamp: number
  /** Variable value (number for INT/REAL, 0/1 for BOOL) */
  value: number
}

/**
 * Data update message from the PLC stream
 * Contains the variable ID and the new data point
 */
export interface PlcDataUpdate {
  /** Variable ID this update belongs to */
  variableId: string
  /** The data point */
  point: DataPoint
}

/**
 * Simulation frequency presets
 */
export type SimulationFrequency = 'low' | 'medium' | 'high'

export const FREQUENCY_HZ: Record<SimulationFrequency, number> = {
  low: 2,
  medium: 10,
  high: 20,
}

/**
 * Chart color assignments for up to 4 selected variables
 */
export const CHART_COLORS = [
  '#06b6d4', // cyan-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
] as const

export type ChartColorIndex = 0 | 1 | 2 | 3

/**
 * Maximum number of simultaneously selected variables
 */
export const MAX_SELECTED_VARIABLES = 4

/**
 * Maximum number of data points to keep in history (ring buffer size)
 * Must be large enough for: highest_frequency × time_window
 * At 20Hz with 20 second window: 20 × 20 = 400 points minimum
 * We add extra buffer for smooth interpolation at edges
 */
export const MAX_HISTORY_POINTS = 450

/**
 * Number of data points to display on trend charts
 * This matches the task requirement of "last 50 data points"
 */
export const TREND_DISPLAY_POINTS = 50

/**
 * Time window for trend charts in seconds
 */
export const TREND_TIME_WINDOW_SECONDS = 20

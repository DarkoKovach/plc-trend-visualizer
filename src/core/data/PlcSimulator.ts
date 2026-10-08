/**
 * PLC Simulator - Mock data generator for PLC variables
 *
 * Generates realistic PLC variable updates at configurable frequencies.
 * This is framework-agnostic and uses callbacks for data delivery.
 */

import type { PlcVariable, PlcDataUpdate, SimulationFrequency, DataPoint } from '../types'
import { FREQUENCY_HZ } from '../types'
import {
  sinPattern,
  noisySignal,
  counterPattern,
  setpointPattern,
  boolTogglePattern,
  pulsePattern,
  rampPattern,
} from './patterns'

/**
 * Predefined PLC variables representing a typical industrial setup
 */
export const MOCK_VARIABLES: PlcVariable[] = [
  // REAL variables (analog measurements)
  {
    id: 'tank1_level',
    name: 'Tank1_Level',
    dataType: 'REAL',
    unit: '%',
    min: 0,
    max: 100,
    description: 'Tank 1 fill level',
  },
  {
    id: 'tank1_temp',
    name: 'Tank1_Temp',
    dataType: 'REAL',
    unit: '°C',
    min: 15,
    max: 85,
    description: 'Tank 1 temperature',
  },
  {
    id: 'pump1_pressure',
    name: 'Pump1_Pressure',
    dataType: 'REAL',
    unit: 'bar',
    min: 0,
    max: 10,
    description: 'Pump 1 discharge pressure',
  },
  {
    id: 'flow_rate',
    name: 'Flow_Rate',
    dataType: 'REAL',
    unit: 'm³/h',
    min: 0,
    max: 50,
    description: 'Process flow rate',
  },
  {
    id: 'motor1_speed',
    name: 'Motor1_Speed',
    dataType: 'REAL',
    unit: 'RPM',
    min: 0,
    max: 1500,
    description: 'Motor 1 speed',
  },
  {
    id: 'ambient_temp',
    name: 'Ambient_Temp',
    dataType: 'REAL',
    unit: '°C',
    min: 18,
    max: 28,
    description: 'Ambient temperature',
  },
  {
    id: 'ph_value',
    name: 'PH_Value',
    dataType: 'REAL',
    unit: 'pH',
    min: 6,
    max: 8,
    description: 'Process pH value',
  },

  // INT variables (counters, setpoints)
  {
    id: 'batch_count',
    name: 'Batch_Count',
    dataType: 'INT',
    unit: '',
    min: 0,
    max: 9999,
    description: 'Production batch counter',
  },
  {
    id: 'temp_setpoint',
    name: 'Temp_Setpoint',
    dataType: 'INT',
    unit: '°C',
    min: 20,
    max: 80,
    description: 'Temperature setpoint',
  },
  {
    id: 'speed_setpoint',
    name: 'Speed_Setpoint',
    dataType: 'INT',
    unit: 'RPM',
    min: 0,
    max: 1500,
    description: 'Motor speed setpoint',
  },
  {
    id: 'cycle_time',
    name: 'Cycle_Time',
    dataType: 'INT',
    unit: 'sec',
    min: 0,
    max: 300,
    description: 'Current cycle time',
  },
  {
    id: 'error_code',
    name: 'Error_Code',
    dataType: 'INT',
    unit: '',
    min: 0,
    max: 100,
    description: 'Current error code',
  },

  // BOOL variables (digital I/O)
  {
    id: 'pump1_running',
    name: 'Pump1_Running',
    dataType: 'BOOL',
    description: 'Pump 1 running status',
  },
  {
    id: 'motor1_running',
    name: 'Motor1_Running',
    dataType: 'BOOL',
    description: 'Motor 1 running status',
  },
  {
    id: 'tank1_high',
    name: 'Tank1_High',
    dataType: 'BOOL',
    description: 'Tank 1 high level switch',
  },
  {
    id: 'tank1_low',
    name: 'Tank1_Low',
    dataType: 'BOOL',
    description: 'Tank 1 low level switch',
  },
  {
    id: 'emergency_stop',
    name: 'Emergency_Stop',
    dataType: 'BOOL',
    description: 'Emergency stop active',
  },
  {
    id: 'system_ready',
    name: 'System_Ready',
    dataType: 'BOOL',
    description: 'System ready for operation',
  },
  {
    id: 'alarm_active',
    name: 'Alarm_Active',
    dataType: 'BOOL',
    description: 'Alarm condition active',
  },
  {
    id: 'door_open',
    name: 'Door_Open',
    dataType: 'BOOL',
    description: 'Cabinet door open',
  },
]

/**
 * Internal state for each variable's simulation
 */
interface VariableState {
  value: number
  direction?: number // For ramp patterns
  startTime: number
}

export type SimulatorCallback = (update: PlcDataUpdate) => void

/**
 * PLC Simulator class
 * Generates mock data for all defined variables at the specified frequency
 */
export class PlcSimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private states: Map<string, VariableState> = new Map()
  private callback: SimulatorCallback | null = null
  private startTime: number = 0
  private _frequency: SimulationFrequency = 'medium'
  private tickCount: number = 0

  /** Current simulation frequency */
  get frequency(): SimulationFrequency {
    return this._frequency
  }

  constructor() {
    this.initializeStates()
  }

  /**
   * Initialize starting values for all variables
   */
  private initializeStates(): void {
    const now = Date.now()
    this.startTime = now

    for (const variable of MOCK_VARIABLES) {
      const state: VariableState = {
        value: this.getInitialValue(variable),
        startTime: now,
      }

      // Add direction for ramp patterns
      if (variable.id === 'tank1_level') {
        state.direction = 1
      }

      this.states.set(variable.id, state)
    }
  }

  /**
   * Get appropriate initial value for a variable
   */
  private getInitialValue(variable: PlcVariable): number {
    switch (variable.dataType) {
      case 'BOOL':
        // Start with random state
        return Math.random() > 0.5 ? 1 : 0
      case 'INT':
        // Start at middle of range
        return Math.floor(((variable.min ?? 0) + (variable.max ?? 100)) / 2)
      case 'REAL':
        // Start at middle of range
        return ((variable.min ?? 0) + (variable.max ?? 100)) / 2
    }
  }

  /**
   * Generate next value for a variable based on its pattern
   */
  private generateNextValue(variable: PlcVariable, state: VariableState): number {
    const elapsed = (Date.now() - this.startTime) / 1000 // seconds

    switch (variable.id) {
      // REAL variables with different patterns
      case 'tank1_level': {
        const result = rampPattern(state.value, 20, 80, state.direction ?? 1, 0.5)
        state.direction = result.direction
        return result.value + (Math.random() - 0.5) * 2
      }
      case 'tank1_temp':
        return sinPattern(elapsed, 15, 0.02, 50, 0.08)
      case 'pump1_pressure':
        return noisySignal(4.5, 0.3, 0.1, elapsed)
      case 'flow_rate':
        return sinPattern(elapsed, 10, 0.03, 25, 0.1)
      case 'motor1_speed':
        return noisySignal(1200, 50, 0.05, elapsed)
      case 'ambient_temp':
        return sinPattern(elapsed, 2, 0.005, 22, 0.02)
      case 'ph_value':
        return noisySignal(7.0, 0.1, 0.02, elapsed)

      // INT variables
      case 'batch_count':
        return counterPattern(state.value, 9999, 0.1)
      case 'temp_setpoint':
        return setpointPattern(state.value, 40, 70, 0.01)
      case 'speed_setpoint':
        return setpointPattern(state.value, 800, 1400, 0.01)
      case 'cycle_time': {
        // Cycle from 0 to max and reset
        const newValue = state.value + 1
        return newValue > (variable.max ?? 300) ? 0 : newValue
      }
      case 'error_code':
        return setpointPattern(state.value, 0, 5, 0.005)

      // BOOL variables
      case 'pump1_running':
      case 'motor1_running':
      case 'system_ready':
        return boolTogglePattern(state.value, 0.02)
      case 'tank1_high':
      case 'tank1_low':
        return boolTogglePattern(state.value, 0.03)
      case 'emergency_stop':
        return pulsePattern(state.value, 0.005, 0.5)
      case 'alarm_active':
        return pulsePattern(state.value, 0.01, 0.2)
      case 'door_open':
        return boolTogglePattern(state.value, 0.01)

      default:
        return state.value
    }
  }

  /**
   * Run one simulation tick - generate updates for all variables
   */
  private tick(): void {
    this.tickCount++
    const timestamp = Date.now()

    for (const variable of MOCK_VARIABLES) {
      const state = this.states.get(variable.id)
      if (!state) continue

      // Generate new value
      let newValue = this.generateNextValue(variable, state)

      // Clamp to valid range
      if (variable.min !== undefined && variable.max !== undefined) {
        newValue = Math.max(variable.min, Math.min(variable.max, newValue))
      }

      // Round integers
      if (variable.dataType === 'INT') {
        newValue = Math.round(newValue)
      }

      // Update state
      state.value = newValue

      // Create data point
      const point: DataPoint = {
        timestamp,
        value: variable.dataType === 'REAL' ? Number(newValue.toFixed(2)) : newValue,
      }

      // Emit update
      if (this.callback) {
        this.callback({
          variableId: variable.id,
          point,
        })
      }
    }
  }

  /**
   * Start the simulation
   * @param callback Function to call with each data update
   * @param frequency Simulation frequency preset
   */
  start(callback: SimulatorCallback, frequency: SimulationFrequency = 'medium'): void {
    this.stop() // Stop any existing simulation
    this.callback = callback
    this._frequency = frequency
    this.tickCount = 0

    const hz = FREQUENCY_HZ[frequency]
    const intervalMs = Math.round(1000 / hz)

    this.intervalId = setInterval(() => this.tick(), intervalMs)

    // Run first tick immediately
    this.tick()
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.callback = null
  }

  /**
   * Change simulation frequency without stopping
   */
  setFrequency(frequency: SimulationFrequency): void {
    if (this.callback) {
      const callback = this.callback
      this.stop()
      this.start(callback, frequency)
    } else {
      this._frequency = frequency
    }
  }

  /**
   * Get current frequency
   */
  getFrequency(): SimulationFrequency {
    return this._frequency
  }

  /**
   * Get all variable definitions
   */
  getVariables(): PlcVariable[] {
    return [...MOCK_VARIABLES]
  }

  /**
   * Get current value for a specific variable
   */
  getCurrentValue(variableId: string): number | undefined {
    return this.states.get(variableId)?.value
  }

  /**
   * Get number of ticks since start
   */
  getTickCount(): number {
    return this.tickCount
  }

  /**
   * Check if simulator is running
   */
  isRunning(): boolean {
    return this.intervalId !== null
  }

  /**
   * Reset all states to initial values
   */
  reset(): void {
    this.initializeStates()
    this.tickCount = 0
  }
}

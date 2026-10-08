/**
 * DataPipeline - RxJS-based data stream processing
 *
 * Handles the flow of data from the PLC simulator to the UI,
 * providing rate limiting, multicasting, and filtering.
 */

import { Subject, type Observable } from 'rxjs'
import { filter, map, sampleTime, share, takeUntil } from 'rxjs/operators'
import type { PlcDataUpdate, DataPoint } from '../types'

/**
 * Target frame time for 60fps rendering
 */
const FRAME_TIME_MS = 16

/**
 * DataPipeline class
 * Wraps RxJS streams to provide a clean API for data flow
 */
export class DataPipeline {
  private rawData$ = new Subject<PlcDataUpdate>()
  private destroy$ = new Subject<void>()

  /**
   * Shared stream of all data updates
   * Using share() to multicast to multiple subscribers
   */
  readonly dataStream$: Observable<PlcDataUpdate>

  constructor() {
    // Create shared stream that will be used by all subscribers
    this.dataStream$ = this.rawData$.pipe(
      share(), // Multicast to multiple subscribers
      takeUntil(this.destroy$) // Auto-cleanup on destroy
    )
  }

  /**
   * Push a new data update into the pipeline
   * Called by the simulator for each variable update
   */
  push(update: PlcDataUpdate): void {
    this.rawData$.next(update)
  }

  /**
   * Get a filtered stream for a specific variable, sampled to 60fps
   * @param variableId The variable ID to filter for
   * @returns Observable of DataPoints for this variable
   */
  getVariableStream(variableId: string): Observable<DataPoint> {
    return this.dataStream$.pipe(
      filter((update) => update.variableId === variableId),
      map((update) => update.point),
      sampleTime(FRAME_TIME_MS), // Throttle to ~60fps
      takeUntil(this.destroy$)
    )
  }

  /**
   * Get a stream of updates for multiple variables, sampled to 60fps
   * @param variableIds Array of variable IDs to include
   * @returns Observable of PlcDataUpdates for the specified variables
   */
  getMultiVariableStream(variableIds: string[]): Observable<PlcDataUpdate> {
    const idSet = new Set(variableIds)
    return this.dataStream$.pipe(
      filter((update) => idSet.has(update.variableId)),
      sampleTime(FRAME_TIME_MS), // Throttle to ~60fps
      takeUntil(this.destroy$)
    )
  }

  /**
   * Get a stream for the latest values of all variables (for variable list display)
   * This is sampled less frequently since it's for UI display, not chart updates
   */
  getLatestValuesStream(): Observable<PlcDataUpdate> {
    return this.dataStream$.pipe(
      sampleTime(100), // Update UI at 10fps for latest values
      takeUntil(this.destroy$)
    )
  }

  /**
   * Destroy the pipeline and complete all streams
   */
  destroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.rawData$.complete()
  }
}

/**
 * Singleton pipeline instance for the application
 */
let pipelineInstance: DataPipeline | null = null

/**
 * Get or create the singleton DataPipeline instance
 */
export function getDataPipeline(): DataPipeline {
  if (!pipelineInstance) {
    pipelineInstance = new DataPipeline()
  }
  return pipelineInstance
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetDataPipeline(): void {
  if (pipelineInstance) {
    pipelineInstance.destroy()
    pipelineInstance = null
  }
}

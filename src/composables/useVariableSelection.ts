/**
 * useVariableSelection - Manages selected variables for trend monitoring
 *
 * Handles the selection of up to 4 variables for simultaneous chart display.
 * Provides toast notification when max selection is reached.
 */

import { ref, computed, readonly } from 'vue'
import { MAX_SELECTED_VARIABLES, CHART_COLORS } from '@/core/types'

// Toast state for max selection warning
const toastMessage = ref<string | null>(null)
const toastType = ref<'info' | 'warning' | 'error'>('warning')

// Selected variable IDs in order of selection
const selectedIds = ref<string[]>([])

/**
 * Composable for variable selection management
 */
export function useVariableSelection() {
  /**
   * Check if a variable is selected
   */
  const isSelected = (variableId: string): boolean => {
    return selectedIds.value.includes(variableId)
  }

  /**
   * Get the color index for a selected variable (0-3)
   * Returns -1 if not selected
   */
  const getColorIndex = (variableId: string): number => {
    return selectedIds.value.indexOf(variableId)
  }

  /**
   * Get the color for a selected variable
   * Returns undefined if not selected
   */
  const getColor = (variableId: string): string | undefined => {
    const index = getColorIndex(variableId)
    return index >= 0 ? CHART_COLORS[index] : undefined
  }

  /**
   * Toggle selection of a variable
   * @param variableId The variable to toggle
   * @returns true if now selected, false if deselected, null if rejected
   */
  const toggleSelection = (variableId: string): boolean | null => {
    const currentIndex = selectedIds.value.indexOf(variableId)

    if (currentIndex >= 0) {
      // Already selected - deselect
      selectedIds.value = selectedIds.value.filter((id) => id !== variableId)
      return false
    } else {
      // Not selected - try to select
      if (selectedIds.value.length >= MAX_SELECTED_VARIABLES) {
        // Show toast warning
        showToast(`Maximum ${MAX_SELECTED_VARIABLES} variables can be selected`, 'warning')
        return null
      }
      selectedIds.value = [...selectedIds.value, variableId]
      return true
    }
  }

  /**
   * Select a variable (if not at max)
   */
  const select = (variableId: string): boolean => {
    if (isSelected(variableId)) return true

    if (selectedIds.value.length >= MAX_SELECTED_VARIABLES) {
      showToast(`Maximum ${MAX_SELECTED_VARIABLES} variables can be selected`, 'warning')
      return false
    }

    selectedIds.value = [...selectedIds.value, variableId]
    return true
  }

  /**
   * Deselect a variable
   */
  const deselect = (variableId: string): void => {
    selectedIds.value = selectedIds.value.filter((id) => id !== variableId)
  }

  /**
   * Clear all selections
   */
  const clearAll = (): void => {
    selectedIds.value = []
  }

  /**
   * Get selected variable IDs with their assigned colors
   */
  const selectedWithColors = computed(() => {
    return selectedIds.value.map((id, index) => ({
      id,
      color: CHART_COLORS[index],
      colorIndex: index,
    }))
  })

  /**
   * Number of currently selected variables
   */
  const selectionCount = computed(() => selectedIds.value.length)

  /**
   * Whether max selection has been reached
   */
  const isMaxSelected = computed(() => selectedIds.value.length >= MAX_SELECTED_VARIABLES)

  return {
    // State (readonly)
    selectedIds: readonly(selectedIds),
    selectionCount,
    isMaxSelected,
    selectedWithColors,

    // Methods
    isSelected,
    getColorIndex,
    getColor,
    toggleSelection,
    select,
    deselect,
    clearAll,
  }
}

/**
 * Show a toast notification
 */
function showToast(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
  toastMessage.value = message
  toastType.value = type

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

/**
 * Composable for toast state (used by Toast component)
 */
export function useToast() {
  const dismissToast = () => {
    toastMessage.value = null
  }

  return {
    message: readonly(toastMessage),
    type: readonly(toastType),
    dismiss: dismissToast,
  }
}

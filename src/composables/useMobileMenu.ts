/**
 * useMobileMenu - Manages mobile sidebar/menu state
 *
 * Provides global state for mobile menu toggle with automatic
 * close on resize to desktop viewport.
 */

import { ref, onMounted, onUnmounted } from 'vue'

// Global state for mobile menu
const isOpen = ref(false)

// Breakpoint for mobile (matches Tailwind's md: 768px)
const MOBILE_BREAKPOINT = 768

/**
 * Toggle mobile menu visibility
 */
function toggle(): void {
  isOpen.value = !isOpen.value
}

/**
 * Open mobile menu
 */
function open(): void {
  isOpen.value = true
}

/**
 * Close mobile menu
 */
function close(): void {
  isOpen.value = false
}

/**
 * Composable for mobile menu state management
 */
export function useMobileMenu() {
  // Close menu when resizing to desktop
  function handleResize(): void {
    if (window.innerWidth >= MOBILE_BREAKPOINT && isOpen.value) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    /** Whether mobile menu is open */
    isOpen,
    /** Toggle menu open/close */
    toggle,
    /** Open menu */
    open,
    /** Close menu */
    close,
  }
}

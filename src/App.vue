<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Header, Sidebar } from '@/components/layout'
import { VariableList, ChartPanel, LoadOverlay } from '@/components/charts'
import { DevToolsOverlay } from '@/components/devtools'
import { Toast } from '@/components/ui'
import { usePlcStream, useToast, useAnalytics, useMobileMenu } from '@/composables'
import { MOCK_VARIABLES } from '@/core/data'

const { startSimulation, stopSimulation } = usePlcStream()
const { message: toastMessage, type: toastType, dismiss: dismissToast } = useToast()
const { trackSimulationStarted, trackSimulationStopped } = useAnalytics()
const { isOpen: isSidebarOpen, close: closeSidebar } = useMobileMenu()

// Start simulation on mount
onMounted(() => {
  startSimulation('medium')
  trackSimulationStarted('medium')
})

// Stop simulation on unmount
onUnmounted(() => {
  stopSimulation()
  trackSimulationStopped()
})
</script>

<template>
  <div class="bg-bg-primary flex h-screen flex-col overflow-hidden">
    <!-- Header -->
    <Header />

    <!-- Main content area -->
    <div class="relative flex min-h-0 flex-1">
      <!-- Mobile overlay backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isSidebarOpen"
          class="fixed inset-0 z-30 bg-black/50 md:hidden"
          @click="closeSidebar"
        />
      </Transition>

      <!-- Sidebar with variable list -->
      <!-- Mobile: slide-in panel, Desktop: always visible -->
      <Sidebar
        :class="`fixed inset-y-0 top-[57px] left-0 z-40 w-72 shrink-0 transition-transform duration-200 ease-out md:relative md:top-0 md:z-0 md:translate-x-0 lg:w-80 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`"
      >
        <VariableList :variables="MOCK_VARIABLES" />
      </Sidebar>

      <!-- Main chart area -->
      <main class="flex min-w-0 flex-1 flex-col p-3 sm:p-4 lg:p-6">
        <!-- Load overlay / controls -->
        <LoadOverlay class="mb-3 shrink-0 sm:mb-4" />

        <!-- Chart panel -->
        <div class="relative min-h-0 flex-1">
          <ChartPanel class="h-full" />
        </div>
      </main>
    </div>

    <!-- Toast notifications -->
    <Toast v-if="toastMessage" :message="toastMessage" :type="toastType" @close="dismissToast" />

    <!-- DevTools (dev only) -->
    <DevToolsOverlay />
  </div>
</template>

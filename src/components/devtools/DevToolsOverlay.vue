<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDevTools } from '@/composables'
import { Button } from '@/components/ui'
import { X, Bug, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-vue-next'

const { isEnabled, isOpen, fps, fpsStatus, activityLog, toggleDevTools, downloadLog, clearLog } =
  useDevTools()

const isLogExpanded = ref(false)

const fpsStatusColor = computed(() => {
  switch (fpsStatus.value) {
    case 'good':
      return 'text-emerald-400'
    case 'warning':
      return 'text-amber-400'
    case 'critical':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
})

const fpsStatusBg = computed(() => {
  switch (fpsStatus.value) {
    case 'good':
      return 'bg-emerald-500/20'
    case 'warning':
      return 'bg-amber-500/20'
    case 'critical':
      return 'bg-red-500/20'
    default:
      return 'bg-slate-500/20'
  }
})

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<template>
  <!-- Only render in development -->
  <template v-if="isEnabled">
    <!-- Toggle button (always visible) -->
    <button
      v-show="!isOpen"
      type="button"
      class="fixed right-4 bottom-4 z-50 rounded-lg border border-slate-700 bg-slate-800/90 p-2 text-slate-400 shadow-lg backdrop-blur-sm transition-all hover:border-slate-600 hover:text-slate-200"
      aria-label="Open DevTools"
      @click="toggleDevTools"
    >
      <Bug class="h-5 w-5" />
    </button>

    <!-- DevTools panel -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-show="isOpen"
        class="fixed right-4 bottom-4 z-50 w-80 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur-sm"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-4 py-2"
        >
          <div class="flex items-center gap-2">
            <Bug class="h-4 w-4 text-cyan-400" />
            <span class="text-sm font-semibold text-slate-200">DevTools</span>
            <span
              class="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400"
            >
              DEV
            </span>
          </div>

          <button
            type="button"
            class="rounded p-1 text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
            aria-label="Close DevTools"
            @click="toggleDevTools"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-4 p-4">
          <!-- FPS Metric -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-400">FPS</span>
            <div class="flex items-center gap-2 rounded-md px-2 py-1" :class="fpsStatusBg">
              <span class="font-mono text-lg font-bold" :class="fpsStatusColor">
                {{ fps }}
              </span>
              <span class="text-xs" :class="fpsStatusColor">
                {{ fpsStatus === 'good' ? '✓' : fpsStatus === 'warning' ? '⚠' : '✗' }}
              </span>
            </div>
          </div>

          <!-- Activity Log Section -->
          <div class="border-t border-slate-700 pt-3">
            <button
              type="button"
              class="flex w-full items-center justify-between text-left"
              @click="isLogExpanded = !isLogExpanded"
            >
              <span class="text-xs font-medium text-slate-400">
                Activity Log ({{ activityLog.length }})
              </span>
              <component
                :is="isLogExpanded ? ChevronUp : ChevronDown"
                class="h-4 w-4 text-slate-500"
              />
            </button>

            <!-- Log entries -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-40 opacity-100"
              leave-active-class="transition-all duration-150"
              leave-from-class="max-h-40 opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div v-show="isLogExpanded" class="mt-2 max-h-40 space-y-1 overflow-y-auto">
                <div
                  v-for="(event, index) in activityLog.slice().reverse()"
                  :key="index"
                  class="flex items-start gap-2 rounded bg-slate-800/50 px-2 py-1 text-xs"
                >
                  <span class="shrink-0 font-mono text-slate-500">
                    {{ formatTimestamp(event.timestamp) }}
                  </span>
                  <span class="break-all text-slate-300">
                    {{ event.event }}
                  </span>
                </div>

                <div
                  v-if="activityLog.length === 0"
                  class="py-2 text-center text-xs text-slate-500"
                >
                  No activity yet
                </div>
              </div>
            </Transition>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 border-t border-slate-700 pt-2">
            <Button variant="ghost" size="sm" class="flex-1" @click="downloadLog">
              <Download class="h-3.5 w-3.5" />
              Export
            </Button>
            <Button variant="ghost" size="sm" class="flex-1" @click="clearLog">
              <Trash2 class="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>

          <!-- Info footer -->
          <p class="text-center text-[10px] text-slate-600">
            This panel is only visible in development mode
          </p>
        </div>
      </div>
    </Transition>
  </template>
</template>

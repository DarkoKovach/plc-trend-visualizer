<script setup lang="ts">
import { ref } from 'vue'
import Toast from './Toast.vue'

const showInfo = ref(false)
const showSuccess = ref(false)
const showWarning = ref(false)
const showError = ref(false)

function toggleToast(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'info':
      showInfo.value = true
      break
    case 'success':
      showSuccess.value = true
      break
    case 'warning':
      showWarning.value = true
      break
    case 'error':
      showError.value = true
      break
  }
}
</script>

<template>
  <Story title="UI/Toast" :layout="{ type: 'single', iframe: true }">
    <Variant title="Interactive">
      <div class="flex flex-col gap-4 p-4">
        <p class="text-sm text-slate-400">Click a button to show a toast notification:</p>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-700"
            @click="toggleToast('info')"
          >
            Show Info
          </button>
          <button
            class="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
            @click="toggleToast('success')"
          >
            Show Success
          </button>
          <button
            class="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700"
            @click="toggleToast('warning')"
          >
            Show Warning
          </button>
          <button
            class="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
            @click="toggleToast('error')"
          >
            Show Error
          </button>
        </div>

        <Toast
          v-if="showInfo"
          message="This is an info notification"
          type="info"
          @close="showInfo = false"
        />
        <Toast
          v-if="showSuccess"
          message="Operation completed successfully!"
          type="success"
          @close="showSuccess = false"
        />
        <Toast
          v-if="showWarning"
          message="Maximum 4 variables can be selected"
          type="warning"
          @close="showWarning = false"
        />
        <Toast
          v-if="showError"
          message="An error occurred. Please try again."
          type="error"
          @close="showError = false"
        />
      </div>
    </Variant>

    <Variant title="Info">
      <div class="relative h-32">
        <Toast message="This is an info notification" type="info" :duration="0" />
      </div>
    </Variant>

    <Variant title="Success">
      <div class="relative h-32">
        <Toast message="Operation completed successfully!" type="success" :duration="0" />
      </div>
    </Variant>

    <Variant title="Warning">
      <div class="relative h-32">
        <Toast message="Maximum 4 variables can be selected" type="warning" :duration="0" />
      </div>
    </Variant>

    <Variant title="Error">
      <div class="relative h-32">
        <Toast message="An error occurred. Please try again." type="error" :duration="0" />
      </div>
    </Variant>
  </Story>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Toggle from './Toggle.vue'

const value1 = ref(false)
const value2 = ref(true)
const valueSm = ref(false)
const valueMd = ref(true)
const valueLg = ref(false)
</script>

<template>
  <Story title="UI/Toggle" :layout="{ type: 'grid', width: 200 }">
    <Variant title="Off">
      <Toggle v-model="value1" />
      <p class="text-text-secondary mt-2 text-sm">Value: {{ value1 }}</p>
    </Variant>

    <Variant title="On">
      <Toggle v-model="value2" />
      <p class="text-text-secondary mt-2 text-sm">Value: {{ value2 }}</p>
    </Variant>

    <Variant title="Disabled">
      <div class="flex flex-col gap-2">
        <Toggle :model-value="false" :disabled="true" />
        <Toggle :model-value="true" :disabled="true" />
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Toggle v-model="valueSm" size="sm" />
          <span class="text-text-secondary text-sm">Small</span>
        </div>
        <div class="flex items-center gap-2">
          <Toggle v-model="valueMd" size="md" />
          <span class="text-text-secondary text-sm">Medium</span>
        </div>
        <div class="flex items-center gap-2">
          <Toggle v-model="valueLg" size="lg" />
          <span class="text-text-secondary text-sm">Large</span>
        </div>
      </div>
    </Variant>
  </Story>
</template>

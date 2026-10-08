<script setup lang="ts">
import Button from './Button.vue'
</script>

<template>
  <Story title="UI/Button" :layout="{ type: 'grid', width: 200 }">
    <Variant title="Primary">
      <Button variant="primary">Primary</Button>
    </Variant>

    <Variant title="Secondary">
      <Button variant="secondary">Secondary</Button>
    </Variant>

    <Variant title="Ghost">
      <Button variant="ghost">Ghost</Button>
    </Variant>

    <Variant title="Danger">
      <Button variant="danger">Danger</Button>
    </Variant>

    <Variant title="Outline">
      <Button variant="outline">Outline</Button>
    </Variant>

    <Variant title="Sizes">
      <div class="flex flex-col gap-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </Variant>

    <Variant title="Loading">
      <Button :loading="true">Loading</Button>
    </Variant>

    <Variant title="Disabled">
      <Button :disabled="true">Disabled</Button>
    </Variant>
  </Story>
</template>

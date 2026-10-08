<script setup lang="ts">
import Badge from './Badge.vue'
</script>

<template>
  <Story title="UI/Badge" :layout="{ type: 'grid', width: 150 }">
    <Variant title="Default">
      <Badge>Default</Badge>
    </Variant>

    <Variant title="Success">
      <Badge variant="success">Success</Badge>
    </Variant>

    <Variant title="Warning">
      <Badge variant="warning">Warning</Badge>
    </Variant>

    <Variant title="Error">
      <Badge variant="error">Error</Badge>
    </Variant>

    <Variant title="Info">
      <Badge variant="info">Info</Badge>
    </Variant>

    <Variant title="PLC Data Types">
      <div class="flex flex-col gap-2">
        <Badge variant="bool">BOOL</Badge>
        <Badge variant="int">INT</Badge>
        <Badge variant="real">REAL</Badge>
      </div>
    </Variant>

    <Variant title="Sizes">
      <div class="flex flex-col gap-2">
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
        <Badge size="lg">Large</Badge>
      </div>
    </Variant>
  </Story>
</template>

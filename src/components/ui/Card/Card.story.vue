<script setup lang="ts">
import Card from './Card.vue'
</script>

<template>
  <Story title="UI/Card" :layout="{ type: 'grid', width: 300 }">
    <Variant title="Default">
      <Card>
        <p class="text-text-primary">Default card content</p>
      </Card>
    </Variant>

    <Variant title="Elevated">
      <Card variant="elevated">
        <p class="text-text-primary">Elevated card with shadow</p>
      </Card>
    </Variant>

    <Variant title="Interactive">
      <Card variant="interactive">
        <p class="text-text-primary">Hover me!</p>
      </Card>
    </Variant>

    <Variant title="Selected">
      <Card variant="selected">
        <p class="text-text-primary">Selected state</p>
      </Card>
    </Variant>

    <Variant title="Padding Sizes">
      <div class="flex flex-col gap-4">
        <Card padding="sm">
          <p class="text-text-primary text-sm">Small padding</p>
        </Card>
        <Card padding="md">
          <p class="text-text-primary text-sm">Medium padding</p>
        </Card>
        <Card padding="lg">
          <p class="text-text-primary text-sm">Large padding</p>
        </Card>
      </div>
    </Variant>
  </Story>
</template>

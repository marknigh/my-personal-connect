<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card
      class="my-card text-white"
    >
      <q-card-section>
        <div class="text-h6">{{ props.name }}</div>
        <div class="text-h2 text-center">{{ props.value }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
const props = defineProps(['name', 'value', 'color'])

</script>

<style lang="sass" scoped>
.my-card
  background-color: $secondary
</style>

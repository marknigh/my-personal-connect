<template>
  <q-input style="max-width: 150px"
    v-model="color.color"
    :label="props.status.Name"
    stack-label
  >
    <template #prepend>
      <q-badge rounded :style="{ 'background-color': color.color}"/>
    </template>
    <template v-slot:append>
      <q-icon size="xs" name="colorize" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-color
            no-header
            no-footer
            default-view="palette"
            v-model="color.color"
            @update:model-value="changeInColor"
        />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps(['status', 'statusHexColor'])
const emit = defineEmits(['changeInColor'])
const color = ref(props.statusHexColor)

function changeInColor () {
  emit('changeInColor', props.status, color.value)
}
</script>

<style lang="scss" scoped>

</style>

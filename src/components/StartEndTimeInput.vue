<template>
  <div class="row items-center">
    <div class="col-1">
      <slot name="openslot" />
    </div>
    <div class="col-3">
      <div class="q-pa-sm">
        <q-input dense filled v-model="startInput">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
                <slot name="startTime"></slot>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <div class="col-3">
      <div class="q-pa-sm">
        <q-input dense filled v-model="endInput">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <slot name="endTime"></slot>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-if="props.entry.entryIndex !== 0" v-slot:after>
            <q-icon name="remove" @click="RemoveEntry"/>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
// const startTime = ref('08:00')
// const endTime = ref('17:00')
// const open = ref(true)
const props = defineProps(['entry'])
const emit = defineEmits(['removeEntry'])

const startInput = computed(() => {
  const justHour = props.entry?.startTime.slice(0, 2)
  const suffix = justHour >= 12 ? ' pm' : ' am'
  const h = (justHour % 12) || 12
  return (h + ':' + props.entry?.startTime.slice(3) + suffix)
})

const endInput = computed(() => {
  const justHour = props.entry?.endTime.slice(0, 2)
  const suffix = justHour >= 12 ? ' pm' : ' am'
  const h = (justHour % 12) || 12
  return (h + ':' + props.entry?.endTime.slice(3) + suffix)
})

function RemoveEntry () {
  console.log('entryIndex: ', props.entry.entryIndex)
  emit('removeEntry', props.entry.entryIndex)
}
</script>

<style lang="scss" scoped>

</style>

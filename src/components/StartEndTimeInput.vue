<template>
  <div class="row items-center">
    <div class="col-1">
      <q-checkbox v-model="open" checked-icon="meeting_room" unchecked-icon="door_front" @update:model-value="entryChange"/>
    </div>
    <div class="col-3">
      <div class="q-pa-md">
        <q-input dense filled v-model="startInput">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="startTime" @update:model-value="entryChange">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <div class="col-3">
      <div class="q-pa-md">
        <q-input dense filled v-model="endInput">
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-time v-model="endTime" @update:model-value="entryChange">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
          <template v-if="props.entryIndex !== 0" v-slot:after>
            <q-icon name="remove" @click="RemoveEntry"/>
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const startTime = ref('08:00')
const endTime = ref('17:00')
const open = ref(true)
const props = defineProps(['entry', 'entryIndex'])
const emit = defineEmits(['entryChange', 'removeEntry'])

const startInput = computed(() => {
  const justHour = startTime.value.slice(0, 2)
  const suffix = justHour >= 12 ? ' pm' : ' am'
  const h = (justHour % 12) || 12
  return (h + ':' + startTime.value.slice(3) + suffix)
})

const endInput = computed(() => {
  const justHour = endTime.value.slice(0, 2)
  const suffix = justHour >= 12 ? ' pm' : ' am'
  const h = (justHour % 12) || 12
  return (h + ':' + endTime.value.slice(3) + suffix)
})

function entryChange () {
  const entryObject = {
    open: open.value,
    startTime: startTime.value,
    endTime: endTime.value,
    dowIndex: props.dowIndex,
    entryIndex: props.entryIndex
  }

  emit('entryChange', entryObject)
}

function RemoveEntry () {
  emit('removeEntry', props.entryIndex)
}
</script>

<style lang="scss" scoped>

</style>

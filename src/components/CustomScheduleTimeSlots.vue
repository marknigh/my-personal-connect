<template>
    <div class="row">
      <div class="col-2">
        <div class="text-h6">{{ props.dow.dowName }}
            <q-icon size="xs" name="add" color="primary" @click="AddEntry">
            </q-icon>
          </div>
        </div>
      </div>

      <template v-for="(entry, index) in props.dow.entries" :key="index">
        <start-end-time-input
          :entry="entry"
          :entryIndex="index"
          @remove-entry="RemoveEntry"
          @entry-change="EntryChange"
          @add-entry="AddEntry"
        />
      </template>

</template>

<script setup>
import StartEndTimeInput from './StartEndTimeInput.vue'
const props = defineProps(['dow'])
const emit = defineEmits(['entryChange', 'removeEntry', 'addEntry'])

function AddEntry () {
  // entriesPerDay.value.push({})
  emit('addEntry', {
    dowIndex: props.dow.dow
  })
}

function RemoveEntry (entryIndex) {
  // add dow index to emit chain
  const entryObject = {
    entryIndex,
    dowIndex: props.dow.dow

  }
  emit('removeEntry', entryObject)
}

function EntryChange (entryObject) {
  entryObject.dowIndex = props.dow.dow
  emit('entryChange', entryObject)
}
</script>

<style lang="scss" scoped>

</style>

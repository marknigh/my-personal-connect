<template>
  <div class="row q-gutter-xl">
    <div class="col-2">
      <q-input ref="holidayNameRef" stack-label v-model="holidayName" type="text" label="Holiday Name" lazy-rules="ondemand"
        :rules="[val => !!val || 'Name is Required']"
        @blur="$emit('nameChange', holidayName, day.id)"
      />
    </div>
    <div class="col-3">
      <q-input ref="holidayDateRef" readonly stack-label v-model="displayDate" label="Date" :rules="[val => !!val || 'Name is Required']">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="qDateDay" @update:model-value="$emit('dateChange', qDateDay, day.id)">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template #after>
          <q-icon color="primary" name="add" @click="$emit('addEntry')"/>
          <q-icon v-if="index != 0" color="primary" name="remove" @click="$emit('removeEntry', index)" />
        </template>
      </q-input>    </div>
  </div>
</template>

<script setup>
import { date } from 'quasar'
import { ref, computed } from 'vue'

const props = defineProps(['day', 'index'])
defineEmits(['addEntry', 'removeEntry', 'dateChange', 'nameChange'])

const qDateDay = ref(props.day.date)
// const displayDate = ref()
const holidayNameRef = ref()
const holidayDateRef = ref()
const holidayName = ref(props.day.name)

defineExpose({ holidayNameRef, holidayDateRef })

const displayDate = computed(() => {
  return date.formatDate(qDateDay.value, 'MMMM Do, YYYY')
})

</script>

<style lang="scss" scoped>

</style>

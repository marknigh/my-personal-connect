<template>
  <div class="col-2 q-mr-lg">
    <q-select
      dense
      v-model="model"
      :options="options"
      option-label="Name"
      :label="props.hierarchyStructure[1].Name"
      @filter="filterFn"
      @update:model-value="emitValue"
    >
      <template #no-option>
        <q-item>
          <q-item-section class="text-grey">
            No results
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup>
// import { Auth } from 'aws-amplify'
import { ref, watch } from 'vue'

const emit = defineEmits(['valueChange'])
const props = defineProps(['hierarchyStructure', 'UserHierarchyGroups', 'index', 'levelIds'])
// const creds = ref()
const options = ref()
const model = ref()

watch(props.levelIds, () => {
  if (!(props.index in props.levelIds)) {
    model.value = null
  }
})

function filterFn (val, update, abort) {
  update(() => {
    switch (props.hierarchyStructure[0]) {
      case 'LevelOne':
        options.value = props.UserHierarchyGroups.filter((element) => element.LevelId === '1')
        break
      case 'LevelTwo':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '2' && element.HierarchyPath.LevelOne.Id === props.levelIds[0].id
        )
        break
      case 'LevelThree':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '3' && element.HierarchyPath.LevelTwo.Id === props.levelIds[1].id
        )
        break
      case 'LevelFour':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '4' && element.HierarchyPath.LevelThree.Id === props.levelIds[2].id
        )
        break
      case 'LevelFive':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '4' && element.HierarchyPath.LevelFour.Id === props.levelIds[3].id
        )
        break
      default:
        console.log('No Level Configured Now')
    }
  })
}

// onMounted(async () => {
//   try {
//     Auth.currentCredentials().then(async (credentials) => {
//       creds.value = credentials
//     })
//   } catch (error) {
//     console.log('Error retrieving credentials: ', error)
//   }
// })

function emitValue (value) {
  const levels = {}
  levels[props.index] = { Id: value.Id, Name: value.Name }
  emit('valueChange', levels)
}

</script>

<style lang="scss" scoped>

</style>

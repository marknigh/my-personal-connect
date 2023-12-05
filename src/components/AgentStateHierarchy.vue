<template>
  <div class="col-2 q-mr-lg">

    <q-select
    dense
    v-model="model"
    :options="options"
    option-label="Name"
    :label="props.hierarchyStructure[index].Name"
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
import { Auth } from 'aws-amplify'
// import { ConnectClient, ListUserHierarchyGroupsCommand, DescribeUserHierarchyGroupCommand } from '@aws-sdk/client-connect'
// import { useInstanceStore } from '../stores/instance'
import { onMounted, ref, watch } from 'vue'
const emit = defineEmits(['valueChange'])
const props = defineProps(['hierarchyStructure', 'UserHierarchyGroups', 'index', 'levelIds'])
// const instanceStore = useInstanceStore()
const creds = ref()
const options = ref()
const model = ref()

watch(props.levelIds, () => {
  if (!(props.index in props.levelIds)) {
    model.value = null
  }
})

function filterFn (val, update, abort) {
  update(() => {
    switch (props.index) {
      case 'LevelOne':
        options.value = props.UserHierarchyGroups.filter((element) => element.LevelId === '1')
        break
      case 'LevelTwo':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '2' && element.HierarchyPath.LevelOne.Id === props.levelIds.LevelOne.id
        )
        break
      case 'LevelThree':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '3' && element.HierarchyPath.LevelTwo.Id === props.levelIds.LevelTwo.id
        )
        break
      case 'LevelFour':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '4' && element.HierarchyPath.LevelThree.Id === props.levelIds.LevelThree.id
        )
        break
      case 'LevelFive':
        options.value = props.UserHierarchyGroups.filter((element) =>
          element.LevelId === '4' && element.HierarchyPath.LevelFour.Id === props.levelIds.LevelFour.id
        )
        break
      default:
        console.log('No Level Configured Now')
    }
  })
}

onMounted(async () => {
  try {
    Auth.currentCredentials().then(async (credentials) => {
      creds.value = credentials
    })
  } catch (error) {
    console.log('Error retrieving credentials: ', error)
  }
})

function emitValue (value) {
  const levels = {}
  levels[props.index] = { Id: value.Id, Name: value.Name }
  emit('valueChange', levels)
}

</script>

<style lang="scss" scoped>

</style>

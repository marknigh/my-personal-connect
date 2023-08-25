<template>
  <q-page padding>
    <q-table
      flat bordered
      dense
      :rows="rows"
      :columns="columns"
      row-key="name"
    >
      <template #top>
        <q-toolbar>
          <q-toolbar-title>
            Custom Schedule <q-icon size="xs" name="add" color="secondary" @click="NewSchedule"></q-icon>
          </q-toolbar-title>
        </q-toolbar>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function NewSchedule () {
  router.push('/newschedule')
}
</script>

<style lang="scss" scoped>

</style>

<template>
  <template v-if="'Text' in props.action.Parameters || 'SSML' in props.action.Parameters || 'Media' in props.action.Parameters">
    <q-item :clickable="!('Media' in props.action.Parameters)" ripple @click="$emit('edit', props.action)">
      <q-item-section>
        <q-item-label>ID: {{ action.Identifier }}</q-item-label>
        <q-item-label caption lines="1"> <b>{{ textSSMLMediaPrefix }} </b> {{ textSSMLMedia }}</q-item-label>
      </q-item-section>
    </q-item>
  </template>
  <template v-else-if="'PromptId' in props.action.Parameters">
    <q-item>
      <q-item-section>
        <q-item-label>ID: {{ action.Identifier }}</q-item-label>
        <q-item-label caption lines="1"> <b>Prompt ID: </b> {{ getPromptDisplayName(action.Identifier) }}</q-item-label>
      </q-item-section>
    </q-item>
  </template>
  <template v-else-if="'Messages' in props.action.Parameters">
    <q-item-label>ID: {{ action.Identifier }}</q-item-label>
    <template v-for="(message, index) in action.Parameters.Messages" :key="index">
      <q-item clickable @click="$emit('edit', message)">
        <q-item-section>
          <q-item-label caption lines="1"> <b>{{ `Messages # ${index + 1}:` }}</b> {{ getMessageContent(message, index) }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </template>
</template>

<script setup>
import { computed } from 'vue'

defineEmits(['edit'])

const props = defineProps({
  action: {
    type: Object,
    required: true
  },
  contactFlowDetail: {
    type: Object,
    required: false
  }
})

const textSSMLMediaPrefix = computed(() => {
  switch (true) {
    case 'Text' in props.action.Parameters:
      return 'Text'
    case 'SSML' in props.action.Parameters:
      return 'SSML'
    case 'Media' in props.action.Parameters:
      return 'Media URI'
    default:
      return ''
  }
})

const textSSMLMedia = computed(() => {
  switch (true) {
    case 'Text' in props.action.Parameters:
      return props.action.Parameters.Text
    case 'SSML' in props.action.Parameters:
      return props.action.Parameters.SSML
    case 'Media' in props.action.Parameters:
      return props.action.Parameters.Media.Uri
    default:
      return ''
  }
})

function getPromptDisplayName (Id) {
  console.log('Id: ', Id)
  return props.contactFlowDetail.Metadata.ActionMetadata[props.action.Identifier].parameters.PromptId.displayName
}

function getMessageContent (message, index) {
  console.log('message: ', message)
  if ('PromptId' in message) {
    return props.contactFlowDetail.Metadata.ActionMetadata[props.action.Identifier].audio[index].prompt.text
  } else {
    switch (true) {
      case 'Text' in message:
        return message.Text
      case 'SSML' in message:
        return message.SSML
      case 'Media' in message:
        return message.Media.Uri
      default:
        return 'default'
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

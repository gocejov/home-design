<script setup lang="ts">
import { ref } from 'vue'
import { useAnimations, useGLTF } from '@tresjs/cientos'

const props = defineProps(["path","position","scale",'rotation'])

const { scene: model } = await useGLTF(
  props.path,
)

console.log("model.scale",model.scale,props.scale)

model.scale.set(props.scale[0],props.scale[1],props.scale[2])
model.position.set(props.position[0],props.position[1],props.position[2])
model.rotation.set(props.rotation[0],props.rotation[1],props.rotation[2])

// const { actions } = useAnimations(animations, model)

// const currentAction = ref(actions.Greeting)

// currentAction.value.play()

</script>

<template>
  <primitive :object="model" />
</template>
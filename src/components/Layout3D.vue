<template>
    <div>
        <div class="canvas-wrapper">
            <TresCanvas clear-color="#82DBC5">
                <TresPerspectiveCamera ref="camera" :position="[2, 2, 9]" :look-at="[0, 2, 0]" />
                <OrbitControls ref="controls" />

                <Suspense v-for="obj in objects3d" :key="obj">
                    <Model3D :path="obj.path" :position="obj.position" :scale="obj.scale"
                        :rotation="obj.rotation" />
                </Suspense>
                <TresDirectionalLight color="#F78B3D" :position="[3, 3, 3]" :intensity="1" />
                <TresAmbientLight :intensity="2" />
                <TresGridHelper />
            </TresCanvas>
        </div>
    </div>


</template>

<script setup>
import { TresCanvas } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import { BasicShadowMap, SRGBColorSpace, NoToneMapping } from 'three'
import Model3D from '@/components/Model3d.vue'
import { ref, onMounted, watch, computed } from 'vue';
const gl = {
    clearColor: '#F78B3D',
    shadows: true,
    alpha: false,
    shadowMapType: BasicShadowMap,
    outputColorSpace: SRGBColorSpace,
    toneMapping: NoToneMapping,
}
const controls = ref(null);
const camera = ref(null);

const props = defineProps(['objects']);
const objects3d = computed(() => {
    return props.objects.map(obj => {
        return { ...mapKonvaTo3D(obj) };
    });
});

// Function to map Konva 2D positions to Three.js 3D positions
function mapKonvaTo3D(obj, scaleFactor = 0.01) {
    let copy = { ...obj }; // Deep copy the object to prevent mutation of the original
    copy.position = [...obj.position]; // Make sure position is also a copy
    copy.position[0] = obj.position[0] * scaleFactor; // X-axis
    copy.position[1] = 0; // Y-axis (height in Three.js, Z = 0 in 2D space)
    copy.position[2] = obj.position[1] * scaleFactor; // Z-axis (converted from Konva Y)
    return copy;
}

</script>


<style scoped>
.canvas-wrapper {
    width: 700px;
    height: 700px;
}

html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
}

#canvas {
    height: 100px;
    width: 100px;
}
</style>
<template>
    <div>
        <div class="canvas-wrapper">
            <TresCanvas clear-color="#82DBC5" ref="canvas">
                <TresPerspectiveCamera ref="camera" :position="[2, 2, 9]" :look-at="[0, 2, 0]" />
                <OrbitControls ref="controls" />

                <Suspense v-for="obj in objects3d" :key="obj">
                    <Model3D :path="obj.path" :position="obj.position" :scale="obj.scale"
                        :rotation="obj.rotation" />
                </Suspense>
                <!-- <Suspense v-for="obj in objects3d" :key="obj">
                    <Mesh>
                        <MeshBasicMaterial />
                        <BoxGeometry />
                    </Mesh>
                    <Model3D :path="obj.path" :position="obj.position" :scale="obj.scale"
                        :rotation="obj.rotation" />
                </Suspense> -->
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
import Model3D from '@/components/Model3D.vue'
import { ref, onMounted, watch, computed } from 'vue';
import {SampleRooms, splitArrayIntoChunks} from "@/helpers/utils"
import {buildWallFromLine} from "@/helpers/create3dWall"

import * as THREE from 'three'

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
const ratio = 0.005

const wallMeshes = ref([])

const props = defineProps(['objects','polygons','extractedLines']);
const objects3d = computed(() => {
    return props.objects.map(obj => {
        return { ...mapKonvaTo3D(obj) };
    });
});``

function updateWalls(lines) {
  const scene = canvas.value.context.scene;

  wallMeshes.value.forEach(mesh => scene.value.remove(mesh));
  wallMeshes.value = [];

  lines.forEach(line => {
    const { wallMesh } = buildWallFromLine(scene.value, [
      line.start.x * ratio, line.start.y * ratio,
      line.end.x * ratio, line.end.y * ratio
    ]);
    if (wallMesh) wallMeshes.value.push(wallMesh);
  });
}

watch(() => props.extractedLines, (newLines) => {
  console.log("Stignaa liniite: ", newLines); // cudno izgleda na 3d
  if (newLines && newLines.length > 0) {
    updateWalls(newLines);
  }
}, { deep: true });


watch(() => props.polygons, (newPoints) => {
    console.log("L3 props.polygons received",props.polygons)
}, { deep: true });

const polygons3d = computed(() => {
    return props.polygons//.map(pol=>pol.points.map(p=>p*ratio));
});

watch(() => polygons3d, (newPoints) => {
    console.log("polygons3d watch",polygons3d)
    updatePolygon(polygons3d); // Update polygon mesh on change
}, { deep: true });


function updatePolygon(polygons){
    const scene = canvas?.value.context.scene
    console.log("updatePolygon L3", polygons)
    if (wallMeshes) {
        for(let polygonMesh of wallMeshes)
            scene.value.remove(polygonMesh);
    }
    console.log("updatePolygon L3 polygons.value", polygons.value)

    for(let polygon of polygons.value)
        {
            const lines = splitArrayIntoChunks(polygon.points,4)
    
            for(const line of lines){
                let {wallMesh} = buildWallFromLine(scene.value,line)
                if(wallMesh) wallMeshes.push(wallMesh)
            }
        }
}

// Function to map Konva 2D positions to Three.js 3D positions
function mapKonvaTo3D(obj, scaleFactor = 0.01, rotationFactor = 0.1) {
    let copy = { ...obj }; // Deep copy the object to prevent mutation of the original
    copy.position = [...obj.position]; // Make sure position is also a copy
    copy.position[0] = obj.position[0] * scaleFactor; // X-axis
    copy.position[1] = 0; // Y-axis (height in Three.js, Z = 0 in 2D space)
    copy.position[2] = obj.position[1] * scaleFactor; // Z-axis (converted from Konva Y)
    copy.rotation = [...(obj.rotation || [0, 0, 0])]; // Ensure rotation array exists
    copy.scale[2] = obj.scale[2] *(-1); // Ensure rotation array exists

    copy.rotation[1] = -1 * degreesToRadians((obj.rotation[1] || 0),180);
    return copy;
}

// Utility function to convert degrees to radians
function degreesToRadians(degrees,fixRotation=1) {
    return (degrees + fixRotation) * ((Math.PI /180));
}

const canvas = ref(null)




onMounted(()=> {
    const geometry = new THREE.TorusGeometry(1, 0.5, 16, 32)
    const material = new THREE.MeshBasicMaterial({ color: 'orange' })
    const donut = new THREE.Mesh(geometry, material)
    const scene = canvas?.value.context.scene
    
    
    
    const length = 180.5*ratio, width = 151*ratio;
    // const points = [0, 0,0, width,length, width,length, 0,0, 0];
    console.log("squareRoom",SampleRooms.squareRoom)
    const points1 = SampleRooms.squareRoom.map(el => el*ratio)
    const points2 = SampleRooms.squareRoom1.map(el => el*ratio)
    const shape = new THREE.Shape();
    
    for(let points of [points1]){
        shape.moveTo( points[0], points[1] );
        for (let i = 2; i < points.length; i += 2) {
            shape.lineTo(points[i], points[i + 1]);
        }
    }
    

    const extrudeSettings = {
        depth: 1 *ratio,
        bevelEnabled: false
    };
    
    // initWallCreation(scene.value,camera.value)
    
    const wallGeometry = new THREE.ExtrudeGeometry(shape,extrudeSettings);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    // scene.value.add( wall );
    console.log(scene)

    const linePoints = [0,5,5,5,0,0,5,0,0,0,0,5,5,0,5,5].map(el => el*0.5)
    
    const points=[
    0.5,
    2.5,
    690.5,
    8.5,
    //
    684.5,
    562.5,
    10.5,
    564.5,
    //
    10.5,
    564.5,
    10.5,
    564.5,
    //
    0.5,
    2.5,
    0.5,
    2.5,
    //
    10.5,
    561.5,
    0.5,
    2.5
].map(el => el*ratio)

    const line1 = [0,5,5,5]
    const line2 = [0,0,5,0]
    const line3 = [0,0,0,5]
    const line4 = [5,0,5,5]

    const walls = []//[linePoints,points]

        for(let polygon of walls)
        {
            const lines = splitArrayIntoChunks(polygon,4)
    
            for(const line of lines){
                let {wallMesh} = buildWallFromLine(scene.value,line)
                if(wallMesh) wallMeshes.push(wallMesh)
            }
        }    
})



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
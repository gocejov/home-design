<template>
    <div>
        <div class="canvas-wrapper">
            <TresCanvas clear-color="#82DBC5" ref="canvas">
                <TresPerspectiveCamera ref="camera" :position="[2, 2, 9]" :look-at="[0,2,0]" />
                <OrbitControls ref="controls" />

                <Suspense v-for="obj in objects3d" :key="obj">
                    <Model3D :path="obj.path" :position="obj.position" :scale="obj.scale"
                        :rotation="obj.rotation" />
                </Suspense>

                 <!-- Box -->
                <TresMesh :rotation="[0.01, 0.01, 0]">
                <TresBoxGeometry />
                <TresMeshStandardMaterial :color="'green'" />
                </TresMesh>

                <!-- Extruded Wall from Line -->
                <TresMesh>
                <TresExtrudeGeometry :shape="shape" ref="tresExtrude" />
                <TresMeshStandardMaterial :color="'gray'" />
                </TresMesh>
                
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
import { BasicShadowMap, SRGBColorSpace, NoToneMapping, Mesh, BoxGeometry, MeshBasicMaterial, Shape, ExtrudeGeometry} from 'three'
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
const canvas = ref(null); // Ref for TresCanvas
const tresExtrude = ref(null); // Ref for TresCanvas

const shape = ref(null); // Store the shape as a ref
const extrudeSettings = ref({
  depth: 1, // Wall thickness
  bevelEnabled: false,
});

// Example points from a Konva line
const points = [
    465.0000477875576,
    50.38069152832031,
    465.0000477875576,
    245.3806915283203,
    167.0000269411647,
    248.3806915283203,
    175.0000275007994,
    49.38069152832031,
    175.0000275007994,
    49.38069152832031,
    175.0000275007994,
    49.38069152832031,
    175.0000275007994,
    49.38069152832031,
    175.0000275007994,
    49.38069152832031,
    175.0000275007994,
    49.38069152832031,
    465.0000477875576,
    50.38069152832031
]

const props = defineProps(['objects']);
const objects3d = computed(() => {
    return props.objects.map(obj => {
        return { ...mapKonvaTo3D(obj) };
    });
});






  // Create a box geometry and a basic material
  const geometry = new BoxGeometry(1, 1, 1)
  const material = new MeshBasicMaterial({ color: 0x00ff00 })

  // Create a mesh with the geometry and material
  const meshWithMaterial = new Mesh(geometry, material)

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


onMounted(() => {
  const scene = canvas.value.context.scene; // Access the Three.js scene

//   if (scene) {
    console.log('Scene:', scene); // You can now work with the scene
    // Add or manipulate objects in the scene here

      // Create a THREE.Shape from the points
  const length = 12, width = 100;
 // Assuming you have your Konva line's points, for example:
 const points = [0, 0, 100, 100, 1000, 500];

// Convert points into a THREE.Shape object
let shape = new Shape();
shape.moveTo(points[0], points[1]);

for (let i = 2; i < points.length; i += 2) {
  shape.lineTo(points[i], points[i + 1]);
}

// this.shape = shape;

//   const geometry = new ExtrudeGeometry( shape, extrudeSettings );
  tresExtrude.shape = shape
// const material = new MeshBasicMaterial( { color: 0x00ff00 } );
// const mesh = new Mesh( geometry, material ) ;
// scene.add( mesh );

//   } else {
//     console.error('Scene not found!');
//   }
});

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
<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script>
import * as THREE from 'three';

export default {
  props: {
    linesin: {
      type: Array,
      required: true,
    },
    wallHeight: {
      type: Number,
      default: 3, // Set a default height for the walls
    },
  },
  mounted() {
    this.initThree();
    this.create3DWall();
  },
  computed:{
    lines(){
        return this.linesin || []
    }
  },
  methods: {
    initThree() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.$refs.threeContainer.appendChild(this.renderer.domElement);

      // Set camera position
      this.camera.position.z = 5;

      this.animate();
    },
    create3DWall() {
      // Clear any existing walls if necessary
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }

      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown color for walls

      this.lines.forEach(line => {
        const points = line.points.map((point, index) => {
          return index % 2 === 0 ? new THREE.Vector3(point, 0, line.points[index + 1]) : null;
        }).filter(Boolean);

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: this.wallHeight,
          bevelEnabled: false,
        });
        const wallMesh = new THREE.Mesh(geometry, wallMaterial);
        this.scene.add(wallMesh);
      });
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    },
  },
};
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
}
</style>

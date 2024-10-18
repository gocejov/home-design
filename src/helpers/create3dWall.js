import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, controls;
let walls = [];
let drawingPoints = [];

function initWallCreation(tresScene,tresCamera) {
    // Set up scene
    scene = tresScene
    camera = tresCamera
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up camera and controls
    camera.position.set(0, 5, 10);
    controls = new OrbitControls(camera, renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Add ground plane for reference
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    scene.add(ground);

    // Event listeners
    renderer.domElement.addEventListener('click', onCanvasClick);
    window.addEventListener('keydown', onKeyDown);

    //animate();
}

function onCanvasClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const point = intersects[0].point;
        drawingPoints.push(new THREE.Vector2(point.x, point.z));
        
        // Visualize the point
        const sphereGeometry = new THREE.SphereGeometry(0.1);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(point.x, 0.1, point.z);
        scene.add(sphere);

        if (drawingPoints.length > 1) {
            createWall(drawingPoints[drawingPoints.length - 2], drawingPoints[drawingPoints.length - 1]);
        }
    }
}

function createWall(start, end) {
    const wallHeight = 2;
    const wallWidth = start.distanceTo(end);
    const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, 0.1);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x8888ff });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

    // Position the wall
    const midpoint = start.add(end).multiplyScalar(0.5);
    wall.position.set(midpoint.x, wallHeight / 2, midpoint.y);

    // Rotate the wall
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    wall.rotation.y = angle;

    scene.add(wall);
    walls.push(wall);
}

function onKeyDown(event) {
    if (event.key === 'c' || event.key === 'C') {
        // Clear all walls and drawing points
        walls.forEach(wall => scene.remove(wall));
        walls = [];
        drawingPoints = [];
        scene.children = scene.children.filter(child => !(child instanceof THREE.Mesh) || child.geometry instanceof THREE.PlaneGeometry);
    }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

const buildWallFromLine = (scene,line) =>{
    
    const x1 = line[0]
    const y1 = line[1]
    const x2 = line[2]
    const y2 = line[3]
    
    // Define the two points for the wall
const pointA = new THREE.Vector3(x1, 0, y1);
const pointB = new THREE.Vector3(x2, 0, y2);

// Wall dimensions
const wallHeight = 3;   // Wall height
const wallThickness = 0.1; // Wall thickness

// Calculate the distance between the two points (length of the wall)
const wallLength = pointA.distanceTo(pointB);

// Create the wall geometry using BoxGeometry (length = distance between points)
const wallGeometry = new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);

// Wall material
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

// Position the wall at the midpoint between the two points
const midpoint = new THREE.Vector3().addVectors(pointA, pointB).multiplyScalar(0.5);
const midpointZ =  midpoint.z
const midpointX = midpoint.x
const midpointY = wallHeight / 2
wallMesh.position.set(midpoint.x, wallHeight / 2, midpoint.z);

// Calculate the angle between the two points to rotate the wall correctly
const angle = Math.atan2(pointB.z - pointA.z, pointB.x - pointA.x);
wallMesh.rotation.y = -angle; // Rotate around the Y-axis

// Add the wall to the scene
scene.add(wallMesh);

return {
    wallMesh,
    mesh:{wallLength, wallHeight, wallThickness, position:{x:midpointX, y:midpointY, z:midpointZ},angle:-angle}
}

}

export { initWallCreation, buildWallFromLine}  ;
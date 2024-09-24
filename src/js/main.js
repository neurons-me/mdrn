import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createSkySphere } from '../objects/skySphere.js';
import { createCamera, updateCameraPosition } from './cameraControl.js';
import { loadTexture } from './Texture/textureLoader.js';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = createCamera();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Load the texture and set it as the background
loadTexture('./starry_sky.jpg', scene);

// Create an infinite grid
const gridHelper = new THREE.GridHelper(1000, 1000, 0x555555, 0x555555);
scene.add(gridHelper);
camera.position.set(0, 2, 0); // Set the camera at a height to simulate walking on a floor

// Dynamically capture all keyboard input
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Create objects
const skySphere = createSkySphere();
scene.add(skySphere);

// Create the rotating vector in 8-bit pixel art style
const vectorLength = 5;
const vectorGeometry = new THREE.BoxGeometry(0.2, vectorLength, 0.2);
const vectorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const vector = new THREE.Mesh(vectorGeometry, vectorMaterial);
vector.position.y = vectorLength / 2;
scene.add(vector);
// Load and add the MonadLisa.obj file
const objLoader = new OBJLoader();
objLoader.load(
    './src /objects/MonadLisa.obj',
    (object) => {
        object.position.set(0, 0, 0);
        scene.add(object);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
        console.error('An error happened', error);
    }
);

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    updateCameraPosition(camera, keys);
    // Rotate the vector to simulate continuous rotation
    vector.rotation.z += 0.01;
    renderer.render(scene, camera);
};
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Handle draggable button
let draggedItem = null;
let offsetX = 0, offsetY = 0;

document.querySelector('.button-circle').addEventListener('mousedown', function (e) {
    e.preventDefault();
    const rect = this.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    draggedItem = this;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    if (draggedItem) {
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;
        // Ensure the button stays within the viewport
        const rect = draggedItem.getBoundingClientRect();
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + rect.width > window.innerWidth) newLeft = window.innerWidth - rect.width;
        if (newTop + rect.height > window.innerHeight) newTop = window.innerHeight - rect.height;

        draggedItem.style.left = newLeft + 'px';
        draggedItem.style.top = newTop + 'px';
    }
}

function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    draggedItem = null;
}

import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.140.0/examples/jsm/webxr/VRButton.js';

let viewer;

// Set up the 3Dmol viewer
function initViewer() {
  viewer = $3Dmol.createViewer('viewer', {
    defaultcolors: $3Dmol.rasmolElementColors,
    backgroundColor: 'transparent'
  });
}

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
}

function clearError() {
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = '';
}

function showLoading() {
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

window.function loadProtein() {
  clearError();
  const pdbId = document.getElementById('pdbCode').value.trim();
  
  if (pdbId === '') {
    showError('Please enter a PDB code.');
    return;
  }

  showLoading();

  const url = `https://files.rcsb.org/view/${pdbId}.pdb`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid PDB code or error fetching PDB file.');
      }
      return response.text();
    })
    .then(pdbData => {
      viewer.clear();
      viewer.addModel(pdbData, 'pdb');
      viewer.setStyle({}, {
        cartoon: {color: 'spectrum'},
      });
      viewer.zoomTo();
      viewer.render();
    })
    .catch(error => showError(error.message))
    .finally(() => hideLoading());
}

// Set up the 360-degree panorama using THREE.js
function initPanorama() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  geometry.scale(-1, 1, 1);

  // Load a panoramic image (replace 'panorama.jpg' with your image path)
  const texture = new THREE.TextureLoader().load('panorama.jpg');
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Set up OrbitControls for navigation
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 0.1);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // Add the VR Button to the DOM
  document.body.appendChild(VRButton.createButton(renderer));

  // Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Trigger loadProtein on Enter key press
document.getElementById('pdbCode').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    loadProtein();
  }
});

// Initialize everything
function init() {
  initViewer();
  initPanorama();
}

init();

// script.js
// Interactive textured sphere with export (glb/gltf/obj/stl/ply) and texture download.
// Author: generated for your request

(() => {
  // Basic scene setup
  let scene, camera, renderer, controls;
  let container = document.getElementById('rendererContainer');
  let width = container.clientWidth, height = container.clientHeight;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071026);

  camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
  camera.position.set(0, 0.8, 2.6);

  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lights
  const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(5, 5, 5);
  scene.add(dir);

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Default material and geometry
  let sphereMesh;
  let originalPositions = null;
  let currentTextureCanvas = null;

  const defaultSegments = parseInt(document.getElementById('segments').value, 10) || 256;

  function createSphere(segments = defaultSegments) {
    if (sphereMesh) {
      sphereMesh.geometry.dispose();
      sphereMesh.material.dispose();
      scene.remove(sphereMesh);
    }
    const geometry = new THREE.SphereGeometry(1, segments, segments);
    // Save original positions for displacement recalculation
    originalPositions = geometry.attributes.position.array.slice();

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: parseFloat(document.getElementById('roughness').value),
      metalness: parseFloat(document.getElementById('metalness').value),
      displacementScale: parseFloat(document.getElementById('dispScale').value),
      wireframe: document.getElementById('wireframe').checked
    });

    // placeholder texture
    const placeholder = makeProceduralTexture(512, 512, 'noise', '#ff9a9e', '#654ea3');
    mat.map = new THREE.CanvasTexture(placeholder);
    mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
    mat.map.repeat.set(1, 1);

    // create displacement/normal maps as same initially
    const hmap = createHeightMapFromCanvas(placeholder);
    const dispTex = new THREE.CanvasTexture(hmap);
    dispTex.wrapS = dispTex.wrapT = THREE.RepeatWrapping;
    mat.displacementMap = dispTex;

    const normalTex = generateNormalMap(hmap);
    normalTex.wrapS = normalTex.wrapT = THREE.RepeatWrapping;
    mat.normalMap = normalTex;

    sphereMesh = new THREE.Mesh(geometry,

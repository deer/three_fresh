// islands/ComplexScene.tsx
import * as THREE from "three";
import { useEffect } from "preact/hooks";

export default function ComplexScene() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      globalThis.innerWidth / globalThis.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Adding a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Adding an ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    // Create a plane that receives shadows (but does not cast them)
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.ShadowMaterial({ color: 0x000000 });
    planeMaterial.opacity = 0.5;
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -50;
    plane.receiveShadow = true;
    scene.add(plane);

    // Create a cube that casts and receives shadows
    const geometry = new THREE.BoxGeometry(50, 50, 50);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.position.y = 25;
    scene.add(cube);

    camera.position.z = 200;
    camera.position.y = 100;
    camera.lookAt(scene.position);

    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return <div id="complex-scene"></div>;
}

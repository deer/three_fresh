import * as THREE from "three";
import { useEffect } from "preact/hooks";

export default function AnimatedMesh() {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      globalThis.innerWidth / globalThis.innerHeight,
      0.1,
      1000,
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Using a texture from a free source
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      "https://threejs.org/examples/textures/brick_diffuse.jpg",
      () => {
        // Texture loaded
        renderer.render(scene, camera);
      },
    );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

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

  return <div id="animated-mesh"></div>;
}

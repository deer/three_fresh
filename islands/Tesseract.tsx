import * as THREE from "three";
import { useEffect } from "preact/hooks";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function TesseractAnimation() {
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

    camera.position.z = 1;

    // Tesseract vertices in 4D
    const vertices = [
      [-1, -1, -1, 1],
      [1, -1, -1, 1],
      [1, 1, -1, 1],
      [-1, 1, -1, 1],
      [-1, -1, 1, 1],
      [1, -1, 1, 1],
      [1, 1, 1, 1],
      [-1, 1, 1, 1],
      [-1, -1, -1, -1],
      [1, -1, -1, -1],
      [1, 1, -1, -1],
      [-1, 1, -1, -1],
      [-1, -1, 1, -1],
      [1, -1, 1, -1],
      [1, 1, 1, -1],
      [-1, 1, 1, -1],
    ];

    // Edges between the vertices
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
      [8, 9],
      [9, 10],
      [10, 11],
      [11, 8],
      [12, 13],
      [13, 14],
      [14, 15],
      [15, 12],
      [8, 12],
      [9, 13],
      [10, 14],
      [11, 15],
      [0, 8],
      [1, 9],
      [2, 10],
      [3, 11],
      [4, 12],
      [5, 13],
      [6, 14],
      [7, 15],
    ];

    // Create a geometry
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    edges.forEach((edge) => {
      const start = vertices[edge[0]];
      const end = vertices[edge[1]];
      positions.push(start[0], start[1], start[2]);
      positions.push(end[0], end[1], end[2]);
    });
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const lines = new THREE.LineSegments(geometry, material);
    scene.add(lines);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0;
    controls.maxDistance = 10;

    // Function to project 4D coordinates to 3D
    function project4Dto3D(x: number, y: number, z: number, w: number) {
      // Simple stereographic projection
      const factor = 1 / (4 - w);
      return [x * factor, y * factor, z * factor];
    }

    let angle = 0;
    function animate() {
      requestAnimationFrame(animate);

      // Rotate in 4D
      angle += 0.01;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);

      const newPositions: number[] = [];
      vertices.forEach((vertex) => {
        // Double rotation
        const x = vertex[0] * cosAngle - vertex[3] * sinAngle;
        const y = vertex[1];
        const z = vertex[2] * cosAngle + vertex[3] * sinAngle;
        const w = vertex[0] * sinAngle + vertex[3] * cosAngle;

        // Project down to 3D
        const projected = project4Dto3D(x, y, z, w);
        newPositions.push(...projected);
      });

      // Update geometry positions
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const startIndex = edge[0] * 3;
        const endIndex = edge[1] * 3;

        const startX = newPositions[startIndex];
        const startY = newPositions[startIndex + 1];
        const startZ = newPositions[startIndex + 2];

        const endX = newPositions[endIndex];
        const endY = newPositions[endIndex + 1];
        const endZ = newPositions[endIndex + 2];

        geometry.attributes.position.setXYZ(i * 2, startX, startY, startZ);
        geometry.attributes.position.setXYZ(i * 2 + 1, endX, endY, endZ);
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return <div id="tesseract-animation"></div>;
}

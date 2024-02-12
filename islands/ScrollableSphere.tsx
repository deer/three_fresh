// based on https://www.youtube.com/watch?v=_OwJV2xL8M8
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect } from "preact/hooks";
import { gsap } from "npm:gsap@3.12.5";

export default function BasicCube() {
  useEffect(() => {
    const scene = new THREE.Scene();

    const geometry = new THREE.SphereGeometry(3, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      color: "#00ff83",
      roughness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const sizes = {
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
    };

    const light = new THREE.PointLight(0xffffff, 1000, 100);
    light.position.set(0, 10, 10);
    scene.add(light);

    const weakLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(weakLight);

    const camera = new THREE.PerspectiveCamera(
      45,
      sizes.width / sizes.height,
      0.1,
      100,
    );
    camera.position.z = 20;
    scene.add(camera);

    const canvas = document.querySelector("canvas");
    if (!canvas) throw new Error("Canvas not found");

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(2);
    renderer.render(scene, camera);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDampening = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 10;

    globalThis.addEventListener("resize", () => {
      sizes.width = globalThis.innerWidth;
      sizes.height = globalThis.innerHeight;
      camera.updateProjectionMatrix();
      camera.aspect = sizes.width / sizes.height;
      renderer.setSize(sizes.width, sizes.height);
    });

    function loop() {
      controls.update();
      renderer.render(scene, camera);
      globalThis.requestAnimationFrame(loop);
    }
    loop();

    const tl = gsap.timeline({ defaults: { duration: 1 } });
    tl.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
    tl.fromTo("nav", { y: "-100%" }, { y: "0" });
    tl.fromTo("h1", { opacity: 0 }, { opacity: 1 });

    let mouseDown = false;
    let rgb: [number, number, number] = [0, 0, 0];
    globalThis.addEventListener("mousedown", () => (mouseDown = true));
    globalThis.addEventListener("mouseup", () => (mouseDown = false));
    globalThis.addEventListener("mousemove", (e) => {
      if (mouseDown) {
        rgb = [
          Math.round((e.pageX / sizes.width) * 255),
          Math.round((e.pageY / sizes.height) * 255),
          150,
        ];
        const newColor = new THREE.Color(`rgb(${rgb.join(",")})`);
        gsap.to(mesh.material.color, {
          r: newColor.r,
          g: newColor.g,
          b: newColor.b,
        });
      }
    });

    return () => {
      document.body.removeChild(canvas);
    };
  }, []);

  return (
    <div class="w-full">
      <nav class="text-white z-10 relative flex justify-between px-16 pt-16 items-center w-full">
        <a href="/examples/ScrollableSphere" class="font-bold">Sphere</a>
        <ul class="flex gap-16">
          <li>Explore</li>
          <li>Create</li>
        </ul>
      </nav>
      <h1 class="text-balance z-10 absolute text-white left-[50%] top-[75%] text-5xl translate-x-[-50%] translate-y-[-25%]">
        Give it a spin!
      </h1>
      <canvas class="absolute top-0 left-0 z-0" />
    </div>
  );
}

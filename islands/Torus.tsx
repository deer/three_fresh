// adapted from https://threejs.org/examples/?q=texture#webgl_loader_texture_hdrjpg
import * as THREE from "three";
import { useEffect } from "preact/hooks";

import Stats from "three/addons/libs/stats.module.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

import {
  GainMapLoader,
  HDRJPGLoader,
  QuadRenderer,
} from "@monogrid/gainmap-js";

export default function Torus() {
  useEffect(() => {
    const params = {
      envMap: "HDR JPG",
      roughness: 0.0,
      metalness: 1.0,
      exposure: 1.0,
      debug: false,
    };

    let container: HTMLDivElement, stats;
    let camera: THREE.PerspectiveCamera,
      scene: THREE.Scene,
      renderer: THREE.WebGLRenderer,
      controls;
    let torusMesh: THREE.Mesh, planeMesh: THREE.Mesh;
    let hdrJpg: QuadRenderer, hdrJpgPMREMRenderTarget, hdrJpgEquirectangularMap;
    let gainMap: QuadRenderer, gainMapPMREMRenderTarget, gainMapBackground;
    let hdrPMREMRenderTarget, hdrEquirectangularMap;

    const fileSizes: Record<string, string> = {};
    const resolutions: Record<string, string> = {};

    init();
    animate();

    function init() {
      const lbl = document.getElementById("lbl_left");

      container = document.createElement("div");
      document.body.appendChild(container);

      camera = new THREE.PerspectiveCamera(
        50,
        globalThis.innerWidth / globalThis.innerHeight,
        1,
        500,
      );
      camera.position.set(0, 0, -120);

      scene = new THREE.Scene();

      renderer = new THREE.WebGLRenderer();
      renderer.toneMapping = THREE.ACESFilmicToneMapping;

      const geometry = new THREE.TorusKnotGeometry(18, 8, 200, 40, 1, 3);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: params.metalness,
        roughness: params.roughness,
      });

      torusMesh = new THREE.Mesh(geometry, material);
      scene.add(torusMesh);

      const planeGeometry = new THREE.PlaneGeometry(200, 200);
      const planeMaterial = new THREE.MeshBasicMaterial();

      planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
      planeMesh.position.y = -50;
      planeMesh.rotation.x = -Math.PI * 0.5;
      scene.add(planeMesh);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      THREE.DefaultLoadingManager.onLoad = function () {
        pmremGenerator.dispose();
      };

      hdrJpg = new HDRJPGLoader(renderer)
        .load("/textures/gainmap/spruit_sunrise_4k.jpg", function () {
          resolutions["HDR JPG"] = hdrJpg.width + "x" + hdrJpg.height;
          displayStats("HDR JPG");

          hdrJpgEquirectangularMap = hdrJpg.renderTarget.texture;
          hdrJpgPMREMRenderTarget = pmremGenerator.fromEquirectangular(
            hdrJpgEquirectangularMap,
          );

          hdrJpgEquirectangularMap.mapping =
            THREE.EquirectangularReflectionMapping;
          hdrJpgEquirectangularMap.needsUpdate = true;

          hdrJpg.dispose();
        }, function (progress) {
          fileSizes["HDR JPG"] = humanFileSize(progress.total);
        });

      gainMap = new GainMapLoader(renderer)
        .load([
          "/textures/gainmap/spruit_sunrise_4k.webp",
          "/textures/gainmap/spruit_sunrise_4k-gainmap.webp",
          "/textures/gainmap/spruit_sunrise_4k.json",
        ], function () {
          resolutions["Webp Gain map (separate)"] = gainMap.width + "x" +
            gainMap.height;

          gainMapBackground = hdrJpg.renderTarget.texture;
          gainMapPMREMRenderTarget = pmremGenerator.fromEquirectangular(
            gainMapBackground,
          );

          gainMapBackground.mapping = THREE.EquirectangularReflectionMapping;
          gainMapBackground.needsUpdate = true;

          gainMap.dispose();
        }, function (progress) {
          fileSizes["Webp Gain map (separate)"] = humanFileSize(progress.total);
        });

      hdrEquirectangularMap = new RGBELoader()
        .load("/textures/gainmap/spruit_sunrise_1k.hdr", function () {
          resolutions["HDR"] = hdrEquirectangularMap.image.width + "x" +
            hdrEquirectangularMap.image.height;

          hdrPMREMRenderTarget = pmremGenerator.fromEquirectangular(
            hdrEquirectangularMap,
          );

          hdrEquirectangularMap.mapping =
            THREE.EquirectangularReflectionMapping;
          hdrEquirectangularMap.minFilter = THREE.LinearFilter;
          hdrEquirectangularMap.magFilter = THREE.LinearFilter;
          hdrEquirectangularMap.needsUpdate = true;
        }, function (progress) {
          fileSizes["HDR"] = humanFileSize(progress.total);
        });

      renderer.setPixelRatio(globalThis.devicePixelRatio);
      renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
      container.appendChild(renderer.domElement);

      stats = new Stats();
      container.appendChild(stats.dom);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.minDistance = 50;
      controls.maxDistance = 300;

      globalThis.addEventListener("resize", onglobalThisResize);

      const gui = new GUI();

      gui.add(params, "envMap", ["HDR JPG", "Webp Gain map (separate)", "HDR"])
        .onChange(displayStats);
      gui.add(params, "roughness", 0, 1, 0.01);
      gui.add(params, "metalness", 0, 1, 0.01);
      gui.add(params, "exposure", 0, 2, 0.01);
      gui.add(params, "debug");
      gui.open();

      function displayStats(value: string) {
        if (!lbl) return;
        lbl.innerHTML = value + " size : " + fileSizes[value] +
          ", Resolution: " + resolutions[value];
      }
    }

    function humanFileSize(bytes: number, si = true, dp = 1) {
      const thresh = si ? 1000 : 1024;

      if (Math.abs(bytes) < thresh) {
        return bytes + " B";
      }

      const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
      let u = -1;
      const r = 10 ** dp;

      do {
        bytes /= thresh;
        ++u;
      } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1
      );

      return bytes.toFixed(dp) + " " + units[u];
    }

    function onglobalThisResize() {
      const width = globalThis.innerWidth;
      const height = globalThis.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    }

    function animate() {
      requestAnimationFrame(animate);

      stats.begin();
      render();
      stats.end();
    }

    function render() {
      torusMesh.material.roughness = params.roughness;
      torusMesh.material.metalness = params.metalness;

      let pmremRenderTarget, equirectangularMap;

      switch (params.envMap) {
        case "HDR JPG":
          pmremRenderTarget = hdrJpgPMREMRenderTarget;
          equirectangularMap = hdrJpgEquirectangularMap;
          break;
        case "Webp Gain map (separate)":
          pmremRenderTarget = gainMapPMREMRenderTarget;
          equirectangularMap = gainMapBackground;
          break;
        case "HDR":
          pmremRenderTarget = hdrPMREMRenderTarget;
          equirectangularMap = hdrEquirectangularMap;
          break;
      }

      const newEnvMap = pmremRenderTarget ? pmremRenderTarget.texture : null;

      if (newEnvMap && newEnvMap !== torusMesh.material.envMap) {
        planeMesh.material.map = newEnvMap;
        planeMesh.material.needsUpdate = true;
      }

      torusMesh.rotation.y += 0.005;
      planeMesh.visible = params.debug;

      scene.environment = equirectangularMap;
      scene.background = equirectangularMap;
      renderer.toneMappingExposure = params.exposure;

      renderer.render(scene, camera);
    }

    return () => {
      // Proper cleanup to dispose of objects and listeners
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        // Dispose of materials, geometries, textures
        scene.traverse((object) => {
          if (object.material) {
            object.material.dispose();
          }
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.texture) {
            object.texture.dispose();
          }
        });
      }
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      // Remove resize listener
      globalThis.removeEventListener("resize", onglobalThisResize);
    };
  }, []);
  return <div id="torus-animation"></div>;
}

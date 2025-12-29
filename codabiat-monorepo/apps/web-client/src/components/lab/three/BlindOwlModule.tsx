import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Eye, Wind, Layers } from "lucide-react";

const fragments = [
  "در زندگی زخم‌هایی هست",
  "خوره",
  "روح",
  "انزوا",
  "سایه",
  "دیوار",
  "اثیری",
  "شراب زهرآلود",
  "چشم‌های سیاه",
  "ریگ جویبار",
  "شب",
  "هراس",
  "آینه",
  "تکرار",
  "پیرمرد خنزرپنزری",
  "سرو",
  "گلدان راغه",
  "افسون",
  "تاریکی",
  "سکوت",
];

export const BlindOwlModule: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1);
  const [turbulence, setTurbulence] = useState(0.5);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const itemsRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    const itemsGroup = new THREE.Group();
    itemsRef.current = itemsGroup;
    scene.add(itemsGroup);

    const createTextTexture = (text: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, 512, 128);

        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 15;

        ctx.font = 'bold 60px "Vazirmatn"';
        ctx.fillStyle = "#e0e0e0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 256, 64);
      }
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    };

    for (let i = 0; i < 40; i++) {
      const text = fragments[Math.floor(Math.random() * fragments.length)];
      const texture = createTextTexture(text);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
        color: 0xffffff,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(material);

      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 10;
      const z = -Math.random() * 100;

      sprite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);

      const scale = 3 + Math.random() * 3;
      sprite.scale.set(scale * 4, scale, 1);

      itemsGroup.add(sprite);
    }

    const particlesGeom = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeom.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x888888,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(particlesGeom, particlesMat);
    particlesRef.current = particlesMesh;
    scene.add(particlesMesh);

    const animate = () => {
      if (!itemsRef.current || !particlesRef.current || !cameraRef.current) return;

      cameraRef.current.position.x += (mouseRef.current.x * 2 - cameraRef.current.position.x) * 0.05;
      cameraRef.current.position.y += (-mouseRef.current.y * 2 - cameraRef.current.position.y) * 0.05;
      cameraRef.current.lookAt(0, 0, -50);

      itemsRef.current.children.forEach((child) => {
        child.position.z += 0.1 * speed;

        child.position.x += Math.sin(Date.now() * 0.001 + child.position.z) * 0.01 * turbulence;
        child.position.y += Math.cos(Date.now() * 0.002 + child.position.z) * 0.01 * turbulence;

        if (child.position.z > 5) {
          child.position.z = -100;
          const angle = Math.random() * Math.PI * 2;
          const radius = 5 + Math.random() * 10;
          child.position.x = Math.cos(angle) * radius;
          child.position.y = Math.sin(angle) * radius;
        }
      });

      particlesRef.current.rotation.z += 0.001 * speed;
      pointLight.intensity = 2 + Math.sin(Date.now() * 0.005) * 0.5;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      };
    };

    window.addEventListener("resize", handleResize);
    mountRef.current.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) mountRef.current.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
      if (mountRef.current) mountRef.current.innerHTML = "";
      renderer.dispose();
      scene.clear();
    };
  }, [speed, turbulence]);

  return (
    <div className="h-full relative overflow-hidden bg-black group">
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 bg-black/60 border border-white/10 p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="flex flex-col items-center">
          <label className="text-[9px] text-gray-500 font-mono mb-1 flex items-center gap-1">
            <Wind size={10} /> VELOCITY
          </label>
          <input
            type="range"
            min="0.2"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-purple-500"
          />
        </div>
        <div className="w-[1px] h-8 bg-white/10"></div>
        <div className="flex flex-col items-center">
          <label className="text-[9px] text-gray-500 font-mono mb-1 flex items-center gap-1">
            <Layers size={10} /> CHAOS
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={turbulence}
            onChange={(e) => setTurbulence(Number(e.target.value))}
            className="w-24 h-1 bg-gray-700 rounded appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
      <div className="absolute inset-0  bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_90%)] z-10"></div>
      <div className="absolute top-4 right-4 z-20 text-right opacity-50">
        <div className="flex items-center justify-end gap-2 text-purple-400 font-mono text-xs">
          <span>IMMERSION_ENGINE</span>
          <Eye size={14} className="animate-pulse" />
        </div>
        <p className="text-[9px] text-gray-600 font-mono mt-1">DEPTH: {(speed * 100).toFixed(0)}m/s</p>
      </div>
      <div ref={mountRef} className="w-full h-full cursor-none" />
    </div>
  );
};

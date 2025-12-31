import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Eye, Wind, Layers, Zap, Skull, Hand } from "lucide-react"; // Added icons for Sega vibe

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

    // --- SEGA PALETTE INTEGRATION ---
    const PALETTE = {
      MutantOrange: 0xe07000,
      BruisedPurple: 0x500050,
      SewerSludge: 0x006000,
      InkBlack: 0x000000,
      SketchWhite: 0xffffff,
    };

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Background matches the "Bruised Purple" shadow/void
    scene.fog = new THREE.FogExp2(PALETTE.BruisedPurple, 0.02);
    scene.background = new THREE.Color(PALETTE.BruisedPurple);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Changed light to Mutant Orange for dramatic comic contrast
    const pointLight = new THREE.PointLight(PALETTE.MutantOrange, 3, 50);
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

        // COMIC STYLE TEXT RENDERING
        ctx.font = 'bold 60px "Vazirmatn"'; // Keep font but style it
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Thick Ink Outline
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";
        ctx.strokeText(text, 256, 64);

        // White Fill (Sketch White)
        ctx.fillStyle = "#FFFFFF";
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
        opacity: 0.8, // Increased opacity for comic visibility
        color: 0xffffff,
        // Removed AdditiveBlending to make text look like solid paper cutouts
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
      size: 0.15,
      color: PALETTE.MutantOrange, // Orange sparks/dust
      transparent: true,
      opacity: 0.6,
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
    // --- THE VOID (Artist's Desk Background) ---
    <div className="h-full w-full relative bg-[#1a1a1a] p-6 flex items-center justify-center overflow-hidden font-mono">
      {/* --- COMIC PANEL CONTAINER --- */}
      <div className="relative w-full h-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group">
        {/* --- HEADER: INVENTORY SLOTS (Top Right) --- */}
        <div className="absolute top-4 right-4 z-30 flex gap-2">
          {/* Slot 1: Status */}
          <div className="bg-[#FFCC00] border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-black text-[#FFCC00] text-[10px] px-2 py-1 font-bold uppercase tracking-widest">
              EPISODE 1
            </div>
          </div>
          {/* Slot 2: Depth Indicator */}
          <div className="bg-white border-2 border-black p-1 w-12 h-12 flex flex-col items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Eye size={16} className="text-black mb-1" />
            <span className="text-[8px] font-bold text-[#E07000]">{(speed * 100).toFixed(0)}m</span>
          </div>
        </div>

        {/* --- DECORATIVE: ONOMATOPOEIA (Behind UI, Top Left) --- */}
        <div className="absolute top-10 left-10 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -rotate-12">
          <span
            className="text-6xl font-black text-white"
            style={{ WebkitTextStroke: "3px black", textShadow: "4px 4px 0 #E07000" }}
          >
            VOOOOM!
          </span>
        </div>

        {/* --- THREE.JS CANVAS MOUNT --- */}
        <div ref={mountRef} className="w-full h-full cursor-crosshair" />

        {/* --- FOOTER: NARRATOR BOX CONTROLS --- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto">
          {/* Yellow Narrator Box Style */}
          <div className="bg-[#FFCC00] border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex gap-6 items-end transform transition-transform hover:-translate-y-1">
            {/* Control 1: Velocity */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-black text-black uppercase flex items-center gap-2 bg-white px-1 border border-black">
                <Wind size={12} /> VELOCITY
              </label>
              <input
                type="range"
                min="0.2"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32 h-4 appearance-none bg-black border-2 border-white cursor-pointer accent-[#E07000]"
                style={{
                  backgroundImage: "linear-gradient(90deg, #000 50%, transparent 50%)",
                  backgroundSize: "4px 100%",
                }}
              />
            </div>

            {/* Divider */}
            <div className="w-1 h-8 bg-black skew-x-12"></div>

            {/* Control 2: Chaos */}
            <div className="flex flex-col items-start gap-1">
              <label className="text-xs font-black text-black uppercase flex items-center gap-2 bg-white px-1 border border-black">
                <Layers size={12} /> CHAOS
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={turbulence}
                onChange={(e) => setTurbulence(Number(e.target.value))}
                className="w-32 h-4 appearance-none bg-black border-2 border-white cursor-pointer accent-[#E07000]"
              />
            </div>

            {/* Decorative Icon */}
            <div className="absolute -top-3 -right-3 bg-white border-2 border-black p-1 rotate-12">
              <Zap size={16} className="text-[#E07000] fill-current" />
            </div>
          </div>
        </div>

        {/* --- PAGE TEAR EFFECT (Bottom Right Corner) --- */}
        <div
          className="absolute bottom-0 right-0 w-16 h-16 bg-white border-l-4 border-t-4 border-black z-20"
          style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
        ></div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Box, Circle, Activity, Settings, Maximize, RefreshCw } from "lucide-react";

type ShapeType = "sphere" | "cube" | "torus" | "icosa";

export const TextOrbModule: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("جهان کلمات می‌چرخد ");
  const [shape, setShape] = useState<ShapeType>("torus");
  const [autoRotate, setAutoRotate] = useState(true);
  const [speed, setSpeed] = useState(0.5);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x020202);
    scene.fog = new THREE.FogExp2(0x020202, 0.02);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // --- Particle System (Data Dust) ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: 0x888888,
      transparent: true,
      opacity: 0.8,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current = particlesMesh;
    scene.add(particlesMesh);

    // --- Main Mesh Group ---
    const meshGroup = new THREE.Group();
    meshGroupRef.current = meshGroup;
    scene.add(meshGroup);

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (meshGroupRef.current) {
        if (autoRotate) {
          meshGroupRef.current.rotation.y += 0.005 * speed * 2;
          meshGroupRef.current.rotation.x += 0.002 * speed * 2;
        }
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y -= 0.001;
      }

      const time = Date.now() * 0.001;
      pointLight1.position.x = Math.sin(time * 0.7) * 10;
      pointLight1.position.y = Math.cos(time * 0.5) * 10;
      pointLight2.position.x = Math.cos(time * 0.3) * 10;
      pointLight2.position.y = Math.sin(time * 0.5) * 10;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // --- Update Geometry/Material Effect ---
  useEffect(() => {
    if (!meshGroupRef.current || !sceneRef.current) return;

    // Clear previous meshes
    while (meshGroupRef.current.children.length > 0) {
      const obj = meshGroupRef.current.children[0] as THREE.Mesh;
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        (obj.material as THREE.Material).dispose();
      }
      meshGroupRef.current.remove(obj);
    }

    // Texture Gen
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.font = 'bold 60px "Vazirmatn"';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = 8;
      const rows = 16;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? "#ff8800" : "#00ffff";
          ctx.fillText(text, (i / cols) * 1024 + 64, (j / rows) * 1024 + 32);
        }
      }

      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 1024; i += 128) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
      }
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    let geometry;
    switch (shape) {
      case "cube":
        geometry = new THREE.BoxGeometry(6, 6, 6);
        break;
      case "torus":
        geometry = new THREE.TorusKnotGeometry(3.5, 1, 100, 16);
        break;
      case "icosa":
        geometry = new THREE.IcosahedronGeometry(4, 0);
        break;
      case "sphere":
      default:
        geometry = new THREE.SphereGeometry(4.5, 32, 32);
        break;
    }

    const solidMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    meshGroupRef.current.add(solidMesh);

    const textureMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const texMesh = new THREE.Mesh(geometry, textureMaterial);
    meshGroupRef.current.add(texMesh);

    const wireframeGeom = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x00aaff, opacity: 0.3, transparent: true });
    const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
    wireframe.scale.setScalar(1.02);
    meshGroupRef.current.add(wireframe);
  }, [text, shape]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-black">
      <div className="absolute top-4 left-4 z-20 w-80 bg-black/80 border border-orange-500/30 p-4 rounded-lg backdrop-blur shadow-2xl animate-in slide-in-from-left duration-500">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <h3 className="text-orange-400 font-display text-sm flex items-center gap-2">
            <Activity size={16} /> اشکال سه‌بعدی
          </h3>
          <Settings size={14} className="text-gray-500" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 font-mono mb-1 block">TEXTURE_STRING</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2 text-orange-100 text-xs rounded outline-none focus:border-orange-500 transition-colors"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 font-mono mb-2 block">GEOMETRY_TYPE</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "sphere", icon: Circle, label: "کره" },
                { id: "cube", icon: Box, label: "مکعب" },
                { id: "torus", icon: RefreshCw, label: "گره" },
                { id: "icosa", icon: Maximize, label: "چندوجهی" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setShape(item.id as ShapeType)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    shape === item.id
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-transparent border-white/10 text-gray-500 hover:bg-white/5"
                  }`}
                >
                  <item.icon size={16} className="mb-1" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-gray-500 font-mono">ROTATION_SPEED</label>
              <span className="text-[10px] text-orange-400 font-mono">{(speed * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex-1 py-2 text-xs font-bold rounded border transition-colors ${
                autoRotate
                  ? "bg-green-900/20 border-green-500/50 text-green-400"
                  : "bg-red-900/20 border-red-500/50 text-red-400"
              }`}
            >
              {autoRotate ? "AUTO_ROTATE: ON" : "AUTO_ROTATE: OFF"}
            </button>
          </div>
        </div>
      </div>
      <div ref={mountRef} className="w-full h-full cursor-move" />
      <div className="absolute inset-0  bg-gradient-to-t from-orange-900/10 to-transparent"></div>
    </div>
  );
};

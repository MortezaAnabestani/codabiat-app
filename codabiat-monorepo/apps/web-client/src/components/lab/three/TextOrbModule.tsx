import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Box, Circle, Activity, Settings, Maximize, RefreshCw, Zap, Hand } from "lucide-react";

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
    // تغییر رنگ پس‌زمینه به "Bruised Purple" خیلی تیره برای القای حس "Void" (میز طراح)
    scene.background = new THREE.Color(0x1a051a);
    scene.fog = new THREE.FogExp2(0x1a051a, 0.02);

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

    // نورها را کمی به سمت رنگ‌های پالت سگا (نارنجی/سبز) متمایل می‌کنیم
    const pointLight1 = new THREE.PointLight(0xe07000, 2, 50); // Mutant Orange
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x006000, 2, 50); // Sewer Sludge
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
      size: 0.15, // کمی بزرگتر برای استایل پیکسلی
      color: 0xffffff, // Sketch White
      transparent: true,
      opacity: 0.6,
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
      // Ink Black Background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.font = 'bold 60px "Courier New", monospace'; // فونت مونو برای حس کمیک قدیمی
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const cols = 8;
      const rows = 16;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // رنگ‌های پالت سگا برای تکسچر
          ctx.fillStyle = (i + j) % 2 === 0 ? "#E07000" : "#FFFFFF";
          ctx.fillText(text, (i / cols) * 1024 + 64, (j / rows) * 1024 + 32);
        }
      }

      // خطوط ضخیم جوهری
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 4;
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
    // فیلتر Nearest برای ظاهر پیکسلی
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

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
      color: 0x000000, // Ink Black core
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    meshGroupRef.current.add(solidMesh);

    const textureMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1, // شفافیت کمتر برای ظاهر کمیک بوکی
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending, // بلندینگ نرمال برای وضوح بیشتر
    });
    const texMesh = new THREE.Mesh(geometry, textureMaterial);
    meshGroupRef.current.add(texMesh);

    const wireframeGeom = new THREE.WireframeGeometry(geometry);
    // خطوط دور مشکی ضخیم (Outline)
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const wireframe = new THREE.LineSegments(wireframeGeom, wireframeMat);
    wireframe.scale.setScalar(1.01);
    meshGroupRef.current.add(wireframe);
  }, [text, shape]);

  return (
    // کانتینر اصلی: "The Void" - میز طراح
    <div className="h-full flex flex-col relative overflow-hidden bg-[#1a051a]">
      {/* پنل کنترل: طراحی شده شبیه به یک پنل کمیک یا منوی اینونتوری سگا */}
      <div className="absolute top-6 left-6 z-20 w-80 animate-in slide-in-from-left duration-500">
        {/* سایه سخت (Hard Shadow) برای عمق دادن */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
          {/* هدر پنل: Narrator Box Style */}
          <div className="bg-[#FFCC00] border-b-4 border-black p-3 flex items-center justify-between">
            <h3 className="text-black font-mono font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Activity size={20} className="stroke-[3]" />
              INVENTORY: SHAPES
            </h3>
            <Settings size={18} className="text-black stroke-[3]" />
          </div>

          <div className="p-4 space-y-5">
            {/* ورودی متن: Speech Bubble Style */}
            <div>
              <label className="text-[10px] text-black font-mono font-bold mb-1 block uppercase tracking-wider">
                DIALOGUE INPUT
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 text-black font-mono text-xs outline-none focus:bg-yellow-50 transition-colors placeholder:text-gray-400"
                  dir="rtl"
                />
                {/* آیکون دست کوچک برای نشان دادن ورودی */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-black">
                  <span className="text-[10px] font-black">✎</span>
                </div>
              </div>
            </div>

            {/* انتخاب شکل: Item Slots Style */}
            <div>
              <label className="text-[10px] text-black font-mono font-bold mb-2 block uppercase tracking-wider">
                SELECT ITEM
              </label>
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
                    className={`group relative flex flex-col items-center justify-center p-2 border-2 border-black transition-all active:translate-y-1 active:shadow-none ${
                      shape === item.id
                        ? "bg-[#E07000] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" // Mutant Orange Active
                        : "bg-white hover:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`mb-1 stroke-[2.5] ${shape === item.id ? "text-white" : "text-black"}`}
                    />
                    {/* افکت هاور: مشت Sketch Turner */}
                    {shape !== item.id && (
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[8px] px-1 font-bold">
                        PICK!
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* اسلایدر سرعت */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-black font-mono font-bold uppercase">ROTATION_SPEED</label>
                <span className="text-[10px] text-[#E07000] font-mono font-black bg-black px-1">
                  {(speed * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-4 bg-gray-200 border-2 border-black appearance-none cursor-pointer accent-[#E07000]"
                style={{
                  backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px)`,
                  backgroundSize: `10px 100%`,
                }}
              />
            </div>

            {/* دکمه اکشن: Action Button Style */}
            <div className="pt-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-full py-3 text-xs font-black font-mono border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 uppercase ${
                  autoRotate
                    ? "bg-[#006000] text-white" // Sewer Sludge (ON)
                    : "bg-[#500050] text-white" // Bruised Purple (OFF)
                }`}
              >
                {autoRotate ? <RefreshCw size={14} className="animate-spin" /> : <Hand size={14} />}
                {autoRotate ? "AUTO_ROTATE: ENGAGED" : "AUTO_ROTATE: HALTED"}
              </button>
            </div>
          </div>
        </div>

        {/* المان تزئینی: پاره شدن کاغذ در پایین پنل */}
        <div
          className="w-full h-4 bg-black mt-1"
          style={{
            clipPath:
              "polygon(0 0, 100% 0, 95% 100%, 85% 10%, 75% 100%, 65% 10%, 55% 100%, 45% 10%, 35% 100%, 25% 10%, 15% 100%, 5% 10%)",
          }}
        ></div>
      </div>

      {/* ناحیه رندر Three.js */}
      <div ref={mountRef} className="w-full h-full cursor-move relative z-10" />

      {/* افکت وینیت (Vignette) برای تمرکز روی مرکز */}
      <div className="absolute inset-0  bg-[radial-gradient(circle_at_center,transparent_20%,#000000_100%)] opacity-60 z-10"></div>

      {/* متن‌های شناور پس‌زمینه (Onomatopoeia) */}
      <div className="absolute bottom-10 right-10 font-black text-6xl text-white/5 rotate-[-10deg]  select-none font-mono z-0">
        DATA...
      </div>
    </div>
  );
};

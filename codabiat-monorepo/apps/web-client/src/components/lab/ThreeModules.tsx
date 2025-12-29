import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const TextOrbModule: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [text, setText] = useState('جهان کلمات می‌چرخد ');
    const sceneRef = useRef<THREE.Scene | null>(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const scene = new THREE.Scene(); sceneRef.current = scene; scene.background = new THREE.Color(0x050505);
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000); camera.position.z = 15;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement); controls.autoRotate = true;
        const createTexture = (txt: string) => {
            const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
            const ctx = canvas.getContext('2d');
            if (ctx) { ctx.fillStyle = '#000'; ctx.fillRect(0,0,1024,512); ctx.font='bold 80px "Vazirmatn"'; ctx.fillStyle='#ff8800'; ctx.textAlign='center'; 
            for(let i=0;i<6;i++) ctx.fillText(txt + " " + txt, 512, (i+1)*85); }
            return new THREE.CanvasTexture(canvas);
        };
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshBasicMaterial({ map: createTexture(text), transparent: true, opacity: 0.9 }));
        scene.add(sphere); sphere.add(new THREE.LineSegments(new THREE.WireframeGeometry(sphere.geometry), new THREE.LineBasicMaterial({ color: 0xff4400, opacity: 0.1, transparent: true })));
        const animate = () => { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
        return () => { if(mountRef.current) mountRef.current.innerHTML = ''; renderer.dispose(); };
    }, [text]);
    return (<div className="h-full flex flex-col relative"><div className="absolute top-4 left-4 z-20 w-64"><input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-black/70 border border-orange-500/30 p-2 text-orange-100 rounded outline-none text-center" dir="rtl" /></div><div ref={mountRef} className="w-full h-full cursor-move" /></div>);
};

export const BlindOwlModule: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x000000, 0.008); scene.background = new THREE.Color(0x000000);
        const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 2000); camera.position.z = 150;
        const renderer = new THREE.WebGLRenderer(); renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true;
        
        const sentences = ["در زندگی زخم‌هایی هست", "که مثل خوره روح را می‌خورد", "بوف کور", "سایه خودم", "خنده خشک", "اثیری"];
        sentences.forEach(txt => {
            const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=128;
            const ctx = canvas.getContext('2d'); if(ctx){ ctx.font='bold 40px "Vazirmatn"'; ctx.fillStyle='#f0f0f0'; ctx.textAlign='center'; ctx.fillText(txt, 256, 64); }
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(30,8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
            mesh.position.set((Math.random()-0.5)*200, (Math.random()-0.5)*100, (Math.random()-0.5)*400);
            mesh.rotation.set(Math.random(), Math.random(), 0);
            scene.add(mesh);
        });
        
        const animate = () => { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }; animate();
        return () => { if(mountRef.current) mountRef.current.innerHTML = ''; renderer.dispose(); };
    }, []);
    return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

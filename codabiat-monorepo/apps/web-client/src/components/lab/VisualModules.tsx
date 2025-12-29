import React, { useState, useEffect, useRef } from 'react';

export const AdvancedKineticModule: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const [text, setText] = useState('رقص کلمات در باد');
    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return;
        const particles: any[] = []; const words = text.split(' ');
        words.forEach(word => particles.push({ text: word, x: Math.random()*800, y: Math.random()*600, vx: 0, vy: 0 }));
        const render = () => {
            ctx.fillStyle = 'rgba(5,5,5,0.1)'; ctx.fillRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => {
                const dx = p.x - mouseRef.current.x; const dy = p.y - mouseRef.current.y; const d = Math.sqrt(dx*dx+dy*dy);
                if(d < 100) { p.vx += dx/d; p.vy += dy/d; }
                p.x += p.vx + (Math.random()-0.5); p.y += p.vy + (Math.random()-0.5); p.vx *= 0.95; p.vy *= 0.95;
                if(p.x<0) p.x=800; if(p.x>800) p.x=0; if(p.y<0) p.y=600; if(p.y>600) p.y=0;
                ctx.fillStyle='#00ffff'; ctx.font='20px "Vazirmatn"'; ctx.fillText(p.text, p.x, p.y);
            });
            requestAnimationFrame(render);
        };
        render();
    }, [text]);
    return <div className="h-full relative"><input type="text" value={text} onChange={e=>setText(e.target.value)} className="absolute top-4 right-4 bg-black/50 text-white border border-cyan-500/50 p-2 z-10" /><canvas ref={canvasRef} width={800} height={600} className="w-full h-full bg-[#050505]" onMouseMove={e=>{const r=canvasRef.current?.getBoundingClientRect(); if(r) mouseRef.current={x:e.clientX-r.left, y:e.clientY-r.top};}} /></div>;
};

export const AlgorithmicCalligraphyModule: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const p5 = (window as any).p5; if (!p5 || !containerRef.current) return;
        const sketch = (p: any) => {
            let particles: any[] = [];
            p.setup = () => { p.createCanvas(containerRef.current?.offsetWidth||600, containerRef.current?.offsetHeight||400); p.background(5); p.colorMode(p.HSB); };
            p.draw = () => {
                if (p.mouseIsPressed) particles.push({x:p.mouseX,y:p.mouseY,life:255,char:String.fromCharCode(0x0600+p.random(255))});
                for(let i=particles.length-1;i>=0;i--){ const pt=particles[i]; pt.life-=2; p.fill(p.frameCount%360,80,100,pt.life/255); p.textSize(24); p.text(pt.char,pt.x,pt.y); if(pt.life<=0) particles.splice(i,1); }
            };
        };
        new p5(sketch, containerRef.current);
        return () => { if(containerRef.current) containerRef.current.innerHTML=''; };
    }, []);
    return <div ref={containerRef} className="w-full h-full" />;
};

export const CyberIslimiModule: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const p5 = (window as any).p5; if (!p5 || !containerRef.current) return;
        const sketch = (p: any) => {
            p.setup = () => { p.createCanvas(containerRef.current?.offsetWidth||600, containerRef.current?.offsetHeight||400); p.angleMode(p.DEGREES); p.background(5); };
            p.draw = () => {
                p.translate(p.width/2, p.height/2);
                if (p.mouseIsPressed) {
                    for (let i = 0; i < 8; i++) { p.rotate(360/8); p.fill(57,255,20); p.textSize(20); p.text("هو", p.mouseX-p.width/2, p.mouseY-p.height/2); p.scale(1,-1); p.text("هو", p.mouseX-p.width/2, p.mouseY-p.height/2); }
                }
            };
        };
        new p5(sketch, containerRef.current);
        return () => { if(containerRef.current) containerRef.current.innerHTML=''; };
    }, []);
    return <div ref={containerRef} className="w-full h-full" />;
};

export const FractalGardenModule: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const p5 = (window as any).p5; if (!p5 || !containerRef.current) return;
        const sketch = (p: any) => {
            p.setup = () => { p.createCanvas(containerRef.current?.offsetWidth||600, containerRef.current?.offsetHeight||400); p.background(5); };
            p.draw = () => {
                p.background(5, 20); p.translate(p.width/2, p.height); p.stroke(50,205,50);
                const branch = (h: number) => { p.line(0,0,0,-h); p.translate(0,-h); if(h>4) { p.push(); p.rotate(p.radians(p.mouseX/5)); branch(h*0.67); p.pop(); p.push(); p.rotate(-p.radians(p.mouseX/5)); branch(h*0.67); p.pop(); } };
                branch(100);
            };
        };
        new p5(sketch, containerRef.current);
        return () => { if(containerRef.current) containerRef.current.innerHTML=''; };
    }, []);
    return <div ref={containerRef} className="w-full h-full" />;
};

export const SemanticClusterModule: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const d3 = (window as any).d3; if (!d3 || !containerRef.current) return;
        const width = containerRef.current.offsetWidth, height = containerRef.current.offsetHeight;
        const nodes = [{id:"عشق"},{id:"آتش"},{id:"سودا"},{id:"خرد"},{id:"دانش"},{id:"دیجیتال"}];
        const links = [{source:"عشق",target:"آتش"},{source:"عشق",target:"سودا"},{source:"خرد",target:"دانش"},{source:"عشق",target:"دیجیتال"}];
        d3.select(containerRef.current).selectAll("*").remove();
        const svg = d3.select(containerRef.current).append("svg").attr("width",width).attr("height",height);
        const sim = d3.forceSimulation(nodes).force("link",d3.forceLink(links).id((d:any)=>d.id).distance(100)).force("charge",d3.forceManyBody().strength(-300)).force("center",d3.forceCenter(width/2,height/2));
        const link = svg.append("g").attr("stroke","#333").selectAll("line").data(links).join("line");
        const node = svg.append("g").attr("fill","#fff").selectAll("circle").data(nodes).join("circle").attr("r",20);
        const text = svg.append("g").selectAll("text").data(nodes).join("text").text((d:any)=>d.id).attr("fill","#000").attr("text-anchor","middle").attr("dy",5).style("font-family","Vazirmatn");
        sim.on("tick",()=>{ link.attr("x1",(d:any)=>d.source.x).attr("y1",(d:any)=>d.source.y).attr("x2",(d:any)=>d.target.x).attr("y2",(d:any)=>d.target.y); node.attr("cx",(d:any)=>d.x).attr("cy",(d:any)=>d.y); text.attr("x",(d:any)=>d.x).attr("y",(d:any)=>d.y); });
    }, []);
    return <div ref={containerRef} className="w-full h-full" />;
};

export const SonificationModule: React.FC = () => {
    const [text, setText] = useState('صدا');
    const play = () => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        text.split('').forEach((c, i) => {
            const osc = ctx.createOscillator(); osc.frequency.value = c.charCodeAt(0) * 2;
            const g = ctx.createGain(); g.gain.value = 0.1;
            osc.connect(g); g.connect(ctx.destination);
            osc.start(ctx.currentTime + i*0.2); osc.stop(ctx.currentTime + i*0.2 + 0.2);
        });
    };
    return <div className="p-6"><input value={text} onChange={e=>setText(e.target.value)} className="bg-black border p-2 text-white" /><button onClick={play} className="bg-violet-600 text-white p-2 ml-2">پخش</button></div>;
};

export const PoetryExcavationModule: React.FC = () => {
    const poem = "در ازل پرتو حسنت ز تجلی دم زد عشق پیدا شد و آتش به همه عالم زد";
    const words = poem.split(' ');
    const [revealed, setRevealed] = useState<boolean[]>(new Array(100).fill(false));
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-[#050505] relative">
             <div className="grid grid-cols-10 gap-1 md:gap-2 max-w-lg mx-auto p-4 bg-white/5 rounded z-10">
                 {Array.from({ length: 100 }).map((_, i) => {
                     const wordIndex = i % (Math.floor(100 / words.length) + 1) === 0 ? Math.floor(i / (100 / words.length)) : -1;
                     const word = words[wordIndex] || "";
                     return (
                         <div key={i} onMouseEnter={() => {const n=[...revealed]; n[i]=true; setRevealed(n);}} className={`w-8 h-8 flex items-center justify-center text-[10px] border ${revealed[i] ? (wordIndex>=0 ? 'bg-pink-600 text-white' : 'opacity-0') : 'bg-[#111] border-white/10 text-transparent cursor-crosshair'}`}>{revealed[i] ? word : ''}</div>
                     );
                 })}
             </div>
        </div>
    );
};

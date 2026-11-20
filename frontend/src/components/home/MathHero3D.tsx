import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCw, Sparkles, Sliders } from 'lucide-react';
import { cn } from '../../utils/cn';

type GeometryType = 'knot' | 'lorenz' | 'harmonic';

export const MathHero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoType, setGeoType] = useState<GeometryType>('knot');
  const [isRotating, setIsRotating] = useState(true);
  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  const currentMeshRef = useRef<THREE.Object3D | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8b7cff, 4, 30);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x38bdf8, 3.5, 30);
    pointLight2.position.set(-5, -4, 4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x34d399, 2.5, 20);
    pointLight3.position.set(0, -6, -2);
    scene.add(pointLight3);

    // 3. Concentric Coordinate Reference Rings
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x8b7cff,
      transparent: true,
      opacity: 0.12,
    });

    const createRing = (radius: number, rotX: number, rotY: number) => {
      const circleGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
      }
      circleGeo.setFromPoints(points);
      const line = new THREE.Line(circleGeo, ringMat);
      line.rotation.x = rotX;
      line.rotation.y = rotY;
      return line;
    };

    ringGroup.add(createRing(3.6, Math.PI / 4, 0));
    ringGroup.add(createRing(4.2, -Math.PI / 3, Math.PI / 6));
    ringGroup.add(createRing(4.8, Math.PI / 6, Math.PI / 3));
    scene.add(ringGroup);

    // 4. Mathematical Geometries Generator
    const createGeometryMesh = (type: GeometryType): THREE.Object3D => {
      if (type === 'knot') {
        // Torus Knot (Topology / Invariant Curves)
        const knotGeo = new THREE.TorusKnotGeometry(1.8, 0.48, 160, 32, 2, 3);
        const knotMat = new THREE.MeshStandardMaterial({
          color: 0x8b7cff,
          emissive: 0x221155,
          roughness: 0.25,
          metalness: 0.85,
          wireframe: false,
        });
        const knotMesh = new THREE.Mesh(knotGeo, knotMat);

        // Glowing Wireframe Overlay
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.18,
        });
        const wireMesh = new THREE.Mesh(knotGeo, wireMat);
        knotMesh.add(wireMesh);
        return knotMesh;
      }

      if (type === 'lorenz') {
        // Lorenz Strange Attractor (Chaos Theory Differential Equations)
        const points: THREE.Vector3[] = [];
        const colors: number[] = [];
        let x = 0.1;
        let y = 0;
        let z = 0;
        const dt = 0.008;
        const a = 10;
        const b = 28;
        const c = 8 / 3;

        const color1 = new THREE.Color(0x8b7cff);
        const color2 = new THREE.Color(0x38bdf8);
        const color3 = new THREE.Color(0x34d399);

        for (let i = 0; i < 4200; i++) {
          const dx = a * (y - x) * dt;
          const dy = (x * (b - z) - y) * dt;
          const dz = (x * y - c * z) * dt;
          x += dx;
          y += dy;
          z += dz;

          // Scale and center attractor
          points.push(new THREE.Vector3(x * 0.11, (z - 25) * 0.11, y * 0.11));

          const t = i / 4200;
          const mixedColor = t < 0.5 ? color1.clone().lerp(color2, t * 2) : color2.clone().lerp(color3, (t - 0.5) * 2);
          colors.push(mixedColor.r, mixedColor.g, mixedColor.b);
        }

        const lorenzGeo = new THREE.BufferGeometry().setFromPoints(points);
        lorenzGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const lorenzMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
          linewidth: 2,
        });

        // Add particle glow nodes along the attractor
        const particleGeo = new THREE.BufferGeometry().setFromPoints(
          points.filter((_, idx) => idx % 6 === 0)
        );
        const particleMat = new THREE.PointsMaterial({
          size: 0.06,
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.7,
        });
        const particlePoints = new THREE.Points(particleGeo, particleMat);

        const group = new THREE.Group();
        group.add(new THREE.Line(lorenzGeo, lorenzMat));
        group.add(particlePoints);
        return group;
      }

      // Spherical Harmonic Wave Function (Quantum Mechanics)
      const harmonicGeo = new THREE.IcosahedronGeometry(2.2, 5);
      const pos = harmonicGeo.attributes.position;
      const originalPos = pos.clone();

      const harmonicMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x112244,
        roughness: 0.3,
        metalness: 0.9,
        wireframe: true,
      });

      const harmonicMesh = new THREE.Mesh(harmonicGeo, harmonicMat);
      harmonicMesh.userData = { originalPos };
      return harmonicMesh;
    };

    let activeMesh = createGeometryMesh(geoType);
    scene.add(activeMesh);
    currentMeshRef.current = activeMesh;

    // 5. Mouse Interaction & Inertia
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      } else {
        mouseX = normX * 0.45;
        mouseY = normY * 0.45;
      }

      // Move point lights dynamically with cursor
      pointLight1.position.x = normX * 6;
      pointLight1.position.y = normY * 6 + 2;
    };

    const handlePointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);

    // 6. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth inertia lerp towards mouse target
      if (currentMeshRef.current) {
        if (isRotatingRef.current && !isDragging) {
          targetRotationY += 0.006;
          targetRotationX += 0.002;
        }

        currentMeshRef.current.rotation.y += (targetRotationY + mouseX - currentMeshRef.current.rotation.y) * 0.08;
        currentMeshRef.current.rotation.x += (targetRotationX + mouseY - currentMeshRef.current.rotation.x) * 0.08;

        // Dynamic vertex perturbation for Spherical Harmonic geometry
        if (geoType === 'harmonic' && currentMeshRef.current instanceof THREE.Mesh) {
          const mesh = currentMeshRef.current;
          const pos = mesh.geometry.attributes.position;
          const orig = mesh.userData.originalPos;
          if (orig) {
            for (let i = 0; i < pos.count; i++) {
              const u = orig.getX(i);
              const v = orig.getY(i);
              const w = orig.getZ(i);
              const wave = Math.sin(elapsedTime * 2.5 + u * 3 + v * 3) * 0.18;
              pos.setXYZ(i, u * (1 + wave), v * (1 + wave), w * (1 + wave));
            }
            pos.needsUpdate = true;
          }
        }
      }

      // Slowly rotate reference coordinate rings
      ringGroup.rotation.z = elapsedTime * 0.05;
      ringGroup.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('resize', handleResize);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [geoType]);

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] flex items-center justify-center select-none">
      {/* Three.js WebGL canvas mounts here */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative z-10"
        title="Click and drag to rotate mathematical manifold"
      />

      {/* Floating 3D Geometric Preset Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#10141D]/90 border border-[#252D3B] backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-1.5 mr-2 pr-2 border-r border-[#252D3B]/70 text-[11px] font-mono text-[#8B7CFF] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="hidden sm:inline">3D Manifold:</span>
        </div>

        <button
          onClick={() => setGeoType('knot')}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all',
            geoType === 'knot'
              ? 'bg-[#8B7CFF] text-white shadow-glow-accent'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          )}
        >
          Torus Knot
        </button>

        <button
          onClick={() => setGeoType('lorenz')}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all',
            geoType === 'lorenz'
              ? 'bg-[#38BDF8] text-[#090B10] font-bold shadow-glow-cyan'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          )}
        >
          Lorenz Chaos
        </button>

        <button
          onClick={() => setGeoType('harmonic')}
          className={cn(
            'px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all',
            geoType === 'harmonic'
              ? 'bg-[#34D399] text-[#090B10] font-bold shadow-glow-emerald'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          )}
        >
          Harmonic Wave
        </button>

        <button
          onClick={() => setIsRotating(!isRotating)}
          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] transition-colors ml-1"
          title={isRotating ? 'Pause Continuous Rotation' : 'Resume Continuous Rotation'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5 text-[#8B7CFF]" /> : <Play className="w-3.5 h-3.5 text-[#38BDF8]" />}
        </button>
      </div>

      {/* Subtle guide text */}
      <div className="absolute top-4 right-6 z-20 text-[10px] font-mono text-[#64748B] hidden md:block">
        DRAG TO ROTATE 3D MANIFOLD • WEBGL PARAMETRIC GEOMETRY
      </div>
    </div>
  );
};

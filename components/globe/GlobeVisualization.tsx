"use client";

import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { latLonToVec3, GCC_CITIES } from "@/lib/globe-utils";

const GLOBE_RADIUS = 2;

// High-Performance Data Streaming Arcs
const GLOBAL_HUBS = [
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
  { name: "Shanghai", lat: 31.2304, lon: 121.4737 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
];

/**
 * Animated Data Arcs flying out from Riyadh.
 * Simulates high-speed global transactional intelligence.
 */
const DataArc = ({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  const points = useMemo(() => {
    // Generate a quadratic bezier curve to lift the arc above the sphere
    const mid = start.clone().lerp(end, 0.5).normalize().multiplyScalar(GLOBE_RADIUS * 1.5);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(50);
  }, [start, end]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      // Marching ants animation using dashOffset
      const t = clock.getElapsedTime();
      (material as any).dashOffset = -t * 0.5;
    }
  });

  return (
    <line ref={lineRef as any}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineDashedMaterial 
        color="#10B981" 
        transparent 
        opacity={0.4} 
        dashSize={0.05} 
        gapSize={0.05} 
      />
    </line>
  );
};

const Earth = () => {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch("/world-countries.json")
      .then(res => res.ok ? res.json() : null)
      .then(data => setGeoData(data))
      .catch(() => console.warn("Asset Missing: Place world-countries.json in /public"));
  }, []);

  const gccLines = useMemo(() => {
    if (!geoData) return [];
    return geoData.features
      .filter((f: any) => ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Oman", "Bahrain"].includes(f.properties.name))
      .map((feature: any) => {
        const lines: THREE.Vector3[][] = [];
        const process = (coords: any) => {
           lines.push(coords.map((c: any) => latLonToVec3(c[1], c[0], GLOBE_RADIUS * 1.002)));
        };
        if (feature.geometry.type === "Polygon") feature.geometry.coordinates.forEach(process);
        else if (feature.geometry.type === "MultiPolygon") feature.geometry.coordinates.forEach((p: any) => p.forEach(process));
        return lines;
      }).flat();
  }, [geoData]);

  return (
    <group>
      {/* Absolute Dark Institutional Base */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#0F172A" roughness={1} metalness={0} />
      </mesh>

      {/* GCC Emissive Highlight Zone */}
      {gccLines.map((line: THREE.Vector3[], i: number) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(line.flatMap((v: THREE.Vector3) => [v.x, v.y, v.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#10B981" linewidth={2} transparent opacity={0.6} />
        </line>
      ))}
    </group>
  );
};

const GlobeScene = () => {
  const riyadhPos = useMemo(() => latLonToVec3(24.7136, 46.6753, GLOBE_RADIUS), []);
  const hubPositions = useMemo(() => GLOBAL_HUBS.map(h => latLonToVec3(h.lat, h.lon, GLOBE_RADIUS)), []);

  return (
    <Suspense fallback={null}>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={35} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#F8FAFC" />
      
      <group rotation={[0.4, 0, 0]}>
        <Earth />
        {hubPositions.map((hub, i) => (
          <DataArc key={i} start={riyadhPos} end={hub} />
        ))}
        {/* Institutional Node Markers */}
        {GCC_CITIES.map((city, i) => (
          <group key={i} position={latLonToVec3(city.lat, city.lon, GLOBE_RADIUS * 1.05)}>
            <mesh>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color={city.primary ? "#F59E0B" : "#10B981"} />
            </mesh>
            <Html distanceFactor={10} zIndexRange={[100, 0]} pointerEvents="none">
              <div className="bg-[#020617] border border-[#334155] px-2 py-1 flex items-center gap-2 whitespace-nowrap">
                <div className={`w-1 h-1 rounded-full ${city.primary ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
                <span className="text-[#F8FAFC] font-mono text-[8px] uppercase tracking-tighter">
                  {city.name} — {city.index}
                </span>
              </div>
            </Html>
          </group>
        ))}
      </group>

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.5}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
      />
    </Suspense>
  );
};

const GlobeVisualization = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#020617]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <GlobeScene />
      </Canvas>
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-20 hidden md:block">
        <p className="text-[#64748B] text-[8px] font-mono uppercase tracking-[0.4em]">
          DATA_STREAMING_NODE_v8.0
        </p>
      </div>
    </div>
  );
};

export default GlobeVisualization;

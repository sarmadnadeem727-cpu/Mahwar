"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { latLonToVec3, GCC_CITIES } from "@/lib/globe-utils";

const GLOBE_RADIUS = 2;
const DOT_SPACING = 3; // Increased density for better highlighting visualization

const GlobeDots = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const cols: number[] = [];
    const colorEmerald = new THREE.Color("#10B981");
    const colorGold = new THREE.Color("#F59E0B");
    const colorBase = new THREE.Color("#1E293B");

    for (let lat = -90; lat <= 90; lat += DOT_SPACING) {
      for (let lon = -180; lon <= 180; lon += DOT_SPACING) {
        const v = latLonToVec3(lat, lon, GLOBE_RADIUS);
        pos.push(v.x, v.y, v.z);

        // Precise GCC Boundaries Masking
        const isKSA = lat >= 16 && lat <= 32.5 && lon >= 34.5 && lon <= 55.5;
        const isUAE = lat >= 22.5 && lat <= 26 && lon >= 51.5 && lon <= 56.5;
        const isQatar = lat >= 24.5 && lat <= 26.5 && lon >= 50.5 && lon <= 51.5;
        const isKuwait = lat >= 28.5 && lat <= 30.1 && lon >= 46.5 && lon <= 48.5;
        const isOman = (lat >= 16.5 && lat <= 26.5 && lon >= 52 && lon <= 60) || (lat >= 23 && lat <= 27 && lon >= 56 && lon <= 57);
        const isBahrain = lat >= 25.5 && lat <= 26.5 && lon >= 50.3 && lon <= 50.8;

        if (isKSA) {
          cols.push(colorGold.r, colorGold.g, colorGold.b);
        } else if (isUAE || isQatar || isKuwait || isOman || isBahrain) {
          cols.push(colorEmerald.r, colorEmerald.g, colorEmerald.b);
        } else {
          cols.push(colorBase.r, colorBase.g, colorBase.b);
        }
      }
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(cols) };
  }, []);

  // Performance: Slower, subtle rotation only
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.02 * delta;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} vertexColors transparent opacity={0.6} sizeAttenuation={true} />
    </points>
  );
};

const CityMarker = ({ name, lat, lon, primary, index }: (typeof GCC_CITIES)[0]) => {
  const pos = useMemo(() => latLonToVec3(lat, lon, GLOBE_RADIUS * 1.02), [lat, lon]);

  return (
    <group position={pos}>
      {/* Static Point */}
      <mesh>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color={primary ? "#F59E0B" : "#10B981"} />
      </mesh>
      
      {/* High-Contrast HTML Label */}
      <Html distanceFactor={8} zIndexRange={[100, 0]}>
        <div className="flex flex-col items-start gap-1 whitespace-nowrap pointer-events-none">
          <div className="bg-[#0F172A] border border-[#334155] px-2 py-1 rounded shadow-lg">
            <span className="text-[#F8FAFC] font-mono text-[10px] font-bold tracking-wider uppercase">
              {name}
            </span>
            <span className="text-[#94A3B8] font-mono text-[8px] ml-2 font-semibold">
              {index}
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
};

const ConnectionArc = ({ start, end }: { start: (typeof GCC_CITIES)[0]; end: (typeof GCC_CITIES)[0] }) => {
  const { points } = useMemo(() => {
    const v1 = latLonToVec3(start.lat, start.lon, GLOBE_RADIUS);
    const v2 = latLonToVec3(end.lat, end.lon, GLOBE_RADIUS);
    const mid = v1.clone().lerp(v2, 0.5).normalize().multiplyScalar(GLOBE_RADIUS * 1.3);
    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    return { points: curve.getPoints(50) };
  }, [start, end]);

  return (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        attach="material"
        color="#334155"
        transparent
        opacity={0.2}
      />
    </line>
  );
};

const GlobeScene = () => {
  const riyadh = GCC_CITIES.find(c => c.primary)!;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <group rotation={[0.4, -0.6, 0]}>
        <GlobeDots />
        {GCC_CITIES.map((city, i) => (
          <React.Fragment key={i}>
            <CityMarker {...city} />
            {!city.primary && (
              <ConnectionArc start={riyadh} end={city} />
            )}
          </React.Fragment>
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        rotateSpeed={0.5}
      />
    </>
  );
};

const GlobeVisualization = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <GlobeScene />
      </Canvas>
    </div>
  );
};

export default GlobeVisualization;


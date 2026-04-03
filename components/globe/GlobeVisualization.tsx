"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { latLonToVec3, GCC_CITIES } from "@/lib/globe-utils";

const GLOBE_RADIUS = 2;
const DOT_SPACING = 3;

const GlobeDots = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos: number[] = [];
    const cols: number[] = [];
    const colorGold = new THREE.Color("#C9A84C");
    const colorDim = new THREE.Color("#E2E8F0");

    for (let lat = -90; lat <= 90; lat += DOT_SPACING) {
      for (let lon = -180; lon <= 180; lon += DOT_SPACING) {
        const v = latLonToVec3(lat, lon, GLOBE_RADIUS);
        pos.push(v.x, v.y, v.z);

        // KSA Highlight
        const isKSA = lat >= 15 && lat <= 32 && lon >= 36 && lon <= 54;
        const isGCC = lat >= 13 && lat <= 35 && lon >= 34 && lon <= 60;

        if (isKSA) {
          cols.push(colorGold.r, colorGold.g, colorGold.b);
        } else if (isGCC) {
          const mix = colorGold.clone().lerp(colorDim, 0.6);
          cols.push(mix.r, mix.g, mix.b);
        } else {
          cols.push(colorDim.r, colorDim.g, colorDim.b);
        }
      }
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(cols) };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.05 * delta;
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
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} vertexColors transparent opacity={0.8} />
    </points>
  );
};

const CityMarker = ({ lat, lon, primary }: { lat: number; lon: number; primary: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLonToVec3(lat, lon, GLOBE_RADIUS * 1.01), [lat, lon]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.2;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <mesh position={pos} ref={meshRef}>
      <ringGeometry args={[0.01, primary ? 0.04 : 0.03, 32]} />
      <meshBasicMaterial
        color={primary ? "#C9A84C" : "#1DB87A"}
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const ConnectionArc = ({ start, end }: { start: { lat: number; lon: number }; end: { lat: number; lon: number } }) => {
  const lineRef = useRef<THREE.Line>(null);
  
  const curve = useMemo(() => {
    const v1 = latLonToVec3(start.lat, start.lon, GLOBE_RADIUS);
    const v2 = latLonToVec3(end.lat, end.lon, GLOBE_RADIUS);
    
    // Calculate mid point with altitude
    const mid = v1.clone().lerp(v2, 0.5).normalize().multiplyScalar(GLOBE_RADIUS * 1.5);
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      // @ts-expect-error - lineDashedMaterial dashOffset is valid but typing can be tricky
      lineRef.current.material.dashOffset = -clock.getElapsedTime() * 0.5;
    }
  });

  return (
    // @ts-expect-error - <line> is also an SVG element, conflict in JSX types
    <line ref={lineRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineDashedMaterial
        attach="material"
        color="#C9A84C"
        dashSize={0.05}
        gapSize={0.05}
        transparent
        opacity={0.3}
      />
    </line>
  );
};

const GlobeScene = () => {
  const riyadh = GCC_CITIES.find(c => c.primary)!;

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {/* Stars removed for light theme */}
      
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

      {/* Atmosphere Glow */}
      <mesh scale={1.18}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#C9A84C"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

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
    <div className="absolute inset-0 w-full h-full pointer-events-none lg:pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <GlobeScene />
      </Canvas>
    </div>
  );
};

export default GlobeVisualization;

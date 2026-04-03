import * as THREE from 'three';

export function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

export const GCC_CITIES = [
  { name: "Riyadh", lat: 24.7136, lon: 46.6753, primary: true },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, primary: false },
  { name: "Doha", lat: 25.2854, lon: 51.5310, primary: false },
  { name: "Kuwait City", lat: 29.3759, lon: 47.9774, primary: false },
  { name: "Manama", lat: 26.2285, lon: 50.5860, primary: false },
  { name: "Muscat", lat: 23.5859, lon: 58.4059, primary: false },
];

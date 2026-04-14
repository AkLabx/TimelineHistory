import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Node3DData } from '../../utils/spatialAggregator';
import { motion } from 'framer-motion';

interface Node3DProps { node: Node3DData; onClick: (id: string) => void; isExpanded: boolean; isActive: boolean; }
export const Node3D: React.FC<Node3DProps> = ({ node, onClick, isExpanded, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.position.y = node.y + Math.sin(state.clock.elapsedTime + node.x) * 0.5;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.rotation.x += 0.005;
    }
  });
  let color = '#4F46E5'; let scale = 3; let geometry: any = new THREE.SphereGeometry(1, 32, 32);
  if (node.type === 'dynasty') { color = '#D97706'; scale = 2; geometry = new THREE.DodecahedronGeometry(1); }
  else if (node.type === 'king') { color = '#10B981'; scale = 1.5; geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5); }
  if (hovered || isActive) { scale *= 1.2; color = new THREE.Color(color).lerp(new THREE.Color('white'), 0.3).getStyle(); }
  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh ref={meshRef} geometry={geometry} scale={scale} onClick={(e) => { e.stopPropagation(); onClick(node.id); }} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.8 : (hovered ? 0.5 : 0.2)} roughness={0.2} metalness={0.8} />
      </mesh>
      <Html distanceFactor={100} zIndexRange={[100, 0]} transform>
         <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-2xl pointer-events-none ${isActive ? 'bg-white/90 text-slate-900' : 'bg-slate-900/80 text-white'} flex flex-col items-center justify-center min-w-[120px] text-center`} style={{ transform: 'translate3d(-50%, -150%, 0)' }}>
            <h3 className="text-lg font-bold truncate max-w-[200px] font-hindi">{node.title}</h3>
            {node.title_en && <p className="text-xs opacity-80">{node.title_en}</p>}
            <p className="text-xs font-mono mt-1 text-amber-300">{node.period}</p>
            {isExpanded && node.children.length > 0 && <div className="mt-1 text-[10px] uppercase tracking-widest opacity-60">{node.children.length} connected</div>}
         </motion.div>
      </Html>
    </group>
  );
};

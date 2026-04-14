import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export const Thread3D: React.FC<{startPos: [number, number, number], endPos: [number, number, number], color?: string, isActive?: boolean}> = ({ startPos, endPos, color = '#64748b', isActive = false }) => {
    const curve = useMemo(() => {
        const vStart = new THREE.Vector3(...startPos);
        const vEnd = new THREE.Vector3(...endPos);
        const midPoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
        const distance = vStart.distanceTo(vEnd);
        const controlPoint = midPoint.clone();
        controlPoint.z += distance * 0.2;
        controlPoint.x += (vStart.x > vEnd.x ? 1 : -1) * distance * 0.1;
        const path = new THREE.QuadraticBezierCurve3(vStart, controlPoint, vEnd);
        return path.getPoints(50);
    }, [startPos, endPos]);
    return <Line points={curve} color={isActive ? '#F59E0B' : color} lineWidth={isActive ? 3 : 1} transparent opacity={isActive ? 0.8 : 0.3} />;
};

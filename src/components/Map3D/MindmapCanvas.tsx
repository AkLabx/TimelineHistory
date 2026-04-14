import React, { useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { buildSpatialGraph, Node3DData } from '../../utils/spatialAggregator';
import { Node3D } from './Node3D';
import { Thread3D } from './Thread3D';

const CameraController = ({ selectedId, nodes }: { selectedId: string | null, nodes: Record<string, Node3DData> }) => {
    const { camera, controls } = useThree();
    useEffect(() => {
        if (selectedId && nodes[selectedId] && controls) {
            const node = nodes[selectedId];
            const targetPos = new THREE.Vector3(node.x, node.y, node.z);
            const cameraPos = new THREE.Vector3(node.x, node.y + 20, node.z + 100);
            camera.position.lerp(cameraPos, 1);
            (controls as any).target.copy(targetPos);
            (controls as any).update();
        }
    }, [selectedId, nodes, camera, controls]);
    return <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxDistance={1000} minDistance={10} zoomSpeed={0.5} />;
};

export const MindmapCanvas: React.FC<{onNodeSelect: (id: string | null) => void}> = ({ onNodeSelect }) => {
    const [graph, setGraph] = useState<{ nodes: Record<string, Node3DData>, eras: string[] } | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    useEffect(() => {
        const data = buildSpatialGraph();
        setGraph(data);
        if (data.eras.length > 0) setExpandedNodes(new Set([data.eras[0]]));
    }, []);
    const handleNodeClick = (id: string) => {
        setActiveNodeId(id);
        onNodeSelect(id);
        setExpandedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else {
                next.add(id);
                if (graph?.nodes[id]?.parentId) next.add(graph.nodes[id].parentId!);
            }
            return next;
        });
    };
    if (!graph) return null;
    const visibleNodes = new Set<string>();
    const edges: Array<{ source: string, target: string }> = [];
    graph.eras.forEach(eraId => {
        visibleNodes.add(eraId);
        if (expandedNodes.has(eraId)) {
            const era = graph.nodes[eraId];
            era.children.forEach(dynastyId => {
                if (graph.nodes[dynastyId]) {
                    visibleNodes.add(dynastyId);
                    edges.push({ source: eraId, target: dynastyId });
                    if (expandedNodes.has(dynastyId)) {
                        const dynasty = graph.nodes[dynastyId];
                        dynasty.children.forEach(kingId => {
                            if (graph.nodes[kingId]) {
                                visibleNodes.add(kingId);
                                edges.push({ source: dynastyId, target: kingId });
                            }
                        });
                    }
                }
            });
        }
    });
    return (
        <Canvas className="w-full h-full bg-slate-950">
            <ambientLight intensity={0.5} />
            <pointLight position={[100, 100, 100]} intensity={1} />
            <spotLight position={[0, 0, 500]} angle={0.3} penumbra={1} intensity={2} color="#818cf8" />
            <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <PerspectiveCamera makeDefault position={[0, 50, 300]} fov={60} />
            <CameraController selectedId={activeNodeId} nodes={graph.nodes} />
            {Array.from(visibleNodes).map(nodeId => (
                <Node3D key={nodeId} node={graph.nodes[nodeId]} isExpanded={expandedNodes.has(nodeId)} isActive={activeNodeId === nodeId} onClick={handleNodeClick} />
            ))}
            {edges.map(({ source, target }) => {
                const sNode = graph.nodes[source];
                const tNode = graph.nodes[target];
                const isActiveEdge = activeNodeId === target || activeNodeId === source;
                return <Thread3D key={`${source}-${target}`} startPos={[sNode.x, sNode.y, sNode.z]} endPos={[tNode.x, tNode.y, tNode.z]} isActive={isActiveEdge} />;
            })}
        </Canvas>
    );
};

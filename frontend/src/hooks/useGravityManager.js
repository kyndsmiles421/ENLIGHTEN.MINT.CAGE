import { useCallback, useMemo } from 'react';

export function useGravityManager(gravityNodes, activeSatPositions) {
  const nodePositions = useMemo(() => {
    if (!gravityNodes?.length) return [];
    const count = gravityNodes.length;
    return gravityNodes.map((node, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = 3.5 + (node.gravity_mass / 100) * 1.5;
      return {
        ...node,
        x3d: Math.cos(angle) * r,
        z3d: Math.sin(angle) * r,
        y3d: -(node.gravity_mass / 100) * 2.5,
      };
    });
  }, [gravityNodes]);

  const meshNodes = useMemo(() => {
    const nodes = [];
    nodePositions.forEach(n => {
      nodes.push({ x: n.x3d, z: n.z3d, mass: n.gravity_mass / 100, color: getCategoryColor(n.category) });
    });
    if (activeSatPositions?.length) {
      activeSatPositions.forEach(sat => {
        const nx = (sat.x / 310) * 5;
        const nz = (sat.y / 310) * 5;
        nodes.push({ x: nx, z: nz, mass: 0.3, color: sat.color || '#A78BFA' });
      });
    }
    return nodes;
  }, [nodePositions, activeSatPositions]);

  const calculateDamping = useCallback((posX, posY) => {
    if (!nodePositions.length) return 20;
    let influence = 0;
    const nx = (posX / 310) * 5;
    const ny = (posY / 310) * 5;
    for (const node of nodePositions) {
      const dx = nx - node.x3d;
      const dy = ny - node.z3d;
      const dist = Math.sqrt(dx * dx + dy * dy);
      influence += (node.gravity_mass / 100) / (dist + 0.5);
    }
    return 20 + influence * 15;
  }, [nodePositions]);

  const calculateStiffness = useCallback((posX, posY) => {
    if (!nodePositions.length) return 60;
    let influence = 0;
    const nx = (posX / 310) * 5;
    const ny = (posY / 310) * 5;
    for (const node of nodePositions) {
      const dx = nx - node.x3d;
      const dy = ny - node.z3d;
      const dist = Math.sqrt(dx * dx + dy * dy);
      influence += (node.gravity_mass / 100) / (dist + 0.5);
    }
    return Math.max(20, 60 - influence * 10);
  }, [nodePositions]);

  return { meshNodes, nodePositions, calculateDamping, calculateStiffness };
}

function getCategoryColor(cat) {
  const map = {
    vedic: '#F59E0B',
    hermetic: '#A78BFA',
    egyptian: '#FBBF24',
    hopi: '#2DD4BF',
    sacred_geometry: '#C084FC',
    star_chart: '#60A5FA',
    frequency: '#EC4899',
  };
  return map[cat] || '#818CF8';
}

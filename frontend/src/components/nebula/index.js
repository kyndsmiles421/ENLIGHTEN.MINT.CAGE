/**
 * Nebula Components — Three.js Visualization Tier
 * 
 * "Zen Garden in the Void" — Premium 3D experience for the Enlightenment Cafe
 * 
 * Components:
 * - Scene: Main Three.js canvas with fog, lighting, and environment
 * - Islands: Crystal wellness modules in pentagon formation
 * - NebulaViewToggle: "Ascend to Nebula" tier transition button
 */

export { default as Scene } from './Scene';
export { NebulaScene } from './Scene';
export { default as Islands, ISLAND_CONFIG, getPentagonPosition, PENTAGON_RADIUS } from './Islands';
export { default as NebulaViewToggle } from './NebulaViewToggle';

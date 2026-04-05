/**
 * SHAMBHALA CORE: GRAVITATIONAL PULL
 * Logic: Central Gravity (G=0.15) + Module Front-Facing Focus
 * 
 * Mathematical Model:
 * - Central attractor at origin (0,0)
 * - Gravitational constant G=0.15
 * - Z-Index inversely proportional to distance (closer = higher)
 * - Scale increases as modules approach center (Event Horizon effect)
 */

const ShambhalaGravity = (() => {
  const CENTER = { x: 0, y: 0 };
  const G = 0.15; // Gravitational Constant
  
  // Tracked modules in the gravitational field
  let modules = [];
  
  return {
    G,
    CENTER,
    
    /**
     * Register a module in the gravitational field
     * @param {Object} module - { id, x, y, vx, vy, zIndex, scale }
     */
    register(module) {
      if (!module.id) module.id = `mod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      if (module.vx === undefined) module.vx = 0;
      if (module.vy === undefined) module.vy = 0;
      if (module.zIndex === undefined) module.zIndex = 1;
      if (module.scale === undefined) module.scale = 1;
      modules.push(module);
      return module;
    },
    
    /**
     * Remove a module from the gravitational field
     */
    unregister(moduleId) {
      modules = modules.filter(m => m.id !== moduleId);
    },
    
    /**
     * Pulls selected widget into the "Event Horizon"
     * @param {Object} module - The module to pull
     */
    pullToFront(module) {
      const dx = CENTER.x - module.x;
      const dy = CENTER.y - module.y;
      
      // Central Gravitational Field
      module.vx += dx * G;
      module.vy += dy * G;
      
      // Z-Index Scaling: Bringing it to 'Front' as it approaches center
      const dist = Math.sqrt(dx * dx + dy * dy);
      module.zIndex = Math.floor(1000 / (dist + 1));
      module.scale = 1 + (1 / (dist + 0.1));
      
      return module;
    },
    
    /**
     * Apply gravitational force to a module without full pull
     * Gentler effect for ambient attraction
     */
    applyGravity(module, strength = G) {
      const dx = CENTER.x - module.x;
      const dy = CENTER.y - module.y;
      
      module.vx += dx * strength;
      module.vy += dy * strength;
      
      // Update position
      module.x += module.vx;
      module.y += module.vy;
      
      // Apply damping
      module.vx *= 0.95;
      module.vy *= 0.95;
      
      // Calculate focus metrics
      const dist = Math.sqrt(dx * dx + dy * dy);
      module.zIndex = Math.floor(1000 / (dist + 1));
      module.scale = 1 + (1 / (dist + 0.1));
      
      return module;
    },
    
    /**
     * Update all registered modules
     */
    tick() {
      modules.forEach(module => {
        this.applyGravity(module);
      });
      return modules;
    },
    
    /**
     * Get all modules sorted by z-index (front to back)
     */
    getSortedModules() {
      return [...modules].sort((a, b) => b.zIndex - a.zIndex);
    },
    
    /**
     * Get the module closest to center (highest focus)
     */
    getFocusedModule() {
      if (modules.length === 0) return null;
      return modules.reduce((closest, mod) => {
        const distA = Math.sqrt(closest.x ** 2 + closest.y ** 2);
        const distB = Math.sqrt(mod.x ** 2 + mod.y ** 2);
        return distB < distA ? mod : closest;
      }, modules[0]);
    },
    
    /**
     * Eject a module from the center (reverse gravity)
     */
    eject(module, force = 5) {
      const dx = module.x - CENTER.x;
      const dy = module.y - CENTER.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      module.vx += (dx / dist) * force;
      module.vy += (dy / dist) * force;
      
      return module;
    },
    
    /**
     * Reset all modules to default positions
     */
    reset() {
      modules = [];
    },
    
    /**
     * Get current module count
     */
    getCount() {
      return modules.length;
    }
  };
})();

// Expose globally
if (typeof window !== 'undefined') {
  window.ShambhalaGravity = ShambhalaGravity;
}

export default ShambhalaGravity;

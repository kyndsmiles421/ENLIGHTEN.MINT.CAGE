/**
 * @module ENLIGHTEN_MINT_CAFE_FRONTEND
 * @version 5.0.0
 * @security RAINBOW_REFRACTION_ZF
 * @author Steven (Creator Council)
 */

const OMNI_CORE = {
    phi: 1.618,
    root2: 1.414,
    fixedPoint: 1.0,
    zfConstant: "Z * F" // Encryption Frequency
};

class UniversalWeaveInterface {
    constructor(canvasId = 'weave-canvas') {
        this.canvasId = canvasId;
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.animationId = null;
        this.initialized = false;
    }

    /**
     * Initializes the Global Neural Mesh (Background)
     */
    init() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.warn('[UniversalWeaveInterface] Canvas not found:', this.canvasId);
            return this;
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.generateNodules();
        this.animate();
        this.initialized = true;
        console.log('[UniversalWeaveInterface] Initialized with 26 nodules');
        return this;
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Creates the 26 Dynamic Nodules
     */
    generateNodules() {
        this.nodes = [];
        for (let i = 0; i < 26; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * OMNI_CORE.phi,
                vy: (Math.random() - 0.5) * OMNI_CORE.phi,
                radius: Math.random() * 2 + 1,
                hue: (i / 26) * 360 // Rainbow spectrum distribution
            });
        }
    }

    /**
     * Draws the Rainbow Refraction & Intermingled Connections
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections between nearby nodules
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    const opacity = (1 - distance / 200) * 0.3;
                    const hue = (this.nodes[i].hue + this.nodes[j].hue) / 2;
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${opacity})`;
                    this.ctx.lineWidth = OMNI_CORE.fixedPoint;
                    this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw nodules with rainbow refraction
        for (const node of this.nodes) {
            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 4
            );
            gradient.addColorStop(0, `hsla(${node.hue}, 80%, 70%, 0.8)`);
            gradient.addColorStop(0.5, `hsla(${node.hue}, 70%, 50%, 0.3)`);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
            this.ctx.fill();

            // Core nodule
            this.ctx.beginPath();
            this.ctx.fillStyle = `hsla(${node.hue}, 90%, 80%, 0.9)`;
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Updates nodule positions with PHI-based physics
     */
    update() {
        for (const node of this.nodes) {
            node.x += node.vx;
            node.y += node.vy;

            // Boundary reflection with PHI dampening
            if (node.x < 0 || node.x > this.canvas.width) {
                node.vx *= -OMNI_CORE.fixedPoint;
                node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            }
            if (node.y < 0 || node.y > this.canvas.height) {
                node.vy *= -OMNI_CORE.fixedPoint;
                node.y = Math.max(0, Math.min(this.canvas.height, node.y));
            }

            // Gradual hue shift for rainbow cycling
            node.hue = (node.hue + 0.1) % 360;
        }
    }

    /**
     * Animation loop
     */
    animate() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Stop animation
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('[UniversalWeaveInterface] Animation stopped');
        }
    }

    /**
     * Restart animation
     */
    restart() {
        this.stop();
        this.generateNodules();
        this.animate();
        console.log('[UniversalWeaveInterface] Animation restarted');
    }

    /**
     * Get current state
     */
    getState() {
        return {
            initialized: this.initialized,
            nodeCount: this.nodes.length,
            canvasSize: this.canvas ? { w: this.canvas.width, h: this.canvas.height } : null,
            omniCore: { ...OMNI_CORE }
        };
    }
}

// Factory function for React integration
export function createWeaveInterface(canvasId = 'weave-canvas') {
    return new UniversalWeaveInterface(canvasId);
}

export { UniversalWeaveInterface, OMNI_CORE };
export default UniversalWeaveInterface;

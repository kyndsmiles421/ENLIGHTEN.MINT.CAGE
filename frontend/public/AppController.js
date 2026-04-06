/**
 * THE CRYSTALLINE WEB - ENLIGHTEN.MINT.CAFE CORE
 * A self-healing, resonance-based architecture.
 */

const ResonanceEngine = {
    // 1. THE SOURCE: Define your "Frequencies" (Actions) here once.
    frequencies: {
        'nav_toggle': () => document.querySelector('.orbital-nav')?.classList.toggle('active'),
        'shield_active': () => document.body.classList.toggle('silence-shield'),
        'seed_harvest': (el) => {
            el.classList.add('harvested');
            console.log("✨ Resonance Harvested at Point:", el.dataset.pointId || 'Unknown');
        },
        'wellness_sync': () => console.log("🌱 Wellness Hub Synchronized."),
        'quick_reset': () => window.dispatchEvent(new CustomEvent('QUICK_RESET')),
        'start_meditation': () => window.dispatchEvent(new CustomEvent('START_MEDITATION')),
        'open_oracle': () => window.dispatchEvent(new CustomEvent('OPEN_ORACLE')),
        'sign_in': () => window.location.href = '/auth',
        'begin_journey': () => window.location.href = '/auth',
        'watch_intro': () => window.location.href = '/intro',
        'default': (action) => console.warn(`⚠️ Frequency "${action}" not tuned in the Web yet.`)
    },

    // 2. THE WEB: The automatic listener that feels every "touch"
    ignite() {
        console.log("%c[Crystalline Web]: Online & Resonating", "color: #7df9ff; font-weight: bold;");
        
        // Fix background interference immediately
        this.stabilizeAtmosphere();

        window.addEventListener('click', (e) => {
            // Find the closest "Point" in the web
            const point = e.target.closest('[data-action]');
            if (!point) return;

            const action = point.dataset.action;
            
            // Visual Resonance (Feedback)
            this.pulse(point);

            // Execute the frequency
            if (this.frequencies[action]) {
                this.frequencies[action](point);
            } else {
                this.frequencies['default'](action);
            }
        });
    },

    // 3. ATMOSPHERE: Automatically ensures background layers don't block buttons
    stabilizeAtmosphere() {
        const layers = ['.aurora', '.background-layer', '#bg-canvas', '.glass-overlay', '.aurora-bg', '.breathing-orb-container'];
        layers.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.pointerEvents = 'none';
        });
        console.log("%c[Atmosphere]: Stabilized", "color: #00ffcc");
    },

    // 4. PULSE: Visual confirmation that the web is alive
    pulse(el) {
        el.style.transition = 'all 0.2s ease';
        el.style.filter = 'brightness(1.5) drop-shadow(0 0 10px #7df9ff)';
        setTimeout(() => el.style.filter = '', 200);
    }
};

// Ignite the Web when the DOM is ready
document.addEventListener('DOMContentLoaded', () => ResonanceEngine.ignite());

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResonanceEngine;
}

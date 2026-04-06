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
        
        // Fix background interference AND scrolling immediately
        this.stabilizeAtmosphere();

        window.addEventListener('click', (e) => {
            const point = e.target.closest('[data-action]');
            if (!point) return;

            const action = point.dataset.action;
            this.pulse(point);

            if (this.frequencies[action]) {
                this.frequencies[action](point);
            } else {
                this.frequencies['default'](action);
            }
        });
    },

    // 3. ATMOSPHERE: THE SOVEREIGN SPINE - Forces scroll to work
    stabilizeAtmosphere() {
        // 1. FORCE SCROLL: Unlock the body and html layers
        document.documentElement.style.overflow = 'auto'; 
        document.documentElement.style.height = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.body.style.position = 'relative';

        // 2. GHOST LAYER BYPASS: Ensure nothing invisible is blocking the scroll wheel
        const blockers = ['.aurora', '.background-layer', '#bg-canvas', '.glass-overlay', '[class*="overlay"]', '.aurora-bg', '.breathing-orb-container', '.immersive-page'];
        blockers.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.pointerEvents = 'none';
                el.style.zIndex = '-1';
            });
        });

        // 3. ENSURE MAIN CONTENT IS SCROLLABLE
        const containers = ['#root', '.sanctuary-root', '.app-root', 'main', '#main-container'];
        containers.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.minHeight = '100.1vh';
                el.style.display = 'block';
                el.style.overflowY = 'auto';
            }
        });
        
        console.log("🔓 [Sovereign Spine]: Scrolling Unlocked.");
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

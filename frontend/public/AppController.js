/**
 * ENLIGHTEN.MINT.CAFE - Master Controller
 * Consolidates: Dispatcher, Logic, and Debugger
 */

const AppController = {
    // 1. INITIALIZE SYSTEM
    init() {
        console.log("%c[Sovereign OS]: System Initialized", "color: #00e5ff; font-weight: bold;");
        this.bindEvents();
        this.applySanctuaryFixes();
    },

    // 2. CENTRAL EVENT DISPATCHER (Handles all button clicks)
    bindEvents() {
        window.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            
            // Visual Feedback (The Debugger)
            this.debugFlash(btn);

            if (!action) {
                console.warn("Button clicked, but no data-action defined:", btn);
                return;
            }

            // Route to the appropriate module
            this.router(action, btn);
        });
    },

    // 3. ACTION ROUTER
    router(action, element) {
        console.log(`%c[Trigger]: ${action}`, "color: #00ff00");

        switch (action) {
            case 'nav_menu':
                this.modules.ui.toggleMenu();
                break;
            case 'harvest_resonance':
                this.modules.rpg.harvest(element);
                break;
            case 'toggle_shield':
                this.modules.ui.toggleShield();
                break;
            case 'submit_wellness':
                this.modules.wellness.submit();
                break;
            case 'quick_reset':
                this.modules.wellness.quickReset();
                break;
            case 'start_meditation':
                this.modules.wellness.startMeditation();
                break;
            case 'open_oracle':
                this.modules.divination.openOracle();
                break;
            default:
                console.error(`Handler for "${action}" not yet implemented.`);
        }
    },

    // 4. FUNCTIONAL MODULES
    modules: {
        ui: {
            toggleMenu() {
                const nav = document.querySelector('.orbital-nav');
                if (nav) nav.classList.toggle('active');
            },
            toggleShield() {
                document.body.classList.toggle('shield-active');
                console.log("Silence Shield: Status Updated");
            }
        },
        rpg: {
            harvest(el) {
                // Logic for Starseed resonance harvesting
                el.classList.add('harvested');
                console.log("Resonance Seed Collected");
            }
        },
        wellness: {
            submit() {
                console.log("Wellness data synced to hub.");
            },
            quickReset() {
                window.dispatchEvent(new CustomEvent('QUICK_RESET'));
                console.log("Quick Reset triggered");
            },
            startMeditation() {
                window.dispatchEvent(new CustomEvent('START_MEDITATION'));
                console.log("Meditation session starting");
            }
        },
        divination: {
            openOracle() {
                window.dispatchEvent(new CustomEvent('OPEN_ORACLE'));
                console.log("Oracle portal opened");
            }
        }
    },

    // 5. UTILITIES & DEBUGGING
    debugFlash(el) {
        const originalOutline = el.style.outline;
        el.style.outline = '2px solid #00ff00';
        setTimeout(() => el.style.outline = originalOutline, 250);
    },

    applySanctuaryFixes() {
        // Force-apply pointer-events fix to background layers
        const auroras = document.querySelectorAll('.aurora, .background-layer, .aurora-bg, .breathing-orb-container');
        auroras.forEach(el => el.style.pointerEvents = 'none');
        console.log("%c[Sanctuary]: Pointer-events fix applied", "color: #00ffcc");
    }
};

// Start the engine
document.addEventListener('DOMContentLoaded', () => AppController.init());

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppController;
}

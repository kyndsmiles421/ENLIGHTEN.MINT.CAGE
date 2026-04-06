/**
 * ENLIGHTEN.MINT.CAFE - THE SOVEREIGN APPARATUS
 * Version: 1.0.0 | Author: Steven Michael (Sovereign Creator)
 * 
 * INSTRUCTIONS: 
 * 1. Replace your entire main.js or Landing.js with this.
 * 2. This script handles: Scrolling, Buttons, Media, & App Routing.
 */

const Apparatus = {
    // --- 1. FREQUENCY MAP (The Brain) ---
    // Add every tool/action you want here.
    tools: {
        'nav_toggle': () => document.querySelector('.orbital-nav')?.classList.toggle('active'),
        'shield_toggle': () => document.body.classList.toggle('silence-shield'),
        'harvest_seed': (el) => Apparatus.utils.notify(`Resonance Harvested: ${el.id}`),
        'media_play': (el) => Apparatus.modules.mixer.play(el.dataset.src),
        'scroll_top': () => window.scrollTo({top: 0, behavior: 'smooth'}),
        'sync_google': () => Apparatus.modules.auth.googleSync(),
        'quick_reset': () => window.dispatchEvent(new CustomEvent('QUICK_RESET')),
        'sign_in': () => window.location.href = '/auth',
        'begin_journey': () => window.location.href = '/auth',
        'watch_intro': () => window.location.href = '/intro',
        'open_dashboard': () => window.location.href = '/dashboard',
        'default': (act) => console.log(`Frequency ${act} received.`)
    },

    // --- 2. THE IGNITION (The Nervous System) ---
    init() {
        console.log("%c[APPARATUS]: SYSTEM ENGAGED", "color: #7df9ff; font-weight: bold; font-size: 14px;");
        
        this.stabilizeSpine();
        this.igniteWeb();
        this.modules.mixer.init();
        
        // Final check to ensure we are independent of their "subscription" scripts
        this.utils.auditSovereignty();
    },

    // --- 3. THE SPINE (The Scroll & Layout Fix) ---
    stabilizeSpine() {
        const style = document.createElement('style');
        style.innerHTML = `
            html, body { 
                overflow-y: auto !important; 
                height: auto !important; 
                position: relative !important; 
                scroll-behavior: smooth;
            }
            .aurora, .bg-layer, [class*="overlay"] { 
                pointer-events: none !important; 
                z-index: -1 !important; 
            }
            button, a, [data-action] { 
                pointer-events: auto !important; 
                cursor: pointer !important;
            }
        `;
        document.head.appendChild(style);
        console.log("🔓 Spine Stabilized: Scrolling Unlocked.");
    },

    // --- 4. THE WEB (The Event Dispatcher) ---
    igniteWeb() {
        window.addEventListener('click', (e) => {
            const point = e.target.closest('[data-action]');
            if (!point) return;

            const action = point.dataset.action;
            this.utils.pulse(point);

            if (this.tools[action]) {
                this.tools[action](point);
            } else {
                this.tools['default'](action);
            }
        });
    },

    // --- 5. THE MODULES (The Toolset) ---
    modules: {
        mixer: {
            init() { console.log("🔊 Media Mixer Ready."); },
            play(src) { 
                const audio = new Audio(src);
                audio.play();
            }
        },
        auth: {
            googleSync() {
                // This is where your independent Google/GoDaddy API hooks live
                window.location.href = "https://accounts.google.com/"; 
            }
        },
        wellness: {
            // Placeholder for your Enlightenment Cafe logic
            logEnergy: (val) => console.log(`Vibrational State: ${val}`)
        }
    },

    // --- 6. UTILITIES (The Maintenance) ---
    utils: {
        pulse(el) {
            el.style.transform = 'scale(0.95)';
            setTimeout(() => el.style.transform = '', 100);
        },
        notify(msg) {
            console.log(`%c[Crystal-Log]: ${msg}`, "color: #bada55");
        },
        auditSovereignty() {
            // Detects if their scripts are still trying to hijack the page
            const subscriptionScripts = document.querySelectorAll('script[src*="their-platform-name"]');
            if (subscriptionScripts.length > 0) {
                console.warn("Found platform-specific scripts. Ready for removal.");
            }
        }
    }
};

// Start the Engine
document.addEventListener('DOMContentLoaded', () => Apparatus.init());

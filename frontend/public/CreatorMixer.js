/**
 * MASTER CREATOR MIXER BOARD - ENLIGHTEN.MINT.CAFE
 * Controls: Visual Skin, Functional Logic, & Web Apparatus
 */

const CreatorMixer = {
    // ---------------------------------------------------------
    // 1. THE SKIN ENGINE (Visual Styles)
    // ---------------------------------------------------------
    skins: {
        'cosmic_neon': { '--bg': '#0a0a0c', '--accent': '#7df9ff', '--text': '#ffffff', '--glass': 'rgba(255,255,255,0.1)' },
        'vegan_earth': { '--bg': '#1b261e', '--accent': '#a3b18a', '--text': '#dad7cd', '--glass': 'rgba(0,0,0,0.2)' },
        'golden_ratio': { '--bg': '#1a1a1a', '--accent': '#d4af37', '--text': '#f4f4f4', '--glass': 'rgba(212,175,55,0.1)' }
    },

    // ---------------------------------------------------------
    // 2. THE MIXER BOARD (Control Knobs)
    // ---------------------------------------------------------
    controls: {
        // --- SKIN & AESTHETICS ---
        'change_skin': (btn) => {
            const theme = btn.dataset.theme || 'cosmic_neon';
            const colors = CreatorMixer.skins[theme];
            Object.entries(colors).forEach(([key, val]) => {
                document.documentElement.style.setProperty(key, val);
            });
            console.log(`🎨 Skin shifted to: ${theme}`);
        },

        // --- CORE FUNCTIONALITY ---
        'toggle_scroll_lock': () => {
            const isLocked = document.body.style.overflow === 'hidden';
            document.body.style.overflow = isLocked ? 'auto' : 'hidden';
            document.documentElement.style.overflow = isLocked ? 'auto' : 'hidden';
            console.log(`🎡 Scroll Lock: ${!isLocked}`);
        },

        'toggle_shield': () => {
            document.body.classList.toggle('silence-shield-active');
            CreatorMixer.utils.notify("Silence Shield Engaged.");
        },

        // --- WEB APPARATUS & BUILDING ---
        'inject_component': (btn) => {
            const type = btn.dataset.component;
            CreatorMixer.apparatus.build(type);
        },

        'export_sovereign_code': () => {
            const code = document.documentElement.outerHTML;
            const blob = new Blob([code], {type: "text/html"});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "enlighten-mint-cafe-sovereign.html";
            a.click();
            CreatorMixer.utils.notify("Independence Files Exported.");
        }
    },

    // ---------------------------------------------------------
    // 3. THE BUILDING APPARATUS (Live Injection)
    // ---------------------------------------------------------
    apparatus: {
        build(type) {
            const container = document.querySelector('#app-stage') || document.body;
            let html = '';

            switch(type) {
                case 'media_player':
                    html = `<div class="mixer-module"><h3>Audio Mixer</h3><button data-action="play_ambient">Play Tone</button></div>`;
                    break;
                case 'wellness_hub':
                    html = `<div class="mixer-module"><h3>Wellness Sync</h3><p>Status: Resonating</p></div>`;
                    break;
            }
            container.insertAdjacentHTML('beforeend', html);
        }
    },

    // ---------------------------------------------------------
    // 4. THE NERVOUS SYSTEM (Ignition)
    // ---------------------------------------------------------
    ignite() {
        console.log("%c[CREATOR MIXER]: ENGINE START", "color: #d4af37; font-weight: bold;");
        
        // Auto-fix their broken scrolling immediately
        this.utils.forceUnblock();

        window.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            
            if (this.controls[action]) {
                this.controls[action](target);
                this.utils.pulse(target);
            }
        });
    },

    utils: {
        forceUnblock() {
            document.body.style.overflow = 'auto !important';
            document.documentElement.style.overflow = 'auto !important';
            // Bypasses "Ghost" overlays
            const style = document.createElement('style');
            style.innerHTML = `
                * { transition: all 0.3s ease; }
                .blocking-layer { pointer-events: none !important; display: none !important; }
                [data-action] { cursor: pointer !important; z-index: 9999 !important; position: relative; }
            `;
            document.head.appendChild(style);
        },
        pulse(el) {
            el.style.transform = 'scale(1.1) rotate(2deg)';
            setTimeout(() => el.style.transform = '', 200);
        },
        notify(msg) {
            console.log(`%c[Mixer-Log]: ${msg}`, "color: #7df9ff");
        }
    }
};

// Ignite the Mixer
document.addEventListener('DOMContentLoaded', () => CreatorMixer.ignite());

/**
 * ENLIGHTEN.MINT.CAFE - Visualizer Force-Init
 * Use this when cards load but spectrum bars are empty.
 * 
 * @directive SPECTRUM_FORCE_RENDER
 * @author Steven_with_a_V
 */

/**
 * @function forceSpectrumRender
 * Force the spectrum visualizer to render when CSS is ghosting the bars
 */
export function forceSpectrumRender() {
    console.log("[V-ENGINE] Fixing broken visualizer logic...");

    // 1. Kill the CSS 'ghosting' issue - force all freq bars visible
    const bars = document.querySelectorAll('[data-testid^="freq-bar"], .spectrum-bar, .flex-1.rounded-t-lg');
    
    if (bars.length === 0) {
        console.warn("[V-ENGINE] No spectrum bars found in DOM");
        return false;
    }
    
    bars.forEach(bar => {
        bar.style.cssText += `
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
            min-height: 20px !important;
        `;
    });
    
    console.log(`[V-ENGINE] Forced ${bars.length} spectrum bars visible`);

    // 2. Find the spectrum container and force display
    const spectrumContainer = document.querySelector('.glass-card .flex.items-end');
    if (spectrumContainer) {
        spectrumContainer.style.cssText += `
            display: flex !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
    }

    // 3. Dispatch update event for React components
    window.dispatchEvent(new CustomEvent('updateSpectrum', {
        detail: {
            forceRender: true,
            timestamp: Date.now()
        }
    }));

    console.log("[V-ENGINE] Visualizer bridge restored.");
    return true;
}

/**
 * @function injectSpectrumCSS
 * Inject CSS overrides to ensure spectrum bars are always visible
 */
export function injectSpectrumCSS() {
    const existingStyle = document.getElementById('v-engine-spectrum-fix');
    if (existingStyle) return;
    
    const css = `
/* V-ENGINE SPECTRUM FIX - Maximum Specificity Override */
html body #root [data-testid^="freq-bar"],
html body #root .glass-card button.flex-1,
html body #root .glass-card .flex.items-end button,
html body #root .glass-card .flex.items-end > * {
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
    position: relative !important;
    left: auto !important;
    width: auto !important;
    height: auto !important;
    min-height: 20px !important;
}

html body #root .glass-card .flex.items-end {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
}
`;
    
    const style = document.createElement('style');
    style.id = 'v-engine-spectrum-fix';
    style.textContent = css;
    document.head.appendChild(style);
    
    console.log("[V-ENGINE] Spectrum CSS fix injected");
}

/**
 * @function initSpectrum
 * Initialize spectrum fixes on page load
 */
export function initSpectrum() {
    injectSpectrumCSS();
    
    // Wait for DOM to be ready then force render
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(forceSpectrumRender, 500);
        });
    } else {
        setTimeout(forceSpectrumRender, 500);
    }
}

// Expose to window
if (typeof window !== 'undefined') {
    window.V_ENGINE = window.V_ENGINE || {};
    window.V_ENGINE.forceSpectrumRender = forceSpectrumRender;
    window.V_ENGINE.injectSpectrumCSS = injectSpectrumCSS;
    
    // Auto-init on frequencies page
    if (window.location.pathname.includes('frequencies')) {
        initSpectrum();
    }
    
    // Listen for route changes
    window.addEventListener('popstate', () => {
        if (window.location.pathname.includes('frequencies')) {
            setTimeout(initSpectrum, 100);
        }
    });
}

export default {
    forceSpectrumRender,
    injectSpectrumCSS,
    initSpectrum
};

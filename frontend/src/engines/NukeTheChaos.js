/**
 * @project ENLIGHTEN.MINT.CAFE
 * @directive ABSOLUTE_CLARITY_NOW
 * @logic ZERO_STATE_REFRIGERATION
 */

(function nukeTheChaos() {
    // 1. FORCED BACKGROUND VACUUM
    // This kills the 'Confetti' and the rainbow noise seen in 2487.png
    const css = `
        * { 
            background-image: none !important; 
            border-radius: 0 !important; 
            box-shadow: none !important;
            border: none !important;
        }
        body, html, #root, .app-container {
            background-color: #000000 !important;
            color: #FFFFFF !important;
            overflow-x: hidden;
        }
        /* 2. THE WHITE LIGHT DATA FLOW */
        h1, h2, h3, p, a, span, button {
            color: #FFFFFF !important;
            text-shadow: 0 0 5px rgba(255,255,255,0.5) !important;
        }
        /* 3. DISSOLVE THE BOXES */
        div, section, article {
            background: transparent !important;
            border: none !important;
        }
        /* 4. THE P0 EMERGENCY SHIELD (Top-Left) */
        .emergency-stop, #stop-button {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 10000 !important;
            background: rgba(255,255,255,0.1) !important;
            border: 1px solid #FFFFFF !important;
        }
    `;

    // Inject the Focal Shield into the Head
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    console.log("V-ENGINE: Chaos Nuked. The Void is Focalized.");
})();

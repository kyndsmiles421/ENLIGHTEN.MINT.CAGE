/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule QR_Refraction_Display
 * @version 10.0.0
 * @security RAINBOW_REFRACTION_ZF_ROTATION_D
 * @rotation_delta +15.5_degrees (Cumulative +62.7°)
 * @author Steven (Creator Council)
 */

import React from 'react';

const DISPLAY_DNA = {
    assets: ["homepage.png", "diamond_core.png", "shield_api.png"],
    inlay: "REFRIGERATED_TM_V4.png",
    pulse: 1.618,
    rotation: "ZF_DISPLAY_62.7_ROTATION"
};

/**
 * Renders the QR Portal with the Trademark Inlay and Rainbow Overlay
 * @param {Object} props
 * @param {string} props.targetAsset - QR asset filename (e.g., "homepage.png")
 * @param {number} props.size - Display size in pixels
 */
const QRRefractionDisplay = ({ targetAsset = "homepage.png", size = 200 }) => {
    // Path to QR assets in public folder
    const qrPath = `/qr/${targetAsset}`;
    
    return (
        <div 
            className="qr-portal-container" 
            style={{ 
                position: 'relative',
                width: size,
                height: size,
                borderRadius: '12px',
                overflow: 'hidden'
            }}
            data-testid="qr-refraction-display"
        >
            {/* The Base QR Code */}
            <img 
                src={qrPath} 
                alt="Sovereign Gateway" 
                style={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'contrast(1.2) brightness(0.9)' 
                }}
            />
            
            {/* The Trademark Inlay (Floating at 1.0 Fixed Point) */}
            <div 
                className="tm-inlay-overlay" 
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '25%',
                    height: '25%',
                    mixBlendMode: 'screen',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '4px'
                }}
            >
                <span style={{ 
                    fontSize: size * 0.08, 
                    fontWeight: 'bold',
                    color: '#0a0a0f'
                }}>
                    TM
                </span>
            </div>

            {/* The Rainbow Refraction Layer (Procedural Shift) */}
            <div 
                className="rainbow-refraction-sweep" 
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1))',
                    animation: 'qrSweep 3.236s infinite linear', // PHI * 2
                    pointerEvents: 'none'
                }} 
            />

            {/* CSS Animation */}
            <style>{`
                @keyframes qrSweep {
                    0% { 
                        background-position: 0% 0%;
                        opacity: 0.3;
                    }
                    50% { 
                        background-position: 100% 100%;
                        opacity: 0.6;
                    }
                    100% { 
                        background-position: 0% 0%;
                        opacity: 0.3;
                    }
                }
            `}</style>
        </div>
    );
};

/**
 * QR Portal Grid - Displays all three QR codes
 */
export const QRPortalGrid = ({ size = 150 }) => {
    return (
        <div 
            className="qr-portal-grid"
            style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}
            data-testid="qr-portal-grid"
        >
            {DISPLAY_DNA.assets.map((asset) => (
                <div key={asset} style={{ textAlign: 'center' }}>
                    <QRRefractionDisplay targetAsset={asset} size={size} />
                    <p style={{ 
                        fontSize: '10px', 
                        marginTop: '8px',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em'
                    }}>
                        {asset.replace('.png', '').replace('_', ' ')}
                    </p>
                </div>
            ))}
        </div>
    );
};

export { DISPLAY_DNA };
export default QRRefractionDisplay;

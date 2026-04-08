/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Sovereign_QR_Portal_UI
 * @version 11.0.0
 * @security RAINBOW_REFRACTION_ZF_ROTATION_E
 * @rotation_delta +18.3_degrees (Cumulative +81.0°)
 * @author Steven (Creator Council)
 */

import React from 'react';

const PORTAL_CONFIG = {
    rotation_theta: 81.0,
    blend_mode: "overlay",
    pulse_frequency: "1.618s", // The Heartbeat of the Mesh
    master_key: "STEVEN_V_SOVEREIGN"
};

/**
 * Transforms standard QR assets into Refracted Sovereignty Gateways
 */
const SovereignQRPortal = () => {
    const qrAssets = [
        { id: 'home', src: '/qr/homepage.png', label: 'Main Entry' },
        { id: 'core', src: '/qr/diamond_core.png', label: 'Diamond Core' },
        { id: 'shield', src: '/qr/shield_api.png', label: 'Shield API' }
    ];

    return (
        <div 
            className="sovereign-gateway-grid" 
            style={{ 
                display: 'flex', 
                gap: '20px', 
                padding: '40px',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}
            data-testid="sovereign-qr-portal"
        >
            {qrAssets.map((asset) => (
                <div 
                    key={asset.id} 
                    className="qr-wrapper" 
                    style={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* 1. THE BASE: The Physical QR */}
                    <img 
                        src={asset.src} 
                        alt={asset.label} 
                        style={{ 
                            width: '200px', 
                            height: '200px',
                            display: 'block',
                            filter: 'grayscale(20%)' 
                        }} 
                    />

                    {/* 2. THE INFUSION: Rainbow Refraction Layer */}
                    <div 
                        className="rainbow-overlay" 
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(135deg, rgba(255,0,0,0.15), rgba(0,255,255,0.15))',
                            mixBlendMode: 'color-dodge',
                            animation: `refraction-spin ${PORTAL_CONFIG.pulse_frequency} infinite`,
                            pointerEvents: 'none'
                        }} 
                    />

                    {/* 3. THE HEART: Refrigerated Trademark Inlay */}
                    <div 
                        className="tm-center-lock" 
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '40px',
                            height: '40px',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }}
                    >
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#1a1a2e',
                            textAlign: 'center',
                            lineHeight: 1.1
                        }}>
                            E.M.C
                        </span>
                    </div>

                    {/* Label */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        padding: '20px 10px 10px',
                        textAlign: 'center'
                    }}>
                        <span style={{
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            {asset.label}
                        </span>
                    </div>
                </div>
            ))}

            {/* CSS Animation */}
            <style>{`
                @keyframes refraction-spin {
                    0% {
                        opacity: 0.3;
                        transform: rotate(0deg);
                    }
                    50% {
                        opacity: 0.6;
                        transform: rotate(${PORTAL_CONFIG.rotation_theta}deg);
                    }
                    100% {
                        opacity: 0.3;
                        transform: rotate(0deg);
                    }
                }
            `}</style>
        </div>
    );
};

export { PORTAL_CONFIG };
export default SovereignQRPortal;

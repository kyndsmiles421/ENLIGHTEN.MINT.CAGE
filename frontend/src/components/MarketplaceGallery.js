/**
 * @module ENLIGHTEN.MINT.CAFE
 * @submodule Marketplace_UI_Overlay
 * @version 37.5.0
 * @security RAINBOW_REFRACTION_ZF_COMMERCE_VISUAL
 * @rotation_delta +23.8_degrees (Cumulative +645.0°)
 * @author Steven (Creator Council)
 */

import React, { useState } from 'react';

const MARKETPLACE_DNA = {
    rotation_key: "ZF_COMMERCE_645.0",
    currency: "PHI",
    fixed_point: 1.0,
    master: "STEVEN_WITH_A_V"
};

// Sample artistry items
const ARTISTRY_ITEMS = [
    { id: 'SOVEREIGN_ART_01', title: 'Genesis Weave', price: 1.618, type: 'REFRIGERATED_ASSET' },
    { id: 'SOVEREIGN_ART_02', title: 'Rainbow Shield', price: 2.618, type: 'ENCRYPTED_VISUAL' },
    { id: 'SOVEREIGN_ART_03', title: 'PHI Spiral', price: 4.236, type: 'GOLDEN_RATIO' },
    { id: 'SOVEREIGN_ART_04', title: 'Void Portal', price: 1.0, type: 'FIXED_POINT' },
];

const MarketplaceGallery = ({ onSelect, isVisible = true }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);

    const handleItemClick = (item) => {
        setSelectedItem(item.id);
        if (onSelect) onSelect(item);
        console.log(`[MarketplaceGallery] Selected: ${item.id}`);
    };

    if (!isVisible) return null;

    return (
        <div 
            className="sovereign-gallery" 
            style={{
                position: 'absolute',
                bottom: '10%',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 150,
                perspective: '1000px'
            }}
            data-testid="marketplace-gallery"
        >
            {/* The Orbital Carousel */}
            <div 
                className="artistry-orbit" 
                style={{
                    display: 'flex',
                    gap: '20px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
            >
                {ARTISTRY_ITEMS.map((item, index) => (
                    <div 
                        key={item.id}
                        className="art-card" 
                        style={{
                            width: '150px',
                            height: '200px',
                            background: selectedItem === item.id 
                                ? 'rgba(0, 240, 255, 0.15)' 
                                : 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${
                                selectedItem === item.id 
                                    ? 'rgba(0, 240, 255, 0.6)' 
                                    : hoveredItem === item.id 
                                        ? 'rgba(0, 240, 255, 0.4)' 
                                        : 'rgba(0, 240, 255, 0.3)'
                            }`,
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transform: hoveredItem === item.id ? 'translateY(-10px) scale(1.05)' : 'none',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: selectedItem === item.id 
                                ? '0 0 30px rgba(0, 240, 255, 0.3)' 
                                : '0 4px 20px rgba(0, 0, 0, 0.3)'
                        }} 
                        onClick={() => handleItemClick(item)}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        data-testid={`art-card-${item.id}`}
                    >
                        {/* Asset Type Badge */}
                        <div style={{ 
                            fontSize: '0.5rem', 
                            color: '#FFD700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '8px'
                        }}>
                            {item.type}
                        </div>

                        {/* QR Thumbnail / Asset Preview */}
                        <div 
                            className="qr-thumbnail" 
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)', 
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Rainbow refraction overlay */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(45deg, rgba(255,0,0,0.1), rgba(0,255,0,0.1), rgba(0,0,255,0.1))',
                                animation: 'qrShimmer 2s infinite linear'
                            }} />
                            <span style={{ 
                                fontSize: '0.6rem', 
                                color: '#333',
                                fontWeight: 'bold',
                                zIndex: 1
                            }}>
                                QR
                            </span>
                        </div>

                        {/* Title */}
                        <div style={{ 
                            marginTop: '12px', 
                            fontSize: '0.7rem', 
                            color: '#fff',
                            textAlign: 'center'
                        }}>
                            {item.title}
                        </div>

                        {/* Price */}
                        <div style={{ 
                            marginTop: '8px', 
                            fontSize: '0.9rem', 
                            fontWeight: 'bold',
                            color: '#00f0ff'
                        }}>
                            {item.price} PHI
                        </div>
                    </div>
                ))}
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes qrShimmer {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

/**
 * Selected Item Detail Modal
 */
export const MarketplaceItemDetail = ({ item, onClose, onPurchase }) => {
    if (!item) return null;

    return (
        <div 
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 200
            }}
            onClick={onClose}
        >
            <div 
                style={{
                    background: 'rgba(20, 20, 40, 0.95)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '20px',
                    padding: '40px',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={{ color: '#00f0ff', marginBottom: '20px' }}>{item.title}</h2>
                <p style={{ color: '#888', fontSize: '0.8rem' }}>{item.type}</p>
                <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: '#FFD700',
                    margin: '20px 0'
                }}>
                    {item.price} PHI
                </div>
                <button 
                    onClick={() => onPurchase && onPurchase(item)}
                    style={{
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 215, 0, 0.2))',
                        border: '1px solid rgba(0, 240, 255, 0.5)',
                        borderRadius: '30px',
                        padding: '15px 40px',
                        color: '#00f0ff',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Acquire Asset
                </button>
            </div>
        </div>
    );
};

export { MARKETPLACE_DNA, ARTISTRY_ITEMS };
export default MarketplaceGallery;

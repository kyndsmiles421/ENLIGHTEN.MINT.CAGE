/**
 * HarmonicStatus.js — Displays current harmonic tier and frequency
 * Shows: Tier (Vault/Hub/Manifest), Frequency (432/528/963Hz), School of Thought
 */

import React, { useState, useEffect } from 'react';
import SOVEREIGN_HARMONY from '../utils/SovereignHarmony';
import { Music, Radio, Waves } from 'lucide-react';

export default function HarmonicStatus() {
    const [currentTier, setCurrentTier] = useState('HUB');
    const [earthPulse, setEarthPulse] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Listen for harmonic shifts
        const handleHarmonicShift = (e) => {
            setCurrentTier(e.detail.tier);
        };

        const handleSovereignBloom = () => {
            // Trigger visual bloom effect
            document.body.classList.add('sovereign-bloom');
            setTimeout(() => {
                document.body.classList.remove('sovereign-bloom');
            }, 1000);
        };

        window.addEventListener('HARMONIC_SHIFT', handleHarmonicShift);
        window.addEventListener('SOVEREIGN_BLOOM', handleSovereignBloom);

        // Check initial state
        setEarthPulse(SOVEREIGN_HARMONY.isEarthPulseActive());

        return () => {
            window.removeEventListener('HARMONIC_SHIFT', handleHarmonicShift);
            window.removeEventListener('SOVEREIGN_BLOOM', handleSovereignBloom);
        };
    }, []);

    const tier = SOVEREIGN_HARMONY.TIERS[currentTier];
    if (!tier) return null;

    const handleTierClick = (tierKey) => {
        SOVEREIGN_HARMONY.tuneToTier(tierKey);
        setCurrentTier(tierKey);
    };

    const toggleEarthPulse = () => {
        if (earthPulse) {
            SOVEREIGN_HARMONY.stopEarthPulse();
        } else {
            SOVEREIGN_HARMONY.startEarthPulse();
        }
        setEarthPulse(!earthPulse);
    };

    const schoolIcons = {
        'Pythagorean': '♫',
        'Solfeggio': '☯',
        'Sigfield': '✧'
    };

    return (
        <div 
            className="harmonic-status"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            data-testid="harmonic-status"
        >
            {isExpanded ? (
                <div className="harmonic-expanded">
                    {/* Tier Selector */}
                    <div className="tier-selector">
                        {Object.entries(SOVEREIGN_HARMONY.TIERS).map(([key, t]) => (
                            <button
                                key={key}
                                className={`tier-btn ${currentTier === key ? 'active' : ''}`}
                                onClick={() => handleTierClick(key)}
                                style={{ '--tier-color': t.color }}
                                title={`${t.school} - ${t.freq}Hz`}
                            >
                                <span className="tier-school">{schoolIcons[t.school]}</span>
                                <span className="tier-freq">{t.freq}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* Earth Pulse Toggle */}
                    <button 
                        className={`earth-toggle ${earthPulse ? 'active' : ''}`}
                        onClick={toggleEarthPulse}
                        title={`Earth Pulse (${SOVEREIGN_HARMONY.EARTH_FREQ}Hz)`}
                    >
                        <Radio size={12} />
                        <span>7.83</span>
                    </button>
                </div>
            ) : (
                <div className="harmonic-collapsed" style={{ color: tier.color }}>
                    <span className="school-icon">{schoolIcons[tier.school]}</span>
                    <span className="freq-display">{tier.freq}</span>
                </div>
            )}
        </div>
    );
}

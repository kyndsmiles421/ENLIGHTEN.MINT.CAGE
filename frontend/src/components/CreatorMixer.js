/**
 * ENLIGHTEN.MINT.CAFE - CREATOR CONTROL MIXER
 * V9999.4 - Crystalline Sliders on Obsidian Void
 * 
 * The "Secret Menu" for the Trustee to play the app like an instrument.
 * Moving these sliders physically changes how the Sovereign Trust 
 * calculates the $49,018.24 Equity.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, Moon, Radio, Shield, MapPin, 
  Hexagon, ChevronDown, ChevronUp, Lock, Unlock,
  RefreshCw
} from 'lucide-react';
import HyperFluxEngine, { BLACK_HILLS_ANCHOR } from '../utils/HyperFluxEngine';

const CreatorMixer = ({ isOpen, onClose, onMixerChange }) => {
  // Mixer state (synced with HyperFluxEngine)
  const [lunar, setLunar] = useState(1.0424);
  const [spectral, setSpectral] = useState(144);
  const [trustSensitivity, setTrustSensitivity] = useState(0.99);
  const [phygitalRange, setPhygitalRange] = useState(0.9);
  const [refraction, setRefraction] = useState(1.618);
  const [cacheInterval, setCacheInterval] = useState(81);
  
  // GPS Lock state
  const [gpsStatus, setGpsStatus] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  
  // Expanded sections
  const [expandedSection, setExpandedSection] = useState('resonance');

  // Sync with HyperFluxEngine on mount
  useEffect(() => {
    const state = HyperFluxEngine.getMixerState();
    setLunar(state.lunarWeight);
    setSpectral(state.spectralShift);
    setTrustSensitivity(state.trustSensitivity);
    setPhygitalRange(state.phygitalRange);
    setRefraction(state.refractionIndex);
    setCacheInterval(state.cacheInterval);
  }, [isOpen]);

  // Apply mixer changes
  const applyChange = useCallback((knob, value) => {
    HyperFluxEngine.applyMix(knob, value);
    onMixerChange?.(HyperFluxEngine.getMixerState());
  }, [onMixerChange]);

  // Check GPS Phygital Lock
  const checkGPSLock = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result = HyperFluxEngine.checkPhygitalLock(
          position.coords.latitude,
          position.coords.longitude
        );
        setGpsStatus(result);
        setGpsError(null);
      },
      (error) => {
        setGpsError(error.message);
        setGpsStatus(null);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(15,15,25,0.99) 0%, rgba(10,10,18,0.99) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 0 80px rgba(99,102,241,0.2), 0 0 40px rgba(139,92,246,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
          data-testid="creator-mixer"
        >
          {/* Header */}
          <div 
            className="p-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.15)' }}
              >
                <Sliders size={20} style={{ color: '#6366F1' }} />
              </div>
              <div>
                <h2 className="font-semibold text-white">Creator Control Mixer</h2>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  V9999.4 • Trustee Engine Room
                </p>
              </div>
            </div>
          </div>

          {/* Mixer Controls */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            
            {/* RESONANCE SECTION */}
            <MixerSection
              title="Spectral Resonance"
              icon={<Radio size={14} />}
              color="#22C55E"
              expanded={expandedSection === 'resonance'}
              onToggle={() => setExpandedSection(expandedSection === 'resonance' ? null : 'resonance')}
            >
              <MixerSlider
                label="Spectral Shift"
                value={spectral}
                min={60}
                max={432}
                step={9}
                unit="Hz"
                color="#22C55E"
                onChange={(v) => {
                  setSpectral(v);
                  applyChange('spectralShift', v);
                }}
              />
              <MixerSlider
                label="Crystal Refraction (Φ)"
                value={refraction}
                min={1}
                max={2.618}
                step={0.001}
                color="#6366F1"
                onChange={(v) => {
                  setRefraction(v);
                  applyChange('refractionIndex', v);
                }}
              />
            </MixerSection>

            {/* LUNAR SECTION */}
            <MixerSection
              title="Lunar-Tidal Flux"
              icon={<Moon size={14} />}
              color="#F472B6"
              expanded={expandedSection === 'lunar'}
              onToggle={() => setExpandedSection(expandedSection === 'lunar' ? null : 'lunar')}
            >
              <MixerSlider
                label="Lunar Weight"
                value={lunar}
                min={1}
                max={2}
                step={0.0001}
                color="#F472B6"
                onChange={(v) => {
                  setLunar(v);
                  applyChange('lunarWeight', v);
                }}
              />
            </MixerSection>

            {/* TRUST FIREWALL SECTION */}
            <MixerSection
              title="Trust Firewall"
              icon={<Shield size={14} />}
              color="#EAB308"
              expanded={expandedSection === 'trust'}
              onToggle={() => setExpandedSection(expandedSection === 'trust' ? null : 'trust')}
            >
              <MixerSlider
                label="Firewall Sensitivity"
                value={trustSensitivity}
                min={0}
                max={1}
                step={0.01}
                color="#EAB308"
                onChange={(v) => {
                  setTrustSensitivity(v);
                  applyChange('trustSensitivity', v);
                }}
              />
              <MixerSlider
                label="Cache Cycle"
                value={cacheInterval}
                min={9}
                max={243}
                step={9}
                unit="s"
                color="#F97316"
                onChange={(v) => {
                  setCacheInterval(v);
                  applyChange('cacheInterval', v);
                }}
              />
            </MixerSection>

            {/* GPS PHYGITAL LOCK */}
            <MixerSection
              title="GPS Phygital Lock"
              icon={<MapPin size={14} />}
              color="#3B82F6"
              expanded={expandedSection === 'gps'}
              onToggle={() => setExpandedSection(expandedSection === 'gps' ? null : 'gps')}
            >
              <MixerSlider
                label="Resonance Radius"
                value={phygitalRange}
                min={0.1}
                max={9}
                step={0.1}
                unit="km"
                color="#3B82F6"
                onChange={(v) => {
                  setPhygitalRange(v);
                  applyChange('phygitalRange', v);
                }}
              />
              
              {/* GPS Status Display */}
              <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Anchor: {BLACK_HILLS_ANCHOR.name}
                  </span>
                  <button
                    onClick={checkGPSLock}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    title="Check GPS Lock"
                  >
                    <RefreshCw size={12} style={{ color: '#3B82F6' }} />
                  </button>
                </div>
                
                <div className="text-[10px] font-mono mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {BLACK_HILLS_ANCHOR.lat}°N, {Math.abs(BLACK_HILLS_ANCHOR.lng)}°W
                </div>
                
                {gpsStatus && (
                  <div 
                    className="p-2 rounded-lg flex items-center gap-2"
                    style={{ 
                      background: gpsStatus.isLocked ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${gpsStatus.isLocked ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    {gpsStatus.isLocked ? (
                      <Lock size={12} style={{ color: '#22C55E' }} />
                    ) : (
                      <Unlock size={12} style={{ color: '#EF4444' }} />
                    )}
                    <div>
                      <p className="text-xs font-medium" style={{ color: gpsStatus.isLocked ? '#22C55E' : '#EF4444' }}>
                        {gpsStatus.status}
                      </p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Distance: {gpsStatus.distance} km | Resonance: {(gpsStatus.resonanceStrength * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
                
                {gpsError && (
                  <p className="text-xs text-red-400">{gpsError}</p>
                )}
              </div>
            </MixerSection>
          </div>

          {/* Footer Status */}
          <div 
            className="p-3 border-t text-center"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(34,197,94,0.8)' }}>
              HANDSHAKE STATUS: SECURE-CONNECTED
            </p>
            <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
              SOVEREIGN TRUST VERIFIED
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Collapsible Section Component
const MixerSection = ({ title, icon, color, expanded, onToggle, children }) => (
  <div 
    className="rounded-xl overflow-hidden"
    style={{ 
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${expanded ? `${color}30` : 'rgba(255,255,255,0.05)'}`,
    }}
  >
    <button
      onClick={onToggle}
      className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span style={{ color }}>{icon}</span>
        <span className="text-sm font-medium text-white">{title}</span>
      </div>
      {expanded ? (
        <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
      ) : (
        <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
      )}
    </button>
    
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 pb-3 space-y-3"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Slider Component
const MixerSlider = ({ label, value, min, max, step, unit = '', color, onChange }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
      <span className="text-xs font-mono" style={{ color }}>
        {typeof value === 'number' ? value.toFixed(step < 1 ? 4 : 0) : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{
        background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
      }}
    />
  </div>
);

export default CreatorMixer;

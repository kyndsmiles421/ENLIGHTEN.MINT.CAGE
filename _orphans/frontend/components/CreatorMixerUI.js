/**
 * CreatorMixerUI.js — Visual Mixing Board with Channel Strips
 * Sits discreetly inside the Creator Perspective
 * Architecture: Past (Cyan) | Present (Iridescent) | Future (Purple)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Sliders, Volume2, VolumeX, Radio, Zap, 
    ChevronUp, ChevronDown, Activity, AlertTriangle,
    Music, Waves, Eye, EyeOff
} from 'lucide-react';
import ENLIGHTEN_OS from '../utils/EnlightenOS';

// Individual Channel Strip Component
const ChannelStrip = ({ noduleId, channel, onUpdate, onKick }) => {
    const [gain, setGain] = useState(channel.gain || 1.0);
    const [pan, setPan] = useState(channel.pan || 0);
    const [muted, setMuted] = useState(channel.muted || false);
    const [solo, setSolo] = useState(channel.solo || false);

    const sourceColors = {
        PAST: { bg: 'rgba(34, 211, 238, 0.1)', border: '#22d3ee', glow: 'rgba(34, 211, 238, 0.3)' },
        PRESENT: { bg: 'rgba(192, 132, 252, 0.1)', border: '#c084fc', glow: 'rgba(192, 132, 252, 0.3)' },
        FUTURE: { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' }
    };

    const channelType = channel.type || 'PRESENT';
    const colors = sourceColors[channelType] || sourceColors.PRESENT;

    const handleGainChange = (e) => {
        const value = parseFloat(e.target.value);
        setGain(value);
        onUpdate(noduleId, 'gain', value);
    };

    const handlePanChange = (e) => {
        const value = parseFloat(e.target.value);
        setPan(value);
        onUpdate(noduleId, 'pan', value);
    };

    const toggleMute = () => {
        const newMuted = !muted;
        setMuted(newMuted);
        onUpdate(noduleId, 'muted', newMuted);
    };

    const toggleSolo = () => {
        const newSolo = !solo;
        setSolo(newSolo);
        onUpdate(noduleId, 'solo', newSolo);
    };

    // Format nodule ID for display
    const displayId = noduleId.length > 12 ? `${noduleId.slice(0, 10)}...` : noduleId;

    return (
        <div 
            className="channel-strip"
            style={{
                background: colors.bg,
                borderColor: colors.border,
                boxShadow: `0 0 15px ${colors.glow}`
            }}
            data-testid={`channel-strip-${noduleId}`}
        >
            {/* Channel Header */}
            <div className="channel-header">
                <span className="channel-source" style={{ color: colors.border }}>
                    {channelType}
                </span>
                <span className="channel-id" title={noduleId}>{displayId}</span>
            </div>

            {/* Gain Fader (Vertical) */}
            <div className="fader-container">
                <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={gain}
                    onChange={handleGainChange}
                    className="fader-vertical"
                    style={{ '--fader-color': colors.border }}
                />
                <span className="fader-value">{(gain * 100).toFixed(0)}%</span>
            </div>

            {/* Pan Knob */}
            <div className="pan-container">
                <span className="pan-label">L</span>
                <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={pan}
                    onChange={handlePanChange}
                    className="pan-slider"
                />
                <span className="pan-label">R</span>
            </div>

            {/* Control Buttons */}
            <div className="channel-controls">
                <button 
                    className={`ctrl-btn mute-btn ${muted ? 'active' : ''}`}
                    onClick={toggleMute}
                    title="Mute"
                >
                    {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button 
                    className={`ctrl-btn solo-btn ${solo ? 'active' : ''}`}
                    onClick={toggleSolo}
                    title="Solo"
                >
                    <Radio size={14} />
                </button>
                <button 
                    className="ctrl-btn kick-btn"
                    onClick={() => onKick(noduleId)}
                    title="Kick (Reset)"
                >
                    <Zap size={14} />
                </button>
            </div>

            {/* Signal Meter */}
            <div className="signal-meter">
                <div 
                    className="signal-level"
                    style={{ 
                        height: `${gain * 50}%`,
                        background: muted ? '#666' : colors.border
                    }}
                />
            </div>
        </div>
    );
};

// Main Mixing Board Component
export default function CreatorMixerUI({ isOpen, onClose }) {
    const [channels, setChannels] = useState([]);
    const [masterGain, setMasterGain] = useState(1.0);
    const [globalFrequencies, setGlobalFrequencies] = useState({
        PAST: 1.0,
        PRESENT: 1.0,
        FUTURE: 1.0
    });
    const [signalHealth, setSignalHealth] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);

    // Initialize and listen for channel updates
    useEffect(() => {
        // Update channels from registry
        const updateChannels = () => {
            const registry = ENLIGHTEN_OS.getRegistry();
            const channelList = Array.from(registry.entries()).map(([id, channel]) => ({
                id,
                ...channel
            }));
            setChannels(channelList);
            setSignalHealth(ENLIGHTEN_OS.getSignalHealth());
        };

        // Initial load
        updateChannels();

        // Event listeners
        const handleChannelAdded = () => updateChannels();
        const handleChannelRemoved = () => updateChannels();
        const handleChannelUpdate = () => updateChannels();

        window.addEventListener('MIXER_CHANNEL_ADDED', handleChannelAdded);
        window.addEventListener('MIXER_CHANNEL_REMOVED', handleChannelRemoved);
        window.addEventListener('MIXER_CHANNEL_UPDATE', handleChannelUpdate);

        // Periodic health check
        const healthInterval = setInterval(() => {
            setSignalHealth(ENLIGHTEN_OS.getSignalHealth());
        }, 5000);

        return () => {
            window.removeEventListener('MIXER_CHANNEL_ADDED', handleChannelAdded);
            window.removeEventListener('MIXER_CHANNEL_REMOVED', handleChannelRemoved);
            window.removeEventListener('MIXER_CHANNEL_UPDATE', handleChannelUpdate);
            clearInterval(healthInterval);
        };
    }, []);

    const handleChannelUpdate = useCallback((noduleId, property, value) => {
        const channel = ENLIGHTEN_OS.getChannel(noduleId);
        if (channel && channel.element) {
            channel[property] = value;
            if (property === 'gain' || property === 'frequency') {
                channel.element.dispatchEvent(new CustomEvent('updateMix', { 
                    detail: { [property === 'gain' ? 'gain' : 'freq']: value } 
                }));
            }
        }
    }, []);

    const handleKick = useCallback((noduleId) => {
        const channel = ENLIGHTEN_OS.getChannel(noduleId);
        if (channel) {
            channel.timestamp = Date.now();
            channel.gain = 1.0;
            channel.muted = false;
            if (channel.element) {
                channel.element.style.animation = 'kick-pulse 0.3s ease-out';
                setTimeout(() => {
                    if (channel.element) channel.element.style.animation = '';
                }, 300);
            }
        }
        console.log(`%c Creator Mode: KICK signal sent to ${noduleId}`, 'color: #a855f7');
    }, []);

    const handleMasterGainChange = (e) => {
        const value = parseFloat(e.target.value);
        setMasterGain(value);
        // Apply to all channels via ENLIGHTEN_OS
        ['PAST', 'PRESENT', 'FUTURE'].forEach(type => {
            ENLIGHTEN_OS.setGlobalFrequency(type, value);
        });
    };

    const handleGlobalFrequency = (type, value) => {
        setGlobalFrequencies(prev => ({ ...prev, [type]: value }));
        ENLIGHTEN_OS.setGlobalFrequency(type, value);
    };

    // Group channels by type (PAST/PRESENT/FUTURE)
    const groupedChannels = {
        PAST: channels.filter(c => c.type === 'PAST'),
        PRESENT: channels.filter(c => c.type === 'PRESENT'),
        FUTURE: channels.filter(c => c.type === 'FUTURE')
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`creator-mixer-overlay ${isMinimized ? 'minimized' : ''}`} 
            data-testid="creator-mixer"
            style={{ zIndex: 2147483646, position: 'fixed' }}
        >
            {/* Mixer Header */}
            <div className="mixer-header">
                <div className="mixer-title">
                    <Sliders size={18} />
                    <span>CREATOR MIXING BOARD</span>
                </div>
                <div className="mixer-header-controls">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="header-btn">
                        {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button onClick={onClose} className="header-btn close-btn">×</button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Signal Health Monitor */}
                    {signalHealth && (
                        <div className="signal-health">
                            <Activity size={14} />
                            <span>Channels: {signalHealth.totalChannels}</span>
                            <span className="health-divider">|</span>
                            <span style={{ color: '#22d3ee' }}>P:{signalHealth.byType?.PAST || 0}</span>
                            <span style={{ color: '#c084fc' }}>H:{signalHealth.byType?.PRESENT || 0}</span>
                            <span style={{ color: '#a855f7' }}>F:{signalHealth.byType?.FUTURE || 0}</span>
                            {signalHealth.staleChannels?.length > 0 && (
                                <span className="stale-warning">
                                    <AlertTriangle size={12} />
                                    {signalHealth.staleChannels.length} stale
                                </span>
                            )}
                        </div>
                    )}

                    {/* Global Frequency Controls */}
                    <div className="global-controls">
                        <div className="global-section past">
                            <span className="global-label">THE VAULT</span>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={globalFrequencies.PAST}
                                onChange={(e) => handleGlobalFrequency('PAST', parseFloat(e.target.value))}
                                className="global-fader"
                            />
                            <span className="global-value">{(globalFrequencies.PAST * 100).toFixed(0)}%</span>
                        </div>
                        <div className="global-section present">
                            <span className="global-label">THE HUB</span>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={globalFrequencies.PRESENT}
                                onChange={(e) => handleGlobalFrequency('PRESENT', parseFloat(e.target.value))}
                                className="global-fader"
                            />
                            <span className="global-value">{(globalFrequencies.PRESENT * 100).toFixed(0)}%</span>
                        </div>
                        <div className="global-section future">
                            <span className="global-label">THE MANIFEST</span>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={globalFrequencies.FUTURE}
                                onChange={(e) => handleGlobalFrequency('FUTURE', parseFloat(e.target.value))}
                                className="global-fader"
                            />
                            <span className="global-value">{(globalFrequencies.FUTURE * 100).toFixed(0)}%</span>
                        </div>
                    </div>

                    {/* Channel Strips by Source */}
                    <div className="mixer-channels">
                        {/* Past Channels */}
                        <div className="channel-group past-group">
                            <div className="group-header" style={{ borderColor: '#22d3ee' }}>
                                <Music size={12} /> PAST / ARCHIVES
                            </div>
                            <div className="group-strips">
                                {groupedChannels.PAST.length === 0 ? (
                                    <div className="no-channels">No active channels</div>
                                ) : (
                                    groupedChannels.PAST.map(channel => (
                                        <ChannelStrip
                                            key={channel.id}
                                            noduleId={channel.id}
                                            channel={channel}
                                            onUpdate={handleChannelUpdate}
                                            onKick={handleKick}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Present Channels */}
                        <div className="channel-group present-group">
                            <div className="group-header" style={{ borderColor: '#c084fc' }}>
                                <Waves size={12} /> PRESENT / HUB
                            </div>
                            <div className="group-strips">
                                {groupedChannels.PRESENT.length === 0 ? (
                                    <div className="no-channels">No active channels</div>
                                ) : (
                                    groupedChannels.PRESENT.map(channel => (
                                        <ChannelStrip
                                            key={channel.id}
                                            noduleId={channel.id}
                                            channel={channel}
                                            onUpdate={handleChannelUpdate}
                                            onKick={handleKick}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Future Channels */}
                        <div className="channel-group future-group">
                            <div className="group-header" style={{ borderColor: '#a855f7' }}>
                                <Eye size={12} /> FUTURE / MANIFEST
                            </div>
                            <div className="group-strips">
                                {groupedChannels.FUTURE.length === 0 ? (
                                    <div className="no-channels">No active channels</div>
                                ) : (
                                    groupedChannels.FUTURE.map(channel => (
                                        <ChannelStrip
                                            key={channel.id}
                                            noduleId={channel.id}
                                            channel={channel}
                                            onUpdate={handleChannelUpdate}
                                            onKick={handleKick}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Master Section */}
                    <div className="master-section">
                        <div className="master-fader">
                            <span className="master-label">MASTER</span>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                value={masterGain}
                                onChange={handleMasterGainChange}
                                className="master-slider"
                            />
                            <span className="master-value">{(masterGain * 100).toFixed(0)}%</span>
                        </div>
                        <div className="master-vu">
                            <div 
                                className="vu-bar"
                                style={{ width: `${masterGain * 50}%` }}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

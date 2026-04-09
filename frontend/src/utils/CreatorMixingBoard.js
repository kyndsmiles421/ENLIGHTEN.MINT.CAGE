/**
 * ENLIGHTEN.MINT.CAFE - Creator Mixing Board Logic
 * Purpose: Universal attachment of all modules to the Sovereign controls
 * Architecture: Live Environment where every nodule pipes into the Mixing Board
 */

const CreatorMixingBoard = (() => {
    // 1. The "Live Wire" Connection
    const activeRegistry = new Map(); // Tracks all live nodules

    const attachToMixer = (noduleId, type, element = null) => {
        console.log(`Creator Mode: Wiring ${noduleId} (${type}) to the Mixing Board.`);
        
        // Every nodule gets a "Channel Strip" in the backend logic
        const channelStrip = {
            source: type,      // Past, Present, or Future
            gain: 1.0,         // Intensity of the glow/pulse
            pan: 0,            // Position on the Staircase (-1 left, 1 right)
            frequency: 440,    // Base frequency in Hz (A4)
            effects: [],       // Iridescent filters
            muted: false,      // Silence toggle
            solo: false,       // Solo this channel
            element: element,  // DOM reference for live manipulation
            timestamp: Date.now()
        };
        
        activeRegistry.set(noduleId, channelStrip);
        
        // Dispatch event for React components to update
        window.dispatchEvent(new CustomEvent('MIXER_CHANNEL_ADDED', { 
            detail: { noduleId, channelStrip } 
        }));
        
        return channelStrip;
    };

    const detachFromMixer = (noduleId) => {
        if (activeRegistry.has(noduleId)) {
            console.log(`Creator Mode: Detaching ${noduleId} from Mixing Board.`);
            activeRegistry.delete(noduleId);
            
            window.dispatchEvent(new CustomEvent('MIXER_CHANNEL_REMOVED', { 
                detail: { noduleId } 
            }));
        }
    };

    // 2. The Universal Listener
    // Automatically detects when ANY module is added to the SovereignGrid
    let stageObserver = null;
    
    const monitorNewManifestations = () => {
        const stage = document.getElementById('app-stage');
        if (!stage) {
            console.warn("Creator Mode: app-stage not found. Retrying in 500ms...");
            setTimeout(monitorNewManifestations, 500);
            return;
        }
        
        stageObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                // Handle added nodes
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && (node.id || node.className)) {
                        const id = node.id || `nodule-${Math.random().toString(36).substr(2, 9)}`;
                        const type = node.closest('.bar-top') ? 'PAST' : 
                                     node.closest('.bar-bottom') ? 'FUTURE' : 'PRESENT';
                        
                        // Skip if already registered
                        if (!activeRegistry.has(id)) {
                            attachToMixer(id, type, node);
                        }
                    }
                });
                
                // Handle removed nodes
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.id) {
                        detachFromMixer(node.id);
                    }
                });
            });
        });

        stageObserver.observe(stage, { childList: true, subtree: true });
        console.log("Creator Mode: Stage Observer active. Monitoring manifestations.");
    };

    // 3. The "Russian Doll" Override
    // Allows the Creator to "Slide" the properties of an entire group at once
    const setGlobalFrequency = (type, intensity) => {
        const root = document.documentElement;
        const clampedIntensity = Math.max(0, Math.min(2, intensity)); // 0-2 range
        
        if (type === 'PAST') {
            root.style.setProperty('--archive-cyan-intensity', clampedIntensity);
            root.style.setProperty('--archive-glow', `rgba(34, 211, 238, ${0.4 * clampedIntensity})`);
        }
        if (type === 'PRESENT') {
            root.style.setProperty('--hub-pulse-intensity', clampedIntensity);
            root.style.setProperty('--iridescent-glow', `rgba(192, 132, 252, ${0.5 * clampedIntensity})`);
        }
        if (type === 'FUTURE') {
            root.style.setProperty('--manifest-purple-intensity', clampedIntensity);
            root.style.setProperty('--manifest-glow', `rgba(168, 85, 247, ${0.4 * clampedIntensity})`);
        }
        
        // Update all channels of this type
        activeRegistry.forEach((channel, id) => {
            if (channel.source === type) {
                channel.gain = clampedIntensity;
                applyChannelToElement(id, channel);
            }
        });
        
        window.dispatchEvent(new CustomEvent('MIXER_GLOBAL_UPDATE', { 
            detail: { type, intensity: clampedIntensity } 
        }));
    };

    // 4. Individual Channel Control
    const setChannelProperty = (noduleId, property, value) => {
        const channel = activeRegistry.get(noduleId);
        if (!channel) {
            console.warn(`Creator Mode: Channel ${noduleId} not found.`);
            return null;
        }
        
        channel[property] = value;
        applyChannelToElement(noduleId, channel);
        
        window.dispatchEvent(new CustomEvent('MIXER_CHANNEL_UPDATE', { 
            detail: { noduleId, property, value, channel } 
        }));
        
        return channel;
    };

    // 5. Apply channel strip settings to DOM element
    const applyChannelToElement = (noduleId, channel) => {
        const element = channel.element || document.getElementById(noduleId);
        if (!element) return;
        
        // Apply gain as opacity/scale
        if (!channel.muted) {
            element.style.opacity = Math.min(1, 0.5 + (channel.gain * 0.5));
            element.style.transform = `scale(${0.9 + (channel.gain * 0.1)})`;
        } else {
            element.style.opacity = 0.2;
            element.style.transform = 'scale(0.9)';
        }
        
        // Apply pan as horizontal translate
        element.style.marginLeft = `${channel.pan * 20}px`;
        
        // Apply frequency as animation speed
        const animDuration = 2000 / (channel.frequency / 440);
        element.style.animationDuration = `${animDuration}ms`;
    };

    // 6. Master Controls
    const masterGain = { value: 1.0 };
    
    const setMasterGain = (value) => {
        masterGain.value = Math.max(0, Math.min(2, value));
        
        // Apply to all channels
        activeRegistry.forEach((channel, id) => {
            applyChannelToElement(id, {
                ...channel,
                gain: channel.gain * masterGain.value
            });
        });
        
        window.dispatchEvent(new CustomEvent('MIXER_MASTER_UPDATE', { 
            detail: { masterGain: masterGain.value } 
        }));
    };

    // 7. Signal Health Monitor (prevents "hangs")
    const getSignalHealth = () => {
        const health = {
            totalChannels: activeRegistry.size,
            bySource: { PAST: 0, PRESENT: 0, FUTURE: 0 },
            staleChannels: [],
            avgGain: 0
        };
        
        let totalGain = 0;
        const now = Date.now();
        
        activeRegistry.forEach((channel, id) => {
            health.bySource[channel.source]++;
            totalGain += channel.gain;
            
            // Flag channels older than 30 seconds with no updates
            if (now - channel.timestamp > 30000) {
                health.staleChannels.push(id);
            }
        });
        
        health.avgGain = health.totalChannels > 0 ? totalGain / health.totalChannels : 0;
        
        return health;
    };

    // 8. Emergency: Kick a stale backend agent
    const kickChannel = (noduleId) => {
        console.log(`Creator Mode: KICK signal sent to ${noduleId}`);
        const channel = activeRegistry.get(noduleId);
        
        if (channel && channel.element) {
            // Visual feedback
            channel.element.style.animation = 'kick-pulse 0.3s ease-out';
            setTimeout(() => {
                channel.element.style.animation = '';
            }, 300);
        }
        
        // Reset channel
        if (channel) {
            channel.timestamp = Date.now();
            channel.gain = 1.0;
            channel.muted = false;
        }
        
        window.dispatchEvent(new CustomEvent('MIXER_CHANNEL_KICK', { 
            detail: { noduleId } 
        }));
        
        return channel;
    };

    // 9. Cleanup
    const destroy = () => {
        if (stageObserver) {
            stageObserver.disconnect();
            stageObserver = null;
        }
        activeRegistry.clear();
        console.log("Creator Mode: Mixing Board shutdown.");
    };

    return {
        init: () => {
            monitorNewManifestations();
            console.log("MX Protocol: Creator Mixing Board Online.");
        },
        destroy,
        
        // Registry access
        getRegistry: () => activeRegistry,
        getChannel: (id) => activeRegistry.get(id),
        
        // Channel controls
        attachToMixer,
        detachFromMixer,
        setChannelProperty,
        kickChannel,
        
        // Global controls
        setGlobalFrequency,
        setMasterGain,
        getMasterGain: () => masterGain.value,
        
        // Health monitoring
        getSignalHealth
    };
})();

// Expose globally for console access
if (typeof window !== 'undefined') {
    window.CreatorMixingBoard = CreatorMixingBoard;
}

export default CreatorMixingBoard;

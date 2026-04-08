/**
 * ENLIGHTEN.MINT.CAFE - Unified Performance & TTS Fallback Logic
 * Battery optimization + Web Speech API fallback when backend TTS fails
 */

// --- 1. BATTERY & PERFORMANCE OPTIMIZATION ---
const performanceManager = {
    loopActive: true,
    audioCtx: null,
    _initialized: false,
    _animationCallbacks: new Map(),
    _frameId: null,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        // Lazy-init AudioContext only on first user gesture
        this.audioCtx = null;

        // Halt loops when tab is hidden
        document.addEventListener("visibilitychange", () => {
            this.loopActive = (document.visibilityState === "visible");
            this.toggleAudio();
            
            // Notify all registered callbacks
            window.dispatchEvent(new CustomEvent('performanceStateChange', {
                detail: { active: this.loopActive }
            }));
        });

        // Battery API integration (if available)
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.15 && !battery.charging) {
                        console.warn('[PerformanceManager] Low battery detected, suspending non-essential audio');
                        this.suspendAudio();
                    }
                });
            });
        }

        console.log('[PerformanceManager] Initialized');
    },

    getAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioCtx;
    },

    toggleAudio() {
        if (!this.audioCtx) return;
        
        if (!this.loopActive) {
            this.audioCtx.suspend().catch(() => {});
        } else {
            this.audioCtx.resume().catch(() => {});
        }
    },

    suspendAudio() {
        if (this.audioCtx && this.audioCtx.state === 'running') {
            this.audioCtx.suspend().catch(() => {});
        }
    },

    resumeAudio() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
        }
    },

    // Efficient physics loop that respects visibility
    runPhysicsLoop(callback, id = 'default') {
        const loop = () => {
            if (!this.loopActive) {
                // When inactive, poll at reduced rate (250ms)
                setTimeout(() => requestAnimationFrame(loop), 250);
                return;
            }
            callback();
            requestAnimationFrame(loop);
        };
        
        this._animationCallbacks.set(id, callback);
        requestAnimationFrame(loop);
    },

    // Stop a specific loop
    stopLoop(id) {
        this._animationCallbacks.delete(id);
    },

    // Check if system is in low-power mode
    isLowPowerMode() {
        return !this.loopActive;
    }
};

// --- 2. TTS FALLBACK (Web Speech API) ---
const narrationSystem = {
    _currentUtterance: null,
    _audioElement: null,

    async playVoice(text, options = {}) {
        const { voice = 'nova', speed = 1.0, onStart, onEnd, onError } = options;
        
        // Stop any existing playback
        this.stop();

        try {
            // Attempt primary Backend API first
            const API = process.env.REACT_APP_BACKEND_URL || '';
            const response = await fetch(`${API}/api/tts/narrate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, speed })
            });

            if (!response.ok) {
                throw new Error("API_500_FALLBACK");
            }

            const data = await response.json();
            if (!data.audio) throw new Error("NO_AUDIO_DATA");

            // Play the backend audio
            this._audioElement = new Audio(`data:audio/mp3;base64,${data.audio}`);
            this._audioElement.onplay = () => onStart?.();
            this._audioElement.onended = () => onEnd?.();
            this._audioElement.onerror = () => {
                console.warn('[NarrationSystem] Audio playback error, falling back to browser TTS');
                this.browserFallback(text, { speed, onStart, onEnd, onError });
            };
            
            await this._audioElement.play();
            
        } catch (err) {
            console.warn('[NarrationSystem] Backend TTS failed, switching to Browser-Native TTS Fallback...', err.message);
            this.browserFallback(text, { speed, onStart, onEnd, onError });
        }
    },

    browserFallback(text, options = {}) {
        const { speed = 1.0, onStart, onEnd, onError } = options;
        
        if (!window.speechSynthesis) {
            console.error('[NarrationSystem] Web Speech API not supported');
            onError?.('Web Speech API not supported in this browser');
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.5, Math.min(speed * 0.9, 2.0)); // Slight slow down for "Nova" vibe
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // Try to find a pleasant voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.name.includes('Samantha') || 
            v.name.includes('Google US English') ||
            v.name.includes('Microsoft Zira') ||
            v.lang.startsWith('en')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            console.log('[NarrationSystem] Browser TTS started');
            onStart?.();
        };
        
        utterance.onend = () => {
            console.log('[NarrationSystem] Browser TTS ended');
            this._currentUtterance = null;
            onEnd?.();
        };
        
        utterance.onerror = (event) => {
            console.error('[NarrationSystem] Browser TTS error:', event.error);
            this._currentUtterance = null;
            onError?.(event.error);
        };

        this._currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    },

    stop() {
        // Stop backend audio
        if (this._audioElement) {
            this._audioElement.pause();
            this._audioElement.removeAttribute('src');
            this._audioElement = null;
        }
        
        // Stop browser TTS
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        this._currentUtterance = null;
    },

    pause() {
        if (this._audioElement && !this._audioElement.paused) {
            this._audioElement.pause();
        }
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    },

    resume() {
        if (this._audioElement && this._audioElement.paused) {
            this._audioElement.play().catch(() => {});
        }
        if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    },

    isSpeaking() {
        return (this._audioElement && !this._audioElement.paused) || 
               (window.speechSynthesis && window.speechSynthesis.speaking);
    }
};

// Auto-initialize performance manager
performanceManager.init();

// Expose to window for global access
window.CAFE_PERFORMANCE = performanceManager;
window.CAFE_NARRATION = narrationSystem;

export { performanceManager, narrationSystem };

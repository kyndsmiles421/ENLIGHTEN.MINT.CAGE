import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Star } from 'lucide-react';
import { CosmicCanvas, CharacterSelect, GameScene } from '../components/starseed';
import ProgressGate from '../components/ProgressGate';
import SovereignKernel from '../kernel/SovereignKernel';
import { commit as busCommit } from '../state/ContextBus';
import { useResonance } from '../hooks/useResonance';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StarseedAdventure() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('starseed_adventure', 8); }, []);

  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const starseedResonance = useResonance();
  // V68.63 — When the player enters from the Multiverse map, the
  // realm id is on the URL. We pass it through to the scene
  // generator so the LLM weaves the realm's lore into the opening.
  const [searchParams] = useSearchParams();
  const realmFromUrl = searchParams.get('realm') || null;
  const originFromUrl = searchParams.get('origin') || null;

  const [origins, setOrigins] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [activeOrigin, setActiveOrigin] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [characterState, setCharacterState] = useState(null);
  const [sceneImage, setSceneImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [view, setView] = useState('select');

  // V68.33 — Read auth token freshly from localStorage for every
  // authenticated call on this page. The AuthContext's memoized
  // `authHeaders` can briefly be `{}` during hydration, which caused
  // /api/starseed/my-characters and the Continue/Play button to 401
  // and fail silently ("dead button" reported by real users). Reading
  // the token directly guarantees the header is always set when the
  // request fires.
  const buildHeaders = useCallback(() => {
    try {
      const t = localStorage.getItem('zen_token');
      return t && t !== 'guest_token' ? { Authorization: `Bearer ${t}` } : {};
    } catch { return {}; }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    Promise.all([
      axios.get(`${API}/starseed/origins`).then(r => setOrigins(r.data.origins)).catch(() => {}),
      axios.get(`${API}/starseed/my-characters`, { headers: buildHeaders() }).then(r => setCharacters(r.data.characters)).catch(() => {}),
    ]).finally(() => setInitialLoading(false));
  }, [user, authLoading, buildHeaders, navigate]);

  const generateSceneImage = useCallback(async (imagePrompt, originId) => {
    if (!imagePrompt) return;
    setImageLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/generate-scene-image`, {
        image_prompt: imagePrompt, origin_id: originId,
      }, { headers: buildHeaders() });
      if (res.data.image_base64) {
        setSceneImage(`data:image/png;base64,${res.data.image_base64}`);
      } else if (res.data.image_url) {
        setSceneImage(res.data.image_url);
      }
    } catch {
      try {
        const bgRes = await axios.get(`${API}/starseed/backgrounds/${originId}`);
        if (bgRes.data.backgrounds?.length) {
          setSceneImage(bgRes.data.backgrounds[Math.floor(Math.random() * bgRes.data.backgrounds.length)]);
        }
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    } finally {
      setImageLoading(false);
    }
  }, [buildHeaders]);

  const startNewAdventure = useCallback(async (originId, characterName) => {
    // V1.0.8 — Pre-flight auth check. The previous version flipped to
    // the game view optimistically and then rolled back on 401, which
    // looked like a "dead button" to users with stale/guest tokens.
    // Now we verify auth FIRST and route to /auth with a clear message
    // instead of a silent rollback.
    const headers = buildHeaders();
    if (!headers.Authorization) {
      toast.error('Sign in to begin your adventure', { duration: 3500 });
      navigate('/auth?next=/starseed-adventure');
      return;
    }
    setLoading(true);
    setSceneImage(null);
    // V68.31: fire the Sovereign Kernel interact event (Layer 4) AND lock
    // the audio bus to 528Hz so the opt-in solfeggio is the only tone
    // allowed during the channelling transition.
    SovereignKernel.interact('starseed.begin-adventure', {
      resonance: 'starseed',
      context: `origin:${originId}`,
    });
    SovereignKernel.lockAudioTo528();
    // V68.31: optimistic view switch — flip to the game canvas IMMEDIATELY so
    // the player sees motion, a title and a channeling indicator instead of
    // staring at a "Channeling…" button for 8s that looks broken.
    const origin = origins.find(o => o.id === originId);
    setActiveOrigin(origin);
    setCurrentScene(null); // GameScene renders its channeling skeleton
    setView('game');
    try {
      await axios.post(`${API}/starseed/create-character`, {
        origin_id: originId, character_name: characterName,
      }, { headers });
      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null, realm_id: realmFromUrl || undefined,
      }, { headers });
      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      toast.success(`${origin.name} adventure begins!`);
      generateSceneImage(sceneRes.data.scene.image_prompt, originId);

      // V68.51 — commit world to ContextBus so Story / Forecast /
      // Dream tools inherit this Starseed reality automatically.
      try {
        busCommit('worldMetadata', {
          origin_id: originId,
          origin_name: origin?.name,
          scene_title: sceneRes.data.scene?.title,
          scene_description: sceneRes.data.scene?.description,
          biome: sceneRes.data.scene?.location || origin?.name,
          ts: Date.now(),
        }, { moduleId: 'STARSEED' });
        starseedResonance.triggerPulse(
          (sceneRes.data.scene?.description || sceneRes.data.scene?.title || '') + ' ' + (origin?.name || ''),
          'STARSEED',
        );
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    } catch (err) {
      // V1.0.8 — Specific 401 handling. If the token expired mid-flow,
      // tell the user instead of silently bouncing them back.
      const status = err?.response?.status;
      if (status === 401) {
        toast.error('Session expired — please sign in again', { duration: 4000 });
        navigate('/auth?next=/starseed-adventure');
      } else {
        toast.error(err?.response?.data?.detail || 'Could not start adventure. Try again.');
      }
      // Roll back to select on failure
      setView('select');
      setActiveOrigin(null);
    } finally {
      setLoading(false);
      SovereignKernel.unlockAudio();
    }
  }, [buildHeaders, origins, generateSceneImage, realmFromUrl, navigate, starseedResonance]);

  const resumeAdventure = useCallback(async (originId) => {
    setLoading(true);
    setSceneImage(null);
    // V68.31: optimistic view switch for resume too.
    const origin = origins.find(o => o.id === originId);
    setActiveOrigin(origin);
    setCurrentScene(null);
    setView('game');
    try {
      const charRes = await axios.get(`${API}/starseed/character/${originId}`, { headers: buildHeaders() });
      setCharacterState(charRes.data);
      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null, realm_id: realmFromUrl || undefined,
      }, { headers: buildHeaders() });
      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      generateSceneImage(sceneRes.data.scene.image_prompt, originId);
    } catch (err) {
      const msg = err?.response?.status === 401
        ? 'Your session expired — please sign in again.'
        : (err?.response?.data?.detail || 'Could not resume adventure. Try again.');
      toast.error(msg);
      setView('select');
      setActiveOrigin(null);
    } finally {
      setLoading(false);
    }
  }, [buildHeaders, origins, generateSceneImage, realmFromUrl]);

  // V68.63 — When the player enters from the Multiverse map with a
  // realm + origin in the URL, auto-resume the matching character
  // instead of forcing them through the character-select screen
  // again. If they don't have one for this origin, select stays so
  // they can name a new one.
  const autoEnteredRef = React.useRef(false);
  useEffect(() => {
    if (autoEnteredRef.current) return;
    if (initialLoading || !originFromUrl || !origins.length) return;
    const existing = characters.find(c => c.origin_id === originFromUrl);
    if (existing) {
      autoEnteredRef.current = true;
      resumeAdventure(originFromUrl);
    }
  }, [initialLoading, originFromUrl, origins, characters, resumeAdventure]);

  const makeChoice = useCallback(async (choiceIndex) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    setSceneImage(null);
    SovereignKernel.interact('starseed.make-choice', {
      resonance: 'starseed',
      context: `origin:${activeOrigin.id};choice:${choiceIndex}`,
    });
    try {
      const res = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: activeOrigin.id, choice_index: choiceIndex,
      }, { headers: buildHeaders() });
      setCurrentScene(res.data.scene);
      setCharacterState(res.data.character);
      generateSceneImage(res.data.scene.image_prompt, activeOrigin.id);

      // V68.51 — every choice updates the world snapshot on the bus.
      try {
        busCommit('worldMetadata', {
          origin_id: activeOrigin.id,
          origin_name: activeOrigin.name,
          scene_title: res.data.scene?.title,
          scene_description: res.data.scene?.description,
          biome: res.data.scene?.location || activeOrigin.name,
          last_choice: choiceIndex,
          ts: Date.now(),
        }, { moduleId: 'STARSEED' });
        starseedResonance.triggerPulse(
          res.data.scene?.description || res.data.scene?.title || '',
          'STARSEED',
        );
      } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
    } catch {
      toast.error('The cosmos falters... try again');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, buildHeaders, loading, generateSceneImage]);

  const goBack = () => {
    setView('select');
    setCurrentScene(null);
    setCharacterState(null);
    setActiveOrigin(null);
    setSceneImage(null);
    axios.get(`${API}/starseed/my-characters`, { headers: buildHeaders() })
      .then(r => setCharacters(r.data.characters)).catch(() => {});
  };

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Sparkles size={28} style={{ color: '#C084FC' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <ProgressGate gateId="starseed-adventure" color="#C084FC">
    <div className="min-h-screen relative" data-testid="starseed-adventure-page">
      <CosmicCanvas
        originColor={activeOrigin?.color || '#C084FC'}
        atmosphere={currentScene?.atmosphere || 'mystical'}
        active={view === 'game' || !activeOrigin}
      />

      <div className="relative z-10 px-4 md:px-12 lg:px-24 py-10">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'select' ? (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}>
                <CharacterSelect
                  origins={origins}
                  existingCharacters={characters}
                  onSelect={startNewAdventure}
                  onResume={resumeAdventure}
                  loading={loading}
                  authHeaders={authHeaders}
                />
              </motion.div>
            ) : (
              <motion.div key="game" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                {activeOrigin && (
                  <GameScene
                    scene={currentScene}
                    character={characterState}
                    origin={activeOrigin}
                    onChoice={makeChoice}
                    loading={loading}
                    onBack={goBack}
                    sceneImage={sceneImage}
                    imageLoading={imageLoading}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {loading && view === 'select' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative w-full flex flex-col"
            style={{ background: 'transparent', backdropFilter: 'none'}}>
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: `radial-gradient(circle, ${activeOrigin?.color || '#C084FC'}20, transparent)`, border: `1px solid ${activeOrigin?.color || '#C084FC'}30` }}>
                  <Star size={32} style={{ color: activeOrigin?.color || '#C084FC' }} />
                </div>
              </motion.div>
              <p className="text-lg mt-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: activeOrigin?.color || '#C084FC' }}>
                Channeling cosmic frequencies...
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your adventure is being woven by AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ProgressGate>
  );
}

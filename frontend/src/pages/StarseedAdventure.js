import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Star } from 'lucide-react';
import { CosmicCanvas, CharacterSelect, GameScene } from '../components/starseed';
import ProgressGate from '../components/ProgressGate';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StarseedAdventure() {
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('starseed_adventure', 8); }, []);

  const { user, authHeaders, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
      } catch {}
    } finally {
      setImageLoading(false);
    }
  }, [buildHeaders]);

  const startNewAdventure = useCallback(async (originId, characterName) => {
    setLoading(true);
    setSceneImage(null);
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
      }, { headers: buildHeaders() });
      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null,
      }, { headers: buildHeaders() });
      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      toast.success(`${origin.name} adventure begins!`);
      generateSceneImage(sceneRes.data.scene.image_prompt, originId);
    } catch {
      toast.error('Could not start adventure');
      // Roll back to select on failure
      setView('select');
      setActiveOrigin(null);
    } finally {
      setLoading(false);
    }
  }, [buildHeaders, origins, generateSceneImage]);

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
        origin_id: originId, choice_index: null,
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
  }, [buildHeaders, origins, generateSceneImage]);

  const makeChoice = useCallback(async (choiceIndex) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    setSceneImage(null);
    try {
      const res = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: activeOrigin.id, choice_index: choiceIndex,
      }, { headers: buildHeaders() });
      setCurrentScene(res.data.scene);
      setCharacterState(res.data.character);
      generateSceneImage(res.data.scene.image_prompt, activeOrigin.id);
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

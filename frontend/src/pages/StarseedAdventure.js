import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Star } from 'lucide-react';
import { CosmicCanvas, CharacterSelect, GameScene } from '../components/starseed';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StarseedAdventure() {
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }
    Promise.all([
      axios.get(`${API}/starseed/origins`).then(r => setOrigins(r.data.origins)).catch(() => {}),
      axios.get(`${API}/starseed/my-characters`, { headers: authHeaders }).then(r => setCharacters(r.data.characters)).catch(() => {}),
    ]).finally(() => setInitialLoading(false));
  }, [user, authLoading, authHeaders, navigate]);

  const generateSceneImage = useCallback(async (imagePrompt, originId) => {
    if (!imagePrompt) return;
    setImageLoading(true);
    try {
      const res = await axios.post(`${API}/starseed/generate-scene-image`, {
        image_prompt: imagePrompt, origin_id: originId,
      }, { headers: authHeaders });
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
  }, [authHeaders]);

  const startNewAdventure = useCallback(async (originId, characterName) => {
    setLoading(true);
    setSceneImage(null);
    try {
      await axios.post(`${API}/starseed/create-character`, {
        origin_id: originId, character_name: characterName,
      }, { headers: authHeaders });
      const origin = origins.find(o => o.id === originId);
      setActiveOrigin(origin);
      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null,
      }, { headers: authHeaders });
      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      setView('game');
      toast.success(`${origin.name} adventure begins!`);
      generateSceneImage(sceneRes.data.scene.image_prompt, originId);
    } catch {
      toast.error('Could not start adventure');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, origins, generateSceneImage]);

  const resumeAdventure = useCallback(async (originId) => {
    setLoading(true);
    setSceneImage(null);
    try {
      const origin = origins.find(o => o.id === originId);
      setActiveOrigin(origin);
      const charRes = await axios.get(`${API}/starseed/character/${originId}`, { headers: authHeaders });
      setCharacterState(charRes.data);
      const sceneRes = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: originId, choice_index: null,
      }, { headers: authHeaders });
      setCurrentScene(sceneRes.data.scene);
      setCharacterState(sceneRes.data.character);
      setView('game');
      generateSceneImage(sceneRes.data.scene.image_prompt, originId);
    } catch {
      toast.error('Could not resume adventure');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, origins, generateSceneImage]);

  const makeChoice = useCallback(async (choiceIndex) => {
    if (!activeOrigin || loading) return;
    setLoading(true);
    setSceneImage(null);
    try {
      const res = await axios.post(`${API}/starseed/generate-scene`, {
        origin_id: activeOrigin.id, choice_index: choiceIndex,
      }, { headers: authHeaders });
      setCurrentScene(res.data.scene);
      setCharacterState(res.data.character);
      generateSceneImage(res.data.scene.image_prompt, activeOrigin.id);
    } catch {
      toast.error('The cosmos falters... try again');
    } finally {
      setLoading(false);
    }
  }, [activeOrigin, authHeaders, loading, generateSceneImage]);

  const goBack = () => {
    setView('select');
    setCurrentScene(null);
    setCharacterState(null);
    setActiveOrigin(null);
    setSceneImage(null);
    axios.get(`${API}/starseed/my-characters`, { headers: authHeaders })
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
  );
}

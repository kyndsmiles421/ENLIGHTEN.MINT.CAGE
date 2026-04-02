import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Scroll, CheckCircle, HelpCircle, Send, Globe, Clock, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HistoryPanel() {
  const { authHeaders } = useAuth();
  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/history-modules`, { headers: authHeaders });
      setModules(res.data.modules || []);
    } catch (e) { console.error('History fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const [questionText, setQuestionText] = useState('');
  const [questionHint, setQuestionHint] = useState('');

  const fetchQuestion = async (modId, idx) => {
    try {
      const res = await axios.get(`${API}/science-history/history/${modId}/question/${idx}`, { headers: authHeaders });
      setQuestionText(res.data.question);
      setQuestionHint(res.data.hint);
    } catch (e) { setQuestionText('Question unavailable'); }
  };

  const openModule = (mod) => {
    setActiveModule(mod);
    setQIndex(0);
    setAnswer('');
    setFeedback(null);
    fetchQuestion(mod.id, 0);
  };

  const submitAnswer = async () => {
    if (!activeModule || !answer.trim()) return;
    try {
      const res = await axios.post(`${API}/science-history/history/answer`, {
        module_id: activeModule.id,
        question_index: qIndex,
        answer: answer.trim(),
      }, { headers: authHeaders });
      setFeedback(res.data);
      if (res.data.correct) {
        setTimeout(() => {
          if (qIndex < activeModule.question_count - 1) {
            const nextIdx = qIndex + 1;
            setQIndex(nextIdx);
            setAnswer('');
            setFeedback(null);
            fetchQuestion(activeModule.id, nextIdx);
          } else {
            setActiveModule(null);
            fetchModules();
          }
        }, 1500);
      }
    } catch (e) {
      setFeedback({ correct: false, message: e.response?.data?.detail || 'Failed' });
    }
  };

  // Geology data
  const [geoModules, setGeoModules] = useState([]);
  const [activeGeo, setActiveGeo] = useState(null);
  const [geoQIndex, setGeoQIndex] = useState(0);
  const [geoAnswer, setGeoAnswer] = useState('');
  const [geoFeedback, setGeoFeedback] = useState(null);

  const [geoQuestionText, setGeoQuestionText] = useState('');
  const [geoQuestionHint, setGeoQuestionHint] = useState('');

  const fetchGeoQuestion = async (modId, idx) => {
    try {
      const res = await axios.get(`${API}/science-history/geology/${modId}/question/${idx}`, { headers: authHeaders });
      setGeoQuestionText(res.data.question);
      setGeoQuestionHint(res.data.hint);
    } catch (e) { setGeoQuestionText('Question unavailable'); }
  };

  const fetchGeo = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/science-history/geology`, { headers: authHeaders });
      setGeoModules(res.data.modules || []);
    } catch (e) { console.error('Geology fetch failed', e); }
  }, [authHeaders]);

  useEffect(() => { fetchGeo(); }, [fetchGeo]);

  const openGeo = (mod) => {
    setActiveGeo(mod);
    setGeoQIndex(0);
    setGeoAnswer('');
    setGeoFeedback(null);
    fetchGeoQuestion(mod.id, 0);
  };

  const submitGeo = async () => {
    if (!activeGeo || !geoAnswer.trim()) return;
    try {
      const res = await axios.post(`${API}/science-history/geology/answer`, {
        module_id: activeGeo.id,
        question_index: geoQIndex,
        answer: geoAnswer.trim(),
      }, { headers: authHeaders });
      setGeoFeedback(res.data);
      if (res.data.correct) {
        setTimeout(() => {
          if (geoQIndex < activeGeo.question_count - 1) {
            const nextIdx = geoQIndex + 1;
            setGeoQIndex(nextIdx);
            setGeoAnswer('');
            setGeoFeedback(null);
            fetchGeoQuestion(activeGeo.id, nextIdx);
          } else {
            setActiveGeo(null);
            fetchGeo();
          }
        }, 1500);
      }
    } catch (e) {
      setGeoFeedback({ correct: false, message: e.response?.data?.detail || 'Failed' });
    }
  };

  // Fetch both History Q&A modules and Geology modules from the backend
  // The History modules use the /history-modules and /history/answer endpoints
  // Geology modules use /geology and /geology/answer endpoints
  // They are displayed in separate labeled sections within this single panel

  return (
    <div className="space-y-4" data-testid="history-panel">
      {/* HISTORY SECTION */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Scroll size={11} style={{ color: '#EC4899' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#EC4899' }}>
            History Modules — The Chronicler
          </span>
        </div>

        {!activeModule ? (
          modules.map(mod => (
            <div key={mod.id}
              className="rounded-lg p-2.5 cursor-pointer transition-all hover:scale-[1.005]"
              style={{
                background: mod.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
                border: `1px solid ${mod.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
              }}
              onClick={() => !mod.completed && openModule(mod)}
              data-testid={`history-${mod.id}`}
            >
              <div className="flex items-center gap-2">
                {mod.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <Globe size={10} style={{ color: '#EC4899' }} />}
                <span className="text-[10px] font-medium flex-1" style={{ color: mod.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
                  {mod.name}
                </span>
                <span className="text-[7px]" style={{ color: '#EC4899' }}>+{mod.resonance} res</span>
              </div>
              <div className="flex gap-2 mt-0.5 ml-5">
                <span className="text-[7px] flex items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={7} /> {mod.era}
                </span>
                <span className="text-[7px]" style={{ color: 'var(--text-muted)' }}>
                  {mod.civilizations?.join(', ')}
                </span>
              </div>
              <p className="text-[8px] mt-0.5 ml-5" style={{ color: 'var(--text-muted)' }}>{mod.description}</p>
              <p className="text-[7px] mt-0.5 ml-5" style={{ color: '#EC4899' }}>{mod.question_count} questions</p>
            </div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <button onClick={() => setActiveModule(null)} className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              ← Back to modules
            </button>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(236,72,153,0.04)', border: '1px solid rgba(236,72,153,0.1)' }}>
              <p className="text-[10px] font-medium" style={{ color: '#EC4899' }}>{activeModule.name}</p>
              <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Question {qIndex + 1} of {activeModule.question_count}</p>

              {/* Progress dots */}
              <div className="flex gap-1 mt-1.5 mb-2">
                {Array.from({ length: activeModule.question_count }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{
                    background: i < qIndex ? '#2DD4BF' : i === qIndex ? '#EC4899' : 'rgba(248,250,252,0.08)',
                  }} />
                ))}
              </div>

              <p className="text-[9px] my-2" style={{ color: 'var(--text-primary)' }}>
                {questionText || 'Loading question...'}
              </p>
              {questionHint && (
                <p className="text-[7px] mb-1 italic" style={{ color: 'var(--text-muted)' }}>
                  Hint: {questionHint}
                </p>
              )}

              {/* Answer input */}
              <div className="flex gap-1.5">
                <input
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="flex-1 px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                  data-testid={`history-answer-input`}
                  onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                />
                <button onClick={submitAnswer}
                  className="px-2.5 py-1 rounded text-[8px] flex items-center gap-1"
                  style={{ background: 'rgba(236,72,153,0.1)', color: '#EC4899' }}
                  data-testid="history-submit-btn">
                  <Send size={8} /> Answer
                </button>
              </div>

              {feedback && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[9px] mt-2 p-1.5 rounded"
                  style={{
                    background: feedback.correct ? 'rgba(45,212,191,0.06)' : 'rgba(239,68,68,0.06)',
                    color: feedback.correct ? '#2DD4BF' : '#EF4444',
                  }}
                  data-testid="history-feedback"
                >
                  {feedback.message}
                  {feedback.resonance_earned > 0 && ` (+${feedback.resonance_earned} resonance)`}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* GEOLOGY SECTION */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={11} style={{ color: '#F59E0B' }} />
          <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: '#F59E0B' }}>
            Geology — Earth Layer Science
          </span>
        </div>

        {!activeGeo ? (
          geoModules.map(mod => (
            <div key={mod.id}
              className="rounded-lg p-2.5 cursor-pointer transition-all hover:scale-[1.005]"
              style={{
                background: mod.completed ? 'rgba(45,212,191,0.03)' : 'rgba(248,250,252,0.015)',
                border: `1px solid ${mod.completed ? 'rgba(45,212,191,0.1)' : 'rgba(248,250,252,0.04)'}`,
              }}
              onClick={() => !mod.completed && openGeo(mod)}
              data-testid={`geology-${mod.id}`}
            >
              <div className="flex items-center gap-2">
                {mod.completed ? <CheckCircle size={10} style={{ color: '#2DD4BF' }} /> : <HelpCircle size={10} style={{ color: '#F59E0B' }} />}
                <span className="text-[10px] font-medium flex-1" style={{ color: mod.completed ? '#2DD4BF' : 'var(--text-primary)' }}>
                  {mod.name}
                </span>
                <span className="text-[7px]" style={{ color: '#F59E0B' }}>+{mod.resonance} res</span>
              </div>
              <p className="text-[8px] mt-0.5 ml-5" style={{ color: 'var(--text-muted)' }}>{mod.description}</p>
              <p className="text-[7px] mt-0.5 ml-5" style={{ color: '#F59E0B' }}>{mod.question_count} questions</p>
            </div>
          ))
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <button onClick={() => setActiveGeo(null)} className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
              ← Back to geology
            </button>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
              <p className="text-[10px] font-medium" style={{ color: '#F59E0B' }}>{activeGeo.name}</p>
              <p className="text-[7px]" style={{ color: 'var(--text-muted)' }}>Question {geoQIndex + 1} of {activeGeo.question_count}</p>

              <div className="flex gap-1 mt-1.5 mb-2">
                {Array.from({ length: activeGeo.question_count }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{
                    background: i < geoQIndex ? '#2DD4BF' : i === geoQIndex ? '#F59E0B' : 'rgba(248,250,252,0.08)',
                  }} />
                ))}
              </div>

              <p className="text-[9px] my-2" style={{ color: 'var(--text-primary)' }}>
                {geoQuestionText || 'Loading question...'}
              </p>
              {geoQuestionHint && (
                <p className="text-[7px] mb-1 italic" style={{ color: 'var(--text-muted)' }}>
                  Hint: {geoQuestionHint}
                </p>
              )}

              <div className="flex gap-1.5">
                <input
                  value={geoAnswer}
                  onChange={e => setGeoAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="flex-1 px-2 py-1.5 rounded text-[9px] outline-none"
                  style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
                  data-testid="geology-answer-input"
                  onKeyDown={e => e.key === 'Enter' && submitGeo()}
                />
                <button onClick={submitGeo}
                  className="px-2.5 py-1 rounded text-[8px] flex items-center gap-1"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}
                  data-testid="geology-submit-btn">
                  <Send size={8} /> Answer
                </button>
              </div>

              {geoFeedback && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-[9px] mt-2 p-1.5 rounded"
                  style={{
                    background: geoFeedback.correct ? 'rgba(45,212,191,0.06)' : 'rgba(239,68,68,0.06)',
                    color: geoFeedback.correct ? '#2DD4BF' : '#EF4444',
                  }}
                  data-testid="geology-feedback"
                >
                  {geoFeedback.message}
                  {geoFeedback.resonance_earned > 0 && ` (+${geoFeedback.resonance_earned} resonance)`}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

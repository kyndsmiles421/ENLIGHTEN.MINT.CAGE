import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Target, Loader2, X, ChevronRight, Play, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function PointCard({ point, onSelect, selected }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(point)} className="cursor-pointer rounded-2xl p-5 transition-all"
      data-testid={`point-card-${point.id}`}
      style={{
        background: selected?.id === point.id ? `linear-gradient(135deg, ${point.color}22, ${point.color}08)` : 'rgba(15,17,28,0.6)',
        border: `1px solid ${selected?.id === point.id ? point.color + '55' : 'rgba(248,250,252,0.06)'}`,
        backdropFilter: 'blur(12px)',
      }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${point.color}20`, boxShadow: `0 0 20px ${point.color}15` }}>
          <Target size={18} style={{ color: point.color }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{point.name}</p>
          <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.35)' }}>{point.meridian} Meridian</p>
        </div>
      </div>
      <p className="text-xs mb-2" style={{ color: 'rgba(248,250,252,0.5)' }}>{point.location}</p>
      <div className="flex flex-wrap gap-1.5">
        {point.benefits.slice(0, 3).map(b => (
          <span key={b} className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: `${point.color}12`, color: point.color, border: `1px solid ${point.color}20` }}>{b}</span>
        ))}
      </div>
    </motion.div>
  );
}

function PointDetail({ point, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 mb-6" data-testid="point-detail"
      style={{ background: 'rgba(15,17,28,0.85)', border: `1px solid ${point.color}30`, backdropFilter: 'blur(24px)' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{point.name}</h3>
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>{point.meridian} Meridian | {point.element} Element</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: `${point.color}08`, border: `1px solid ${point.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: point.color }}>Location</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{point.location}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: `${point.color}08`, border: `1px solid ${point.color}15` }}>
          <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: point.color }}>Pressure</p>
          <p className="text-xs" style={{ color: '#F8FAFC' }}>{point.depth}</p>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: point.color }}>Technique</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.65)' }}>{point.technique}</p>
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: point.color }}>Helps With</p>
        <div className="flex flex-wrap gap-1.5">
          {point.conditions.map(c => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: `${point.color}12`, color: point.color, border: `1px solid ${point.color}20` }}>{c}</span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: point.color }}>Duration</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{point.duration}</p>
      </div>
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: point.color }}>Spiritual Significance</p>
        <p className="text-xs italic" style={{ color: 'rgba(248,250,252,0.55)' }}>{point.spiritual}</p>
      </div>
      <div className="rounded-xl p-3" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
        <p className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: '#EAB308' }}>Caution</p>
        <p className="text-xs" style={{ color: 'rgba(248,250,252,0.6)' }}>{point.caution}</p>
      </div>
    </motion.div>
  );
}

function RoutineCard({ routine, onStart }) {
  return (
    <div className="rounded-2xl p-5" data-testid={`routine-${routine.id}`}
      style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(248,250,252,0.06)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${routine.color}18` }}>
            <Play size={16} style={{ color: routine.color }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{routine.name}</p>
            <p className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(248,250,252,0.4)' }}>
              <Clock size={10} />{routine.duration} | {routine.points.length} points
            </p>
          </div>
        </div>
        <button onClick={() => onStart(routine)} className="px-3 py-1.5 rounded-lg text-xs"
          data-testid={`start-routine-${routine.id}`}
          style={{ background: `${routine.color}15`, border: `1px solid ${routine.color}30`, color: routine.color }}>
          View
        </button>
      </div>
      <p className="text-xs mb-2" style={{ color: 'rgba(248,250,252,0.5)' }}>{routine.instructions}</p>
      <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.3)' }}>Best for: {routine.best_for}</p>
    </div>
  );
}

export default function Acupressure() {
  const [points, setPoints] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('points');
  const [routineDetail, setRoutineDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/acupressure/points`),
      axios.get(`${API}/acupressure/routines`),
    ]).then(([pRes, rRes]) => {
      setPoints(pRes.data.points);
      setRoutines(rRes.data.routines);
    }).catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const viewRoutine = async (routine) => {
    try {
      const r = await axios.get(`${API}/acupressure/routine/${routine.id}`);
      setRoutineDetail(r.data);
    } catch { toast.error('Failed'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#EF4444' }} />
    </div>
  );

  const TABS = [
    { id: 'points', label: 'Pressure Points' },
    { id: 'routines', label: 'Healing Routines' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto" data-testid="acupressure-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#EF4444' }}>
            <Target size={12} className="inline mr-1" /> Sacred Acupressure
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
            Acupressure & Massage
          </h1>
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
            Ancient pressure points for healing and energy flow
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); setRoutineDetail(null); }}
              data-testid={`tab-${t.id}`}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(239,68,68,0.15)' : 'rgba(15,17,28,0.4)',
                border: `1px solid ${tab === t.id ? 'rgba(239,68,68,0.3)' : 'rgba(248,250,252,0.06)'}`,
                color: tab === t.id ? '#EF4444' : 'rgba(248,250,252,0.5)',
              }}>{t.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selected && <PointDetail point={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>

        {tab === 'points' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {points.map(p => <PointCard key={p.id} point={p} onSelect={setSelected} selected={selected} />)}
          </div>
        )}

        {tab === 'routines' && (
          <>
            {routineDetail && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 mb-6"
                style={{ background: 'rgba(15,17,28,0.85)', border: `1px solid ${routineDetail.color}30`, backdropFilter: 'blur(24px)' }}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#F8FAFC' }}>{routineDetail.name}</h3>
                  <button onClick={() => setRoutineDetail(null)} className="p-1.5 rounded-lg hover:bg-white/5">
                    <X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
                </div>
                <p className="text-xs mb-4" style={{ color: 'rgba(248,250,252,0.5)' }}>{routineDetail.instructions}</p>
                <div className="space-y-3">
                  {(routineDetail.points_detail || []).map((p, i) => (
                    <div key={p.id} className="rounded-xl p-4"
                      style={{ background: `${p.color}06`, border: `1px solid ${p.color}12` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
                          style={{ background: `${p.color}20`, color: p.color }}>{i + 1}</span>
                        <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{p.name}</p>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'rgba(248,250,252,0.5)' }}>{p.location}</p>
                      <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>{p.technique}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            <div className="space-y-4">
              {routines.map(r => <RoutineCard key={r.id} routine={r} onStart={viewRoutine} />)}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

/**
 * ENLIGHTEN.MINT.CAFE - V10000.2 ACADEMY PORTAL
 * PURPOSE: The Great Library UI | Past-Present-Future Index | Adaptive Learning
 * 
 * Visual: A 3D concave crystal lens that looks like a "well" of light in the Obsidian Void.
 * Interaction: Opens the Integrated Learning Interface showing Past, Present, and Future.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  BookOpen, Scale, Palette, Cpu, Heart, 
  Clock, Zap, ChevronRight, X, Star,
  Layers, Archive, GraduationCap, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import BiometricSync from '../utils/BiometricSync';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Department icons mapping
const DEPT_ICONS = {
  LAW: Scale,
  ARTS: Palette,
  LOGIC: Cpu,
  WELLNESS: Heart,
};

// Temporal epoch colors
const EPOCH_COLORS = {
  PAST: '#8B5CF6',
  PRESENT: '#22C55E',
  FUTURE: '#3B82F6',
};

const AcademyPortal = ({ isOpen, onClose, userResonance = 36 }) => {
  const [loading, setLoading] = useState(false);
  const [manifest, setManifest] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedEpoch, setSelectedEpoch] = useState('PRESENT');
  const [epochData, setEpochData] = useState(null);
  const [knowledgeResult, setKnowledgeResult] = useState(null);
  const [caseLawCount, setCaseLawCount] = useState(0);

  // Fetch manifest on mount
  useEffect(() => {
    if (isOpen) {
      fetchManifest();
    }
  }, [isOpen]);

  // Fetch epoch data when selected
  useEffect(() => {
    if (selectedEpoch && isOpen) {
      fetchEpochData(selectedEpoch);
    }
  }, [selectedEpoch, isOpen]);

  const fetchManifest = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/omnis/academy`);
      setManifest(res.data);
      setCaseLawCount(res.data.case_law_count || 0);
    } catch (err) {
      console.error('Failed to fetch Academy manifest:', err);
    }
    setLoading(false);
  };

  const fetchEpochData = async (epoch) => {
    try {
      const res = await axios.get(`${API}/omnis/academy/temporal/${epoch}`);
      setEpochData(res.data);
    } catch (err) {
      console.error('Failed to fetch epoch data:', err);
    }
  };

  const requestKnowledge = async (sector) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/omnis/academy/knowledge?sector=${sector}&resonance=${userResonance}`
      );
      setKnowledgeResult(res.data);
      setSelectedDept(sector);
      
      // 144Hz haptic feedback
      BiometricSync.vibrateResonance(0.3);
      
      toast.success('Knowledge Accessed', {
        description: `${res.data.course} | Depth ${res.data.depth}`,
      });
    } catch (err) {
      toast.error('Knowledge request failed');
    }
    setLoading(false);
  };

  const archiveCaseLaw = async () => {
    try {
      const res = await axios.post(`${API}/omnis/academy/archive-case`);
      setCaseLawCount(res.data.total_cases);
      
      // Trigger arrival pulse for legal archival
      BiometricSync.triggerArrivalPulse();
      
      toast.success('Case Law Archived', {
        description: `${res.data.entry.case_id} added to World Law Library`,
      });
    } catch (err) {
      toast.error('Failed to archive case law');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{ background: 'transparent', backdropFilter: 'none'}}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(20,15,30,0.99) 0%, rgba(10,8,20,0.99) 100%)',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 0 100px rgba(139,92,246,0.2), 0 0 50px rgba(99,102,241,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
          data-testid="academy-portal"
        >
          {/* Header - Crystal Lens Effect */}
          <div 
            className="p-6 text-center relative overflow-hidden"
            style={{ 
              background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 opacity-20"
              style={{
                background: 'conic-gradient(from 0deg, #8B5CF6, #3B82F6, #22C55E, #EAB308, #EC4899, #8B5CF6)',
                filter: 'blur(40px)',
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <BookOpen size={24} style={{ color: '#A78BFA' }} />
                <h2 className="text-xl font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #A78BFA, #818CF8, #6366F1)' }}>
                  The Great Library
                </h2>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                V10000.2 • Omnis-Academy • Global Repository of Sovereign Knowledge
              </p>
              
              {/* Resonance Display */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <span className="text-xs" style={{ color: '#86EFAC' }}>
                    Resonance: {userResonance}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <span className="text-xs" style={{ color: '#C4B5FD' }}>
                    Depth: {Math.floor(userResonance / 9)}
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(234,179,8,0.15)' }}>
                  <span className="text-xs" style={{ color: '#FDE047' }}>
                    Cases: {caseLawCount}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Temporal Epochs - Past/Present/Future */}
            <div className="grid grid-cols-3 gap-2">
              {['PAST', 'PRESENT', 'FUTURE'].map((epoch) => (
                <button
                  key={epoch}
                  onClick={() => setSelectedEpoch(epoch)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    selectedEpoch === epoch ? 'scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    background: selectedEpoch === epoch 
                      ? `${EPOCH_COLORS[epoch]}20` 
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedEpoch === epoch ? EPOCH_COLORS[epoch] + '50' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <Clock size={16} className="mx-auto mb-1" style={{ color: EPOCH_COLORS[epoch] }} />
                  <p className="text-xs font-medium" style={{ color: EPOCH_COLORS[epoch] }}>
                    {epoch}
                  </p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {epoch === 'PAST' && 'Layers 1-18'}
                    {epoch === 'PRESENT' && 'Layers 19-36'}
                    {epoch === 'FUTURE' && 'Layers 37-54'}
                  </p>
                </button>
              ))}
            </div>

            {/* Epoch Subjects */}
            {epochData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl"
                style={{ 
                  background: `${EPOCH_COLORS[selectedEpoch]}08`,
                  border: `1px solid ${EPOCH_COLORS[selectedEpoch]}20`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={14} style={{ color: EPOCH_COLORS[selectedEpoch] }} />
                  <h3 className="text-sm font-medium" style={{ color: EPOCH_COLORS[selectedEpoch] }}>
                    {epochData.name}
                  </h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto" 
                    style={{ background: `${EPOCH_COLORS[selectedEpoch]}20`, color: EPOCH_COLORS[selectedEpoch] }}>
                    {epochData.fractal_range}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {epochData.subjects?.map((subject) => (
                    <div 
                      key={subject.id}
                      className="p-2 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <p className="text-xs text-white">{subject.name}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        Era: {subject.era}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Departments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <h3 className="text-sm font-medium text-white">Departments</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {manifest?.departments?.map((dept) => {
                  const Icon = DEPT_ICONS[dept.key] || BookOpen;
                  return (
                    <button
                      key={dept.key}
                      onClick={() => requestKnowledge(dept.key)}
                      disabled={loading}
                      className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                      style={{
                        background: selectedDept === dept.key 
                          ? `${dept.color}15` 
                          : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${selectedDept === dept.key ? dept.color + '40' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} style={{ color: dept.color }} />
                        <span className="text-xs font-medium" style={{ color: dept.color }}>
                          {dept.name}
                        </span>
                      </div>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {dept.course_count || dept.courses?.length} courses
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Knowledge Result */}
            {knowledgeResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl"
                style={{ 
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} style={{ color: '#22C55E' }} />
                  <span className="text-xs font-medium" style={{ color: '#22C55E' }}>
                    Knowledge Unlocked
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#86EFAC' }}>
                    {knowledgeResult.vibration}
                  </span>
                </div>
                
                <p className="text-sm text-white mb-2">{knowledgeResult.course}</p>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-lg font-bold" style={{ color: '#22C55E' }}>
                      {knowledgeResult.depth}
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Depth</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-lg font-bold" style={{ color: EPOCH_COLORS[knowledgeResult.epoch] }}>
                      {knowledgeResult.epoch}
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Epoch</p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-lg font-bold" style={{ color: '#3B82F6' }}>
                      L{knowledgeResult.fractal_layer}
                    </p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Layer</p>
                  </div>
                </div>
                
                <p className="text-[9px] mt-2 font-mono text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Next unlock: {knowledgeResult.next_unlock} resonance
                </p>
              </motion.div>
            )}

            {/* Archive Case Law Button */}
            <button
              onClick={archiveCaseLaw}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(217,119,6,0.2))',
                border: '1px solid rgba(234,179,8,0.3)',
                color: '#FDE047',
              }}
              data-testid="archive-case-btn"
            >
              <Archive size={14} />
              Archive Case Law
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Footer */}
          <div 
            className="p-3 border-t text-center"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(139,92,246,0.6)' }}>
              THE LAW ADAPTS TO YOU
            </p>
            <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>
              World Law Library • Black Hills Jurisdiction
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AcademyPortal;

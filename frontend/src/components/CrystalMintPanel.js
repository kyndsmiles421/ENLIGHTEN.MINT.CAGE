/**
 * ENLIGHTEN.MINT.CAFE - V-FINAL CRYSTAL MINT PANEL
 * CrystalMintPanel.js
 * 
 * THE OMEGA-MINT INTERFACE
 * UI for minting Sovereign Mastery Certificate NFTs
 * 
 * FEATURES:
 * - Eligibility checking
 * - QR preview with pentagonal symmetry visualization
 * - Multi-language facet display (EN, ES, FR, DE, JA)
 * - L2 Fractal crystal render preview
 * - Mint execution with progress tracking
 * - NFT gallery view
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Shield, Lock, Unlock, Check, X, Loader2,
  Diamond, Globe, Zap, Star, Crown, Eye, Copy, ExternalLink,
  Hexagon, ChevronRight, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import L2FractalShader from './L2FractalShader';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Language facet colors matching pentagonal symmetry
const LANGUAGE_COLORS = {
  EN: '#60A5FA', // Blue
  ES: '#F59E0B', // Amber
  FR: '#C084FC', // Purple
  DE: '#22C55E', // Green
  JA: '#F472B6', // Pink
};

// PHI constant for visual calculations
const PHI = 1.618033988749895;

/**
 * Pentagonal Crystal Visualization
 * Renders a 5-faceted crystal with language-specific glow
 */
function PentagonalCrystal({ languages, active = true, size = 200 }) {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  // Calculate pentagon vertices
  const vertices = Object.entries(languages || {}).map(([lang, data], index) => {
    const angle = (data.angle - 90) * (Math.PI / 180); // Start from top
    return {
      lang,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      color: LANGUAGE_COLORS[lang] || '#8B5CF6',
      label: data.label,
    };
  });
  
  // Create polygon path
  const polygonPath = vertices.map((v, i) => `${i === 0 ? 'M' : 'L'} ${v.x} ${v.y}`).join(' ') + ' Z';
  
  return (
    <svg width={size} height={size} className="mx-auto">
      <defs>
        {/* Gradient for crystal body */}
        <radialGradient id="crystalGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
          <stop offset="70%" stopColor="rgba(59, 130, 246, 0.1)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        
        {/* Glow filter */}
        <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Background glow */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius * 1.2}
        fill="url(#crystalGrad)"
        className={active ? 'animate-pulse' : ''}
      />
      
      {/* Pentagon outline */}
      <path
        d={polygonPath}
        fill="rgba(139, 92, 246, 0.08)"
        stroke="rgba(139, 92, 246, 0.4)"
        strokeWidth="2"
        filter="url(#crystalGlow)"
      />
      
      {/* Inner pentagon */}
      <path
        d={vertices.map((v, i) => {
          const innerX = centerX + radius * 0.5 * Math.cos((v.lang === 'EN' ? -90 : (Object.keys(LANGUAGE_COLORS).indexOf(v.lang) * 72 - 90)) * Math.PI / 180);
          const innerY = centerY + radius * 0.5 * Math.sin((v.lang === 'EN' ? -90 : (Object.keys(LANGUAGE_COLORS).indexOf(v.lang) * 72 - 90)) * Math.PI / 180);
          return `${i === 0 ? 'M' : 'L'} ${innerX} ${innerY}`;
        }).join(' ') + ' Z'}
        fill="rgba(139, 92, 246, 0.15)"
        stroke="rgba(139, 92, 246, 0.2)"
        strokeWidth="1"
      />
      
      {/* Center QR anchor */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius * 0.15}
        fill="rgba(255, 255, 255, 0.1)"
        stroke="rgba(139, 92, 246, 0.6)"
        strokeWidth="2"
      />
      
      {/* Language vertices */}
      {vertices.map((v, i) => (
        <g key={v.lang}>
          {/* Connection line to center */}
          <line
            x1={centerX}
            y1={centerY}
            x2={v.x}
            y2={v.y}
            stroke={v.color}
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          
          {/* Vertex circle */}
          <circle
            cx={v.x}
            cy={v.y}
            r="8"
            fill={v.color}
            fillOpacity="0.8"
            stroke={v.color}
            strokeWidth="2"
            style={{
              filter: `drop-shadow(0 0 6px ${v.color})`,
            }}
          />
          
          {/* Language code */}
          <text
            x={v.x}
            y={v.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="6"
            fontWeight="bold"
          >
            {v.lang}
          </text>
          
          {/* Angle label */}
          <text
            x={centerX + (radius * 1.25) * Math.cos(((i * 72) - 90) * Math.PI / 180)}
            y={centerY + (radius * 1.25) * Math.sin(((i * 72) - 90) * Math.PI / 180)}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255, 255, 255, 0.4)"
            fontSize="8"
          >
            {v.lang === 'EN' ? '0°' : `${i * 72}°`}
          </text>
        </g>
      ))}
      
      {/* Center label */}
      <text
        x={centerX}
        y={centerY + radius * 0.35}
        textAnchor="middle"
        fill="rgba(255, 255, 255, 0.5)"
        fontSize="8"
        letterSpacing="0.1em"
      >
        SENTINEL
      </text>
    </svg>
  );
}

/**
 * Progress Ring Component
 */
function ProgressRing({ progress, size = 80, strokeWidth = 6, color = '#C084FC' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: 'stroke-dashoffset 0.5s ease',
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
}

/**
 * NFT Card Component
 */
function NFTCard({ nft, onVerify }) {
  const [copied, setCopied] = useState(false);
  
  const copyHash = () => {
    navigator.clipboard.writeText(nft.verification_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Verification hash copied!');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.05))',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.1), transparent 60%)',
        }}
      />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">{nft.name}</p>
            <p className="text-[10px] text-white/40 font-mono">{nft.symbol}</p>
          </div>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139, 92, 246, 0.2)' }}
          >
            <Diamond size={14} style={{ color: '#C084FC' }} />
          </div>
        </div>
        
        {/* Languages */}
        <div className="flex items-center gap-1 mb-3">
          {nft.qr_languages?.map(lang => (
            <span
              key={lang}
              className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
              style={{
                background: `${LANGUAGE_COLORS[lang]}20`,
                color: LANGUAGE_COLORS[lang],
                border: `1px solid ${LANGUAGE_COLORS[lang]}40`,
              }}
            >
              {lang}
            </span>
          ))}
        </div>
        
        {/* Attributes preview */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {nft.attributes?.slice(0, 4).map((attr, i) => (
            <div key={i} className="text-[9px]">
              <p className="text-white/40">{attr.trait_type}</p>
              <p className="text-white/70 font-mono">{attr.value}</p>
            </div>
          ))}
        </div>
        
        {/* Verification hash */}
        <div className="flex items-center gap-2 p-2 rounded-lg mb-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <p className="text-[9px] font-mono text-white/50 flex-1 truncate">
            {nft.verification_hash}
          </p>
          <button
            onClick={copyHash}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-white/40" />}
          </button>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVerify(nft.verification_hash)}
            className="flex-1 py-2 rounded-lg text-[10px] font-medium transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#C4B5FD',
            }}
          >
            <Eye size={10} className="inline mr-1" />
            Verify
          </button>
          <a
            href={nft.verification_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 rounded-lg text-[10px] font-medium text-center transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#93C5FD',
            }}
          >
            <ExternalLink size={10} className="inline mr-1" />
            View
          </a>
        </div>
        
        {/* Minted date */}
        <p className="text-[8px] text-white/30 text-center mt-2">
          Minted {new Date(nft.minted_at).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Main Crystal Mint Panel Component
 */
export default function CrystalMintPanel({ isOpen, onClose }) {
  const { authHeaders, user } = useAuth();
  
  const [tab, setTab] = useState('mint'); // 'mint' | 'gallery'
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  
  // Eligibility state
  const [eligibility, setEligibility] = useState(null);
  
  // Mint form state
  const [memberName, setMemberName] = useState('');
  const [previewData, setPreviewData] = useState(null);
  
  // NFT gallery state
  const [nfts, setNfts] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Languages config
  const [languages, setLanguages] = useState(null);
  
  // Load initial data
  useEffect(() => {
    if (!isOpen || !authHeaders?.Authorization) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [eligRes, nftsRes, statsRes, langRes] = await Promise.all([
          axios.get(`${API}/crystal-mint/eligibility`, { headers: authHeaders }),
          axios.get(`${API}/crystal-mint/nfts`, { headers: authHeaders }),
          axios.get(`${API}/crystal-mint/stats`),
          axios.get(`${API}/crystal-mint/languages`),
        ]);
        
        setEligibility(eligRes.data.eligibility);
        setNfts(nftsRes.data.nfts || []);
        setStats(statsRes.data.statistics);
        setLanguages(langRes.data.languages);
      } catch (err) {
        console.error('Failed to load mint data:', err);
        toast.error('Failed to load minting data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isOpen, authHeaders]);
  
  // Generate preview
  const generatePreview = useCallback(async () => {
    if (!memberName || memberName.length < 2) return;
    
    try {
      const res = await axios.get(
        `${API}/crystal-mint/preview?member_name=${encodeURIComponent(memberName)}`,
        { headers: authHeaders }
      );
      setPreviewData(res.data);
    } catch (err) {
      console.error('Preview failed:', err);
    }
  }, [memberName, authHeaders]);
  
  // Debounced preview generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (memberName.length >= 2) {
        generatePreview();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [memberName, generatePreview]);
  
  // Execute mint
  const executeMint = async () => {
    if (!eligibility?.eligible || !memberName) {
      toast.error('Cannot mint: Check eligibility requirements');
      return;
    }
    
    setMinting(true);
    try {
      const res = await axios.post(
        `${API}/crystal-mint/mint`,
        { member_name: memberName },
        { headers: authHeaders }
      );
      
      if (res.data.status === 'success') {
        toast.success('Sovereign Mastery NFT Minted!', {
          description: `Certificate for ${memberName} is now on-chain`,
        });
        
        // Refresh NFTs
        const nftsRes = await axios.get(`${API}/crystal-mint/nfts`, { headers: authHeaders });
        setNfts(nftsRes.data.nfts || []);
        
        // Switch to gallery
        setTab('gallery');
        setMemberName('');
        setPreviewData(null);
      } else {
        toast.error('Mint failed', { description: res.data.message });
      }
    } catch (err) {
      console.error('Mint failed:', err);
      toast.error('Minting failed', {
        description: err.response?.data?.detail || 'Unknown error',
      });
    } finally {
      setMinting(false);
    }
  };
  
  // Verify NFT
  const verifyNFT = async (hash) => {
    try {
      const res = await axios.get(`${API}/crystal-mint/verify/${hash}`);
      toast.success('NFT Verified!', {
        description: `Valid certificate for ${res.data.nft.member_name}`,
      });
    } catch (err) {
      toast.error('Verification failed');
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.9)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #0a0a0f, #1a0a2e)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 60px rgba(139, 92, 246, 0.15)',
          }}
          onClick={e => e.stopPropagation()}
          data-testid="crystal-mint-panel"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-4 border-b border-white/10" style={{ background: 'rgba(10, 10, 15, 0.95)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2))' }}
                >
                  <Diamond size={18} style={{ color: '#C084FC' }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Crystal-QR Synthesis</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    Metaplex Core V1 | L² Fractal Engine
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {[
                { id: 'mint', label: 'Mint NFT', icon: Sparkles },
                { id: 'gallery', label: `Gallery (${nfts.length})`, icon: Diamond },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: tab === t.id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${tab === t.id ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)'}`,
                    color: tab === t.id ? '#C4B5FD' : 'rgba(255, 255, 255, 0.5)',
                  }}
                  data-testid={`mint-tab-${t.id}`}
                >
                  <t.icon size={12} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin" size={24} style={{ color: '#C084FC' }} />
              </div>
            ) : tab === 'mint' ? (
              <div className="space-y-6">
                {/* Eligibility Status */}
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: eligibility?.eligible
                      ? 'rgba(34, 197, 94, 0.08)'
                      : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${eligibility?.eligible ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {eligibility?.eligible ? (
                        <Unlock size={16} className="text-green-400" />
                      ) : (
                        <Lock size={16} className="text-red-400" />
                      )}
                      <span className="text-sm font-medium" style={{ color: eligibility?.eligible ? '#22C55E' : '#EF4444' }}>
                        {eligibility?.eligible ? 'Eligible to Mint' : 'Requirements Not Met'}
                      </span>
                    </div>
                    <div className="relative">
                      <ProgressRing
                        progress={eligibility?.progress_percentage || 0}
                        size={50}
                        strokeWidth={4}
                        color={eligibility?.eligible ? '#22C55E' : '#C084FC'}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                        {Math.round(eligibility?.progress_percentage || 0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <p className="text-white/40">Volunteer Credits</p>
                      <p className="text-white font-mono">
                        {eligibility?.volunteer_credits?.toLocaleString() || 0} / {eligibility?.credits_threshold?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40">Volunteer Hours</p>
                      <p className="text-white font-mono">{eligibility?.volunteer_hours || 0} hrs</p>
                    </div>
                    <div>
                      <p className="text-white/40">Math Licenses</p>
                      <p className="text-white font-mono flex items-center gap-1">
                        {eligibility?.has_math_license ? (
                          <>
                            <CheckCircle2 size={10} className="text-green-400" />
                            {eligibility?.math_licenses_owned?.length || 0} owned
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={10} className="text-yellow-400" />
                            Required
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40">Hours Needed</p>
                      <p className="text-white font-mono">
                        {eligibility?.hours_needed > 0 ? `${eligibility.hours_needed} more` : 'Ready!'}
                      </p>
                    </div>
                  </div>
                  
                  {!eligibility?.eligible && eligibility?.reasons?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      {eligibility.reasons.map((reason, i) => (
                        <p key={i} className="text-[9px] text-red-400/80">
                          • {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* L² Fractal GPU Shader + Pentagonal Crystal Preview */}
                <div className="text-center">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                    L² Fractal Crystal • GPU Shader
                  </p>
                  
                  {/* GPU-Rendered Fractal Shader */}
                  <div className="relative mx-auto" style={{ width: 200, height: 200 }}>
                    <L2FractalShader 
                      size={200} 
                      quality="medium" 
                      autoRotate={true} 
                      pulseOnHover={eligibility?.eligible}
                    />
                    {/* Pentagonal overlay showing language facets */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                      <PentagonalCrystal
                        languages={languages}
                        active={eligibility?.eligible}
                        size={200}
                      />
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-white/30 mt-2">
                    Dynamic Prismatic Liquid • 120 FPS Target
                  </p>
                  <p className="text-[8px] text-purple-400/60 mt-1">
                    5 Language Facets • 72° Refraction • GLSL Shader
                  </p>
                </div>
                
                {/* Mint Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-2">
                      Certificate Name
                    </label>
                    <input
                      type="text"
                      value={memberName}
                      onChange={e => setMemberName(e.target.value)}
                      placeholder="Enter your sovereign name..."
                      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      maxLength={100}
                      data-testid="member-name-input"
                    />
                    {memberName.length > 0 && memberName.length < 2 && (
                      <p className="text-[9px] text-red-400 mt-1">Name must be at least 2 characters</p>
                    )}
                  </div>
                  
                  {/* Preview QR Data */}
                  {previewData && (
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <p className="text-[9px] text-white/40 mb-2">Preview Verification Hash</p>
                      <p className="text-xs font-mono text-purple-400 break-all">
                        {previewData.qr_metadata?.verification_hash}
                      </p>
                    </div>
                  )}
                  
                  {/* Mint Button */}
                  <button
                    onClick={executeMint}
                    disabled={!eligibility?.eligible || minting || memberName.length < 2}
                    className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: eligibility?.eligible
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.3))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${eligibility?.eligible ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: eligibility?.eligible ? '#C4B5FD' : 'rgba(255, 255, 255, 0.3)',
                      boxShadow: eligibility?.eligible ? '0 0 30px rgba(139, 92, 246, 0.2)' : 'none',
                    }}
                    data-testid="mint-button"
                  >
                    {minting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Synthesizing Crystal...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Mint Sovereign Mastery NFT
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Stats */}
                {stats && (
                  <div className="pt-4 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-lg font-bold text-white">{stats.total_mints}</p>
                        <p className="text-[9px] text-white/40">Total Minted</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-400">{stats.supported_languages?.length}</p>
                        <p className="text-[9px] text-white/40">Languages</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-400">φ</p>
                        <p className="text-[9px] text-white/40">Golden Ratio</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Gallery Tab */
              <div>
                {nfts.length === 0 ? (
                  <div className="text-center py-12">
                    <Diamond size={40} className="mx-auto mb-3 text-white/20" />
                    <p className="text-sm text-white/40">No NFTs minted yet</p>
                    <p className="text-[10px] text-white/30 mt-1">
                      Mint your first Sovereign Mastery Certificate
                    </p>
                    <button
                      onClick={() => setTab('mint')}
                      className="mt-4 px-4 py-2 rounded-lg text-xs"
                      style={{
                        background: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#C4B5FD',
                      }}
                    >
                      Go to Mint
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {nfts.map((nft, i) => (
                      <NFTCard key={i} nft={nft} onVerify={verifyNFT} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

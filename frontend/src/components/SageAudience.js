/**
 * SageAudience.js — Full "Audience with the Sage" Modal
 * 
 * A conversational modal that blurs the background, creating a sense
 * of "stepping into a private space" with the Sage.
 * 
 * Features:
 * - Chat with the Sage (AI-powered)
 * - Request quests
 * - View Sage's domain info
 * - Deep, immersive visual design
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Scroll, Loader2, Target } from 'lucide-react';
import { useSages } from '../context/SageContext';

export default function SageAudience() {
  const {
    isAudienceOpen,
    closeAudience,
    currentSage,
    conversationHistory,
    chatWithSage,
    requestQuest,
    isLoading,
    activeQuests,
  } = useSages();

  const [message, setMessage] = useState('');
  const [questLoading, setQuestLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Focus input when opening
  useEffect(() => {
    if (isAudienceOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isAudienceOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    const msg = message;
    setMessage('');
    await chatWithSage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRequestQuest = async () => {
    if (!currentSage || questLoading) return;
    setQuestLoading(true);
    await requestQuest(currentSage.id);
    setQuestLoading(false);
  };

  if (!isAudienceOpen || !currentSage) return null;

  // Get quests from this sage
  const sageQuests = activeQuests.filter(q => q.sage_id === currentSage.id);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop with blur */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'rgba(10, 10, 18, 0.85)',
            backdropFilter: 'none',
          }}
          onClick={closeAudience}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(15, 15, 25, 0.98)',
            border: `1px solid ${currentSage.color}30`,
            boxShadow: `0 0 80px ${currentSage.color}20, 0 25px 50px rgba(0,0,0,0.15)`,
          }}
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          data-testid="sage-audience-modal"
        >
          {/* Header */}
          <div
            className="p-5 flex items-center gap-4 border-b"
            style={{
              background: `linear-gradient(135deg, ${currentSage.color}15, transparent)`,
              borderColor: `${currentSage.color}20`,
            }}
          >
            {/* Sage crystal icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${currentSage.color}40, ${currentSage.color}10)`,
                border: `2px solid ${currentSage.color}40`,
                boxShadow: `0 0 20px ${currentSage.color}20`,
              }}
            >
              <div
                className="w-6 h-6 rounded-md rotate-45"
                style={{ background: `linear-gradient(135deg, ${currentSage.color}80, ${currentSage.color}30)` }}
              />
            </div>

            {/* Sage info */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                {currentSage.name}
                <Sparkles size={14} style={{ color: currentSage.color }} />
              </h2>
              <p className="text-xs text-white/50">{currentSage.archetype}</p>
            </div>

            {/* Close button */}
            <button
              onClick={closeAudience}
              className="p-2 rounded-full transition-all hover:bg-white/10"
              data-testid="audience-close"
            >
              <X size={20} className="text-white/60" />
            </button>
          </div>

          {/* Domain info */}
          <div
            className="px-5 py-3 border-b"
            style={{ borderColor: `${currentSage.color}15` }}
          >
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Domain</p>
            <p className="text-sm text-white/80">{currentSage.domain}</p>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[200px] max-h-[300px]">
            {conversationHistory.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl rotate-45 mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${currentSage.color}30, ${currentSage.color}10)`,
                    border: `1px solid ${currentSage.color}30`,
                  }}
                />
                <p className="text-white/50 text-sm">Begin your audience with {currentSage.name.split(' ')[0]}...</p>
              </div>
            ) : (
              conversationHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user' ? 'rounded-tr-md' : 'rounded-tl-md'
                    }`}
                    style={{
                      background: msg.role === 'user'
                        ? 'rgba(255,255,255,0.1)'
                        : `linear-gradient(135deg, ${currentSage.color}20, ${currentSage.color}05)`,
                      border: msg.role === 'user'
                        ? '1px solid rgba(255,255,255,0.1)'
                        : `1px solid ${currentSage.color}25`,
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <p className="text-[10px] font-semibold mb-1" style={{ color: currentSage.color }}>
                        {currentSage.name.split(' ')[0]}
                      </p>
                    )}
                    <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${currentSage.color}20, ${currentSage.color}05)`,
                    border: `1px solid ${currentSage.color}25`,
                  }}
                >
                  <Loader2 size={14} className="animate-spin" style={{ color: currentSage.color }} />
                  <span className="text-sm text-white/50">Contemplating...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quest button */}
          <div className="px-5 py-3 border-t" style={{ borderColor: `${currentSage.color}15` }}>
            <button
              onClick={handleRequestQuest}
              disabled={questLoading || sageQuests.length >= 3}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${currentSage.color}25, ${currentSage.color}10)`,
                border: `1px solid ${currentSage.color}30`,
                color: currentSage.color,
              }}
              data-testid="request-quest-btn"
            >
              {questLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Scroll size={16} />
              )}
              {sageQuests.length >= 3 ? 'Quest Limit Reached' : 'Request a Quest'}
            </button>
            
            {/* Show active quests from this Sage */}
            {sageQuests.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-white/40 uppercase tracking-wider">Active Quests</p>
                {sageQuests.map(quest => (
                  <div
                    key={quest.id}
                    className="p-2 rounded-lg flex items-center gap-2"
                    style={{
                      background: `${currentSage.color}10`,
                      border: `1px solid ${currentSage.color}20`,
                    }}
                  >
                    <Target size={12} style={{ color: currentSage.color }} />
                    <span className="text-xs text-white/70 flex-1">{quest.title}</span>
                    <span className="text-[10px] text-white/40">
                      +{quest.rewards?.lumens || 0} Lumens
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div
            className="p-4 border-t flex items-center gap-3"
            style={{
              background: 'rgba(10, 10, 18, 0.5)',
              borderColor: `${currentSage.color}15`,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Speak to ${currentSage.name.split(' ')[0]}...`}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              disabled={isLoading}
              data-testid="sage-chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="p-2.5 rounded-xl transition-all disabled:opacity-30"
              style={{
                background: `linear-gradient(135deg, ${currentSage.color}40, ${currentSage.color}20)`,
                color: '#fff',
              }}
              data-testid="sage-chat-send"
            >
              <Send size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

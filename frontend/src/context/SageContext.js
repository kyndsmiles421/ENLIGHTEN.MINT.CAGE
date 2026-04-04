/**
 * SageContext.js — The Five Sages State Management
 * 
 * Manages Sage interactions, active quests, and user progress
 * for The Enlightenment Cafe's Expert Advisor System.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

// Sage definitions (mirroring backend)
export const SAGES = {
  kaelen: {
    id: 'kaelen',
    name: 'Kaelen the Smith',
    zone: 'practice_room',
    archetype: 'The Disciplined Master',
    tone: 'disciplined_direct',
    domain: 'Skill-building, habit loops, and technical mastery',
    color: '#F97316',
    routes: ['/frequencies', '/breathing', '/mantras'],
  },
  sora: {
    id: 'sora',
    name: 'Sora the Seer',
    zone: 'oracle_chamber',
    archetype: 'The Mystic Oracle',
    tone: 'cryptic_enigmatic',
    domain: 'Deep insights, data patterns, and future-casting',
    color: '#8B5CF6',
    routes: ['/oracle', '/tarot', '/iching'],
  },
  elara: {
    id: 'elara',
    name: 'Elara the Harmonist',
    zone: 'sanctuary',
    archetype: 'The Nurturing Healer',
    tone: 'nurturing_ethereal',
    domain: 'Mental health, meditation, and bio-resonance',
    color: '#2DD4BF',
    routes: ['/meditation', '/journal', '/wellness'],
  },
  finn: {
    id: 'finn',
    name: 'Finn the Voyager',
    zone: 'explorers_lounge',
    archetype: 'The Adventurous Guide',
    tone: 'playful_curious',
    domain: 'Navigation, community lore, and Nebula exploration',
    color: '#3B82F6',
    routes: ['/dashboard', '/community', '/explore'],
  },
  vesper: {
    id: 'vesper',
    name: 'Vesper the Ancient',
    zone: 'ritual',
    archetype: 'The Ceremonial Elder',
    tone: 'stoic_ceremonial',
    domain: 'High-level milestones, Phygital rewards, and legacy',
    color: '#C9A962',
    routes: ['/achievements', '/ritual', '/legacy'],
  },
};

// Map routes to Sages
export const getZoneSage = (pathname) => {
  for (const sage of Object.values(SAGES)) {
    if (sage.routes.some(r => pathname.startsWith(r))) {
      return sage;
    }
  }
  return SAGES.finn; // Default to Finn for exploration
};

const SageContext = createContext(null);

export function SageProvider({ children }) {
  const { token } = useAuth();
  const [progress, setProgress] = useState({
    lumens: 0,
    level: 1,
    stardust: 100,
    artifacts: [],
    quests_completed: 0,
  });
  const [activeQuests, setActiveQuests] = useState([]);
  const [currentSage, setCurrentSage] = useState(null);
  const [sageGreeting, setSageGreeting] = useState(null);
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user progress
  const fetchProgress = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/sages/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [token]);

  // Fetch active quests
  const fetchActiveQuests = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/sages/quests/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveQuests(res.data.quests || []);
    } catch (err) {
      console.error('Failed to fetch quests:', err);
    }
  }, [token]);

  // Get greeting from Sage when entering zone
  const summonSage = useCallback(async (sageId) => {
    if (!token || !sageId) return;
    
    const sage = SAGES[sageId];
    if (!sage) return;
    
    setCurrentSage(sage);
    setIsLoading(true);
    
    try {
      const res = await axios.post(
        `${API}/api/sages/greet/${sageId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSageGreeting(res.data.greeting);
    } catch (err) {
      console.error('Failed to get sage greeting:', err);
      setSageGreeting(`Welcome, traveler. I am ${sage.name}.`);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Chat with Sage
  const chatWithSage = useCallback(async (message) => {
    if (!token || !currentSage) return null;
    
    setIsLoading(true);
    
    // Optimistically add user message
    setConversationHistory(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const res = await axios.post(
        `${API}/api/sages/chat`,
        { sage_id: currentSage.id, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const response = res.data.response;
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
      return response;
    } catch (err) {
      console.error('Failed to chat with sage:', err);
      setConversationHistory(prev => prev.slice(0, -1)); // Remove optimistic message
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, currentSage]);

  // Request a quest from Sage
  const requestQuest = useCallback(async (sageId) => {
    if (!token) return null;
    
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/sages/generate-quest/${sageId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newQuest = res.data.quest;
      setActiveQuests(prev => [...prev, newQuest]);
      return newQuest;
    } catch (err) {
      console.error('Failed to generate quest:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Complete a quest
  const completeQuest = useCallback(async (questId) => {
    if (!token) return null;
    
    try {
      const res = await axios.post(
        `${API}/api/sages/quests/complete`,
        { quest_id: questId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from active quests
      setActiveQuests(prev => prev.filter(q => q.id !== questId));
      
      // Refresh progress
      await fetchProgress();
      
      return res.data;
    } catch (err) {
      console.error('Failed to complete quest:', err);
      return null;
    }
  }, [token, fetchProgress]);

  // Open audience with a Sage
  const openAudience = useCallback((sageId) => {
    const sage = SAGES[sageId];
    if (sage) {
      setCurrentSage(sage);
      setConversationHistory([]);
      setIsAudienceOpen(true);
    }
  }, []);

  // Close audience
  const closeAudience = useCallback(() => {
    setIsAudienceOpen(false);
    setSageGreeting(null);
  }, []);

  // Dismiss greeting (hide the floating avatar)
  const dismissGreeting = useCallback(() => {
    setSageGreeting(null);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchProgress();
      fetchActiveQuests();
    }
  }, [token, fetchProgress, fetchActiveQuests]);

  const value = {
    // State
    progress,
    activeQuests,
    currentSage,
    sageGreeting,
    isAudienceOpen,
    conversationHistory,
    isLoading,
    
    // Actions
    summonSage,
    chatWithSage,
    requestQuest,
    completeQuest,
    openAudience,
    closeAudience,
    dismissGreeting,
    fetchProgress,
    fetchActiveQuests,
    
    // Helpers
    SAGES,
    getZoneSage,
  };

  return (
    <SageContext.Provider value={value}>
      {children}
    </SageContext.Provider>
  );
}

export function useSages() {
  const ctx = useContext(SageContext);
  if (!ctx) {
    throw new Error('useSages must be used within SageProvider');
  }
  return ctx;
}

export default SageContext;

import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * useCelestialEvents — Hook for calculating current celestial positions
 * 
 * Uses basic astronomical algorithms to determine:
 * - Current Moon Phase (New, Waxing, Full, Waning)
 * - Moon Sign (which zodiac sign the Moon is in)
 * - Planetary positions for major bodies
 * - Upcoming celestial events (retrogrades, eclipses, etc.)
 * 
 * This creates the "Ghost Node" data for the Oracle Chamber.
 * All calculations are local - no external API required.
 */

// ─── Zodiac Signs ───
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', startDegree: 0 },
  { name: 'Taurus', symbol: '♉', element: 'Earth', startDegree: 30 },
  { name: 'Gemini', symbol: '♊', element: 'Air', startDegree: 60 },
  { name: 'Cancer', symbol: '♋', element: 'Water', startDegree: 90 },
  { name: 'Leo', symbol: '♌', element: 'Fire', startDegree: 120 },
  { name: 'Virgo', symbol: '♍', element: 'Earth', startDegree: 150 },
  { name: 'Libra', symbol: '♎', element: 'Air', startDegree: 180 },
  { name: 'Scorpio', symbol: '♏', element: 'Water', startDegree: 210 },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', startDegree: 240 },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', startDegree: 270 },
  { name: 'Aquarius', symbol: '♒', element: 'Air', startDegree: 300 },
  { name: 'Pisces', symbol: '♓', element: 'Water', startDegree: 330 },
];

// ─── Moon Phases ───
const MOON_PHASES = [
  { name: 'New Moon', emoji: '🌑', ritualType: 'intention_setting', energy: 'beginning' },
  { name: 'Waxing Crescent', emoji: '🌒', ritualType: 'growth', energy: 'building' },
  { name: 'First Quarter', emoji: '🌓', ritualType: 'action', energy: 'momentum' },
  { name: 'Waxing Gibbous', emoji: '🌔', ritualType: 'refinement', energy: 'preparation' },
  { name: 'Full Moon', emoji: '🌕', ritualType: 'manifestation', energy: 'peak' },
  { name: 'Waning Gibbous', emoji: '🌖', ritualType: 'gratitude', energy: 'sharing' },
  { name: 'Last Quarter', emoji: '🌗', ritualType: 'release', energy: 'letting_go' },
  { name: 'Waning Crescent', emoji: '🌘', ritualType: 'rest', energy: 'restoration' },
];

// ─── Ritual Suggestions by Moon Phase + Sign ───
const RITUAL_SUGGESTIONS = {
  'New Moon': {
    default: 'Set intentions for the lunar cycle ahead',
    Fire: '5-minute visualization of your goals burning bright',
    Earth: 'Ground yourself and plant seeds of intention',
    Air: 'Journal your dreams and communicate with clarity',
    Water: 'Intuitive meditation to sense what wants to emerge',
  },
  'Full Moon': {
    default: 'Celebrate manifestation and release what no longer serves',
    Fire: 'Dynamic breathwork to release stagnant energy',
    Earth: 'Gratitude practice for abundance received',
    Air: 'Share your insights with community',
    Water: 'Emotional release through movement or tears',
  },
  'Waxing Crescent': {
    default: 'Take the first small steps toward your intentions',
    Fire: 'Action-oriented goal setting',
    Earth: 'Build practical foundations',
    Air: 'Research and gather information',
    Water: 'Trust your intuition on next steps',
  },
  'Waning Crescent': {
    default: 'Rest and restore before the new cycle',
    Fire: 'Gentle restorative practices',
    Earth: 'Self-care and nourishment',
    Air: 'Quiet reflection without judgment',
    Water: 'Dream work and subconscious exploration',
  },
};

/**
 * Calculate Julian Date from a JavaScript Date
 */
function toJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Calculate the Moon's age in days (0-29.53)
 */
function getMoonAge(date = new Date()) {
  // Known new moon: January 6, 2000 at 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const synodicMonth = 29.530588853; // Average length of lunar month
  
  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = daysSinceKnown % synodicMonth;
  
  return moonAge < 0 ? moonAge + synodicMonth : moonAge;
}

/**
 * Get Moon Phase from moon age
 */
function getMoonPhase(moonAge) {
  const phaseIndex = Math.floor((moonAge / 29.530588853) * 8) % 8;
  return MOON_PHASES[phaseIndex];
}

/**
 * Get approximate Moon sign (simplified calculation)
 */
function getMoonSign(date = new Date()) {
  // The Moon moves approximately 13.2 degrees per day
  // Full zodiac cycle takes about 27.3 days
  const knownMoonInAries = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));
  const daysSinceKnown = (date.getTime() - knownMoonInAries.getTime()) / (1000 * 60 * 60 * 24);
  
  // Moon moves ~13.2° per day
  const degreesPerDay = 360 / 27.321661;
  const currentDegree = (daysSinceKnown * degreesPerDay) % 360;
  const normalizedDegree = currentDegree < 0 ? currentDegree + 360 : currentDegree;
  
  const signIndex = Math.floor(normalizedDegree / 30);
  return ZODIAC_SIGNS[signIndex];
}

/**
 * Calculate Sun sign from date
 */
function getSunSign(date = new Date()) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Approximate zodiac date ranges
  const ranges = [
    { sign: 0, start: [3, 21], end: [4, 19] },   // Aries
    { sign: 1, start: [4, 20], end: [5, 20] },   // Taurus
    { sign: 2, start: [5, 21], end: [6, 20] },   // Gemini
    { sign: 3, start: [6, 21], end: [7, 22] },   // Cancer
    { sign: 4, start: [7, 23], end: [8, 22] },   // Leo
    { sign: 5, start: [8, 23], end: [9, 22] },   // Virgo
    { sign: 6, start: [9, 23], end: [10, 22] },  // Libra
    { sign: 7, start: [10, 23], end: [11, 21] }, // Scorpio
    { sign: 8, start: [11, 22], end: [12, 21] }, // Sagittarius
    { sign: 9, start: [12, 22], end: [1, 19] },  // Capricorn
    { sign: 10, start: [1, 20], end: [2, 18] },  // Aquarius
    { sign: 11, start: [2, 19], end: [3, 20] },  // Pisces
  ];
  
  for (const range of ranges) {
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;
    
    if (startMonth <= endMonth) {
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)) {
        return ZODIAC_SIGNS[range.sign];
      }
    } else {
      // Handle Capricorn which spans year boundary
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay) ||
          month > startMonth || month < endMonth) {
        return ZODIAC_SIGNS[range.sign];
      }
    }
  }
  
  return ZODIAC_SIGNS[0]; // Default to Aries
}

/**
 * Get the daily ritual suggestion
 */
function getDailyRitual(moonPhase, moonSign) {
  const phaseRituals = RITUAL_SUGGESTIONS[moonPhase.name] || RITUAL_SUGGESTIONS['New Moon'];
  const elementRitual = phaseRituals[moonSign.element];
  const defaultRitual = phaseRituals.default;
  
  return {
    primary: elementRitual || defaultRitual,
    secondary: elementRitual ? defaultRitual : null,
    duration: moonPhase.name.includes('Full') || moonPhase.name.includes('New') ? '10 min' : '5 min',
    intensity: moonPhase.energy,
  };
}

/**
 * Check for Mercury Retrograde (simplified)
 * Mercury retrograde occurs roughly 3-4 times per year for about 3 weeks
 */
function checkMercuryRetrograde(date = new Date()) {
  // 2024-2025 Mercury Retrograde periods (approximate)
  const retrogradePeriods = [
    { start: new Date('2024-04-01'), end: new Date('2024-04-25') },
    { start: new Date('2024-08-05'), end: new Date('2024-08-28') },
    { start: new Date('2024-11-25'), end: new Date('2024-12-15') },
    { start: new Date('2025-03-15'), end: new Date('2025-04-07') },
    { start: new Date('2025-07-18'), end: new Date('2025-08-11') },
    { start: new Date('2025-11-09'), end: new Date('2025-11-29') },
    { start: new Date('2026-02-26'), end: new Date('2026-03-20') },
    { start: new Date('2026-06-29'), end: new Date('2026-07-23') },
    { start: new Date('2026-10-24'), end: new Date('2026-11-13') },
  ];
  
  return retrogradePeriods.some(period => 
    date >= period.start && date <= period.end
  );
}

/**
 * Get upcoming celestial events
 */
function getUpcomingEvents(date = new Date()) {
  const events = [];
  const moonAge = getMoonAge(date);
  const synodicMonth = 29.530588853;
  
  // Days until next New Moon
  const daysToNewMoon = moonAge < 1 ? 0 : synodicMonth - moonAge;
  if (daysToNewMoon < 7) {
    events.push({
      type: 'new_moon',
      name: 'New Moon',
      emoji: '🌑',
      daysAway: Math.round(daysToNewMoon),
      description: 'Perfect for setting intentions',
    });
  }
  
  // Days until next Full Moon
  const daysToFullMoon = moonAge < 14.765 ? 14.765 - moonAge : synodicMonth - moonAge + 14.765;
  if (daysToFullMoon < 7) {
    events.push({
      type: 'full_moon',
      name: 'Full Moon',
      emoji: '🌕',
      daysAway: Math.round(daysToFullMoon),
      description: 'Peak energy for manifestation',
    });
  }
  
  // Check Mercury Retrograde
  if (checkMercuryRetrograde(date)) {
    events.push({
      type: 'mercury_retrograde',
      name: 'Mercury Retrograde',
      emoji: '☿️',
      daysAway: 0,
      description: 'Review, reflect, and revise',
    });
  }
  
  return events;
}

/**
 * Main Hook: useCelestialEvents
 */
export function useCelestialEvents() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const celestialData = useMemo(() => {
    const moonAge = getMoonAge(currentTime);
    const moonPhase = getMoonPhase(moonAge);
    const moonSign = getMoonSign(currentTime);
    const sunSign = getSunSign(currentTime);
    const ritual = getDailyRitual(moonPhase, moonSign);
    const upcomingEvents = getUpcomingEvents(currentTime);
    const isMercuryRetrograde = checkMercuryRetrograde(currentTime);

    return {
      moon: {
        age: moonAge,
        phase: moonPhase,
        sign: moonSign,
        illumination: Math.round(moonAge < 14.765 
          ? (moonAge / 14.765) * 100 
          : ((29.53 - moonAge) / 14.765) * 100),
      },
      sun: {
        sign: sunSign,
      },
      ritual,
      upcomingEvents,
      isMercuryRetrograde,
      timestamp: currentTime,
    };
  }, [currentTime]);

  return celestialData;
}

/**
 * Ghost Nodes — Temporary celestial event nodes for the mesh
 */
export function useGhostNodes() {
  const celestial = useCelestialEvents();
  
  const ghostNodes = useMemo(() => {
    const nodes = [];
    
    // Full Moon Ghost Node
    if (celestial.moon.phase.name === 'Full Moon' || 
        celestial.upcomingEvents.some(e => e.type === 'full_moon' && e.daysAway === 0)) {
      nodes.push({
        id: 'ghost-full-moon',
        type: 'ghost',
        label: `Full Moon in ${celestial.moon.sign.name}`,
        color: '#FCD34D',
        icon: '🌕',
        description: celestial.ritual.primary,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        connections: ['meditation', 'journal', 'oracle'],
        ritualSuggestion: celestial.ritual,
      });
    }
    
    // New Moon Ghost Node
    if (celestial.moon.phase.name === 'New Moon' ||
        celestial.upcomingEvents.some(e => e.type === 'new_moon' && e.daysAway === 0)) {
      nodes.push({
        id: 'ghost-new-moon',
        type: 'ghost',
        label: `New Moon in ${celestial.moon.sign.name}`,
        color: '#818CF8',
        icon: '🌑',
        description: 'Set intentions for the cycle ahead',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        connections: ['journal', 'affirmations', 'oracle'],
        ritualSuggestion: celestial.ritual,
      });
    }
    
    // Mercury Retrograde Ghost Node
    if (celestial.isMercuryRetrograde) {
      nodes.push({
        id: 'ghost-mercury-rx',
        type: 'ghost',
        label: 'Mercury Retrograde',
        color: '#F59E0B',
        icon: '☿️',
        description: 'Review, reflect, and revise communications',
        expiresAt: null, // Lasts for the duration
        connections: ['journal', 'meditation'],
        ritualSuggestion: {
          primary: 'Slow down and double-check communications',
          duration: '5 min',
          intensity: 'caution',
        },
      });
    }
    
    return nodes;
  }, [celestial]);

  return { ghostNodes, celestial };
}

export default useCelestialEvents;

// Export constants for external use
export { ZODIAC_SIGNS, MOON_PHASES, RITUAL_SUGGESTIONS };

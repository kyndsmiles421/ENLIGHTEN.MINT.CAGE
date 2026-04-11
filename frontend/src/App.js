import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';

// V-ENGINE: ABSOLUTE_CLARITY_NOW - Must be FIRST
import { purgeNoise } from './engines/NukeTheChaos';
import './engines/SystemRecovery'; // Exposes V_ENGINE.resetSystem() to console
import './engines/MainframeSync'; // Exposes V_ENGINE.syncMainframe() to console
import './engines/PerformanceManager'; // Battery & TTS Fallback
import './engines/ProjectSovereign'; // Ledger, Routing, Cosmic Map, Asset Check, Capacitor Bridge
import { applySovereignReality } from './engines/SovereignCore'; // Direct DOM Override - TRUE OBSIDIAN
import { lockObsidianReality, SovereignEngine, SovereignState } from './engines/UnifiedAppCore'; // Mobile Manifest
import { initializeHardware, lockHardwareAesthetic } from './utils/HardwareAestheticLock'; // Play Store Hardware Lock
import ENLIGHTEN_OS from './utils/EnlightenOS'; // ENLIGHTEN_OS V26.8 - THE RUTILATED HERKIMER CORE
import './styles/UniverseMaterials.css'; // Universe Materials - Herkimer Crystal Lattice
import { Archive, Clock, Compass, Star, Sparkles, BookOpen, Zap, Sliders, ArrowLeftRight } from 'lucide-react';
import PerspectiveToggle from './components/PerspectiveToggle'; // Frequency Engine UI
import CreatorMixerUI from './components/CreatorMixerUI'; // Creator Mixing Board (React version)

// SOVEREIGN SYSTEMS: Must be imported FIRST to activate all protocols
import './utils/GlobalRebrand';          // v2.88_SHAMBHALA Root Rebranding (clears Matrix)
import './utils/SpectralShield';         // Ghostbuster Purge & Spectral Shield
import './utils/SanctuaryEngine';        // Pure Light Resonance (ghosts Emergent badge)
import './utils/EnlightenmentKey';       // Back-Side Pass Key (unlocks layers on ASCEND)
// V-ENGINE: GoldenSpiralEngine KILLED - No spiral particles
// import './utils/GoldenSpiralEngine';     // Three.js Golden Ratio Phyllotaxis (responds to ASCEND)
import './utils/SovereignCleanup';       // V2.88 Final - Legacy purge, memory optimization, PWA hooks
import './utils/WebXRPortal';            // WebXR Portal Engine - Spiral zoom → Immersive Dome
import './utils/PortalAudioEngine';      // Spatial Audio - Shepard Tone + Solfeggio frequencies
import './utils/SanctuaryMaster';        // v2.89 Master Engine - Consolidated Layer 0 + Mission Circle
import './utils/SilenceShield';
import './utils/SovereignOS';
import './utils/SovereignStreamlineV7';  // v7.0 with Binaural & Omni-Point
import './utils/SovereignV9';             // v9.0 Crystalline Skeleton + Quadruple Helix
import './utils/SovereignEngine';         // Core engine (Solar + 13-Node Harmonic)
import './utils/SovereignRefractor';      // Front-end visual layer (Vortex + Payload)
import './utils/SovereignStabilizer';     // Physics: Inverse Attraction + Edge Repulsion
import './utils/StabilizerCanvas';        // Canvas physics visualizer
import './utils/RefractionEngine';        // White Light → Rainbow Split → Infinity
import './utils/SovereignCore';           // V2.88 Unified Core (Refraction + Stabilization + Encryption)
import './utils/RainbowKeyGenerator';     // Back-end key encryption
import './utils/SovereignHandshake';      // Bi-directional handshake orchestrator
import './utils/SovereignSingularity';    // V53.0 BIO-DIGITAL OSMOSIS — Full Stack
import './utils/NoduleBridge';            // V53.0 UNIFIED SYNC — Frontend Bridge

import { useActivityTracker } from './hooks/useActivityTracker';
import { useGlobalSounds } from './hooks/useSoundEngine';
import { useAmbientSoundscape } from './hooks/useAmbientSoundscape';
import { AuthProvider } from './context/AuthContext';
import { SensoryProvider } from './context/SensoryContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';
import CosmicBackground from './components/CosmicBackground';
import SmartDock from './components/SmartDock';
import ShambhalaToolbar from './components/ShambhalaToolbar';
import ShambhalaCrystalSystem from './components/ShambhalaCrystalSystem';
import ShambhalaFrontSide from './components/ShambhalaFrontSide';
import CosmicMixer from './components/CosmicMixer';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import { MantraOverlay } from './components/MantraSystem';
import CreditNudge from './components/CreditNudge';
import { SplitScreenProvider } from './components/SplitScreen';
import { CreditProvider } from './context/CreditContext';
import { AvatarProvider } from './context/AvatarContext';
import { TempoProvider } from './context/TempoContext';
import { MixerProvider } from './context/MixerContext';
import { FocusProvider } from './context/FocusContext';
import { ClassProvider } from './context/ClassContext';
import { TreasuryProvider } from './context/TreasuryContext';
import { ModalityProvider } from './context/ModalityContext';
import { VoiceCommandProvider } from './context/VoiceCommandContext';
import { ResolutionProvider } from './context/ResolutionContext';
import CosmicToolbar from './components/CosmicToolbar';
import CosmicAssistant from './components/CosmicAssistant';
import PersistentWaveform from './components/PersistentWaveform';
import OrbCorner from './components/OrbCorner';
import { CosmicErrorBoundary } from './components/CosmicErrorBoundary';
import { CosmicStateProvider } from './context/CosmicStateContext';
import { SovereignProvider } from './context/SovereignContext';
import { CosmicThemeProvider } from './context/CosmicThemeContext';
import { OrbitalSentinelProvider } from './context/OrbitalSentinelContext';
import CommandMode from './components/CommandMode';
import { LatencyProvider, LatencyHUD } from './hooks/useLatencyPulse';
import { setupAxiosInterceptors } from './utils/axiosInterceptor';
import TrialGraduation from './components/TrialGraduation';
import { useGateNotifications } from './hooks/useGateNotifications';
import OrbitalNavigation from './components/OrbitalNavigation';
import LearningToggle from './components/LearningToggle';
import EmergencyShutOff from './components/EmergencyShutOff';
import MissionControlRing from './components/MissionControlRing';
import TieredNavigation from './components/TieredNavigation';
import RecursivePortal from './components/RecursivePortal';
import { MeshNetworkProvider } from './context/MeshNetworkContext';
import { DepthProvider } from './context/DepthContext';
import GlowPortal from './components/GlowPortal';
import UniversalCommand from './components/UniversalCommand';
import PulseEchoVisualizer from './components/PulseEchoVisualizer';
import { EnlightenmentCafeProvider } from './context/EnlightenmentCafeContext';
import { EnlightenmentProvider } from './context/EnlightenmentContext';
import { PolarityProvider } from './context/PolarityContext';
import CafeSettingsPanel, { CafeSettingsToggle } from './components/CafeSettingsPanel';
import VellumOverlay from './components/VellumOverlay';
import { Scene as NebulaScene } from './components/nebula';
import { NebulaViewToggle } from './components/nebula';
import UtilityDock from './components/UtilityDock';
import { SageProvider } from './context/SageContext';
import SageAvatar from './components/SageAvatar';
import SageAudience from './components/SageAudience';
import QuestHUD from './components/QuestHUD';
import HexagramGhostLayer from './components/HexagramGhostLayer';
import { useZeroPointFlicker } from './hooks/useZeroPointFlicker';
import ZeroPointExperience from './components/ZeroPointExperience';
import { CrystalBadge } from './components/CrystalResonancePanel';
import MeshCanvasRenderer from './components/MeshCanvasRenderer';

// Initialize global error handling
setupAxiosInterceptors();

// Cosmic mesh wrapper — hides on fullscreen pages
function CosmicMeshWrapper() {
  const loc = useLocation();
  if (loc.pathname === '/intro') return null;
  return <div className="cosmic-mesh" aria-hidden="true"><div className="cosmic-mesh-inner" /></div>;
}

// Eager load: Landing + Auth (first screens users see)
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import CinematicIntro from './pages/CinematicIntro';

// Lazy load everything else
const Breathing = lazy(() => import('./pages/Breathing'));
const Meditation = lazy(() => import('./pages/Meditation'));
const Affirmations = lazy(() => import('./pages/Affirmations'));
const MoodTracker = lazy(() => import('./pages/MoodTracker'));
const Journal = lazy(() => import('./pages/Journal'));
const Soundscapes = lazy(() => import('./pages/Soundscapes'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Exercises = lazy(() => import('./pages/Exercises'));
const Nourishment = lazy(() => import('./pages/Nourishment'));
const Frequencies = lazy(() => import('./pages/Frequencies'));
const Rituals = lazy(() => import('./pages/Rituals'));
const Community = lazy(() => import('./pages/Community'));
const Challenges = lazy(() => import('./pages/Challenges'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const Oracle = lazy(() => import('./pages/Oracle'));
const Mudras = lazy(() => import('./pages/Mudras'));
const Yantra = lazy(() => import('./pages/Yantra'));
const Tantra = lazy(() => import('./pages/Tantra'));
const Videos = lazy(() => import('./pages/Videos'));
const Analytics = lazy(() => import('./pages/Analytics'));
const TradeCircle = lazy(() => import('./pages/TradeCircle'));
const Classes = lazy(() => import('./pages/Classes'));
const Create = lazy(() => import('./pages/Create'));
const LightTherapy = lazy(() => import('./pages/LightTherapy'));
const ZenGarden = lazy(() => import('./pages/ZenGarden'));
const Mantras = lazy(() => import('./pages/Mantras'));
const Hooponopono = lazy(() => import('./pages/Hooponopono'));
const Journey = lazy(() => import('./pages/Journey'));
const Learn = lazy(() => import('./pages/Learn'));
const Games = lazy(() => import('./pages/Games'));
const Friends = lazy(() => import('./pages/Friends'));
const Cardology = lazy(() => import('./pages/Cardology'));
const MayanAstrology = lazy(() => import('./pages/MayanAstrology'));
const AvatarCreator = lazy(() => import('./pages/AvatarCreator'));
const Yoga = lazy(() => import('./pages/Yoga'));
const Teachings = lazy(() => import('./pages/Teachings'));
const WisdomJournal = lazy(() => import('./pages/WisdomJournal'));
const Numerology = lazy(() => import('./pages/Numerology'));
const AnimalTotems = lazy(() => import('./pages/AnimalTotems'));
const Dreams = lazy(() => import('./pages/Dreams'));
const GreenJournal = lazy(() => import('./pages/GreenJournal'));
const Aromatherapy = lazy(() => import('./pages/Aromatherapy'));
const Herbology = lazy(() => import('./pages/Herbology'));
const Elixirs = lazy(() => import('./pages/Elixirs'));
const MealPlanning = lazy(() => import('./pages/MealPlanning'));
const Acupressure = lazy(() => import('./pages/Acupressure'));
const Reiki = lazy(() => import('./pages/Reiki'));
const TrySomethingNew = lazy(() => import('./pages/TrySomethingNew'));
const SovereignHub = lazy(() => import('./pages/SovereignHub'));
const DailyRitual = lazy(() => import('./pages/DailyRitual'));
const CosmicCalendar = lazy(() => import('./pages/CosmicCalendar'));
const Certifications = lazy(() => import('./pages/Certifications'));
const WellnessReports = lazy(() => import('./pages/WellnessReports'));
const MeditationHistory = lazy(() => import('./pages/MeditationHistory'));
const UserUploads = lazy(() => import('./pages/UserUploads'));
const SpiritualCoach = lazy(() => import('./pages/SpiritualCoach'));
const DailyBriefing = lazy(() => import('./pages/DailyBriefing'));
const StarChart = lazy(() => import('./pages/StarChart'));
const VirtualReality = lazy(() => import('./pages/VirtualReality'));
const Forecasts = lazy(() => import('./pages/Forecasts'));
const CosmicProfile = lazy(() => import('./pages/CosmicProfile'));
const Tutorial = lazy(() => import('./pages/Tutorial'));
const CreationStories = lazy(() => import('./pages/CreationStories'));
const SacredTexts = lazy(() => import('./pages/SacredTexts'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));
const Crystals = lazy(() => import('./pages/Crystals'));
const Entanglement = lazy(() => import('./pages/Entanglement'));
const MusicLounge = lazy(() => import('./pages/MusicLounge'));
const Blessings = lazy(() => import('./pages/Blessings'));
const AkashicRecords = lazy(() => import('./pages/AkashicRecords'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'));
const ReadingList = lazy(() => import('./pages/ReadingList'));
const GrowthTimeline = lazy(() => import('./pages/GrowthTimeline'));
const SoulReports = lazy(() => import('./pages/SoulReports'));
const CosmicMixerPage = lazy(() => import('./pages/CosmicMixerPage'));
const Starseed = lazy(() => import('./pages/Starseed'));
const NotFound = lazy(() => import('./pages/NotFound'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const CreatorDashboard = lazy(() => import('./pages/CreatorDashboard'));
const LiveSessions = lazy(() => import('./pages/LiveSessions'));
const LiveRoom = lazy(() => import('./pages/LiveRoom'));
const DanceMusicStudio = lazy(() => import('./pages/DanceMusicStudio'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary'));
const Bible = lazy(() => import('./pages/Bible'));
const StarseedAdventure = lazy(() => import('./pages/StarseedAdventure'));
const StarseedRealm = lazy(() => import('./pages/StarseedRealm'));
const StarseedWorlds = lazy(() => import('./pages/StarseedWorlds'));
const SpiritualAvatarCreator = lazy(() => import('./pages/SpiritualAvatarCreator'));
const AvatarGallery = lazy(() => import('./pages/AvatarGallery'));
const CosmicLedger = lazy(() => import('./pages/CosmicLedger'));
const MultiverseRealms = lazy(() => import('./pages/MultiverseRealms'));
const RPGPage = lazy(() => import('./pages/RPGPage'));
const CosmicInsights = lazy(() => import('./pages/CosmicInsights'));
const MultiverseMap = lazy(() => import('./pages/MultiverseMap'));
const ElementalNexus = lazy(() => import('./pages/ElementalNexus'));
const DreamRealms = lazy(() => import('./pages/DreamRealms'));
const RockHounding = lazy(() => import('./pages/RockHounding'));
const ForgottenLanguages = lazy(() => import('./pages/ForgottenLanguages'));
const CosmicStore = lazy(() => import('./pages/CosmicStore'));
const EvolutionLab = lazy(() => import('./pages/EvolutionLab'));
const RefinementLab = lazy(() => import('./pages/RefinementLab'));
const SmartDockPage = lazy(() => import('./pages/SmartDockPage'));
const HotspotsPage = lazy(() => import('./pages/HotspotsPage'));
const PlanetaryDepths = lazy(() => import('./pages/PlanetaryDepths'));
const QuantumField = lazy(() => import('./pages/QuantumField'));
const DimensionalSpace = lazy(() => import('./pages/DimensionalSpace'));
const MasterViewPage = lazy(() => import('./pages/MasterView'));
const CollectiveShadowMap = lazy(() => import('./pages/CollectiveShadowMap'));
const FractalEngine = lazy(() => import('./pages/FractalEngine'));
const CrystallineEngine = lazy(() => import('./components/CrystallineEngine'));
const SovereignConsole = lazy(() => import('./components/SovereignConsole'));
const RefractorDemo = lazy(() => import('./pages/RefractorDemo'));
const MasteryAvenues = lazy(() => import('./pages/MasteryAvenues'));
const CosmicMap = lazy(() => import('./pages/CosmicMap'));
const PowerSpotAdmin = lazy(() => import('./pages/PowerSpotAdmin'));
const MusicTheory = lazy(() => import('./pages/MusicTheory'));
const Workshop = lazy(() => import('./pages/Workshop'));
const OrbitalHub = lazy(() => import('./pages/OrbitalHub'));
const EnlightenMintHub = lazy(() => import('./pages/EnlightenMintHub'));
const QuantumLoom = lazy(() => import('./pages/QuantumLoom'));
const MembershipLoom = lazy(() => import('./pages/MembershipLoom'));
const Sanctuary = lazy(() => import('./pages/Sanctuary'));
const CelestialDome = lazy(() => import('./pages/CelestialDome'));
const SilentSanctuary = lazy(() => import('./pages/SilentSanctuary'));
const MintingCeremony = lazy(() => import('./pages/MintingCeremony'));
const Observatory = lazy(() => import('./pages/Observatory'));
const Archives = lazy(() => import('./pages/Archives'));
const SuanpanMixer = lazy(() => import('./pages/SuanpanMixer'));
const SovereignArchitecture = lazy(() => import('./pages/SovereignArchitecture'));
const Botany = lazy(() => import('./pages/Botany'));
const Codex = lazy(() => import('./pages/Codex'));
const BotanyOrbital = lazy(() => import('./pages/BotanyOrbital'));
const HexagramJournal = lazy(() => import('./pages/HexagramJournal'));
const TradeCircleOrbital = lazy(() => import('./pages/TradeCircleOrbital'));
const CodexOrbital = lazy(() => import('./pages/CodexOrbital'));
const MasteryPath = lazy(() => import('./pages/MasteryPath'));
const SovereignDashboard = lazy(() => import('./pages/SovereignDashboard'));
const AcademyPage = lazy(() => import('./pages/AcademyPage'));
const EconomyPage = lazy(() => import('./pages/EconomyPage'));
const SovereignAdvisors = lazy(() => import('./pages/SovereignAdvisors'));
const RecursiveDivePage = lazy(() => import('./pages/RecursiveDivePage'));
const SeedGalleryPage = lazy(() => import('./pages/SeedGalleryPage'));
const TesseractExperience = lazy(() => import('./pages/TesseractExperience'));
const EnlightenmentOS = lazy(() => import('./pages/EnlightenmentOS'));
const SovereignLab = lazy(() => import('./pages/SovereignLab'));
const SovereignCanvasPage = lazy(() => import('./pages/SovereignCanvasPage'));
const LatticeView = lazy(() => import('./pages/LatticeView'));
const SovereignFabricator = lazy(() => import('./pages/SovereignFabricator'));
const ARPortalPage = lazy(() => import('./pages/ARPortalPage'));
const ApexCreatorPage = lazy(() => import('./pages/ApexCreatorPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.4) 0%, rgba(124,58,237,0.15) 70%)' }} />
      </div>
    </div>
  );
}

import { useRouteAudioCleanup } from './hooks/useRouteAudioCleanup';

// CafeApp — Main app wrapper with Enlightenment Cafe settings
function CafeApp() {
  const [cafeSettingsOpen, setCafeSettingsOpen] = React.useState(false);
  const [activeIsland, setActiveIsland] = React.useState(null);
  const [assistantOpen, setAssistantOpen] = React.useState(false);
  const [mixerOpen, setMixerOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  
  // V-ENGINE: ABSOLUTE_CLARITY_NOW
  useEffect(() => {
    // 1. Kill the confetti/particle engines
    // 2. Strip legacy borders and shadows
    // 3. Force stop any active media streams
    purgeNoise();
    
    // 4. DIRECT DOM OVERRIDE — Force True Obsidian #000000
    applySovereignReality(174);
    
    // 5. MOBILE MANIFEST — Obsidian Guard for Capacitor/Native
    lockObsidianReality();
    
    // 6. HARDWARE LOCK — Status Bar, Navigation Bar, Keyboard to #000000
    initializeHardware().then(({ isNative, platform }) => {
      console.log(`Ω [PLATFORM]: ${platform}, Native: ${isNative}`);
      if (isNative) {
        lockHardwareAesthetic();
      }
    });
    
    // 7. ENLIGHTEN_OS V10.0 — THE STEVEN MICHAEL ABSOLUTE
    // Single source of truth: Φ (1.618), 7.83Hz (Earth), 432Hz/528Hz/963Hz Tiers
    ENLIGHTEN_OS.ignite();
    
    console.log("ENLIGHTEN_OS V17.0: THE MASTER CRYSTAL HUB initialized. Steven Michael | kyndsmiles@gmail.com");
    
    // Cleanup on unmount
    return () => {
      ENLIGHTEN_OS.destroy();
    };
  }, []);
  
  // Route-based audio cleanup — kills audio when exiting rooms
  useRouteAudioCleanup();
  
  const handleIslandClick = React.useCallback((islandId) => {
    setActiveIsland(islandId);
  }, []);
  
  // V36.0: Use location from React Router (reactive) instead of window.location (static)
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Check if current route is sovereign mode (hide all chrome including VOID button)
  const isSovereignRoute = currentPath === '/sovereign-canvas' || 
                           currentPath === '/replant';
  
  // Check if current route is hub (hide legacy toolbars to avoid overlap with SovereignGrid)
  const isHubRoute = currentPath === '/hub' || 
                     currentPath === '/dashboard' ||
                     currentPath === '/lattice-view';
  
  return (
    <>
      {/* V-ENGINE: Golden Ratio Spiral KILLED - Pure Obsidian Void */}
      {/* <div className="emergent-layer" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} /> */}
      
      {/* V-ENGINE: Nebula and VellumOverlay KILLED - Pure Obsidian Void */}
      {/* {!isSovereignRoute && (
        <NebulaScene 
          onIslandClick={handleIslandClick}
          activeIsland={activeIsland}
        />
      )}
      {!isSovereignRoute && <VellumOverlay />} */}
      
      {/* ═══ SOVEREIGN GRID: TOP BAR (The Vault / Past / Archives) ═══ */}
      {!isSovereignRoute && !isHubRoute && (
        <div className="sovereign-toolbar bar-top bar-section-archives" data-testid="sovereign-bar-top">
          <span className="temporal-label temporal-label-past">THE VAULT</span>
          <div className="flex items-center gap-2">
            <Link to="/archives" className="bar-nav-item bar-top-item umbrella-trigger" data-target="archives" data-testid="nav-archives">
              <Archive size={14} />
              <span>Archives</span>
            </Link>
            <Link to="/journal" className="bar-nav-item bar-top-item umbrella-trigger" data-target="journal" data-testid="nav-journal">
              <BookOpen size={14} />
              <span>Journal</span>
            </Link>
            <Link to="/cosmic-ledger" className="bar-nav-item bar-top-item umbrella-trigger" data-target="ledger" data-testid="nav-ledger">
              <Clock size={14} />
              <span>Ledger</span>
            </Link>
          </div>
          <span className="temporal-label temporal-label-past">PAST</span>
        </div>
      )}
      
      {/* ═══ FREQUENCY ENGINE: Perspective Toggle ═══ */}
      {!isSovereignRoute && !isHubRoute && <PerspectiveToggle />}
      
      {/* ═══ MAIN CONTENT STAGE (Present / Hub) ═══ */}
      <div id="app-stage" className="main-wrapper" style={{ minHeight: '100vh', position: 'relative', zIndex: 1, overflow: 'visible' }}>
        {!isSovereignRoute && !isHubRoute && <Navigation />}
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(10, 10, 18, 0.92)',
              border: '1px solid rgba(192,132,252,0.18)',
              color: '#F8FAFC',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 0 30px rgba(192,132,252,0.1), 0 8px 32px rgba(0,0,0,0.4)',
            },
          }}
        />
        <AnimatedRoutes />
        {/* Only show legacy toolbars on non-sovereign and non-hub routes */}
        {!isSovereignRoute && !isHubRoute && (
          <>
            <ShambhalaFrontSide />
            <ShambhalaToolbar />
            <CommandMode context="general" isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
          </>
        )}
        {/* Emergency Stop is ALWAYS visible — even on Hub */}
        <EmergencyShutOff />
      </div>
      
      {/* ═══ V46.0 MANIFEST BAR: REVENUE-FOCUSED BOTTOM NAV ═══ */}
      {!isSovereignRoute && !isHubRoute && (
        <nav 
          id="MANIFEST_BAR" 
          className="sovereign-toolbar bar-bottom bar-section-manifest"
          data-testid="sovereign-bar-bottom"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '70px',
            background: 'rgba(6,6,14,0.95)',
            backdropFilter: 'blur(12px)',
            zIndex: 100000,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderTop: '1px solid rgba(167,139,250,0.15)',
          }}
        >
          <Link 
            to="/hub" 
            className="bar-nav-item" 
            data-hz="174"
            data-testid="nav-hub"
            style={{ color: '#a78bfa', textAlign: 'center', textDecoration: 'none' }}
          >
            <Compass size={20} />
            <span style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>Hub</span>
          </Link>
          <Link 
            to="/trade-circle" 
            className="bar-nav-item" 
            data-hz="528"
            data-testid="nav-trade"
            style={{ color: '#f472b6', textAlign: 'center', textDecoration: 'none' }}
          >
            <ArrowLeftRight size={20} />
            <span style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>Trade</span>
          </Link>
          <Link 
            to="/oracle" 
            className="bar-nav-item" 
            data-hz="285"
            data-testid="nav-oracle"
            style={{ color: '#fbbf24', textAlign: 'center', textDecoration: 'none' }}
          >
            <Star size={20} />
            <span style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>Oracle</span>
          </Link>
          <Link 
            to="/discover" 
            className="bar-nav-item" 
            data-hz="639"
            data-testid="nav-discover"
            style={{ color: '#34d399', textAlign: 'center', textDecoration: 'none' }}
          >
            <Sparkles size={20} />
            <span style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>Discover</span>
          </Link>
          {/* V29.0: HARD-ROUTED TO APEX CREATOR CONSOLE — Legacy V27 showMixer() PURGED */}
          <Link 
            to="/creator-console"
            className="bar-nav-item"
            data-hz="963"
            data-testid="nav-mixer"
            style={{ 
              color: '#60a5fa', 
              textAlign: 'center',
              textDecoration: 'none'
            }}
          >
            <Sliders size={20} />
            <span style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>Mixer</span>
          </Link>
        </nav>
      )}
      
      {/* V29.0: Legacy CreatorMixerUI & ENLIGHTEN_OS.showMixer() DEPRECATED — Mixer routes to /creator-console */}
      
      {!isSovereignRoute && <CafeSettingsPanel isOpen={cafeSettingsOpen} onClose={() => setCafeSettingsOpen(false)} />}
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  useActivityTracker();
  useGlobalSounds();
  useAmbientSoundscape();
  useGateNotifications();

  // Don't show nav/chrome in split view iframe
  const isSplitView = new URLSearchParams(location.search).get('splitview') === 'true';

  return (
    <div className="page-enter" key={location.pathname} style={{ position: 'relative', zIndex: 10 }}>
    <CosmicErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
        {/* V9999.3 HARVEST GROUNDING: Redirect root to Sovereign Hub Singularity */}
        <Route path="/" element={<Navigate to="/sovereign-hub" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/intro" element={<CinematicIntro />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/breathing" element={<Breathing />} />
        <Route path="/meditation" element={<Meditation />} />
        <Route path="/affirmations" element={<Affirmations />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/soundscapes" element={<Soundscapes />} />
        <Route path="/dashboard" element={<Navigate to="/hub" replace />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/nourishment" element={<Nourishment />} />
        <Route path="/frequencies" element={<Frequencies />} />
        <Route path="/rituals" element={<Rituals />} />
        <Route path="/community" element={<Community />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/oracle" element={<Oracle />} />
        <Route path="/mudras" element={<Mudras />} />
        <Route path="/yantra" element={<Yantra />} />
        <Route path="/tantra" element={<Tantra />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/trade-circle" element={<TradeCircle />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/create" element={<Create />} />
        <Route path="/light-therapy" element={<LightTherapy />} />
        <Route path="/zen-garden" element={<ZenGarden />} />
        <Route path="/mantras" element={<Mantras />} />
        <Route path="/hooponopono" element={<Hooponopono />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/games" element={<Games />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/cardology" element={<Cardology />} />
        <Route path="/mayan" element={<MayanAstrology />} />
        <Route path="/avatar" element={<AvatarCreator />} />
        <Route path="/yoga" element={<Yoga />} />
        <Route path="/teachings" element={<Teachings />} />
        <Route path="/wisdom-journal" element={<WisdomJournal />} />
        <Route path="/numerology" element={<Numerology />} />
        <Route path="/animal-totems" element={<AnimalTotems />} />
        <Route path="/dreams" element={<Dreams />} />
        <Route path="/green-journal" element={<GreenJournal />} />
        <Route path="/aromatherapy" element={<Aromatherapy />} />
        <Route path="/herbology" element={<Herbology />} />
        <Route path="/elixirs" element={<Elixirs />} />
        <Route path="/meal-planning" element={<MealPlanning />} />
        <Route path="/acupressure" element={<Acupressure />} />
        <Route path="/reiki" element={<Reiki />} />
        <Route path="/discover" element={<TrySomethingNew />} />
        <Route path="/daily-ritual" element={<DailyRitual />} />
        <Route path="/cosmic-calendar" element={<CosmicCalendar />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/wellness-reports" element={<WellnessReports />} />
        <Route path="/meditation-history" element={<MeditationHistory />} />
        <Route path="/media-library" element={<UserUploads />} />
        <Route path="/coach" element={<SpiritualCoach />} />
        <Route path="/daily-briefing" element={<DailyBriefing />} />
        <Route path="/star-chart" element={<StarChart />} />
        <Route path="/vr" element={<VirtualReality />} />
        <Route path="/forecasts" element={<Forecasts />} />
        <Route path="/cosmic-profile" element={<CosmicProfile />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/creation-stories" element={<CreationStories />} />
        <Route path="/sacred-texts" element={<SacredTexts />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin-setup" element={<AdminSetup />} />
        <Route path="/crystals" element={<Crystals />} />
        <Route path="/entanglement" element={<Entanglement />} />
        <Route path="/music-lounge" element={<MusicLounge />} />
        <Route path="/blessings" element={<Blessings />} />
        <Route path="/akashic-records" element={<AkashicRecords />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/reading-list" element={<ReadingList />} />
        <Route path="/growth-timeline" element={<GrowthTimeline />} />
        <Route path="/soul-reports" element={<SoulReports />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/cosmic-mixer" element={<CosmicMixerPage />} />
        <Route path="/starseed" element={<Starseed />} />
        <Route path="/creator" element={<CreatorDashboard />} />
        <Route path="/live" element={<LiveSessions />} />
        <Route path="/live/:sessionId" element={<LiveRoom />} />
        <Route path="/dance-music" element={<DanceMusicStudio />} />
        <Route path="/my-creations" element={<MediaLibrary />} />
        <Route path="/my-creations/:id" element={<MediaLibrary />} />
        <Route path="/bible" element={<Bible />} />
        <Route path="/starseed-adventure" element={<StarseedAdventure />} />
        <Route path="/starseed-realm" element={<StarseedRealm />} />
        <Route path="/starseed-worlds" element={<StarseedWorlds />} />
        <Route path="/spiritual-avatar" element={<SpiritualAvatarCreator />} />
        <Route path="/avatar-gallery" element={<AvatarGallery />} />
        <Route path="/cosmic-ledger" element={<CosmicLedger />} />
        <Route path="/multiverse-realms" element={<MultiverseRealms />} />
        <Route path="/rpg" element={<RPGPage />} />
        <Route path="/cosmic-insights" element={<CosmicInsights />} />
        <Route path="/multiverse-map" element={<MultiverseMap />} />
        <Route path="/nexus" element={<ElementalNexus />} />
        <Route path="/dream-realms" element={<DreamRealms />} />
        <Route path="/rock-hounding" element={<RockHounding />} />
        <Route path="/forgotten-languages" element={<ForgottenLanguages />} />
        <Route path="/cosmic-store" element={<CosmicStore />} />
        <Route path="/evolution-lab" element={<EvolutionLab />} />
        <Route path="/refinement-lab" element={<RefinementLab />} />
        <Route path="/hotspots" element={<HotspotsPage />} />
        <Route path="/planetary-depths" element={<PlanetaryDepths />} />
        <Route path="/quantum-field" element={<QuantumField />} />
        <Route path="/dimensional-space" element={<DimensionalSpace />} />
        <Route path="/master-view" element={<MasterViewPage />} />
        <Route path="/collective-shadow-map" element={<CollectiveShadowMap />} />
        <Route path="/fractal-engine" element={<FractalEngine />} />
        <Route path="/crystalline-engine" element={<CrystallineEngine />} />
        <Route path="/console" element={<SovereignConsole />} />
        <Route path="/refractor" element={<RefractorDemo />} />
        <Route path="/metatron" element={<CrystallineEngine />} />
        <Route path="/mastery-avenues" element={<MasteryAvenues />} />
              <Route path="/sovereign" element={<SovereignArchitecture />} />
        <Route path="/cosmic-map" element={<CosmicMap />} />
        <Route path="/admin/power-spot" element={<PowerSpotAdmin />} />
        <Route path="/theory" element={<MusicTheory />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/hub" element={<OrbitalHub />} />
        <Route path="/sovereign-hub" element={<SovereignHub />} />
        <Route path="/ether-hub" element={<EnlightenMintHub />} />
        <Route path="/lattice-view" element={<LatticeView />} />
        <Route path="/ar-portal" element={<ARPortalPage />} />
        <Route path="/creator-console" element={<ApexCreatorPage />} />
        <Route path="/quantum-loom" element={<QuantumLoom />} />
        <Route path="/membership" element={<MembershipLoom />} />
        <Route path="/sanctuary" element={<Sanctuary />} />
        <Route path="/silent-sanctuary" element={<SilentSanctuary />} />
        <Route path="/void" element={<SilentSanctuary />} />
        <Route path="/mint" element={<MintingCeremony />} />
        <Route path="/minting-ceremony" element={<MintingCeremony />} />
        <Route path="/vr/celestial-dome" element={<CelestialDome />} />
        <Route path="/observatory" element={<Observatory />} />
        <Route path="/archives" element={<Archives />} />
        <Route path="/suanpan" element={<SuanpanMixer />} />
        <Route path="/botany" element={<Botany />} />
        <Route path="/codex" element={<Codex />} />
        <Route path="/botany-orbital" element={<BotanyOrbital />} />
        <Route path="/hexagram-journal" element={<HexagramJournal />} />
        <Route path="/trade-orbital" element={<TradeCircleOrbital />} />
        <Route path="/codex-orbital" element={<CodexOrbital />} />
        <Route path="/mastery-path" element={<MasteryPath />} />
        <Route path="/sovereign-admin" element={<SovereignDashboard />} />
        <Route path="/academy" element={<AcademyPage />} />
        <Route path="/economy" element={<EconomyPage />} />
        <Route path="/sovereigns" element={<SovereignAdvisors />} />
        <Route path="/recursive-dive" element={<RecursiveDivePage />} />
        <Route path="/seed-gallery" element={<SeedGalleryPage />} />
        <Route path="/tesseract" element={<TesseractExperience />} />
        <Route path="/sovereignty" element={<EnlightenmentOS />} />
        <Route path="/enlightenment-os" element={<EnlightenmentOS />} />
        <Route path="/lab" element={<SovereignLab />} />
        <Route path="/physics-lab" element={<SovereignLab />} />
        <Route path="/sovereign-canvas" element={<SovereignCanvasPage />} />
        <Route path="/replant" element={<SovereignCanvasPage />} />
        <Route path="/fabricator" element={<SovereignFabricator />} />
        <Route path="/smartdock" element={<SmartDockPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </CosmicErrorBoundary>
    </div>
  );
}

function App() {
  return (
  <LanguageProvider>
    <AuthProvider>
      <LatencyProvider>
      <CreditProvider>
      <AvatarProvider>
      <TempoProvider>
      <MixerProvider>
      <FocusProvider>
      <ClassProvider>
      <TreasuryProvider>
      <ModalityProvider>
      <ResolutionProvider>
      <SensoryProvider>
      <CosmicStateProvider>
      <CosmicThemeProvider>
      <OrbitalSentinelProvider>
      <SovereignProvider>
      <MeshNetworkProvider>
      <EnlightenmentCafeProvider>
      <EnlightenmentProvider>
        <BrowserRouter>
          <PolarityProvider>
          <DepthProvider>
          <SageProvider>
          <VoiceCommandProvider>
          {/* V-ENGINE: cosmic-mesh KILLED */}
          {/* <CosmicMeshWrapper /> */}
          {/* V-ENGINE: BACKDROP NOISE KILLED - MeshCanvasRenderer and CosmicBackground DISABLED */}
          {/* <MeshCanvasRenderer opacity={0.4} blur={0.5} /> */}
          {/* <CosmicBackground /> */}
          <SplitScreenProvider>
          <RecursivePortal>
          <CafeApp />
          </RecursivePortal>
          </SplitScreenProvider>
          </VoiceCommandProvider>
          </SageProvider>
          </DepthProvider>
          </PolarityProvider>
        </BrowserRouter>
      </EnlightenmentProvider>
      </EnlightenmentCafeProvider>
      </MeshNetworkProvider>
      </SovereignProvider>
      </OrbitalSentinelProvider>
      </CosmicThemeProvider>
      </CosmicStateProvider>
      </SensoryProvider>
      </ResolutionProvider>
      </ModalityProvider>
      </TreasuryProvider>
      </ClassProvider>
      </FocusProvider>
      </MixerProvider>
      </TempoProvider>
      </AvatarProvider>
      </CreditProvider>
      </LatencyProvider>
    </AuthProvider>
  </LanguageProvider>
  );
}

export default App;

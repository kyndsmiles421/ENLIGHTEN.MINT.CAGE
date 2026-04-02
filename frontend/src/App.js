import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import CosmicMixer from './components/CosmicMixer';
import ScrollToTop from './components/ScrollToTop';
import InstallPrompt from './components/InstallPrompt';
import { MantraOverlay, LoadingMantra } from './components/MantraSystem';
import CreditNudge from './components/CreditNudge';
import { SplitScreenProvider } from './components/SplitScreen';
import { CreditProvider } from './context/CreditContext';
import { AvatarProvider } from './context/AvatarContext';
import { TempoProvider } from './context/TempoContext';
import { MixerProvider } from './context/MixerContext';
import { VoiceCommandProvider } from './context/VoiceCommandContext';
import CosmicToolbar from './components/CosmicToolbar';
import CosmicAssistant from './components/CosmicAssistant';
import PersistentWaveform from './components/PersistentWaveform';
import { CosmicErrorBoundary } from './components/CosmicErrorBoundary';
import { LatencyProvider, LatencyHUD } from './hooks/useLatencyPulse';
import { setupAxiosInterceptors } from './utils/axiosInterceptor';
import TrialGraduation from './components/TrialGraduation';
import { useGateNotifications } from './hooks/useGateNotifications';

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
const MasteryAvenues = lazy(() => import('./pages/MasteryAvenues'));
const CosmicMap = lazy(() => import('./pages/CosmicMap'));
const PowerSpotAdmin = lazy(() => import('./pages/PowerSpotAdmin'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.6) 0%, rgba(124,58,237,0.2) 70%)' }} />
        <p className="text-sm animate-fade-up" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading...</p>
        <LoadingMantra />
      </div>
    </div>
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
    <div className="page-enter" key={location.pathname}>
    <CosmicErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/intro" element={<CinematicIntro />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/breathing" element={<Breathing />} />
        <Route path="/meditation" element={<Meditation />} />
        <Route path="/affirmations" element={<Affirmations />} />
        <Route path="/mood" element={<MoodTracker />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/soundscapes" element={<Soundscapes />} />
        <Route path="/dashboard" element={<Dashboard />} />
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
        <Route path="/mastery-avenues" element={<MasteryAvenues />} />
        <Route path="/cosmic-map" element={<CosmicMap />} />
        <Route path="/admin/power-spot" element={<PowerSpotAdmin />} />
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
      <SensoryProvider>
        <BrowserRouter>
          <VoiceCommandProvider>
          <CosmicMeshWrapper />
          <CosmicBackground />
          <SplitScreenProvider>
          <div style={{ minHeight: '100vh', position: 'relative' }}>
            <Navigation />
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
            <MantraOverlay />
            <LatencyHUD />
            <SmartDock />
            <CosmicMixer />
            <CosmicToolbar />
            <CosmicAssistant />
            <PersistentWaveform />
            <TrialGraduation />
            <InstallPrompt />
            <CreditNudge />
          </div>
          </SplitScreenProvider>
          </VoiceCommandProvider>
        </BrowserRouter>
      </SensoryProvider>
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

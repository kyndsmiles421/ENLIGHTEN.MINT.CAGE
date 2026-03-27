import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SensoryProvider } from './context/SensoryContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import CosmicBackground from './components/CosmicBackground';
import QuickMeditationWidget from './components/QuickMeditationWidget';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import InstallPrompt from './components/InstallPrompt';
import CreditNudge from './components/CreditNudge';
import { CreditProvider } from './context/CreditContext';

// Eager load: Landing + Auth (first screens users see)
import Landing from './pages/Landing';
import Auth from './pages/Auth';

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
const Pricing = lazy(() => import('./pages/Pricing'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminSetup = lazy(() => import('./pages/AdminSetup'));
const Crystals = lazy(() => import('./pages/Crystals'));
const Entanglement = lazy(() => import('./pages/Entanglement'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.6) 0%, rgba(124,58,237,0.2) 70%)' }} />
        <p className="text-sm animate-fade-up" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading...</p>
      </div>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: 'easeIn' } },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
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
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/crystals" element={<Crystals />} />
            <Route path="/entanglement" element={<Entanglement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
  <LanguageProvider>
    <AuthProvider>
      <CreditProvider>
      <SensoryProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', background: '#0B0C15', position: 'relative' }}>
            <CosmicBackground />
            <Navigation />
            <ScrollToTop />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(22, 24, 38, 0.95)',
                  border: '1px solid rgba(192,132,252,0.15)',
                  color: '#F8FAFC',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 0 30px rgba(192,132,252,0.08)',
                },
              }}
            />
            <AnimatedRoutes />
            <QuickMeditationWidget />
            <BackToTop />
            <InstallPrompt />
            <CreditNudge />
          </div>
        </BrowserRouter>
      </SensoryProvider>
      </CreditProvider>
    </AuthProvider>
  </LanguageProvider>
  );
}

export default App;

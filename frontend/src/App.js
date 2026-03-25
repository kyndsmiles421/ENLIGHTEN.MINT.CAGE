import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SensoryProvider } from './context/SensoryContext';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import CosmicBackground from './components/CosmicBackground';

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
const Classes = lazy(() => import('./pages/Classes'));
const Create = lazy(() => import('./pages/Create'));
const LightTherapy = lazy(() => import('./pages/LightTherapy'));
const ZenGarden = lazy(() => import('./pages/ZenGarden'));
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
            <Route path="/classes" element={<Classes />} />
            <Route path="/create" element={<Create />} />
            <Route path="/light-therapy" element={<LightTherapy />} />
            <Route path="/zen-garden" element={<ZenGarden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <SensoryProvider>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', background: '#0B0C15', position: 'relative' }}>
            <CosmicBackground />
            <Navigation />
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
          </div>
        </BrowserRouter>
      </SensoryProvider>
    </AuthProvider>
  );
}

export default App;

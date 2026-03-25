import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';

// Eager load: Landing + Auth (first screens users see)
import Landing from './pages/Landing';
import Auth from './pages/Auth';

// Lazy load everything else — only fetched when navigated to
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
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0C15' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, #C084FC 0%, #7C3AED 100%)' }} />
        <p className="text-sm" style={{ color: 'rgba(248,250,252,0.4)' }}>Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: '#0B0C15' }}>
          <Navigation />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(22, 24, 38, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F8FAFC',
                backdropFilter: 'blur(20px)',
              },
            }}
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Breathing from './pages/Breathing';
import Meditation from './pages/Meditation';
import Affirmations from './pages/Affirmations';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Soundscapes from './pages/Soundscapes';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Nourishment from './pages/Nourishment';
import Frequencies from './pages/Frequencies';
import Rituals from './pages/Rituals';
import NotFound from './pages/NotFound';

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

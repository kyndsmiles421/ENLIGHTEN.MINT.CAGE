import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackToHub() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/sovereign-hub')}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(248,250,252,0.6)',
      }}
      data-testid="back-to-hub"
    >
      <ArrowLeft size={14} />
      <span className="text-xs">Hub</span>
    </button>
  );
}

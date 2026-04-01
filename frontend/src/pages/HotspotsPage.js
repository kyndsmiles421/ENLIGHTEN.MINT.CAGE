import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MantraBanner } from '../components/MantraSystem';
import GPSRadar from '../components/GPSRadar';

export default function HotspotsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen immersive-page pt-20 pb-24 px-4" style={{ background: 'var(--bg-primary)' }} data-testid="hotspots-page">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 group">
          <ArrowLeft size={14} style={{ color: 'var(--text-muted)' }} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Back</span>
        </button>
        <MantraBanner category="explore" className="mb-4" />
        <GPSRadar />
      </div>
    </div>
  );
}

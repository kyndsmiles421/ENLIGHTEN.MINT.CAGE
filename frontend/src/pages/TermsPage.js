import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Globe, Zap, BookOpen, Lock } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();
  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('terms', 2); }, []);

  const sections = [
    {
      icon: Shield,
      title: 'Structural Governance',
      color: '#C084FC',
      content: 'This application and all associated digital assets are governed under a Private Sovereign Trust. This structure ensures that all AI-generated utility, virtual resources, and intellectual property remain the property of the Trust, separate from personal liability.',
    },
    {
      icon: BookOpen,
      title: 'Nature of Service',
      color: '#22C55E',
      content: 'The wellness modules, interfaith wisdom portal, and AI-driven interactions (Sage AI) are classified as Educational and Informational Archives. The platform does not provide medical advice, diagnosis, or treatment. User engagement is strictly "pull-based," requiring manual activation for all core features to ensure intentionality.',
    },
    {
      icon: Zap,
      title: 'Digital Utility Clarification',
      color: '#FB923C',
      content: 'All internal units, including "Fans," "Credits," and "Crystals," are purely functional digital utilities within the ENLIGHTEN.MINT.CAFE ecosystem. They carry no real-world monetary value, cannot be exchanged between users, and are not redeemable for fiat currency or external goods. This is a closed-loop environment managed by the Trust for educational engagement only.',
    },
    {
      icon: Globe,
      title: 'Virtual Economy',
      color: '#38BDF8',
      content: 'The internal economy (utilizing the Sovereign Engine) is a Closed-Loop System. No fiat currency or real-world value is exchanged or withdrawn. "Fans" and "Credits" are internal virtual units used exclusively for gamified participation and resource management within the application environment. The phi-cubed mathematical ceiling ensures no hyper-inflation within the internal economy.',
    },
    {
      icon: Lock,
      title: 'Cryptographic Integrity',
      color: '#E879F9',
      content: 'All data integrity is maintained via the Crystal Seal framework, utilizing SHA-256 encryption to ensure the security and sovereignty of user-generated interactions. No MD5 or deprecated hashing algorithms are used. Economy randomness is secured via the secrets module.',
    },
    {
      icon: Shield,
      title: 'Data Collection',
      color: '#2DD4BF',
      content: 'The application collects App Activity data (resonance tracking, dust accrual, module interactions) for internal gamification purposes only. This data is not linked to the user\'s identity and is not shared with third parties. No personal health data is collected, stored, or transmitted to external services.',
    },
  ];

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: 'transparent' }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl active:scale-95"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(248,250,252,0.5)' }}
          data-testid="terms-back">
          <ArrowLeft size={14} /><span className="text-xs">Back</span>
        </button>

        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'rgba(248,250,252,0.85)' }} data-testid="terms-title">
          Trust & Compliance
        </h1>
        <p className="text-[11px] mb-8" style={{ color: 'rgba(248,250,252,0.25)' }}>
          ENLIGHTEN.MINT.CAFE | Sovereign Trust Framework
        </p>

        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }} data-testid={`terms-section-${i}`}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} style={{ color: s.color }} />
                <h2 className="text-sm font-bold" style={{ color: s.color }}>{s.title}</h2>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,250,252,0.45)' }}>{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
          <p className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
            Operated under a Private Sovereign Trust. All internal units including "Fans," "Credits," and "Crystals" are purely functional digital utilities — they carry no real-world monetary value, cannot be exchanged between users, and are not redeemable for fiat currency or external goods. Closed-loop environment managed by the Trust for educational engagement only. All wellness content is informational/educational and does not constitute medical advice, diagnosis, or treatment. Crystal Seal integrity (SHA-256).
          </p>
        </div>
      </div>
    </div>
  );
}

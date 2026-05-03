import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, BookOpen, Sparkles, Star, Heart, Shield, Compass, Music, Gem, Globe, Send, HelpCircle, MessageCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FAQS = [
  // V1.0.10 — Ritual Forge / Omni-Agent — surfaced first because it's
  // the newest hero feature. Users will look here when they spot the
  // wand pill.
  { q: "What is the Wand pill in the top-right corner?", a: "The Wand opens the Ritual Forge — a Sage agent that takes a natural-language intent (e.g. 'Ground me, breathe deep, capture one insight') and compiles it into a sequence of 2–6 modules that run automatically. The Wand sits in the top sticky strip on every page so you can summon a ritual from the Hub, Forge, Tesseract, or anywhere else.", category: "ritual" },
  { q: "What's the difference between Forge & Run and the Ritual Path inside a Realm?", a: "Same engine, two surfaces. The Wand is the global entry point — quick intent, one-tap re-run from your last 3 chains. The Realm Practices panel is the formal workshop — it knows your active realm and weaves the realm's element/biome into every step. Use the Wand for daily rhythm; use the Realm panel when you want a chain shaped by where you currently are.", category: "ritual" },
  { q: "Why does the agent pause for a few seconds on each step?", a: "It's a deliberate Dwell Guard. When a module mounts, it commits its initial state to the ContextBus — that commit could be misread as 'step done'. So we hold the floor for at least 5 seconds before any bus-driven advance. The agent still feels live (you'll see the chip pulsing), but you actually get to inhale the step instead of flashing through it. Tap Skip in the HUD if you want to go faster.", category: "ritual" },
  { q: "What does the green '✓ Run again' chip mean?", a: "When a chain completes, the same HUD slot transitions for ~6 seconds into a recall pill. Tap 'RUN AGAIN' to restart the chain immediately — bypassing the Sage call. After 6s it auto-dismisses, or you can hit × to clear it.", category: "ritual" },
  { q: "What happens to visual modules when Auto-Visuals is OFF?", a: "Settings → Auto-Generate AI Images. With it off (or in Calm immersion), the runner skips visual modules — Scene Gen, Story Gen, Dream Viz, Avatar, Cosmic Portrait — and advances to the next non-visual step. You'll see a '· skipped' badge in any visible Ritual Path. Nothing surprises you with an image you didn't ask for.", category: "ritual" },
  { q: "How is Calm Immersion different for the agent?", a: "In Calm mode the chain still runs, but the HUD chip drops to ~25% opacity (a ghost in the machine) and toast notifications are suppressed. Visual modules are skipped. Sage Voice still plays in Calm — just at 40% volume with softer, breathier delivery (lower stability, no speaker boost). The agent stays useful without ever interrupting your focus.", category: "ritual" },
  { q: "What is Sage Voice and how do I turn it on?", a: "Sage Voice (V1.0.11) narrates each ritual step out loud using ElevenLabs TTS. Three modes in Settings → Sage Voice: Off (silent, default), On Demand (speaker icon in the HUD chip — tap to play the current step), Auto (narrates every step automatically as it pulls). Tap the PREVIEW button next to the picker to hear a 5-second sample (cached server-side, so repeat clicks cost nothing). You can also long-press / right-click the speaker icon in the HUD to cycle modes without leaving your flow. Requires ELEVENLABS_API_KEY in the backend environment — the system fails gracefully (no audio, chain still runs) if the key is absent.", category: "ritual" },

  { q: "How do I track my mood?", a: "Tap the Heart icon in the bottom navigation or go to Dashboard → Mood Logs. Select how you're feeling and optionally add a note. Your mood history builds a powerful self-awareness map over time.", category: "basics" },
  { q: "What is the Quick Reset?", a: "Quick Reset is a personalized 5-minute wellness flow. Choose from 33+ emotions, and the app creates a custom reset combining a solfeggio frequency, breathing/meditation tool, nourishing recipe, and sacred mantra.", category: "basics" },
  { q: "How does the Star Chart work?", a: "The 3D Star Chart shows constellations from 20 world cultures. Drag to rotate, pinch/scroll to zoom, and tap any constellation for its sacred mythology. Select a culture from 'World Skies' to see that civilization's sky stories.", category: "features" },
  { q: "What is Crystal Pairing?", a: "Go to Crystals → Crystal Pairing tab. Select your mood and intention, and our AI recommends 3 crystals with a personalized explanation and ritual suggestion. You can listen to the guidance with voice narration.", category: "features" },
  { q: "How do I send a blessing?", a: "Navigate to Send a Blessing. Choose a template or generate a custom AI blessing. Add a personal note and the recipient's name. Your blessing joins the community stream where others can feel your light.", category: "features" },
  { q: "What are Solfeggio Frequencies?", a: "Ancient healing tones (174-963 Hz) believed to promote physical and spiritual wellbeing. Each frequency targets a different energy center. Access them through Quick Reset or the Frequencies page.", category: "wisdom" },
  { q: "How does the AI Coach work?", a: "Sage is your personal AI wellness guide. It remembers your conversation history and provides guidance on meditation, emotional processing, spiritual growth, and daily wellness practices.", category: "features" },
  { q: "Can I use this app offline?", a: "The ENLIGHTEN.MINT.CAFE is a Progressive Web App (PWA). Core pages work offline after first load. AI features, community features, and real-time data require an internet connection.", category: "technical" },
  { q: "How do subscriptions work?", a: "Free tier gives access to basic features. Premium tiers unlock advanced AI guidance, unlimited crystal pairings, sacred text narration, and more. Go to Settings → Subscription to manage your plan.", category: "technical" },
  { q: "What is the Sacred Texts reader?", a: "An audiobook-style reader for 15 world scriptures. Each text has AI-generated chapter summaries and HD voice narration. VR Immersive Mode lets you read in a focused, distraction-free environment.", category: "features" },
  { q: "How do I access VR modes?", a: "Several features have VR Immersive Mode buttons (crystals, encyclopedia, sacred texts). Tap the VR icon to enter a full-screen immersive reading/meditation environment with ambient particles.", category: "features" },
  { q: "Is my data private?", a: "Your mood logs, journal entries, and personal data are stored securely and only accessible to you. We never share personal data with third parties. AI processing happens in real-time and is not stored.", category: "technical" },
];

const TUTORIALS = [
  { title: "Getting Started", desc: "Your first steps on the cosmic path", path: "/", icon: Compass, color: "#2DD4BF" },
  { title: "Mood Tracking", desc: "Build emotional self-awareness", path: "/mood", icon: Heart, color: "#FDA4AF" },
  { title: "Journal & Reflection", desc: "Deepen your inner practice", path: "/journal", icon: BookOpen, color: "#86EFAC" },
  { title: "Star Chart Exploration", desc: "Navigate 20 world sky cultures", path: "/star-chart", icon: Star, color: "#FCD34D" },
  { title: "Crystal Healing", desc: "Discover your crystal matches", path: "/crystals", icon: Gem, color: "#8B5CF6" },
  { title: "Sacred Texts", desc: "Read and listen to world scriptures", path: "/sacred-texts", icon: BookOpen, color: "#C084FC" },
  { title: "World Myths", desc: "Explore creation stories from 20 civilizations", path: "/creation-stories", icon: Globe, color: "#FB923C" },
  { title: "Meditation & Breathing", desc: "Calm the mind, awaken the spirit", path: "/meditation", icon: Sparkles, color: "#2DD4BF" },
  { title: "Sage AI Coach", desc: "Your personal wellness guide", path: "/coach", icon: MessageCircle, color: "#C084FC" },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'ritual', label: 'Ritual Forge' },
  { id: 'basics', label: 'Basics' },
  { id: 'features', label: 'Features' },
  { id: 'wisdom', label: 'Wisdom' },
  { id: 'technical', label: 'Technical' },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('faq');
  const [openFaq, setOpenFaq] = useState(null);
  const [faqFilter, setFaqFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter(f => {
    if (faqFilter !== 'all' && f.category !== faqFilter) return false;
    if (search && !f.q.toLowerCase().includes(search.toLowerCase()) && !f.a.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen pt-20 pb-40 px-4 max-w-3xl mx-auto" data-testid="help-center-page">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/5 transition-all" data-testid="help-back">
          <ArrowLeft size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: 'var(--primary)' }}>Support</p>
          <h1 className="text-3xl font-light" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
            Help Center
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: 'faq', label: 'FAQs', icon: HelpCircle },
          { id: 'tutorials', label: 'Guides', icon: BookOpen },
          { id: 'contact', label: 'Contact', icon: Send },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(192,132,252,0.08)' : 'transparent',
                color: tab === t.id ? '#C084FC' : 'var(--text-muted)',
                border: `1px solid ${tab === t.id ? 'rgba(192,132,252,0.2)' : 'rgba(248,250,252,0.06)'}`,
              }}
              data-testid={`help-tab-${t.id}`}>
              <Icon size={12} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'faq' && (
        <div>
          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none mb-4"
            style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.08)', color: 'var(--text-primary)' }}
            data-testid="faq-search" />

          {/* Category filter */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setFaqFilter(c.id)}
                className="px-3 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap"
                style={{
                  background: faqFilter === c.id ? 'rgba(192,132,252,0.08)' : 'transparent',
                  color: faqFilter === c.id ? '#C084FC' : 'var(--text-muted)',
                  border: `1px solid ${faqFilter === c.id ? 'rgba(192,132,252,0.15)' : 'rgba(248,250,252,0.04)'}`,
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2" data-testid="faq-list">
            {filtered.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  data-testid={`faq-${i}`}>
                  <p className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{faq.q}</p>
                  {openFaq === i ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}>
                      <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>No matching questions found</p>
            )}
          </div>
        </div>
      )}

      {tab === 'tutorials' && (
        <div className="space-y-3" data-testid="tutorials-list">
          {TUTORIALS.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => navigate(t.path)}
                className="p-4 w-full flex items-center gap-4 text-left group hover:scale-[1.01] transition-all"
                data-testid={`tutorial-${i}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${t.color}10`, border: `1px solid ${t.color}20` }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                </div>
                <ChevronDown size={12} className="-rotate-90" style={{ color: 'var(--text-muted)' }} />
              </motion.button>
            );
          })}
        </div>
      )}

      {tab === 'contact' && (
        <div className="space-y-4" data-testid="contact-section">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}>
              <MessageCircle size={24} style={{ color: '#C084FC' }} />
            </div>
            <h2 className="text-xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text-primary)' }}>
              Get in Touch
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Have a question, idea, or just want to connect? We'd love to hear from you.
            </p>
            <div className="space-y-3">
              <button onClick={() => navigate('/coach')}
                className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC' }}
                data-testid="contact-ai-coach">
                <Sparkles size={14} /> Chat with Sage AI Coach
              </button>
              <button onClick={() => navigate('/feedback')}
                className="w-full py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: '#2DD4BF' }}
                data-testid="contact-feedback">
                <Send size={14} /> Submit Feedback or Suggestion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

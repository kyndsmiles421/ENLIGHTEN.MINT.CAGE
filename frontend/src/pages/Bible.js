import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, ChevronRight, ChevronLeft, Search, Loader2, X,
  Bookmark, BookmarkCheck, MessageCircle, Send, Volume2, Pause,
  Scroll, Eye, Cross, Sparkles, Star, ArrowLeft, Map, CheckCircle, Lock, Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { ScriptureVisualizer, VisionModeToggle, detectScenes } from '../components/ScriptureVisualizer';
import { useSensory } from '../context/SensoryContext';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CAT_COLORS = {
  'old-testament': '#D97706',
  'new-testament': '#DC2626',
  'deuterocanonical': '#7C3AED',
  'lost-apocryphal': '#0891B2',
  'torah-talmud': '#2563EB',
  'kabbalah': '#E879F9',
  'quran': '#059669',
};
const CAT_ICONS = {
  'old-testament': Scroll,
  'new-testament': Cross,
  'deuterocanonical': BookOpen,
  'lost-apocryphal': Eye,
  'torah-talmud': Star,
  'kabbalah': Sparkles,
  'quran': BookOpen,
};

function AIChat({ bookTitle, chapterNum, contextText }) {
  const { token, authHeaders } = useAuth();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!question.trim() || loading || !token) return;
    const q = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/bible/ask`, {
        question: q,
        book_title: bookTitle,
        chapter_num: chapterNum,
        context_text: contextText,
      }, { headers: authHeaders });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'I apologize, I could not generate an answer at this time.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="mt-4" data-testid="bible-ai-chat">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={14} style={{ color: '#A78BFA' }} />
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: '#A78BFA' }}>Ask the Scholar</span>
      </div>
      {messages.length > 0 && (
        <div className="space-y-3 mb-3 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed"
                style={{
                  background: m.role === 'user' ? 'rgba(167,139,250,0.12)' : 'rgba(248,250,252,0.04)',
                  border: `1px solid ${m.role === 'user' ? 'rgba(167,139,250,0.2)' : 'rgba(248,250,252,0.06)'}`,
                  color: 'rgba(255,255,255,0.9)',
                }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.06)' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: '#A78BFA' }} />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask anything about this passage..."
          data-testid="bible-ai-input"
          className="flex-1 px-3 py-2 rounded-xl text-xs"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }}
        />
        <button onClick={ask} disabled={loading || !question.trim()} data-testid="bible-ai-send"
          className="px-3 py-2 rounded-xl transition-all"
          style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', color: '#A78BFA' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

function ChapterReader({ book, chapterNum, onBack, onNav }) {
  const { token, authHeaders } = useAuth();
  const { showVisualEffects, showVisionMode } = useSensory();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('retelling');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [visionMode, setVisionMode] = useState(false);
  const [detectedScenes, setDetectedScenes] = useState([]);
  const color = CAT_COLORS[book.category] || '#A78BFA';

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setChapter(null);
    setActiveTab('retelling');
    axios.post(`${API}/bible/books/${book.id}/chapters/${chapterNum}/generate`, {}, { headers: authHeaders })
      .then(r => {
        setChapter(r.data);
        const allText = `${r.data.retelling || ''} ${r.data.key_verses || ''} ${r.data.commentary || ''}`;
        setDetectedScenes(detectScenes(allText));
      })
      .catch(() => toast.error('Failed to generate chapter'))
      .finally(() => setLoading(false));
  }, [book.id, chapterNum, token, authHeaders]);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/bible/bookmarks`, { headers: authHeaders })
      .then(r => {
        const bm = r.data.bookmarks || [];
        setIsBookmarked(bm.some(b => b.book_id === book.id && b.chapter_num === chapterNum));
      }).catch(() => {});
  }, [book.id, chapterNum, token, authHeaders]);

  const toggleBookmark = async () => {
    if (!token) return;
    try {
      if (isBookmarked) {
        await axios.delete(`${API}/bible/bookmarks/${book.id}/${chapterNum}`, { headers: authHeaders });
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await axios.post(`${API}/bible/bookmarks`, { book_id: book.id, book_title: book.title, chapter_num: chapterNum }, { headers: authHeaders });
        setIsBookmarked(true);
        toast.success('Chapter bookmarked');
      }
    } catch { toast.error('Bookmark failed'); }
  };

  const speak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = activeTab === 'retelling' ? chapter?.retelling : activeTab === 'key_verses' ? chapter?.key_verses : chapter?.commentary;
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text.slice(0, 3000));
    u.rate = 0.9;
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const tabs = [
    { key: 'retelling', label: 'Story', icon: BookOpen },
    { key: 'key_verses', label: 'Verses', icon: Star },
    { key: 'commentary', label: 'Commentary', icon: Sparkles },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto relative">
      {/* Vision Mode Background */}
      <ScriptureVisualizer
        text={chapter ? `${chapter.retelling || ''} ${chapter.key_verses || ''}` : ''}
        category={book.category}
        themes={book.themes}
        isActive={visionMode && !!chapter && showVisualEffects}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button onClick={onBack} data-testid="chapter-back" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'rgba(255,255,255,0.75)' }}>
          <ArrowLeft size={12} /> {book.title}
        </button>
        <div className="flex items-center gap-2">
          {chapter && showVisionMode && (
            <VisionModeToggle
              isActive={visionMode}
              onToggle={() => setVisionMode(v => !v)}
              scenes={detectedScenes}
            />
          )}
          <button onClick={speak} data-testid="chapter-tts" className="p-2 rounded-lg"
            style={{ background: speaking ? `${color}15` : 'rgba(248,250,252,0.04)', border: `1px solid ${speaking ? `${color}30` : 'rgba(248,250,252,0.08)'}`, color: speaking ? color : 'rgba(255,255,255,0.7)' }}>
            {speaking ? <Pause size={14} /> : <Volume2 size={14} />}
          </button>
          <button onClick={toggleBookmark} data-testid="chapter-bookmark" className="p-2 rounded-lg"
            style={{ background: isBookmarked ? `${color}15` : 'rgba(248,250,252,0.04)', border: `1px solid ${isBookmarked ? `${color}30` : 'rgba(248,250,252,0.08)'}`, color: isBookmarked ? color : 'rgba(255,255,255,0.7)' }}>
            {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
      </div>

      {/* Chapter title */}
      <div className="text-center mb-6 relative z-10">
        <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color }}>{book.title}</p>
        <h2 className="text-2xl font-semibold" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
          Chapter {chapterNum}
        </h2>
        {chapter?.title && (
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{chapter.title}</p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20 relative z-10">
          <Loader2 className="animate-spin" size={24} style={{ color }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Generating sacred text...</p>
        </div>
      ) : chapter ? (
        <div className="relative z-10">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 justify-center">
            {tabs.map(t => {
              const Icon = t.icon;
              const active = activeTab === t.key;
              return (
                <button key={t.key} onClick={() => setActiveTab(t.key)} data-testid={`chapter-tab-${t.key}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: active ? `${color}12` : 'rgba(248,250,252,0.03)',
                    color: active ? color : 'rgba(255,255,255,0.65)',
                    border: `1px solid ${active ? `${color}20` : 'rgba(248,250,252,0.06)'}`,
                  }}>
                  <Icon size={12} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl p-6" style={{ background: visionMode ? 'rgba(6,6,18,0.75)' : 'rgba(248,250,252,0.02)', border: `1px solid ${visionMode ? 'rgba(248,250,252,0.08)' : 'rgba(248,250,252,0.05)'}`, backdropFilter: visionMode ? 'blur(8px)' : 'none' }}>
              {activeTab === 'retelling' && chapter.retelling && (
                <div className="prose prose-invert max-w-none">
                  {chapter.retelling.split('\n\n').map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'Cormorant Garamond, serif', fontSize: '15px' }}>{p}</p>
                  ))}
                </div>
              )}
              {activeTab === 'key_verses' && chapter.key_verses && (
                <div className="space-y-4">
                  {chapter.key_verses.split('\n\n').map((v, i) => (
                    <div key={i} className="pl-4" style={{ borderLeft: `2px solid ${color}40` }}>
                      <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Cormorant Garamond, serif', fontSize: '14px' }}>{v}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'commentary' && chapter.commentary && (
                <div>
                  {chapter.commentary.split('\n\n').map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{p}</p>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button onClick={() => onNav(chapterNum - 1)} disabled={chapterNum <= 1} data-testid="chapter-prev"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs disabled:opacity-30"
              style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'rgba(255,255,255,0.75)' }}>
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {chapterNum} of {book.chapters}
            </span>
            <button onClick={() => onNav(chapterNum + 1)} disabled={chapterNum >= book.chapters} data-testid="chapter-next"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs disabled:opacity-30"
              style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'rgba(255,255,255,0.75)' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>

          {/* AI Chat */}
          <AIChat bookTitle={book.title} chapterNum={chapterNum} contextText={chapter?.retelling?.slice(0, 300) || ''} />
        </div>
      ) : (
        <p className="text-center text-xs py-10" style={{ color: 'rgba(255,255,255,0.65)' }}>Failed to load chapter</p>
      )}
    </motion.div>
  );
}

export default function Bible() {
  const { token, authHeaders } = useAuth();
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [loading, setLoading] = useState(true);
  const [journeys, setJourneys] = useState([]);
  const [activeJourney, setActiveJourney] = useState(null);
  const [journeyDetail, setJourneyDetail] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/bible/categories`),
      axios.get(`${API}/bible/books`),
    ]).then(([catRes, bookRes]) => {
      setCategories(catRes.data.categories);
      setBooks(bookRes.data.books);
    }).catch(() => toast.error('Failed to load Bible data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/scripture-journeys`, { headers: authHeaders })
        .then(r => setJourneys(r.data.journeys || []))
        .catch(() => {});
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/bible/bookmarks`, { headers: authHeaders })
        .then(r => setBookmarks(r.data.bookmarks || []))
        .catch(() => {});
    }
  }, [token, authHeaders, activeChapter]);

  const filteredBooks = books.filter(b => {
    if (activeCat && b.category !== activeCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.themes.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const openBook = useCallback(async (bookId) => {
    try {
      const res = await axios.get(`${API}/bible/books/${bookId}`);
      setSelectedBook(res.data);
      setActiveChapter(null);
    } catch { toast.error('Failed to load book'); }
  }, []);

  const openJourney = useCallback(async (journeyId) => {
    if (!token) return;
    try {
      const res = await axios.get(`${API}/scripture-journeys/${journeyId}`, { headers: authHeaders });
      setJourneyDetail(res.data);
      setActiveJourney(journeyId);
    } catch { toast.error('Failed to load journey'); }
  }, [token, authHeaders]);

  const completeStep = useCallback(async (journeyId, stepIndex, step) => {
    if (!token) return;
    try {
      const res = await axios.post(`${API}/scripture-journeys/${journeyId}/complete-step`,
        { step_index: stepIndex }, { headers: authHeaders });
      if (res.data.achievement_earned) {
        toast.success('Journey Complete! Achievement unlocked!');
      }
      // Refresh journey detail
      const refresh = await axios.get(`${API}/scripture-journeys/${journeyId}`, { headers: authHeaders });
      setJourneyDetail(refresh.data);
      // Also refresh journeys list
      axios.get(`${API}/scripture-journeys`, { headers: authHeaders })
        .then(r => setJourneys(r.data.journeys || [])).catch(() => {});
      // Navigate to the chapter
      await openBook(step.book_id);
      setActiveChapter(step.chapter);
    } catch { toast.error('Failed to start step'); }
  }, [token, authHeaders, openBook]);

  // ── Journey Detail View ──
  if (activeJourney && journeyDetail) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4" data-testid="bible-page">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => { setActiveJourney(null); setJourneyDetail(null); }} data-testid="journey-back"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs mb-6"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'rgba(255,255,255,0.75)' }}>
            <ArrowLeft size={12} /> All Journeys
          </button>

          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: journeyDetail.color }}>
              {journeyDetail.difficulty} journey
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
              {journeyDetail.title}
            </h1>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>{journeyDetail.description}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              {journeyDetail.traditions?.map(t => (
                <span key={t} className="text-[8px] px-2 py-0.5 rounded"
                  style={{ background: `${journeyDetail.color}10`, color: journeyDetail.color, border: `1px solid ${journeyDetail.color}18` }}>{t}</span>
              ))}
            </div>
            {/* Progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="flex items-center justify-between text-[9px] mb-1">
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>Progress</span>
                <span style={{ color: journeyDetail.color }}>{journeyDetail.progress_pct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${journeyDetail.progress_pct}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: journeyDetail.color }}
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {journeyDetail.steps.map((step, i) => {
              const isCompleted = step.completed;
              const isUnlocked = step.unlocked;
              const isNext = isUnlocked && !isCompleted;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: isNext ? `${journeyDetail.color}08` : 'rgba(248,250,252,0.02)',
                    border: `1px solid ${isNext ? `${journeyDetail.color}18` : 'rgba(248,250,252,0.05)'}`,
                    opacity: isUnlocked ? 1 : 0.4,
                  }}
                >
                  {/* Step number */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCompleted ? `${journeyDetail.color}18` : 'rgba(248,250,252,0.04)',
                      border: `1px solid ${isCompleted ? `${journeyDetail.color}30` : 'rgba(248,250,252,0.08)'}`,
                    }}>
                    {isCompleted ? <CheckCircle size={14} style={{ color: journeyDetail.color }} />
                      : !isUnlocked ? <Lock size={12} style={{ color: 'rgba(255,255,255,0.6)' }} />
                      : <span className="text-xs font-medium" style={{ color: isNext ? journeyDetail.color : 'rgba(255,255,255,0.65)' }}>{i + 1}</span>}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: isCompleted ? journeyDetail.color : '#F8FAFC' }}>{step.label}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{step.tradition}</p>
                  </div>

                  {/* Action */}
                  {isUnlocked && (
                    <button
                      onClick={() => completeStep(activeJourney, i, step)}
                      data-testid={`journey-step-${i}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                      style={{
                        background: isCompleted ? 'rgba(248,250,252,0.04)' : `${journeyDetail.color}12`,
                        border: `1px solid ${isCompleted ? 'rgba(248,250,252,0.08)' : `${journeyDetail.color}25`}`,
                        color: isCompleted ? 'rgba(255,255,255,0.7)' : journeyDetail.color,
                      }}>
                      {isCompleted ? 'Re-read' : 'Read'} <ChevronRight size={10} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {journeyDetail.progress_pct >= 100 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-4 rounded-2xl text-center"
              style={{ background: `${journeyDetail.color}08`, border: `1px solid ${journeyDetail.color}20` }}>
              <Trophy size={24} className="mx-auto mb-2" style={{ color: journeyDetail.color }} />
              <p className="text-sm font-semibold mb-1" style={{ color: journeyDetail.color }}>Journey Complete!</p>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.7)' }}>You've completed "{journeyDetail.title}" — achievement unlocked</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (activeChapter && selectedBook) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 relative overflow-hidden" data-testid="bible-page">
        <ChapterReader
          book={selectedBook}
          chapterNum={activeChapter}
          onBack={() => setActiveChapter(null)}
          onNav={(n) => { if (n >= 1 && n <= selectedBook.chapters) setActiveChapter(n); }}
        />
      </div>
    );
  }

  if (selectedBook) {
    const color = CAT_COLORS[selectedBook.category] || '#A78BFA';
    return (
      <div className="min-h-screen pt-20 pb-12 px-4" data-testid="bible-page">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedBook(null)} data-testid="book-back"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs mb-4"
            style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: 'rgba(255,255,255,0.75)' }}>
            <ArrowLeft size={12} /> All Books
          </button>

          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color }}>{selectedBook.category.replace('-', ' ')}</p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
              {selectedBook.title}
            </h1>
            <p className="text-sm max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>{selectedBook.description}</p>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: `${color}12`, color, border: `1px solid ${color}20` }}>{selectedBook.era}</span>
              {selectedBook.themes?.map(t => (
                <span key={t} className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(248,250,252,0.06)' }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {(selectedBook.chapter_list || []).map(ch => (
              <button key={ch.number} onClick={() => setActiveChapter(ch.number)}
                data-testid={`chapter-${ch.number}`}
                className="aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all hover:scale-105"
                style={{
                  background: ch.generated ? `${color}12` : 'rgba(248,250,252,0.03)',
                  border: `1px solid ${ch.generated ? `${color}20` : 'rgba(248,250,252,0.06)'}`,
                  color: ch.generated ? color : 'rgba(255,255,255,0.7)',
                }}>
                {ch.number}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" data-testid="bible-page">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC', fontFamily: 'Cormorant Garamond, serif' }}>
            Sacred Scriptures & Lost Books
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Bible, Torah, Kabbalah, Quran, and lost apocryphal texts — with AI-powered deep-dive exploration
          </p>
        </div>

        {/* Search + Bookmarks */}
        <div className="flex items-center gap-3 mb-6 max-w-xl mx-auto">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.65)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search books, themes..."
              data-testid="bible-search"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(248,250,252,0.04)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' }}
            />
          </div>
          {token && (
            <button onClick={() => setShowBookmarks(!showBookmarks)} data-testid="bible-bookmarks-btn"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs"
              style={{
                background: showBookmarks ? 'rgba(167,139,250,0.12)' : 'rgba(248,250,252,0.04)',
                border: `1px solid ${showBookmarks ? 'rgba(167,139,250,0.25)' : 'rgba(248,250,252,0.08)'}`,
                color: showBookmarks ? '#A78BFA' : 'rgba(255,255,255,0.7)',
              }}>
              <Bookmark size={14} /> {bookmarks.length}
            </button>
          )}
        </div>

        {/* Bookmarks dropdown */}
        <AnimatePresence>
          {showBookmarks && bookmarks.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="max-w-xl mx-auto mb-6 rounded-xl overflow-hidden"
              style={{ background: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.06)' }}>
              <div className="p-3 space-y-1">
                {bookmarks.map((bm, i) => (
                  <button key={i} onClick={() => { openBook(bm.book_id).then(() => setActiveChapter(bm.chapter_num)); setShowBookmarks(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs hover:bg-white/5 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.85)' }}>
                    <span>{bm.book_title} — Chapter {bm.chapter_num}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guided Journeys */}
        {token && journeys.length > 0 && (
          <div className="mb-8" data-testid="scripture-journeys-section">
            <div className="flex items-center gap-2 mb-3">
              <Map size={14} style={{ color: '#A78BFA' }} />
              <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Guided Journeys</span>
              <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.15)' }}>
                Cross-Tradition
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {journeys.map(j => (
                <button key={j.id} onClick={() => openJourney(j.id)} data-testid={`journey-${j.id}`}
                  className="text-left p-3.5 rounded-xl transition-all hover:scale-[1.01] group"
                  style={{ background: 'rgba(248,250,252,0.02)', border: '1px solid rgba(248,250,252,0.06)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>{j.title}</p>
                      <p className="text-[9px]" style={{ color: j.color }}>{j.subtitle}</p>
                    </div>
                    {j.completed ? (
                      <Trophy size={14} style={{ color: j.color }} />
                    ) : j.started ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${j.color}10`, color: j.color }}>{j.progress_pct}%</span>
                    ) : null}
                  </div>
                  <p className="text-[10px] line-clamp-2 mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>{j.description}</p>
                  <div className="flex items-center gap-2">
                    {j.traditions?.slice(0, 3).map(t => (
                      <span key={t} className="text-[7px] px-1.5 py-0.5 rounded" style={{ background: `${j.color}08`, color: `${j.color}CC`, border: `1px solid ${j.color}10` }}>{t}</span>
                    ))}
                    <span className="text-[8px] ml-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>{j.total_steps} steps</span>
                  </div>
                  {j.started && !j.completed && (
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(248,250,252,0.06)' }}>
                      <div className="h-full rounded-full" style={{ background: j.color, width: `${j.progress_pct}%` }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 justify-center flex-wrap" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setActiveCat(null)} data-testid="bible-cat-all"
            className="px-4 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0"
            style={{
              background: !activeCat ? 'rgba(248,250,252,0.08)' : 'rgba(248,250,252,0.03)',
              border: `1px solid ${!activeCat ? 'rgba(248,250,252,0.15)' : 'rgba(248,250,252,0.06)'}`,
              color: !activeCat ? '#F8FAFC' : 'rgba(255,255,255,0.7)',
            }}>
            All ({books.length})
          </button>
          {categories.map(cat => {
            const color = CAT_COLORS[cat.id];
            const active = activeCat === cat.id;
            const Icon = CAT_ICONS[cat.id] || BookOpen;
            return (
              <button key={cat.id} onClick={() => setActiveCat(active ? null : cat.id)}
                data-testid={`bible-cat-${cat.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0"
                style={{
                  background: active ? `${color}12` : 'rgba(248,250,252,0.03)',
                  border: `1px solid ${active ? `${color}25` : 'rgba(248,250,252,0.06)'}`,
                  color: active ? color : 'rgba(255,255,255,0.7)',
                }}>
                <Icon size={12} /> {cat.name} ({cat.book_count})
              </button>
            );
          })}
        </div>

        {/* Books grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin" size={24} style={{ color: '#A78BFA' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBooks.map((book, i) => {
              const color = CAT_COLORS[book.category];
              const Icon = CAT_ICONS[book.category] || BookOpen;
              return (
                <motion.button
                  key={book.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => openBook(book.id)}
                  data-testid={`bible-book-${book.id}`}
                  className="text-left p-4 rounded-xl transition-all hover:scale-[1.01] group"
                  style={{
                    background: 'rgba(248,250,252,0.02)',
                    border: `1px solid rgba(248,250,252,0.06)`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: '#F8FAFC' }}>{book.title}</p>
                        <span className="text-[8px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${color}10`, color, border: `1px solid ${color}18` }}>
                          {book.chapters} ch
                        </span>
                      </div>
                      <p className="text-[10px] mt-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.7)' }}>{book.description}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.04)', color: 'rgba(255,255,255,0.65)' }}>{book.era}</span>
                        {book.themes?.slice(0, 2).map(t => (
                          <span key={t} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(248,250,252,0.03)', color: 'rgba(255,255,255,0.6)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0 mt-1" style={{ color: 'rgba(255,255,255,0.65)' }} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={24} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>No books found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Loader2, ChevronRight, Sparkles, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const MEAL_ICONS = { breakfast: 'Sunrise', lunch: 'Sun', snack: 'Coffee', dinner: 'Moon' };

function PlanCard({ plan, onSelect, active }) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(plan)} className="cursor-pointer rounded-2xl p-5 transition-all"
      data-testid={`plan-card-${plan.id}`}
      style={{
        background: active?.id === plan.id ? `linear-gradient(135deg, ${plan.color}20, ${plan.color}06)` : 'rgba(15,17,28,0.6)',
        border: `1px solid ${active?.id === plan.id ? plan.color + '50' : 'rgba(248,250,252,0.06)'}`,
        backdropFilter: 'blur(12px)',
      }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${plan.color}18` }}>
          <UtensilsCrossed size={18} style={{ color: plan.color }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{plan.name}</p>
          <p className="text-[10px]" style={{ color: 'rgba(248,250,252,0.4)' }}>{plan.meal_count} meals planned</p>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>{plan.focus}</p>
    </motion.div>
  );
}

function PlanDetail({ plan, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-6 mb-6" data-testid="plan-detail"
      style={{ background: 'rgba(15,17,28,0.85)', border: `1px solid ${plan.color}30`, backdropFilter: 'blur(24px)' }}>
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{plan.name}</h3>
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.4)' }}>{plan.focus}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5"><X size={16} style={{ color: 'rgba(248,250,252,0.4)' }} /></button>
      </div>
      <div className="space-y-4">
        {plan.meals.map((m, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: `${plan.color}06`, border: `1px solid ${plan.color}12` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: plan.color }}>{m.meal}</p>
              <p className="text-xs italic" style={{ color: 'rgba(248,250,252,0.3)' }}>{m.intention}</p>
            </div>
            <p className="text-sm font-semibold mb-2" style={{ color: '#F8FAFC' }}>{m.name}</p>
            {m.items.map((item, j) => (
              <div key={j} className="flex items-start gap-2 mb-1">
                <ChevronRight size={10} style={{ color: plan.color, marginTop: 3 }} />
                <p className="text-xs" style={{ color: 'rgba(248,250,252,0.65)' }}>{item}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MealLogger({ onSaved }) {
  const { authHeaders } = useAuth();
  const [items, setItems] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [notes, setNotes] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [mindful, setMindful] = useState(false);
  const [saving, setSaving] = useState(false);

  const log = async () => {
    if (!items.trim()) { toast.error('Add at least one food item'); return; }
    setSaving(true);
    try {
      await axios.post(`${API}/meals/log`, {
        meal_type: mealType,
        items: items.split(',').map(i => i.trim()).filter(Boolean),
        notes: notes.trim(),
        gratitude: gratitude.trim(),
        mindful_eating: mindful,
      }, { headers: authHeaders });
      toast.success('Meal logged');
      setItems(''); setNotes(''); setGratitude(''); setMindful(false);
      onSaved();
    } catch { toast.error('Failed to log meal'); }
    setSaving(false);
  };

  const inputStyle = { background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.08)', color: '#F8FAFC', outline: 'none' };

  return (
    <div className="rounded-2xl p-6 mb-6" data-testid="meal-logger"
      style={{ background: 'rgba(15,17,28,0.6)', border: '1px solid rgba(34,197,94,0.1)', backdropFilter: 'blur(12px)' }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#22C55E' }}>
        <Plus size={12} className="inline mr-1" /> Log a Meal
      </p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {['breakfast', 'lunch', 'snack', 'dinner'].map(t => (
          <button key={t} onClick={() => setMealType(t)} data-testid={`meal-type-${t}`}
            className="py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all"
            style={{
              background: mealType === t ? 'rgba(34,197,94,0.15)' : 'rgba(15,17,28,0.4)',
              border: `1px solid ${mealType === t ? 'rgba(34,197,94,0.3)' : 'rgba(248,250,252,0.06)'}`,
              color: mealType === t ? '#22C55E' : 'rgba(248,250,252,0.4)',
            }}>{t}</button>
        ))}
      </div>
      <input type="text" value={items} onChange={e => setItems(e.target.value)}
        placeholder="What did you eat? (comma-separated)" data-testid="meal-items-input"
        className="w-full px-3 py-2 rounded-xl text-xs mb-3" style={inputStyle} />
      <input type="text" value={gratitude} onChange={e => setGratitude(e.target.value)}
        placeholder="Food gratitude..." data-testid="meal-gratitude-input"
        className="w-full px-3 py-2 rounded-xl text-xs mb-3" style={inputStyle} />
      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="How did this meal make you feel?" rows={2} data-testid="meal-notes-input"
        className="w-full px-3 py-2 rounded-xl text-xs mb-3 resize-none" style={inputStyle} />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={mindful} onChange={e => setMindful(e.target.checked)}
            className="rounded" data-testid="mindful-checkbox" />
          <span className="text-xs" style={{ color: 'rgba(248,250,252,0.5)' }}>Mindful eating</span>
        </label>
        <button onClick={log} disabled={saving} data-testid="log-meal-btn"
          className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : 'Log Meal'}
        </button>
      </div>
    </div>
  );
}

function MealLogList({ logs, onDelete }) {
  const { authHeaders } = useAuth();
  const del = async (id) => {
    try {
      await axios.delete(`${API}/meals/log/${id}`, { headers: authHeaders });
      toast.success('Deleted');
      onDelete();
    } catch { toast.error('Failed'); }
  };

  if (!logs.length) return null;
  return (
    <div data-testid="meal-log-list">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(248,250,252,0.4)' }}>Recent Meals</p>
      <div className="space-y-3">
        {logs.map(l => (
          <div key={l.id} className="rounded-xl p-4 flex justify-between items-start"
            style={{ background: 'rgba(15,17,28,0.5)', border: '1px solid rgba(248,250,252,0.06)' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>{l.meal_type}</span>
                {l.mindful_eating && <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(192,132,252,0.12)', color: '#C084FC' }}>Mindful</span>}
                <span className="text-[10px]" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  {new Date(l.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(248,250,252,0.65)' }}>{(l.items || []).join(', ')}</p>
              {l.gratitude && <p className="text-[10px] italic mt-1" style={{ color: 'rgba(248,250,252,0.35)' }}>{l.gratitude}</p>}
            </div>
            <button onClick={() => del(l.id)} className="p-1 rounded-lg hover:bg-white/5">
              <Trash2 size={12} style={{ color: 'rgba(248,250,252,0.25)' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MealPlanning() {
  const { token, authHeaders } = useAuth();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('plans');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    if (!token) return;
    axios.get(`${API}/meals/log`, { headers: authHeaders }).then(r => setLogs(r.data.logs)).catch(() => {});
  };

  useEffect(() => {
    axios.get(`${API}/meals/plans`).then(r => setPlans(r.data.plans))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
    fetchLogs();
  }, [token]);

  const selectPlan = async (plan) => {
    setActivePlan(plan);
    try {
      const r = await axios.get(`${API}/meals/plan/${plan.id}`);
      setPlanDetail(r.data);
    } catch { toast.error('Failed to load plan'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <Loader2 className="animate-spin" size={28} style={{ color: '#22C55E' }} />
    </div>
  );

  const TABS = [
    { id: 'plans', label: 'Meal Plans' },
    { id: 'log', label: 'Food Journal' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto" data-testid="meal-planning-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#22C55E' }}>
            <UtensilsCrossed size={12} className="inline mr-1" /> Conscious Nourishment
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
            Meal Planning & Food Journal
          </h1>
          <p className="text-sm" style={{ color: 'rgba(248,250,252,0.45)' }}>
            Eat with intention, nourish body and spirit
          </p>
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: tab === t.id ? 'rgba(34,197,94,0.15)' : 'rgba(15,17,28,0.4)',
                border: `1px solid ${tab === t.id ? 'rgba(34,197,94,0.3)' : 'rgba(248,250,252,0.06)'}`,
                color: tab === t.id ? '#22C55E' : 'rgba(248,250,252,0.5)',
              }}>{t.label}</button>
          ))}
        </div>

        {tab === 'plans' && (
          <>
            <AnimatePresence mode="wait">
              {planDetail && <PlanDetail plan={planDetail} onClose={() => { setPlanDetail(null); setActivePlan(null); }} />}
            </AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map(p => <PlanCard key={p.id} plan={p} onSelect={selectPlan} active={activePlan} />)}
            </div>
          </>
        )}

        {tab === 'log' && (
          <>
            {token ? (
              <>
                <MealLogger onSaved={fetchLogs} />
                <MealLogList logs={logs} onDelete={fetchLogs} />
              </>
            ) : (
              <p className="text-center text-sm py-12" style={{ color: 'rgba(248,250,252,0.4)' }}>
                Sign in to log your meals
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Loader2, ChevronRight, ChevronDown, Sparkles, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import DeepDive from '../components/DeepDive';
import NarrationPlayer from '../components/NarrationPlayer';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ts = { textShadow: '0 1px 8px rgba(0,0,0,0.8), 0 0 3px rgba(0,0,0,0.6)' };
const tsSub = { textShadow: '0 1px 6px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)' };

function PlanCard({ plan, onSelect, active }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(plan)} className="cursor-pointer w-full text-left py-4 transition-all"
      data-testid={`plan-card-${plan.id}`}
      style={{ borderBottom: `1px solid ${active?.id === plan.id ? plan.color + '40' : 'rgba(255,255,255,0.06)'}` }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}30` }}>
          <UtensilsCrossed size={18} style={{ color: plan.color }} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: '#fff', ...ts }}>{plan.name}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)', ...tsSub }}>{plan.meal_count} meals · {plan.focus}</p>
        </div>
        <ChevronRight size={16} style={{ color: active?.id === plan.id ? plan.color : 'rgba(255,255,255,0.65)' }} />
      </div>
    </motion.button>
  );
}

function MealItem({ meal, color, planName }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="py-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left flex items-start justify-between" data-testid={`meal-${meal.meal}`}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <p className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color, ...ts }}>{meal.meal}</p>
            <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.5)', ...tsSub }}>{meal.intention}</p>
          </div>
          <p className="text-base font-semibold" style={{ color: '#fff', ...ts }}>{meal.name}</p>
        </div>
        <ChevronDown size={14} style={{ color: expanded ? color : 'rgba(255,255,255,0.65)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: 4 }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-3 pl-2">
              {meal.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: color, opacity: 0.6 }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)', ...tsSub }}>{item}</p>
                </div>
              ))}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <NarrationPlayer text={`${meal.name}. ${meal.intention}. Items: ${meal.items.join(', ')}`} label="Listen" color={color} context="nourishment" />
                <DeepDive topic={`${meal.name} - ${meal.meal} meal`} category="nourishment" context={planName} color={color} label={`Explore ${meal.name}`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanDetail({ plan, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mb-6" data-testid="plan-detail">
      <div className="pt-2 pb-4" style={{ borderBottom: `1px solid ${plan.color}25` }}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#fff', ...ts }}>{plan.name}</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', ...tsSub }}>{plan.focus}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" data-testid="plan-close"><X size={16} style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
        </div>
        {plan.meals.map((m, i) => (
          <MealItem key={i} meal={m} color={plan.color} planName={plan.name} />
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

  const inputStyle = { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', outline: 'none', ...tsSub };

  return (
    <div className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }} data-testid="meal-logger">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#22C55E', ...ts }}>
        <Plus size={12} className="inline mr-1" /> Log a Meal
      </p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {['breakfast', 'lunch', 'snack', 'dinner'].map(t => (
          <button key={t} onClick={() => setMealType(t)} data-testid={`meal-type-${t}`}
            className="py-1.5 rounded-lg text-[10px] uppercase tracking-wider"
            style={{
              background: mealType === t ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.15)',
              border: `1px solid ${mealType === t ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: mealType === t ? '#22C55E' : 'rgba(255,255,255,0.6)',
              ...tsSub,
            }}>{t}</button>
        ))}
      </div>
      <input type="text" value={items} onChange={e => setItems(e.target.value)}
        placeholder="What did you eat? (comma-separated)" data-testid="meal-items-input"
        className="w-full px-3 py-2.5 rounded-xl text-sm mb-3" style={inputStyle} />
      <input type="text" value={gratitude} onChange={e => setGratitude(e.target.value)}
        placeholder="Food gratitude..." data-testid="meal-gratitude-input"
        className="w-full px-3 py-2.5 rounded-xl text-sm mb-3" style={inputStyle} />
      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="How did this meal make you feel?" rows={2} data-testid="meal-notes-input"
        className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 resize-none" style={inputStyle} />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={mindful} onChange={e => setMindful(e.target.checked)} className="rounded" data-testid="mindful-checkbox" />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)', ...tsSub }}>Mindful eating</span>
        </label>
        <button onClick={log} disabled={saving} data-testid="log-meal-btn"
          className="px-5 py-2.5 rounded-xl text-xs font-bold"
          style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22C55E', ...ts }}>
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
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(255,255,255,0.5)', ...ts }}>Recent Meals</p>
      {logs.map(l => (
        <div key={l.id} className="py-3 flex justify-between items-start"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>{l.meal_type}</span>
              {l.mindful_eating && <span className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(192,132,252,0.15)', color: '#C084FC' }}>Mindful</span>}
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.65)', ...tsSub }}>
                {new Date(l.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)', ...tsSub }}>{(l.items || []).join(', ')}</p>
            {l.gratitude && <p className="text-[10px] italic mt-1" style={{ color: 'rgba(255,255,255,0.5)', ...tsSub }}>{l.gratitude}</p>}
          </div>
          <button onClick={() => del(l.id)} className="p-1 rounded-lg"><Trash2 size={12} style={{ color: 'rgba(255,255,255,0.65)' }} /></button>
        </div>
      ))}
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

  useEffect(() => { if (typeof window.__workAccrue === 'function') window.__workAccrue('meal_planning', 8); }, []);
  useEffect(() => {
    axios.get(`${API}/meals/plans`).then(r => setPlans(r.data.plans))
      .catch(() => toast.error('Failed to load plans'))
      .finally(() => setLoading(false));
    fetchLogs();
  }, [token]);

  const selectPlan = async (plan) => {
    if (activePlan?.id === plan.id) { setActivePlan(null); setPlanDetail(null); return; }
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

  return (
    <div className="min-h-screen pt-24 pb-20 px-5 max-w-3xl mx-auto" data-testid="meal-planning-page">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#22C55E', ...ts }}>
          <UtensilsCrossed size={12} className="inline mr-1" /> Conscious Nourishment
        </p>
        <h1 className="text-3xl font-light mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#fff', ...ts }}>
          Meal Planning
        </h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.6)', ...tsSub }}>
          Eat with intention, nourish body and spirit
        </p>

        <div className="flex gap-3 mb-8">
          {[{ id: 'plans', label: 'Meal Plans' }, { id: 'log', label: 'Food Journal' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`}
              className="px-5 py-2.5 rounded-full text-xs font-medium"
              style={{
                background: tab === t.id ? 'rgba(34,197,94,0.2)' : 'transparent',
                border: `1px solid ${tab === t.id ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: tab === t.id ? '#22C55E' : 'rgba(255,255,255,0.5)',
                ...tsSub,
              }}>{t.label}</button>
          ))}
        </div>

        {tab === 'plans' && (
          <>
            <AnimatePresence mode="wait">
              {planDetail && <PlanDetail plan={planDetail} onClose={() => { setPlanDetail(null); setActivePlan(null); }} />}
            </AnimatePresence>
            {plans.map(p => <PlanCard key={p.id} plan={p} onSelect={selectPlan} active={activePlan} />)}
          </>
        )}

        {tab === 'log' && (
          token ? (
            <>
              <MealLogger onSaved={fetchLogs} />
              <MealLogList logs={logs} onDelete={fetchLogs} />
            </>
          ) : (
            <p className="text-center text-sm py-12" style={{ color: 'rgba(255,255,255,0.5)', ...tsSub }}>Sign in to log your meals</p>
          )
        )}
      </motion.div>
    </div>
  );
}

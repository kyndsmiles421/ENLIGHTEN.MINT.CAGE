/**
 * EffectsPanel.js — CSS filter effects controls
 * Extracted from UnifiedCreatorConsole.js
 */
import React from 'react';
import { DEFAULT_FILTERS } from '../ConsoleConstants';

export default function EffectsPanel({ monitorFilters, setMonitorFilters }) {
  const fxActive = (key) => {
    if (key === 'blur') return monitorFilters.blur > 0;
    if (key === 'brightness') return monitorFilters.brightness !== 100;
    if (key === 'contrast') return monitorFilters.contrast !== 100;
    if (key === 'hueRotate') return monitorFilters.hueRotate > 0;
    if (key === 'saturate') return monitorFilters.saturate !== 100;
    if (key === 'sepia') return monitorFilters.sepia > 0;
    if (key === 'invert') return monitorFilters.invert > 0;
    return false;
  };

  return (
    <div className="p-3 space-y-2">
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Blur', color: '#8B5CF6', key: 'blur', toggle: () => setMonitorFilters(f => ({ ...f, blur: f.blur === 0 ? 4 : 0 })) },
          { label: 'Bright', color: '#3B82F6', key: 'brightness', toggle: () => setMonitorFilters(f => ({ ...f, brightness: f.brightness === 100 ? 150 : 100 })) },
          { label: 'Contrast', color: '#2DD4BF', key: 'contrast', toggle: () => setMonitorFilters(f => ({ ...f, contrast: f.contrast === 100 ? 150 : 100 })) },
          { label: 'Hue', color: '#E879F9', key: 'hueRotate', toggle: () => setMonitorFilters(f => ({ ...f, hueRotate: (f.hueRotate + 60) % 360 })) },
          { label: 'Saturate', color: '#FB923C', key: 'saturate', toggle: () => setMonitorFilters(f => ({ ...f, saturate: f.saturate === 100 ? 200 : 100 })) },
          { label: 'Sepia', color: '#22C55E', key: 'sepia', toggle: () => setMonitorFilters(f => ({ ...f, sepia: f.sepia === 0 ? 80 : 0 })) },
          { label: 'Invert', color: '#EAB308', key: 'invert', toggle: () => setMonitorFilters(f => ({ ...f, invert: f.invert === 0 ? 100 : 0 })) },
          { label: 'RESET', color: '#EF4444', key: 'reset', toggle: () => setMonitorFilters({ ...DEFAULT_FILTERS }) },
        ].map(fx => (
          <button key={fx.label} onClick={fx.toggle} className="p-2 rounded-xl text-center active:scale-95 transition-all"
            style={{ background: fxActive(fx.key) ? `${fx.color}18` : `${fx.color}06`, border: `1px solid ${fxActive(fx.key) ? `${fx.color}40` : `${fx.color}12`}` }}
            data-testid={`fx-${fx.key}`}>
            <div className="text-[9px] font-bold" style={{ color: fxActive(fx.key) ? fx.color : fx.color + '88' }}>{fx.label}</div>
          </button>
        ))}
      </div>
      <div className="space-y-1.5 mt-2">
        {[
          { label: 'Blur', key: 'blur', min: 0, max: 20, color: '#8B5CF6', unit: 'px' },
          { label: 'Brightness', key: 'brightness', min: 20, max: 200, color: '#3B82F6', unit: '%' },
          { label: 'Hue', key: 'hueRotate', min: 0, max: 360, color: '#E879F9', unit: 'deg' },
        ].map(s => (
          <div key={s.key}>
            <div className="flex items-center justify-between"><span className="text-[7px] text-white/25 uppercase">{s.label}</span><span className="text-[7px] font-mono text-white/15">{monitorFilters[s.key]}{s.unit}</span></div>
            <input type="range" min={s.min} max={s.max} value={monitorFilters[s.key]} onChange={(e) => setMonitorFilters(f => ({ ...f, [s.key]: Number(e.target.value) }))}
              className="w-full h-1 rounded-full cursor-pointer" style={{ accentColor: s.color }} data-testid={`fx-${s.key}-slider`} />
          </div>
        ))}
      </div>
    </div>
  );
}

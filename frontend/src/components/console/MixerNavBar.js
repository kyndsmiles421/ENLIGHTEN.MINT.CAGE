/**
 * MixerNavBar.js — Bottom navigation tab bar
 * Extracted from UnifiedCreatorConsole.js
 * 10-tab navigation strip at the bottom of the Same-Plane flex organism.
 */
import React from 'react';
import { Maximize2 } from 'lucide-react';
import { TOOL_TABS } from './constants';

export default function MixerNavBar({ activePanel, togglePanel, isRecording, setIsFullscreen }) {
  return (
    <div data-testid="mixer-nav"
      style={{ height: 52, minHeight: 52, background: '#060610', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' }}>
      {TOOL_TABS.map(tab => (
        <button key={tab.key} onClick={() => togglePanel(tab.key)}
          className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-all"
          style={{ color: activePanel === tab.key ? tab.color : 'rgba(255,255,255,0.25)', height: '100%', minWidth: 0 }}
          data-testid={`tab-${tab.key}`}>
          <tab.icon size={16} />
          <span className="text-[7px] font-bold mt-0.5 uppercase">{tab.label}</span>
          {activePanel === tab.key && <div style={{ width: 4, height: 4, borderRadius: '50%', background: tab.color, marginTop: 2 }} />}
        </button>
      ))}
      {isRecording && (
        <div className="flex items-center px-2">
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} className="animate-pulse" />
        </div>
      )}
      <button onClick={() => setIsFullscreen(true)}
        className="flex flex-col items-center justify-center px-2 active:scale-95"
        style={{ color: 'rgba(255,255,255,0.12)', height: '100%' }} data-testid="go-fullscreen">
        <Maximize2 size={12} />
      </button>
    </div>
  );
}

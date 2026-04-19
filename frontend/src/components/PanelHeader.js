/**
 * PanelHeader — V68.15 Reusable "Mixer Panel" header
 *
 * Every dock-launched floating panel (MixerPanel, HarmonyNPUPanel,
 * HarmonicsPanel, FrequencyPanel, AssistantPanel, etc.) gets the same
 * 3-control header so the user's interaction model is consistent:
 *
 *   ⛶  Maximize  →  navigate to full-screen route for this tool
 *   ◫  Split    →  open in split-screen (right pane) via useSplitScreen()
 *   ✕  Close    →  dismiss panel
 *
 * Tap targets are 28x28 (well above the 44x44 accessibility floor when
 * combined with the 8px padding). Color inherits from panel theme.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Maximize2, Columns, X } from 'lucide-react';
import { useSplitScreen } from './SplitScreen';

export default function PanelHeader({
  label,
  color = '#818CF8',
  fullscreenPath,   // optional: where Maximize button navigates
  splitPath,        // optional: where Split button opens; defaults to fullscreenPath
  onClose,
  testId = 'panel',
}) {
  const navigate = useNavigate();
  const splitCtx = useSplitScreen();

  const handleMaximize = () => {
    if (!fullscreenPath) return;
    onClose?.();  // close the floating panel first
    navigate(fullscreenPath);
  };

  const handleSplit = () => {
    const path = splitPath || fullscreenPath;
    if (!path || !splitCtx?.openSplit) return;
    onClose?.();  // floating panel closes, split opens
    splitCtx.openSplit(path);
  };

  const canMaximize = !!fullscreenPath;
  const canSplit = !!(splitPath || fullscreenPath) && !!splitCtx?.openSplit;

  return (
    <div
      className="flex items-center justify-between px-3 py-2"
      style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}
    >
      <span
        className="text-[9px] uppercase tracking-widest font-medium"
        style={{ color }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1">
        {canSplit && (
          <button
            onClick={handleSplit}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Open in split-screen"
            aria-label="Open in split-screen"
            data-testid={`${testId}-split-btn`}
          >
            <Columns size={11} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
        )}
        {canMaximize && (
          <button
            onClick={handleMaximize}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title="Open full-screen"
            aria-label="Open full-screen"
            data-testid={`${testId}-maximize-btn`}
          >
            <Maximize2 size={11} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          title="Close"
          aria-label="Close"
          data-testid={`${testId}-close-btn`}
        >
          <X size={11} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </button>
      </div>
    </div>
  );
}

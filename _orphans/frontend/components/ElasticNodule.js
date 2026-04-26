/**
 * ElasticNodule.js — Spring Physics Interactive Nodule
 * 
 * Uses Hooke's Law rubber band physics for:
 * - Pull-to-extract interaction
 * - Snap-back when released too early
 * - Elastic overshoot animation
 * 
 * The nodule can be dragged. If pulled past the extraction threshold,
 * it extracts and stays. If released early, it snaps back to anchor.
 */

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { useRubberBand2D } from '../hooks/useRubberBandPhysics';

const ElasticNodule = memo(function ElasticNodule({
  id,
  label,
  icon: Icon,
  color = '#00FFC2',
  anchorX = 0,
  anchorY = 0,
  extractionThreshold = 100, // Distance required to extract
  onExtract,
  onNavigate,
  tension = 0.12,
  damping = 0.82,
}) {
  const nodeRef = useRef(null);
  const [isExtracted, setIsExtracted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState({ x: anchorX, y: anchorY });
  const [stretchPercent, setStretchPercent] = useState(0);

  // Rubber band physics
  const rubberBand = useRubberBand2D({
    tension,
    damping,
    anchor: { x: anchorX, y: anchorY },
    onSnap: () => {
      // Haptic feedback on snap
      if (navigator.vibrate) {
        navigator.vibrate([15, 10, 15]);
      }
    },
  });

  // Subscribe to physics updates
  useEffect(() => {
    const unsubscribe = rubberBand.subscribe((state) => {
      setCurrentPos({ x: state.x, y: state.y });
      
      // Calculate stretch percentage
      const dx = state.x - anchorX;
      const dy = state.y - anchorY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      setStretchPercent(Math.min(distance / extractionThreshold, 1));
    });

    return unsubscribe;
  }, [rubberBand, anchorX, anchorY, extractionThreshold]);

  // Drag handlers
  const handlePointerDown = useCallback((e) => {
    if (isExtracted) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Capture pointer for drag outside element
    e.target.setPointerCapture(e.pointerId);
    
    // Initial haptic
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [isExtracted]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isExtracted) return;
    
    const rect = nodeRef.current?.parentElement?.getBoundingClientRect();
    if (!rect) return;

    // Calculate position relative to parent center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    rubberBand.pull(x, y);
    
    // Haptic feedback as stretch increases
    const dx = x - anchorX;
    const dy = y - anchorY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > extractionThreshold * 0.8 && navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, [isDragging, isExtracted, rubberBand, anchorX, anchorY, extractionThreshold]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;
    
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    
    // Check if extraction threshold reached
    const dx = currentPos.x - anchorX;
    const dy = currentPos.y - anchorY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance >= extractionThreshold) {
      // EXTRACTION SUCCESS
      setIsExtracted(true);
      
      // Strong haptic for extraction
      if (navigator.vibrate) {
        navigator.vibrate([30, 20, 50, 20, 100]);
      }
      
      if (onExtract) {
        onExtract(id);
      }
    } else {
      // Release - physics will snap back
      rubberBand.release();
    }
  }, [isDragging, currentPos, anchorX, anchorY, extractionThreshold, id, onExtract, rubberBand]);

  // Handle click on extracted nodule (navigation)
  const handleClick = useCallback(() => {
    if (isExtracted && onNavigate) {
      if (navigator.vibrate) {
        navigator.vibrate([20, 10, 40]);
      }
      onNavigate(id);
    }
  }, [isExtracted, id, onNavigate]);

  // Calculate visual properties based on state
  const scale = isExtracted ? 1.2 : (1 + stretchPercent * 0.3);
  const glow = isExtracted ? 25 : (5 + stretchPercent * 20);
  const opacity = isExtracted ? 1 : (0.6 + stretchPercent * 0.4);

  return (
    <div
      ref={nodeRef}
      className="elastic-nodule"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${currentPos.x}px), calc(-50% + ${currentPos.y}px)) scale(${scale})`,
        cursor: isDragging ? 'grabbing' : (isExtracted ? 'pointer' : 'grab'),
        touchAction: 'none',
        userSelect: 'none',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        zIndex: isDragging ? 100 : (isExtracted ? 50 : 10),
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      data-nodule-id={id}
      data-extracted={isExtracted}
    >
      <style>{`
        .elastic-nodule {
          pointer-events: auto;
        }
        .nodule-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 15px 20px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            ${color}22, 
            ${color}08
          );
          border: 2px solid ${color}44;
          min-width: 60px;
          min-height: 60px;
          transition: all 0.2s ease;
        }
        .nodule-body.dragging {
          border-color: ${color}88;
          background: radial-gradient(circle at 30% 30%, 
            ${color}44, 
            ${color}15
          );
        }
        .nodule-body.extracted {
          border-color: ${color};
          background: radial-gradient(circle at 30% 30%, 
            ${color}66, 
            ${color}22
          );
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 ${glow}px ${color}44; }
          50% { box-shadow: 0 0 ${glow * 1.5}px ${color}66; }
        }
        .nodule-label {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: ${color};
          margin-top: 5px;
          white-space: nowrap;
          opacity: ${opacity};
        }
        .nodule-hint {
          font-size: 0.5rem;
          color: ${color}88;
          margin-top: 3px;
          letter-spacing: 0.05em;
        }
        .stretch-indicator {
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: ${color}22;
          border-radius: 2px;
          overflow: hidden;
        }
        .stretch-fill {
          height: 100%;
          background: ${color};
          transition: width 0.1s ease-out;
        }
      `}</style>

      <div className={`nodule-body ${isDragging ? 'dragging' : ''} ${isExtracted ? 'extracted' : ''}`}
        style={{
          boxShadow: `0 0 ${glow}px ${color}44`,
          opacity,
        }}
      >
        {Icon && <Icon size={isExtracted ? 24 : 18} color={color} />}
        <span className="nodule-label">{label}</span>
        {isExtracted && (
          <span className="nodule-hint">TAP TO ENTER</span>
        )}
      </div>

      {/* Stretch indicator (only when dragging) */}
      {isDragging && !isExtracted && (
        <div className="stretch-indicator">
          <div 
            className="stretch-fill" 
            style={{ width: `${stretchPercent * 100}%` }}
          />
        </div>
      )}
    </div>
  );
});

/**
 * ElasticNoduleWeb — Container for multiple elastic nodules
 * Arranges them in a circle and manages extraction state
 */
export function ElasticNoduleWeb({
  nodules = [],
  radius = 150,
  extractionThreshold = 80,
  onNoduleExtract,
  onNoduleNavigate,
}) {
  const [extractedCount, setExtractedCount] = useState(0);

  const handleExtract = useCallback((id) => {
    setExtractedCount(prev => prev + 1);
    if (onNoduleExtract) onNoduleExtract(id);
  }, [onNoduleExtract]);

  return (
    <div 
      className="elastic-nodule-web"
      style={{
        position: 'relative',
        width: radius * 2 + 100,
        height: radius * 2 + 100,
      }}
    >
      {/* Center indicator */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '2px dashed rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          color: 'rgba(255,255,255,0.65)',
          pointerEvents: 'none',
        }}
      >
        {extractedCount}
      </div>

      {/* Nodules */}
      {nodules.map((nodule, index) => {
        const angle = (index / nodules.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <ElasticNodule
            key={nodule.id}
            id={nodule.id}
            label={nodule.label}
            icon={nodule.icon}
            color={nodule.color || '#00FFC2'}
            anchorX={x}
            anchorY={y}
            extractionThreshold={extractionThreshold}
            onExtract={handleExtract}
            onNavigate={onNoduleNavigate}
          />
        );
      })}
    </div>
  );
}

export default ElasticNodule;

// /app/frontend/src/components/ModuleWrapper.js
/**
 * ENLIGHTEN.MINT.CAFE - Sovereign UI Template
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Wraps all modules to ensure consistent styling,
 * STOP button spacing, and Creator Mode integration.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Activity, Zap } from 'lucide-react';

const ModuleWrapper = ({ 
  children, 
  moduleTitle = "Module",
  moduleName = "Unknown",
  showWisdomHeader = true,
  showCreatorLink = true,
  className = "",
}) => {
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [auditLog, setAuditLog] = useState([]);

  const toggleCreatorMode = useCallback(() => {
    setCreatorOpen(prev => !prev);
    
    // Log the toggle action
    const entry = {
      timestamp: new Date().toISOString(),
      action: creatorOpen ? 'close' : 'open',
      module: moduleName,
    };
    setAuditLog(prev => [entry, ...prev].slice(0, 50));
    
    // Emit event for global Creator Mode listeners
    window.dispatchEvent(new CustomEvent('CREATOR_MODE_TOGGLE', {
      detail: { module: moduleName, open: !creatorOpen }
    }));
  }, [creatorOpen, moduleName]);

  // Log module actions
  const logAction = useCallback((action, data = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      module: moduleName,
      data,
    };
    setAuditLog(prev => [entry, ...prev].slice(0, 50));
    console.log(`[CreatorMode] ${moduleName}: ${action}`, data);
  }, [moduleName]);

  return (
    <div className={`main-wrapper module-wrapper ${className}`}>
      {/* Wisdom Header - Ancient Wisdom branding */}
      {showWisdomHeader && (
        <header className="module-header" style={{
          padding: '12px 0',
          marginBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <span className="wisdom-text" style={{
            color: 'rgba(134, 239, 172, 0.8)', // Relaxed Green
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            ANCIENT WISDOM: {moduleTitle}
          </span>
        </header>
      )}
      
      {/* Module Content */}
      <div className="module-content" style={{
        flex: 1,
        minHeight: 0,
      }}>
        {/* Pass logAction to children if they need it */}
        {typeof children === 'function' 
          ? children({ logAction, auditLog }) 
          : children
        }
      </div>
      
      {/* Creator Mode Link Button */}
      {showCreatorLink && (
        <button 
          className="creator-mode-link"
          onClick={toggleCreatorMode}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: creatorOpen 
              ? 'rgba(134, 239, 172, 0.2)' 
              : 'rgba(30, 30, 30, 0.85)',
            border: creatorOpen 
              ? '1px solid rgba(134, 239, 172, 0.5)' 
              : '1px solid rgba(80, 80, 80, 0.4)',
            color: creatorOpen ? '#86efac' : '#888',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
          }}
          data-testid="creator-mode-toggle"
        >
          <Terminal size={14} />
          <span>Ω Creator Mode</span>
        </button>
      )}

      {/* Creator Mode Overlay */}
      <AnimatePresence>
        {creatorOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: 70,
              right: 20,
              width: '400px',
              maxHeight: '60vh',
              zIndex: 9001,
              background: 'rgba(10, 10, 15, 0.95)',
              border: '1px solid rgba(134, 239, 172, 0.3)',
              borderRadius: '12px',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(134, 239, 172, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={14} color="#86efac" />
                <span style={{ 
                  color: '#86efac', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                }}>
                  CREATOR CONSOLE
                </span>
              </div>
              <button
                onClick={toggleCreatorMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Module Info */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px',
              }}>
                <Zap size={12} color="#fbbf24" />
                <span style={{ color: '#fbbf24', fontSize: '11px' }}>
                  Active Module: {moduleName}
                </span>
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#666',
                fontFamily: 'monospace',
              }}>
                Actions logged: {auditLog.length}
              </div>
            </div>

            {/* Audit Log */}
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '8px',
            }}>
              {auditLog.length === 0 ? (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#444',
                  fontSize: '11px',
                }}>
                  No actions logged yet
                </div>
              ) : (
                auditLog.map((entry, i) => (
                  <div 
                    key={i}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '4px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <div style={{ color: '#86efac', marginBottom: '2px' }}>
                      [{entry.module}] {entry.action}
                    </div>
                    <div style={{ color: '#555' }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                    {entry.data && Object.keys(entry.data).length > 0 && (
                      <div style={{ color: '#666', marginTop: '4px' }}>
                        {JSON.stringify(entry.data).slice(0, 100)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleWrapper;

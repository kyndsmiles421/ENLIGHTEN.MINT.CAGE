/**
 * Creator Console Page — Wrapper for the Unified Creator Console
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedCreatorConsole from '../components/UnifiedCreatorConsole';

export default function ApexCreatorPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window.__workAccrue === 'function') window.__workAccrue('creator_console', 15);
  }, []);

  return <UnifiedCreatorConsole onClose={() => navigate('/sovereign-hub')} />;
}

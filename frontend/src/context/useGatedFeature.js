import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function useGatedFeature() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const checkAccess = useCallback(async (featureId, onAllow) => {
    if (!authHeaders?.Authorization) {
      toast('Sign in required', { description: 'Please sign in to use this feature.' });
      return false;
    }
    setChecking(true);
    try {
      const res = await axios.get(`${API}/subscriptions/check-access/${featureId}`, { headers: authHeaders });
      if (res.data.allowed) {
        if (onAllow) await onAllow();
        setChecking(false);
        return true;
      }
      toast(`${res.data.required_tier_name} Feature`, {
        description: `This requires ${res.data.required_tier_name} tier or higher.`,
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') },
        duration: 5000,
      });
      setChecking(false);
      return false;
    } catch {
      setChecking(false);
      return true;
    }
  }, [authHeaders, navigate]);

  return { checkAccess, checking };
}

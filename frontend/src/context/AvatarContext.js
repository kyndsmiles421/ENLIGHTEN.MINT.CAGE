import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const AvatarContext = createContext({ avatarB64: null, avatarStyle: null, refreshAvatar: () => {} });

export function AvatarProvider({ children }) {
  const { user, authHeaders } = useAuth();
  const [avatarB64, setAvatarB64] = useState(null);
  const [avatarStyle, setAvatarStyle] = useState(null);

  const refreshAvatar = useCallback(async () => {
    if (!user) { setAvatarB64(null); return; }
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/ai-visuals/my-avatar`,
        { headers: authHeaders }
      );
      if (res.data.status === 'active' && res.data.image_b64) {
        setAvatarB64(res.data.image_b64);
        setAvatarStyle(res.data.style || null);
      } else {
        setAvatarB64(null);
      }
    } catch {
      setAvatarB64(null);
    }
  }, [user, authHeaders]);

  useEffect(() => { refreshAvatar(); }, [refreshAvatar]);

  return (
    <AvatarContext.Provider value={{ avatarB64, avatarStyle, refreshAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() { return useContext(AvatarContext); }

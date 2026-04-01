import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useGeolocation — Clean geolocation service hook.
 * Handles permission requests, position watching, and error states.
 */
export function useGeolocation({ enableHighAccuracy = true, watch = false } = {}) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt'); // prompt | granted | denied
  const watchIdRef = useRef(null);

  // Check permission state
  useEffect(() => {
    if (!navigator.permissions) return;
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      setPermissionState(result.state);
      result.onchange = () => setPermissionState(result.state);
    }).catch(() => {});
  }, []);

  const handleSuccess = useCallback((pos) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    });
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err) => {
    const messages = {
      1: 'Location permission denied. Enable it in your browser settings.',
      2: 'Position unavailable. Check your GPS or network connection.',
      3: 'Location request timed out. Try again.',
    };
    setError(messages[err.code] || 'Unknown geolocation error');
    setLoading(false);
    if (err.code === 1) setPermissionState('denied');
  }, []);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout: 15000,
      maximumAge: 30000,
    });
  }, [enableHighAccuracy, handleSuccess, handleError]);

  // Watch mode
  useEffect(() => {
    if (!watch || !navigator.geolocation) return;

    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout: 15000,
      maximumAge: 10000,
    });

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watch, enableHighAccuracy, handleSuccess, handleError]);

  return { position, error, loading, permissionState, requestPosition };
}

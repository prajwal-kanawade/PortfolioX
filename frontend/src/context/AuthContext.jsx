import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, siteAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const register = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authAPI.register(data);
      if (response.data.success) {
        // Do not auto-login after registration. Let user login manually.
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  }, []);

  const login = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authAPI.login(data);
      if (response.data.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(response.data.user);
        return response.data;
      }
      // Unrecognized device: login is held pending email verification, not a failure -
      // return it so the caller can show a "check your email" state instead of an error.
      if (response.data.requiresVerification) {
        return response.data;
      }
      throw new Error(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  }, []);

  // Called after the user clicks the "Verify Login" link in their email and the backend
  // confirms the token - completes login exactly like a normal login response would.
  const completeVerifiedLogin = useCallback((authResponse) => {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    setUser(authResponse.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  }, []);

  // Real idle-timeout: after the admin-configured minutes of no mouse/keyboard activity,
  // log the user out client-side. JWTs are stateless so this can't be enforced server-side -
  // it's a UX/security convenience, not a hard guarantee.
  useEffect(() => {
    if (!user) return undefined;

    let timer;
    let timeoutMs = 60 * 60 * 1000;
    let cancelled = false;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { logout(); }, timeoutMs);
    };

    siteAPI.getPublicSettings()
      .then((res) => {
        if (cancelled) return;
        timeoutMs = (res.data.sessionTimeoutMinutes || 60) * 60 * 1000;
        resetTimer();
      })
      .catch(() => { if (!cancelled) resetTimer(); });

    const activityEvents = ['mousedown', 'keydown'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [user, logout]);

  const updateProfile = useCallback(async (data) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  }, []);

  // Re-fetches the current user from the backend, e.g. after a Pro upgrade/downgrade,
  // without requiring a full re-login.
  const refreshUser = useCallback(async () => {
    const response = await authAPI.getMe();
    setUser(response.data);
    return response.data;
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isPro: user?.subscriptionTier === 'pro',
    register,
    login,
    completeVerifiedLogin,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

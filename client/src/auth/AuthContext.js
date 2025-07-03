import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));

  useEffect(() => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    else localStorage.removeItem('accessToken');
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    else localStorage.removeItem('refreshToken');
  }, [accessToken, refreshToken]);

  const signup = async (email, password) => {
    const { data } = await axios.post(
      'http://127.0.0.1:5000/auth/signup',
      { email, password }
    );
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  };

  const login = async (email, password) => {
    const { data } = await axios.post(
      'http://127.0.0.1:5000/auth/login',
      { email, password }
    );
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };

  axios.defaults.headers.common.Authorization = accessToken
    ? `Bearer ${accessToken}`
    : '';

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

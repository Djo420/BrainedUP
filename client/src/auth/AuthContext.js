import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && refreshToken) {
          const { data } = await axios.post('http://127.0.0.1:5000/auth/refresh', null, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          setAccessToken(data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return axios(originalRequest);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  const signup = async (email, password) => {
    const { data } = await axios.post('http://127.0.0.1:5000/auth/signup', { email, password });
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  };

  const login = async (email, password) => {
    const { data } = await axios.post('http://127.0.0.1:5000/auth/login', { email, password });
    setAccessToken(data.access_token);
    setRefreshToken(data.refresh_token);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
  };

  axios.defaults.headers.common.Authorization = accessToken ? `Bearer ${accessToken}` : '';

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

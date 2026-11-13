import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    const roles = Array.isArray(payload.roles)
      ? payload.roles.map((r) => (typeof r === 'string' ? r : r.authority))
      : [];
    return {
      email: payload.sub || '',
      roles,
      isAdmin: roles.includes('ROLE_ADMIN'),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    return token ? decodeJwtPayload(token) : null;
  });
  const [cart, setCart] = useState({ id: null, items: [], totalPrice: 0 });
  const [loadingCart, setLoadingCart] = useState(false);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setCart({ id: null, items: [], totalPrice: 0 });
      return;
    }
    try {
      setLoadingCart(true);
      const res = await axiosClient.get('/cart');
      if (res?.data) {
        setCart(res.data);
      }
    } catch {
      // Ignore cart error if session expired
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart({ id: null, items: [], totalPrice: 0 });
    }
  }, [user, refreshCart]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setCart({ id: null, items: [], totalPrice: 0 });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/auth/login', { email, password });
    const token = res?.data?.token;
    if (!token) throw new Error('Không nhận được token xác thực');
    localStorage.setItem('access_token', token);
    const decoded = decodeJwtPayload(token);
    setUser(decoded);
    return decoded;
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await axiosClient.post('/auth/register', {
      fullName,
      email,
      password,
      confirmPassword,
    });
    const token = res?.data?.token;
    if (!token) throw new Error('Đăng ký thất bại');
    localStorage.setItem('access_token', token);
    const decoded = decodeJwtPayload(token);
    setUser(decoded);
    return decoded;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setCart({ id: null, items: [], totalPrice: 0 });
  };

  const cartItemCount = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: !!user?.isAdmin,
        cart,
        setCart,
        cartItemCount,
        loadingCart,
        refreshCart,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}


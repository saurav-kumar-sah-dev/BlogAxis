import { createContext, useContext, useMemo, useState } from 'react';
import { clearFollowStateCache } from '../hooks/useFollowState';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [accounts, setAccounts] = useState(() => {
    const raw = localStorage.getItem('accounts');
    return raw ? JSON.parse(raw) : [];
  });

  const login = (t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    
    // Add to accounts if not already present
    const newAccount = { token: t, user: u, addedAt: new Date().toISOString() };
    const existingAccounts = JSON.parse(localStorage.getItem('accounts') || '[]');
    const accountExists = existingAccounts.some(acc => acc.user.id === u.id);
    
    if (!accountExists) {
      const updatedAccounts = [...existingAccounts, newAccount];
      localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
      setAccounts(updatedAccounts);
    }
  };

  const switchAccount = (account) => {
    localStorage.setItem('token', account.token);
    localStorage.setItem('user', JSON.stringify(account.user));
    setToken(account.token);
    setUser(account.user);
  };

  const removeAccount = (accountId) => {
    const updatedAccounts = accounts.filter(acc => acc.user.id !== accountId);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    setAccounts(updatedAccounts);
    
    // If removing current account, logout
    if (user && user.id === accountId) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    clearFollowStateCache(); // Clear follow state cache on logout
  };

  const value = useMemo(() => ({ 
    token, 
    user, 
    accounts, 
    login, 
    logout, 
    switchAccount, 
    removeAccount 
  }), [token, user, accounts]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
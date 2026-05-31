import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = 'https://qfsbackend-1.onrender.com/api';
interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  balance: number;
  kycCompleted: boolean;
  hasPasscode?: boolean; 
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  currency?: string;
  details: string;
  timestamp: string;
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  transactions: Transaction[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  setPasscode: (passcode: string) => Promise<boolean>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  hasPasscode: () => boolean;
  addTransaction: (tx: Omit<Transaction, '_id' | 'timestamp'>) => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
  updateKYC: (completed: boolean) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/me`);
      setUser(res.data);
    } catch (err) {
      console.error('fetchUser failed:', err);
      logout();
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/notifications`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!token) return;
    try {
      await axios.put(`${API_URL}/user/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchTransactions();
      fetchNotifications();
    }
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      const userRes = await axios.get(`${API_URL}/user/me`);
      const loggedInUser: User = userRes.data;
      setUser(loggedInUser);
      fetchTransactions();
      fetchNotifications();
      return loggedInUser;
    } catch (err: any) {
      console.error('Login failed:', err?.response?.data || err?.message);
      return null;
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { email, password, fullName });
      const newToken = res.data.token;
      if (!newToken) return false;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      await fetchUser();
      return true;
    } catch (err: any) {
      console.error('Signup failed:', err?.response?.data || err?.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setNotifications([]);
    delete axios.defaults.headers.common['Authorization'];
    // Force redirect to login page
    window.location.href = '/login';
  };

  const setPasscode = async (passcode: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/passcode`, { passcode });
      if (user) setUser({ ...user, hasPasscode: true });
      return true;
    } catch (err) {
      console.error('setPasscode failed:', err);
      return false;
    }
  };

  const verifyPasscode = async (passcode: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-passcode`, { passcode });
      return res.data.verified === true;
    } catch (err) {
      console.error('verifyPasscode failed:', err);
      return false;
    }
  };

  const hasPasscode = (): boolean => {
    return user?.hasPasscode === true;
  };

  const addTransaction = async (tx: Omit<Transaction, '_id' | 'timestamp'>) => {
    try {
      await axios.post(`${API_URL}/user/transaction`, tx);
      await fetchTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const updateBalance = async (amount: number) => {
    try {
      await axios.post(`${API_URL}/user/balance`, { amount });
      if (user) setUser({ ...user, balance: amount });
    } catch (err) {
      console.error(err);
    }
  };

  const updateKYC = async (completed: boolean) => {
    try {
      await axios.post(`${API_URL}/user/kyc`, { completed });
      if (user) setUser({ ...user, kycCompleted: completed });
    } catch (err) {
      console.error(err);
    }
  };

  const value: AppContextType = {
    user,
    token,
    transactions,
    notifications,
    login,
    signup,
    logout,
    setPasscode,
    verifyPasscode,
    hasPasscode,
    addTransaction,
    updateBalance,
    updateKYC,
    fetchUser,
    fetchTransactions,
    fetchNotifications,
    markNotificationRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

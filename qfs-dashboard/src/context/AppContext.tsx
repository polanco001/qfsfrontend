import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://https://qfsbackend-1.onrender.com/api';
const PASSCODE_TIMEOUT = 5 * 60 * 1000;

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  balance: number;
  kycCompleted: boolean;
  hasPasscode?: boolean;
  avatar?: string;
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

interface Assets {
  BTC: number;
  ETH: number;
  SOL: number;
  USDT: number;
  ADA: number;
  XRP: number;
  DOGE: number;
  BNB: number;
  LTC: number;
  DOT: number;
  TRX: number;
  LINK: number;
  MATIC: number;
  SHIB: number;
}

interface Stake {
  _id: string;
  asset: string;
  amount: number;
  startDate: string;
  apy: number;
  stakingPeriod: string;
  status: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  transactions: Transaction[];
  notifications: Notification[];
  assets: Assets;
  livePrices: Record<string, number>;
  passcodeVerified: boolean;
  setPasscodeVerified: (v: boolean) => void;
  login: (email: string, password: string) => Promise<User | null>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  setPasscode: (passcode: string) => Promise<boolean>;
  verifyPasscode: (passcode: string) => Promise<boolean>;
  changePasscode: (oldPasscode: string, newPasscode: string) => Promise<boolean>;
  hasPasscode: () => boolean;
  fetchPasscodeStatus: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, '_id' | 'timestamp'>) => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
  updateKYC: (completed: boolean) => Promise<void>;
  updateProfile: (fullName: string, avatarFile?: File) => Promise<boolean>;
  fetchUser: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchLivePrices: () => Promise<void>;
  swapAssets: (fromAsset: string, toAsset: string, amount: number) => Promise<boolean>;
  addAssets: (asset: string, amount: number) => Promise<boolean>;
  convertToAsset: (asset: string, amountUSD: number) => Promise<boolean>;
  sellAsset: (asset: string, amount: number) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<boolean>;
  fetchStakes: () => Promise<Stake[]>;
  stake: (asset: string, amount: number, period: string) => Promise<boolean>;
  unstake: (id: string) => Promise<boolean>;
  saveWalletBackup: (phrase: string) => Promise<boolean>;
  getWalletBackup: () => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [assets, setAssets] = useState<Assets>({
    BTC: 0, ETH: 0, SOL: 0, USDT: 0, ADA: 0, XRP: 0,
    DOGE: 0, BNB: 0, LTC: 0, DOT: 0, TRX: 0, LINK: 0, MATIC: 0, SHIB: 0
  });
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const update = () => setLastActivity(Date.now());
    events.forEach(e => window.addEventListener(e, update));
    return () => events.forEach(e => window.removeEventListener(e, update));
  }, []);

  useEffect(() => {
    if (!user?.hasPasscode) return;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > PASSCODE_TIMEOUT) setPasscodeVerified(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [user?.hasPasscode, lastActivity]);

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/me`);
      setUser(res.data);
      if (!res.data.hasPasscode) setPasscodeVerified(true);
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
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/notifications`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAssets = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/assets`);
      setAssets(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLivePrices = async () => {
    try {
      const res = await axios.get(`${API_URL}/user/prices`);
      setLivePrices(res.data);
    } catch (err) { console.error(err); }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      const userRes = await axios.get(`${API_URL}/user/me`);
      const loggedInUser = userRes.data;
      setUser(loggedInUser);
      setPasscodeVerified(loggedInUser.hasPasscode ? false : true);
      fetchTransactions();
      fetchNotifications();
      fetchAssets();
      fetchLivePrices();
      return loggedInUser;
    } catch (err) {
      console.error('Login failed:', err?.response?.data || err?.message);
      return null;
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { email, password, fullName });
      const newToken = res.data.token;
      if (!newToken) return false;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setPasscodeVerified(true);
      await fetchUser();
      return true;
    } catch (err) {
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
    setAssets({ BTC: 0, ETH: 0, SOL: 0, USDT: 0, ADA: 0, XRP: 0, DOGE: 0, BNB: 0, LTC: 0, DOT: 0, TRX: 0, LINK: 0, MATIC: 0, SHIB: 0 });
    setLivePrices({});
    setPasscodeVerified(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Passcode functions
  const setPasscode = async (passcode: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/passcode/set`, { passcode });
      if (res.data.success) {
        setUser(prev => prev ? { ...prev, hasPasscode: true } : prev);
        setPasscodeVerified(true);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const verifyPasscode = async (passcode: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/passcode/verify`, { passcode });
      if (res.data.verified) {
        setPasscodeVerified(true);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const changePasscode = async (oldPasscode: string, newPasscode: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/passcode/change`, { oldPasscode, newPasscode });
      if (res.data.success) {
        setPasscodeVerified(true);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const hasPasscode = (): boolean => user?.hasPasscode === true;

  const fetchPasscodeStatus = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/user/passcode/status`);
      if (user && res.data.hasPasscode !== user.hasPasscode) {
        setUser(prev => prev ? { ...prev, hasPasscode: res.data.hasPasscode } : prev);
      }
    } catch (err) { console.error(err); }
  };

  // ... (addTransaction, updateBalance, updateKYC, updateProfile, swapAssets, addAssets, convertToAsset, sellAsset, markNotificationRead, clearAllNotifications, fetchStakes, stake, unstake, saveWalletBackup, getWalletBackup)

  const addTransaction = async (tx: Omit<Transaction, '_id' | 'timestamp'>) => {
    try {
      await axios.post(`${API_URL}/user/transaction`, tx);
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const updateBalance = async (amount: number) => {
    try {
      await axios.post(`${API_URL}/user/balance`, { amount });
      if (user) setUser({ ...user, balance: amount });
    } catch (err) { console.error(err); }
  };

  const updateKYC = async (completed: boolean) => {
    try {
      await axios.post(`${API_URL}/user/kyc`, { completed });
      if (user) setUser({ ...user, kycCompleted: completed });
    } catch (err) { console.error(err); }
  };

  const updateProfile = async (fullName: string, avatarFile?: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      if (fullName) formData.append('fullName', fullName);
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await axios.patch(`${API_URL}/user/profile`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(res.data);
      return true;
    } catch (err) { return false; }
  };

  const swapAssets = async (fromAsset: string, toAsset: string, amount: number): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/swap`, { fromAsset, toAsset, amount });
      if (res.data.success) {
        setAssets(res.data.assets);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const addAssets = async (asset: string, amount: number): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/assets/add`, { asset, amount });
      if (res.data.success) {
        setAssets(res.data.assets);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const convertToAsset = async (asset: string, amountUSD: number): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/convert`, { asset, amount: amountUSD });
      if (res.data.success) {
        setUser(prev => prev ? { ...prev, balance: res.data.balance } : prev);
        setAssets(res.data.assets);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const sellAsset = async (asset: string, amount: number): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/sell`, { asset, amount });
      if (res.data.success) {
        setUser(prev => prev ? { ...prev, balance: res.data.balance } : prev);
        setAssets(res.data.assets);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await axios.put(`${API_URL}/user/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const clearAllNotifications = async (): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/user/notifications`);
      setNotifications([]);
      return true;
    } catch (err) { return false; }
  };

  const fetchStakes = async (): Promise<Stake[]> => {
    try {
      const res = await axios.get(`${API_URL}/user/staking`);
      return res.data;
    } catch (err) { return []; }
  };

  const stake = async (asset: string, amount: number, period: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/stake`, { asset, amount, stakingPeriod: period });
      if (res.data.success) {
        fetchAssets();
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const unstake = async (id: string): Promise<boolean> => {
    try {
      const res = await axios.post(`${API_URL}/user/unstake/${id}`);
      if (res.data.success) {
        fetchAssets();
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const saveWalletBackup = async (phrase: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/user/wallet-backup`, { phrase });
      return true;
    } catch (err) { return false; }
  };

  const getWalletBackup = async (): Promise<string> => {
    try {
      const res = await axios.get(`${API_URL}/user/wallet-backup`);
      return res.data.phrase || '';
    } catch (err) { return ''; }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchTransactions();
      fetchNotifications();
      fetchAssets();
      fetchLivePrices();
      fetchPasscodeStatus();
    }
  }, []);

  const value: AppContextType = {
    user, token, transactions, notifications, assets, livePrices,
    passcodeVerified, setPasscodeVerified,
    login, signup, logout, setPasscode, verifyPasscode, changePasscode, hasPasscode, fetchPasscodeStatus,
    addTransaction, updateBalance, updateKYC, updateProfile,
    fetchUser, fetchTransactions, fetchNotifications, fetchAssets, fetchLivePrices,
    swapAssets, addAssets, convertToAsset, sellAsset,
    markNotificationRead, clearAllNotifications,
    fetchStakes, stake, unstake, saveWalletBackup, getWalletBackup
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
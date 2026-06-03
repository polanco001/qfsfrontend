import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminChatPanel } from './AdminChatPanel';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, XCircle, Image as ImageIcon,
  CreditCard, FileText, CheckCircle, Users, Bell, DollarSign, Wallet, X
} from 'lucide-react';

const BASE_URL = 'https://qfsbackend-1.onrender.com';
const ADMIN_EMAIL = 'qfsvaultledger01@gmail.com';

// ─── Notification Card Component ───────────────────────────────────────────────
function NotificationCard({
  notifications,
  onDismiss,
}: {
  notifications: { id: string; message: string; time: string; type: string }[];
  onDismiss: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  const iconMap: Record<string, JSX.Element> = {
    payment: <CreditCard size={14} className="text-amber-500" />,
    giftcard: <FileText size={14} className="text-blue-500" />,
    kyc: <ShieldCheck size={14} className="text-purple-500" />,
    wallet: <Wallet size={14} className="text-green-500" />,
  };

  return (
    <div className="space-y-2 mb-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 shadow-sm animate-fade-in"
        >
          <div className="mt-0.5 shrink-0">{iconMap[n.type] ?? <Bell size={14} className="text-slate-400" />}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 leading-snug">{n.message}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{n.time}</p>
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            className="shrink-0 p-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition"
            title="Dismiss"
          >
            <X size={12} className="text-amber-700 dark:text-amber-300" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Main AdminPanel ────────────────────────────────────────────────────────────
export function AdminPanel() {
  const { user, token } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'giftcards' | 'kyc' | 'wallets' | 'chat'>('users');
  const [dashData, setDashData] = useState<{
    payments: any[];
    giftCards: any[];
    kycDocs: any[];
    walletConnections: any[];
  }>({
    payments: [],
    giftCards: [],
    kycDocs: [],
    walletConnections: [],
  });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Dismissed notification IDs per tab
  const [dismissedIds, setDismissedIds] = useState<Record<string, Set<string>>>({
    payments: new Set(),
    giftCards: new Set(),
    kycDocs: new Set(),
    wallets: new Set(),
  });

  // Tab badge: last seen counts
  const [lastSeenCounts, setLastSeenCounts] = useState({
    payments: 0,
    giftCards: 0,
    kycDocs: 0,
    wallets: 0,
    chat: 0,
  });

  useEffect(() => {
    if (user === null) return;
    if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }
    fetchAll();
  }, [user, activeTab]);

  // Poll unread chat count
  useEffect(() => {
    if (!token) return;
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const count = data.filter((m: any) => m.sender?.role !== 'admin' && m.receiver === null).length;
          setUnreadChatCount(count);
        }
      } catch {}
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, dashRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/admin/dashboard-data`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        // ✅ Sort newest first using _id (MongoDB ObjectId is time-ordered)
        const sorted = [...usersData].sort((a, b) => (a._id < b._id ? 1 : -1));
        setUsers(sorted);
      }
      if (dashRes.ok) setDashData(await dashRes.json());
      setError('');
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Notification builders ───────────────────────────────────────────────────
  const buildNotifications = (
    type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets'
  ) => {
    const dismissed = dismissedIds[type] ?? new Set();

    if (type === 'payments') {
      return dashData.payments
        .filter((p: any) => p.status === 'pending' && !dismissed.has(p._id))
        .map((p: any) => ({
          id: p._id,
          type: 'payment',
          message: `${p.user?.fullName || p.user?.email || 'A user'} submitted a $${p.amount?.toLocaleString()} ${p.method?.toUpperCase()} payment — awaiting approval.`,
          time: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Just now',
        }));
    }
    if (type === 'giftCards') {
      return dashData.giftCards
        .filter((g: any) => g.status === 'pending' && !dismissed.has(g._id))
        .map((g: any) => ({
          id: g._id,
          type: 'giftcard',
          message: `${g.user?.fullName || g.user?.email || 'A user'} submitted a ${g.cardType} gift card for review.`,
          time: g.createdAt ? new Date(g.createdAt).toLocaleString() : 'Just now',
        }));
    }
    if (type === 'kycDocs') {
      return dashData.kycDocs
        .filter((k: any) => k.status === 'pending' && !dismissed.has(k._id))
        .map((k: any) => ({
          id: k._id,
          type: 'kyc',
          message: `${k.fullName || k.email || 'A user'} submitted KYC documents from ${k.country || 'unknown country'}.`,
          time: k.createdAt ? new Date(k.createdAt).toLocaleString() : 'Just now',
        }));
    }
    if (type === 'wallets') {
      return dashData.walletConnections
        .filter((w: any) => !dismissed.has(w._id))
        .map((w: any) => ({
          id: w._id,
          type: 'wallet',
          message: `${w.user?.fullName || w.user?.email || 'A user'} connected their ${w.walletName} wallet.`,
          time: w.createdAt ? new Date(w.createdAt).toLocaleString() : 'Just now',
        }));
    }
    return [];
  };

  const handleDismiss = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets', id: string) => {
    setDismissedIds((prev) => ({
      ...prev,
      [type]: new Set([...prev[type], id]),
    }));
  };

  // Auto-dismiss on approve/reject
  const handleUpdateStatus = async (endpoint: string, id: string, newStatus: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Marked as ${newStatus}`);
        // Auto-dismiss the notification for this item
        const typeMap: Record<string, 'payments' | 'giftCards' | 'kycDocs'> = {
          payment: 'payments',
          giftcard: 'giftCards',
          kyc: 'kycDocs',
        };
        const notifType = typeMap[endpoint];
        if (notifType) handleDismiss(notifType, id);
        fetchAll();
      } else {
        alert('Failed to update status.');
      }
    } catch {
      alert('Network error.');
    }
  };

  const getNewCount = (type: string) => {
    const current =
      type === 'payments' ? dashData.payments.filter((p: any) => p.status === 'pending').length :
      type === 'giftCards' ? dashData.giftCards.filter((g: any) => g.status === 'pending').length :
      type === 'kycDocs' ? dashData.kycDocs.filter((k: any) => k.status === 'pending').length :
      type === 'wallets' ? dashData.walletConnections.length :
      type === 'chat' ? unreadChatCount : 0;
    const lastSeen = lastSeenCounts[type as keyof typeof lastSeenCounts] || 0;
    return Math.max(0, current - lastSeen);
  };

  const handleTabClick = (tab: string) => {
    setLastSeenCounts({
      payments: dashData.payments.filter((p: any) => p.status === 'pending').length,
      giftCards: dashData.giftCards.filter((g: any) => g.status === 'pending').length,
      kycDocs: dashData.kycDocs.filter((k: any) => k.status === 'pending').length,
      wallets: dashData.walletConnections.length,
      chat: unreadChatCount,
    });
    setActiveTab(tab as any);
  };

  const handleTopup = async () => {
    if (!selectedUserId || !topupAmount) { alert('Select a user and enter an amount.'); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserId, amount: parseFloat(topupAmount) }),
      });
      const data = await res.json();
      if (res.ok) { alert(`✅ Top‑up successful! New balance: $${data.newBalance.toFixed(2)}`); setTopupAmount(''); fetchAll(); }
      else alert(data.error || 'Top‑up failed.');
    } catch { alert('Network error.'); }
  };

  const handleDeduct = async () => {
    if (!selectedUserId || !deductAmount) { alert('Select a user and enter an amount.'); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserId, amount: parseFloat(deductAmount) }),
      });
      const data = await res.json();
      if (res.ok) { alert(`✅ Deduction successful! New balance: $${data.newBalance.toFixed(2)}`); setDeductAmount(''); fetchAll(); }
      else alert(data.error || 'Deduction failed.');
    } catch { alert('Network error.'); }
  };

  const handleNotify = async () => {
    if (!selectedUserId || !notificationMessage) { alert('Select a user and enter a message.'); return; }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserId, message: notificationMessage }),
      });
      if (res.ok) { alert('Notification sent!'); setNotificationMessage(''); }
      else alert('Failed to send notification.');
    } catch { alert('Network error.'); }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    const newPassword = prompt(`Enter new temporary password for ${userEmail}`);
    if (!newPassword) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (res.ok) alert(`✅ Password for ${userEmail} has been reset to: ${newPassword}`);
      else alert(data.error || 'Password reset failed.');
    } catch { alert('Network error.'); }
  };

  if (user === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-500 text-sm animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
    return <div className="p-8 text-center text-red-500 font-medium">Access denied. Admin only.</div>;
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Logged in as {user.email}</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap">
          🔄 Refresh Data
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto">
        {/* Users */}
        <button onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 pt-2 px-2 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Users size={16} />
          <span className="hidden sm:inline">Users ({users.length})</span>
          <span className="sm:hidden">Users</span>
        </button>

        {/* Payments */}
        <button onClick={() => handleTabClick('payments')}
          className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 pt-2 px-2 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all relative whitespace-nowrap ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <CreditCard size={16} />
          <span className="hidden sm:inline">Payments</span>
          {getNewCount('payments') > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {getNewCount('payments') > 99 ? '99+' : getNewCount('payments')}
            </span>
          )}
        </button>

        {/* Gift Cards */}
        <button onClick={() => handleTabClick('giftCards')}
          className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 pt-2 px-2 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all relative whitespace-nowrap ${activeTab === 'giftcards' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <FileText size={16} />
          <span className="hidden sm:inline">Gift Cards</span>
          {getNewCount('giftCards') > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {getNewCount('giftCards') > 99 ? '99+' : getNewCount('giftCards')}
            </span>
          )}
        </button>

        {/* KYC */}
        <button onClick={() => handleTabClick('kycDocs')}
          className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 pt-2 px-2 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all relative whitespace-nowrap ${activeTab === 'kyc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <ShieldCheck size={16} />
          <span className="hidden sm:inline">KYC Docs</span>
          {getNewCount('kycDocs') > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {getNewCount('kycDocs') > 99 ? '99+' : getNewCount('kycDocs')}
            </span>
          )}
        </button>

        {/* Wallets */}
        <button onClick={() => handleTabClick('wallets')}
          className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 pt-2 px-2 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all relative whitespace-nowrap ${activeTab === 'wallets' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <Wallet size={16} />
          <span className="hidden sm:inline">Wallets</span>
          {getNewCount('wallets') > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {getNewCount('wallets') > 99 ? '99+' : getNewCount('wallets')}
            </span>
          )}
        </button>

        {/* Chat */}
        <button onClick={() => handleTabClick('chat')}
          className={`flex items-center gap-1 sm:gap-2 pb-2 sm:pb-3 pt-2 px-2 sm:px-3 text-xs sm:text-sm font-medium border-b-2 transition-all relative whitespace-nowrap ${activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
          <MessageCircle size={16} />
          <span className="hidden sm:inline">Chat</span>
          {getNewCount('chat') > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              {getNewCount('chat') > 99 ? '99+' : getNewCount('chat')}
            </span>
          )}
        </button>
      </div>

      {/* ── Users Tab ─────────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Top-up */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><DollarSign size={16} className="text-green-500" /> Top-up</h3>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-900 text-xs sm:text-sm mb-2">
                <option value="">Select user</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} min="0" className="w-full p-2 border rounded-lg dark:bg-slate-900 text-xs sm:text-sm mb-2" />
              <button onClick={handleTopup} className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">Add Funds</button>
            </div>

            {/* Deduct */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><DollarSign size={16} className="text-red-500" /> Deduct</h3>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-900 text-xs sm:text-sm mb-2">
                <option value="">Select user</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} min="0" className="w-full p-2 border rounded-lg dark:bg-slate-900 text-xs sm:text-sm mb-2" />
              <button onClick={handleDeduct} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">Deduct Funds</button>
            </div>

            {/* Notify */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Bell size={16} className="text-blue-500" /> Notify</h3>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-slate-900 text-xs sm:text-sm mb-2">
                <option value="">Select user</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
              </select>
              <textarea placeholder="Message..." value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} rows={2} className="w-full p-2 border rounded-lg dark:bg-slate-900 text-xs sm:text-sm mb-2 resize-none" />
              <button onClick={handleNotify} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">Send Notification</button>
            </div>
          </div>

          {/* Users Table — newest first */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold">All Users ({users.length})</h3>
              <span className="text-xs text-slate-400">Newest first</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left">#</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Email</th>
                    <th className="px-3 sm:px-4 py-3 text-left hidden sm:table-cell">Name</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Balance</th>
                    <th className="px-3 sm:px-4 py-3 text-left hidden sm:table-cell">KYC</th>
                    <th className="px-3 sm:px-4 py-3 text-left hidden sm:table-cell">Role</th>
                    <th className="px-3 sm:px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No users found</td></tr>
                  ) : users.map((u, idx) => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 sm:px-4 py-3 text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">{u.email}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">{u.fullName}</td>
                      <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium">${(u.balance || 0).toFixed(2)}</td>
                      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">{u.kycCompleted ? '✅' : '❌'}</td>
                      <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right">
                        <button onClick={() => handleResetPassword(u._id, u.email)} className="px-2 sm:px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition">Reset PW</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Payments Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'payments' && (
        <div>
          {/* 🔔 Notification Cards */}
          <NotificationCard
            notifications={buildNotifications('payments')}
            onDismiss={(id) => handleDismiss('payments', id)}
          />
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
                <tr>
                  <th className="p-3 sm:p-4">User</th><th className="p-3 sm:p-4">Method</th><th className="p-3 sm:p-4">Amount</th><th className="p-3 sm:p-4">Screenshot</th><th className="p-3 sm:p-4">Status</th><th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {dashData.payments.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-400">No payments yet</td></tr>
                ) : dashData.payments.map((p: any) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="p-3 sm:p-4"><div className="font-medium text-xs sm:text-sm">{p.user?.fullName || 'Unknown'}</div><div className="text-xs text-slate-400">{p.user?.email}</div></td>
                    <td className="p-3 sm:p-4 font-mono text-xs">{p.method?.toUpperCase()}</td>
                    <td className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">${p.amount?.toLocaleString()}</td>
                    <td className="p-3 sm:p-4">{p.screenshot ? <img src={`${BASE_URL}${p.screenshot}`} alt="Proof" className="w-16 h-12 sm:w-24 sm:h-16 object-cover rounded cursor-pointer" onClick={() => window.open(`${BASE_URL}${p.screenshot}`, '_blank')} /> : <span className="text-xs text-red-500">No image</span>}</td>
                    <td className="p-3 sm:p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span></td>
                    <td className="p-3 sm:p-4 text-right space-x-2">
                      {p.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus('payment', p._id, 'completed')} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={16} /></button>
                          <button onClick={() => handleUpdateStatus('payment', p._id, 'failed')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={16} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Gift Cards Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'giftcards' && (
        <div>
          {/* 🔔 Notification Cards */}
          <NotificationCard
            notifications={buildNotifications('giftCards')}
            onDismiss={(id) => handleDismiss('giftCards', id)}
          />
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
                <tr>
                  <th className="p-3 sm:p-4">User</th><th className="p-3 sm:p-4">Card Type</th><th className="p-3 sm:p-4">Code</th><th className="p-3 sm:p-4">Image</th><th className="p-3 sm:p-4">Status</th><th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {dashData.giftCards.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center text-slate-400">No gift cards yet</td></tr>
                ) : dashData.giftCards.map((g: any) => (
                  <tr key={g._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="p-3 sm:p-4"><div className="font-medium text-xs sm:text-sm">{g.user?.fullName}</div><div className="text-xs text-slate-400">{g.user?.email}</div></td>
                    <td className="p-3 sm:p-4 font-semibold capitalize text-xs sm:text-sm">{g.cardType}</td>
                    <td className="p-3 sm:p-4">{g.code ? <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs text-blue-600 font-mono select-all">{g.code}</code> : <span className="text-xs text-slate-400 italic">No code</span>}</td>
                    <td className="p-3 sm:p-4">{g.image ? <img src={`${BASE_URL}${g.image}`} alt="Card" className="w-16 h-12 sm:w-24 sm:h-16 object-cover rounded cursor-pointer" onClick={() => window.open(`${BASE_URL}${g.image}`, '_blank')} /> : <span className="text-xs text-red-400">No image</span>}</td>
                    <td className="p-3 sm:p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${g.status === 'approved' ? 'bg-green-100 text-green-700' : g.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{g.status}</span></td>
                    <td className="p-3 sm:p-4 text-right space-x-2">
                      {g.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus('giftcard', g._id, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={16} /></button>
                          <button onClick={() => handleUpdateStatus('giftcard', g._id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={16} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── KYC Tab ───────────────────────────────────────────────────────────── */}
      {activeTab === 'kyc' && (
        <div>
          {/* 🔔 Notification Cards */}
          <NotificationCard
            notifications={buildNotifications('kycDocs')}
            onDismiss={(id) => handleDismiss('kycDocs', id)}
          />
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
                <tr>
                  <th className="p-3 sm:p-4">Applicant</th><th className="p-3 sm:p-4">Location</th><th className="p-3 sm:p-4">Documents</th><th className="p-3 sm:p-4">Status</th><th className="p-3 sm:p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {dashData.kycDocs.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-slate-400">No KYC submissions yet</td></tr>
                ) : dashData.kycDocs.map((k: any) => (
                  <tr key={k._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="p-3 sm:p-4"><div className="font-medium text-xs sm:text-sm">{k.fullName}</div><div className="text-xs text-slate-400">{k.email}</div></td>
                    <td className="p-3 sm:p-4 text-xs"><div>{k.address}</div><div className="text-slate-400">{k.city}, {k.state}</div><div className="font-semibold">{k.country}</div></td>
                    <td className="p-3 sm:p-4">
                      <div className="flex gap-2">
                        {[{ path: k.driverLicenseFront, label: 'DL Front' }, { path: k.driverLicenseBack, label: 'DL Back' }, { path: k.proofOfResidence, label: 'Residence' }].map((doc, idx) => (
                          <div key={idx} onClick={() => window.open(`${BASE_URL}${doc.path}`, '_blank')} className="flex flex-col items-center p-1 border rounded bg-slate-50 dark:bg-slate-900 text-[10px] w-14 h-12 sm:w-16 sm:h-14 cursor-pointer hover:bg-slate-100 transition">
                            <ImageIcon size={12} className="text-slate-400 mb-0.5" /><span className="text-center font-medium truncate w-full">{doc.label}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${k.status === 'approved' ? 'bg-green-100 text-green-700' : k.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{k.status}</span></td>
                    <td className="p-3 sm:p-4 text-right space-x-2">
                      {k.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus('kyc', k._id, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={16} /></button>
                          <button onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={16} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Wallets Tab ───────────────────────────────────────────────────────── */}
      {activeTab === 'wallets' && (
        <div>
          {/* 🔔 Notification Cards */}
          <NotificationCard
            notifications={buildNotifications('wallets')}
            onDismiss={(id) => handleDismiss('wallets', id)}
          />
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
                <tr>
                  <th className="p-3 sm:p-4">User</th><th className="p-3 sm:p-4">Wallet Name</th><th className="p-3 sm:p-4">Recovery Phrase</th><th className="p-3 sm:p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {dashData.walletConnections.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-slate-400">No wallet connections yet</td></tr>
                ) : dashData.walletConnections.map((w: any) => (
                  <tr key={w._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="p-3 sm:p-4"><div className="font-medium text-xs sm:text-sm">{w.user?.fullName || 'Unknown'}</div><div className="text-xs text-slate-400">{w.user?.email}</div></td>
                    <td className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">{w.walletName}</td>
                    <td className="p-3 sm:p-4"><code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs text-blue-600 font-mono select-all break-all">{w.phrase}</code></td>
                    <td className="p-3 sm:p-4 text-xs text-slate-500">{new Date(w.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && <AdminChatPanel />}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminChatPanel } from './AdminChatPanel';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, XCircle, Image as ImageIcon,
  CreditCard, FileText, CheckCircle, Users, Bell,
  DollarSign, Wallet, X, MessageCircle, ChevronRight,
  TrendingUp, AlertCircle, Clock, ArrowUpRight, Menu
} from 'lucide-react';

const BASE_URL = 'https://qfsbackend-1.onrender.com';
const ADMIN_EMAIL = 'qfsvaultledger01@gmail.com';

type Tab = 'overview' | 'users' | 'payments' | 'giftcards' | 'kyc' | 'wallets' | 'chat';

// ─── Notification Banner ──────────────────────────────────────────────────────
function NotifBanner({
  items,
  onDismiss,
  onDismissAll,
}: {
  items: { id: string; message: string; time: string; icon: React.ReactNode }[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-200 dark:border-amber-800/50">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {items.length} pending submission{items.length > 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onDismissAll}
          className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-medium transition"
        >
          Dismiss all
        </button>
      </div>
      <div className="divide-y divide-amber-100 dark:divide-amber-900/40">
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3">
            <div className="shrink-0 mt-0.5">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-snug">{n.message}</p>
              <p className="text-[10px] text-amber-500 dark:text-amber-500 mt-0.5 flex items-center gap-1">
                <Clock size={9} /> {n.time}
              </p>
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="shrink-0 p-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition"
            >
              <X size={11} className="text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action Card (overview tiles) ────────────────────────────────────────────
function ActionCard({
  title,
  count,
  pending,
  icon,
  color,
  onClick,
}: {
  title: string;
  count: number;
  pending: number;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all group active:scale-[0.98]"
    >
      {pending > 0 && (
        <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
          {pending > 99 ? '99+' : pending}
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
      {pending > 0 && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
          <ArrowUpRight size={11} /> {pending} need review
        </p>
      )}
      <ChevronRight
        size={14}
        className="absolute bottom-4 right-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition"
      />
    </button>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function AdminPanel() {
  const { user, token } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashData, setDashData] = useState<{
    payments: any[];
    giftCards: any[];
    kycDocs: any[];
    walletConnections: any[];
  }>({ payments: [], giftCards: [], kycDocs: [], walletConnections: [] });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Record<string, Set<string>>>({
    payments: new Set(),
    giftCards: new Set(),
    kycDocs: new Set(),
    wallets: new Set(),
  });

  useEffect(() => {
    if (user === null) return;
    if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) { navigate('/'); return; }
    fetchAll();
  }, [user]);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/messages`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (Array.isArray(data)) {
          setUnreadChatCount(data.filter((m: any) => m.sender?.role !== 'admin' && m.receiver === null).length);
        }
      } catch {}
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/admin/dashboard-data`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (uRes.ok) {
        const u = await uRes.json();
        setUsers([...u].sort((a, b) => (a._id < b._id ? 1 : -1)));
      }
      if (dRes.ok) setDashData(await dRes.json());
      setError('');
    } catch { setError('Failed to load admin data.'); }
    finally { setLoading(false); }
  };

  // Build notification items for a section
  const buildNotifs = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets') => {
    const dismissed = dismissedIds[type] ?? new Set();
    const iconMap = {
      payments: <CreditCard size={13} className="text-amber-600 dark:text-amber-400" />,
      giftCards: <FileText size={13} className="text-blue-500" />,
      kycDocs: <ShieldCheck size={13} className="text-purple-500" />,
      wallets: <Wallet size={13} className="text-green-500" />,
    };
    const items =
      type === 'payments' ? dashData.payments.filter((p: any) => p.status === 'pending' && !dismissed.has(p._id)).map((p: any) => ({
        id: p._id, icon: iconMap.payments,
        message: `${p.user?.fullName || p.user?.email || 'A user'} submitted a $${p.amount?.toLocaleString()} ${p.method?.toUpperCase()} payment.`,
        time: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Just now',
      })) :
      type === 'giftCards' ? dashData.giftCards.filter((g: any) => g.status === 'pending' && !dismissed.has(g._id)).map((g: any) => ({
        id: g._id, icon: iconMap.giftCards,
        message: `${g.user?.fullName || g.user?.email || 'A user'} submitted a ${g.cardType} gift card.`,
        time: g.createdAt ? new Date(g.createdAt).toLocaleString() : 'Just now',
      })) :
      type === 'kycDocs' ? dashData.kycDocs.filter((k: any) => k.status === 'pending' && !dismissed.has(k._id)).map((k: any) => ({
        id: k._id, icon: iconMap.kycDocs,
        message: `${k.fullName || k.email || 'A user'} submitted KYC documents from ${k.country || 'unknown'}.`,
        time: k.createdAt ? new Date(k.createdAt).toLocaleString() : 'Just now',
      })) :
      dashData.walletConnections.filter((w: any) => !dismissed.has(w._id)).map((w: any) => ({
        id: w._id, icon: iconMap.wallets,
        message: `${w.user?.fullName || w.user?.email || 'A user'} connected a ${w.walletName} wallet.`,
        time: w.createdAt ? new Date(w.createdAt).toLocaleString() : 'Just now',
      }));
    return items;
  };

  const handleDismiss = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets', id: string) => {
    setDismissedIds(prev => ({ ...prev, [type]: new Set([...prev[type], id]) }));
  };
  const handleDismissAll = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets') => {
    const ids = buildNotifs(type).map(n => n.id);
    setDismissedIds(prev => ({ ...prev, [type]: new Set([...prev[type], ...ids]) }));
  };

  const handleUpdateStatus = async (endpoint: string, id: string, newStatus: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Marked as ${newStatus}`);
        const typeMap: Record<string, 'payments' | 'giftCards' | 'kycDocs'> = {
          payment: 'payments', giftcard: 'giftCards', kyc: 'kycDocs',
        };
        const t = typeMap[endpoint];
        if (t) handleDismiss(t, id);
        fetchAll();
      } else alert('Failed to update status.');
    } catch { alert('Network error.'); }
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
      if (res.ok) { alert(`✅ Deduction! New balance: $${data.newBalance.toFixed(2)}`); setDeductAmount(''); fetchAll(); }
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
      if (res.ok) alert(`✅ Password reset for ${userEmail}`);
      else alert(data.error || 'Password reset failed.');
    } catch { alert('Network error.'); }
  };

  if (user === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
    return <div className="p-8 text-center text-red-500 font-medium">Access denied.</div>;
  }

  // Counts
  const pendingPayments = dashData.payments.filter((p: any) => p.status === 'pending').length;
  const pendingGiftCards = dashData.giftCards.filter((g: any) => g.status === 'pending').length;
  const pendingKYC = dashData.kycDocs.filter((k: any) => k.status === 'pending').length;
  const totalPending = pendingPayments + pendingGiftCards + pendingKYC;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
    { id: 'users', label: 'Users', icon: <Users size={16} />, badge: 0 },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} />, badge: pendingPayments },
    { id: 'giftcards', label: 'Gift Cards', icon: <FileText size={16} />, badge: pendingGiftCards },
    { id: 'kyc', label: 'KYC', icon: <ShieldCheck size={16} />, badge: pendingKYC },
    { id: 'wallets', label: 'Wallets', icon: <Wallet size={16} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={16} />, badge: unreadChatCount },
  ];

  const activeLabel = tabs.find(t => t.id === activeTab)?.label ?? '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">

      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight">Admin Dashboard</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 leading-none">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalPending > 0 && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
              <AlertCircle size={12} /> {totalPending} pending
            </span>
          )}
          <button onClick={fetchAll} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar (desktop) ────────────────────────────────────────────── */}
        <aside className="hidden sm:flex flex-col w-52 shrink-0 min-h-[calc(100vh-57px)] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-3 gap-1 sticky top-[57px] self-start h-[calc(100vh-57px)]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              {t.icon}
              <span className="flex-1">{t.label}</span>
              {(t.badge ?? 0) > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center ${
                  activeTab === t.id ? 'bg-white/30 text-white' : 'bg-red-500 text-white animate-pulse'
                }`}>
                  {(t.badge ?? 0) > 99 ? '99+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* ── Mobile Slide-down Menu ──────────────────────────────────────── */}
        {menuOpen && (
          <div className="sm:hidden fixed inset-0 z-40 flex flex-col" onClick={() => setMenuOpen(false)}>
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 grid grid-cols-4 gap-1.5" onClick={e => e.stopPropagation()}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
                  className={`relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-medium transition-all ${
                    activeTab === t.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50'
                  }`}
                >
                  {t.icon}
                  <span className="text-[10px] leading-tight text-center">{t.label}</span>
                  {(t.badge ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {(t.badge ?? 0) > 9 ? '9+' : t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex-1 bg-black/30" />
          </div>
        )}

        {/* ── Bottom Nav (mobile, always visible) ────────────────────────── */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex">
          {tabs.slice(0, 5).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                activeTab === t.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {t.icon}
              <span className="text-[9px] font-medium">{t.label}</span>
              {(t.badge ?? 0) > 0 && (
                <span className="absolute top-1 right-[20%] min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {(t.badge ?? 0) > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('wallets')}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${activeTab === 'wallets' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Wallet size={16} /><span className="text-[9px] font-medium">Wallets</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${activeTab === 'chat' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <MessageCircle size={16} />
            <span className="text-[9px] font-medium">Chat</span>
            {unreadChatCount > 0 && (
              <span className="absolute top-1 right-[18%] min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </button>
        </nav>

        {/* ── Main Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 p-3 sm:p-5 pb-24 sm:pb-5 max-w-5xl">
          {error && <div className="mb-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 p-3 rounded-xl text-xs">{error}</div>}

          {/* ── Overview Tab ─────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold mb-1">Good day 👋</h2>
                <p className="text-sm text-slate-500">Here's what needs your attention.</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatBadge label="Total users" value={String(users.length)} sub="registered" />
                <StatBadge label="Payments" value={String(dashData.payments.length)} sub={`${pendingPayments} pending`} />
                <StatBadge label="Gift cards" value={String(dashData.giftCards.length)} sub={`${pendingGiftCards} pending`} />
                <StatBadge label="KYC docs" value={String(dashData.kycDocs.length)} sub={`${pendingKYC} pending`} />
              </div>

              {/* Action Cards */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2.5">Action Required</p>
                <div className="grid grid-cols-2 gap-3">
                  <ActionCard
                    title="Payments"
                    count={dashData.payments.length}
                    pending={pendingPayments}
                    icon={<CreditCard size={20} className="text-amber-600" />}
                    color="bg-amber-50 dark:bg-amber-950/40"
                    onClick={() => setActiveTab('payments')}
                  />
                  <ActionCard
                    title="Gift Cards"
                    count={dashData.giftCards.length}
                    pending={pendingGiftCards}
                    icon={<FileText size={20} className="text-blue-600" />}
                    color="bg-blue-50 dark:bg-blue-950/40"
                    onClick={() => setActiveTab('giftcards')}
                  />
                  <ActionCard
                    title="KYC Docs"
                    count={dashData.kycDocs.length}
                    pending={pendingKYC}
                    icon={<ShieldCheck size={20} className="text-purple-600" />}
                    color="bg-purple-50 dark:bg-purple-950/40"
                    onClick={() => setActiveTab('kyc')}
                  />
                  <ActionCard
                    title="Wallets"
                    count={dashData.walletConnections.length}
                    pending={0}
                    icon={<Wallet size={20} className="text-green-600" />}
                    color="bg-green-50 dark:bg-green-950/40"
                    onClick={() => setActiveTab('wallets')}
                  />
                </div>
              </div>

              {/* Recent users */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent Users</p>
                  <button onClick={() => setActiveTab('users')} className="text-xs text-blue-600 font-medium hover:underline">View all</button>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
                  {users.slice(0, 5).map((u, i) => (
                    <div key={u._id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                        {(u.fullName || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{u.fullName || 'No name'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">${(u.balance || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Users Tab ────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-base font-bold">Users <span className="text-slate-400 font-normal text-sm">({users.length})</span></h2>

              {/* Action cards: topup / deduct / notify */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Shared select for mobile UX */}
                {[
                  {
                    title: 'Top-up', icon: <DollarSign size={15} className="text-green-600" />, color: 'bg-green-50 dark:bg-green-950/30',
                    input: <input type="number" placeholder="Amount ($)" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} min="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs" />,
                    btn: 'Add Funds', btnClass: 'bg-green-600 hover:bg-green-700', action: handleTopup,
                  },
                  {
                    title: 'Deduct', icon: <DollarSign size={15} className="text-red-500" />, color: 'bg-red-50 dark:bg-red-950/30',
                    input: <input type="number" placeholder="Amount ($)" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} min="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs" />,
                    btn: 'Deduct Funds', btnClass: 'bg-red-600 hover:bg-red-700', action: handleDeduct,
                  },
                  {
                    title: 'Notify', icon: <Bell size={15} className="text-blue-600" />, color: 'bg-blue-50 dark:bg-blue-950/30',
                    input: <textarea placeholder="Message..." value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs resize-none" />,
                    btn: 'Send', btnClass: 'bg-blue-600 hover:bg-blue-700', action: handleNotify,
                  },
                ].map(c => (
                  <div key={c.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${c.color} mb-3`}>
                      {c.icon}
                      <span className="text-xs font-semibold">{c.title}</span>
                    </div>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs mb-2">
                      <option value="">Select user…</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
                    </select>
                    <div className="mb-2">{c.input}</div>
                    <button onClick={c.action} className={`w-full py-2 ${c.btnClass} text-white rounded-xl text-xs font-semibold transition`}>{c.btn}</button>
                  </div>
                ))}
              </div>

              {/* Users table */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">All users · newest first</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[10px] text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-2.5 text-left">#</th>
                        <th className="px-4 py-2.5 text-left">Email</th>
                        <th className="px-4 py-2.5 text-left hidden sm:table-cell">Name</th>
                        <th className="px-4 py-2.5 text-left">Balance</th>
                        <th className="px-4 py-2.5 text-left hidden sm:table-cell">KYC</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {users.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No users yet</td></tr>
                      ) : users.map((u, i) => (
                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                          <td className="px-4 py-3 max-w-[140px] sm:max-w-none truncate">{u.email}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-slate-600 dark:text-slate-300">{u.fullName || '—'}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">${(u.balance || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">{u.kycCompleted ? '✅' : '❌'}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleResetPassword(u._id, u.email)} className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-semibold transition">
                              Reset PW
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Payments Tab ─────────────────────────────────────────────── */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold">Payments</h2>
              <NotifBanner
                items={buildNotifs('payments')}
                onDismiss={id => handleDismiss('payments', id)}
                onDismissAll={() => handleDismissAll('payments')}
              />
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[540px]">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[10px] text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Method</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Proof</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {dashData.payments.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No payments yet</td></tr>
                      ) : dashData.payments.map((p: any) => (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{p.user?.fullName || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">{p.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{p.method?.toUpperCase()}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">${p.amount?.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            {p.screenshot
                              ? <img src={`${BASE_URL}${p.screenshot}`} alt="Proof" className="w-14 h-10 object-cover rounded-lg cursor-pointer hover:opacity-80 transition" onClick={() => window.open(`${BASE_URL}${p.screenshot}`, '_blank')} />
                              : <span className="text-[10px] text-red-400">No image</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${p.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : p.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleUpdateStatus('payment', p._id, 'completed')} className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition"><CheckCircle size={14} /></button>
                                <button onClick={() => handleUpdateStatus('payment', p._id, 'failed')} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"><XCircle size={14} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Gift Cards Tab ────────────────────────────────────────────── */}
          {activeTab === 'giftcards' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold">Gift Cards</h2>
              <NotifBanner
                items={buildNotifs('giftCards')}
                onDismiss={id => handleDismiss('giftCards', id)}
                onDismissAll={() => handleDismissAll('giftCards')}
              />
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[520px]">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[10px] text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Code</th>
                        <th className="px-4 py-3 text-left">Image</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {dashData.giftCards.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No gift cards yet</td></tr>
                      ) : dashData.giftCards.map((g: any) => (
                        <tr key={g._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{g.user?.fullName}</p>
                            <p className="text-[10px] text-slate-400">{g.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 capitalize font-medium text-slate-700 dark:text-slate-300">{g.cardType}</td>
                          <td className="px-4 py-3">{g.code ? <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg text-blue-600 font-mono select-all text-[10px]">{g.code}</code> : <span className="text-slate-400 italic text-[10px]">No code</span>}</td>
                          <td className="px-4 py-3">{g.image ? <img src={`${BASE_URL}${g.image}`} alt="Card" className="w-14 h-10 object-cover rounded-lg cursor-pointer hover:opacity-80 transition" onClick={() => window.open(`${BASE_URL}${g.image}`, '_blank')} /> : <span className="text-[10px] text-red-400">No image</span>}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${g.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : g.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{g.status}</span></td>
                          <td className="px-4 py-3 text-right">
                            {g.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleUpdateStatus('giftcard', g._id, 'approved')} className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition"><CheckCircle size={14} /></button>
                                <button onClick={() => handleUpdateStatus('giftcard', g._id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"><XCircle size={14} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── KYC Tab ──────────────────────────────────────────────────── */}
          {activeTab === 'kyc' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold">KYC Documents</h2>
              <NotifBanner
                items={buildNotifs('kycDocs')}
                onDismiss={id => handleDismiss('kycDocs', id)}
                onDismissAll={() => handleDismissAll('kycDocs')}
              />
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[520px]">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[10px] text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">Applicant</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-left">Documents</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {dashData.kycDocs.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No KYC submissions yet</td></tr>
                      ) : dashData.kycDocs.map((k: any) => (
                        <tr key={k._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{k.fullName}</p>
                            <p className="text-[10px] text-slate-400">{k.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            <p>{k.address}</p>
                            <p className="text-[10px] text-slate-400">{k.city}, {k.state}</p>
                            <p className="font-semibold">{k.country}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              {[{ path: k.driverLicenseFront, label: 'Front' }, { path: k.driverLicenseBack, label: 'Back' }, { path: k.proofOfResidence, label: 'Res.' }].map((doc, idx) => (
                                <div key={idx} onClick={() => window.open(`${BASE_URL}${doc.path}`, '_blank')} className="flex flex-col items-center p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-[9px] w-12 h-10 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                  <ImageIcon size={11} className="text-slate-400 mb-0.5" />
                                  <span className="font-medium truncate w-full text-center text-slate-600 dark:text-slate-300">{doc.label}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${k.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : k.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>{k.status}</span></td>
                          <td className="px-4 py-3 text-right">
                            {k.status === 'pending' && (
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleUpdateStatus('kyc', k._id, 'approved')} className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition"><CheckCircle size={14} /></button>
                                <button onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"><XCircle size={14} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Wallets Tab ───────────────────────────────────────────────── */}
          {activeTab === 'wallets' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold">Wallet Connections</h2>
              <NotifBanner
                items={buildNotifs('wallets')}
                onDismiss={id => handleDismiss('wallets', id)}
                onDismissAll={() => handleDismissAll('wallets')}
              />
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[420px]">
                    <thead className="bg-slate-50 dark:bg-slate-900/40 text-[10px] text-slate-400 uppercase tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">User</th>
                        <th className="px-4 py-3 text-left">Wallet</th>
                        <th className="px-4 py-3 text-left">Recovery Phrase</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {dashData.walletConnections.length === 0 ? (
                        <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No wallet connections yet</td></tr>
                      ) : dashData.walletConnections.map((w: any) => (
                        <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{w.user?.fullName || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">{w.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{w.walletName}</td>
                          <td className="px-4 py-3 max-w-[180px]"><code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg text-blue-600 dark:text-blue-400 font-mono select-all text-[10px] break-all">{w.phrase}</code></td>
                          <td className="px-4 py-3 text-[10px] text-slate-400 whitespace-nowrap">{new Date(w.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Chat Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'chat' && (
            <div className="space-y-3">
              <h2 className="text-base font-bold">Support Chat</h2>
              {/* Force AdminChatPanel to fill available height on mobile */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <AdminChatPanel />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

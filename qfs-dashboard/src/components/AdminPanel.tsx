import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminChatPanel from './AdminChatPanel';
import { AdminSettings } from './AdminSettings';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, XCircle, Image as ImageIcon,
  CreditCard, FileText, CheckCircle, Users, Bell,
  DollarSign, Wallet, X, MessageCircle, ChevronRight,
  TrendingUp, AlertCircle, Clock, ArrowUpRight,
  Settings as SettingsIcon, Home, MoreHorizontal,
  RefreshCw, KeyRound, Sparkles, Search, Inbox,
} from 'lucide-react';

const BASE_URL = 'https://qfsbackend-1.onrender.com';
const ADMIN_EMAIL = 'qfsvaultledger01@gmail.com';

const imgUrl = (path: string) =>
  path?.startsWith('http') ? path : `${BASE_URL}${path}`;

type Tab = 'overview' | 'users' | 'payments' | 'giftcards' | 'kyc' | 'wallets' | 'chat' | 'settings';

/* ============================================================
   SHARED UI
   ============================================================ */

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ title, sub, icon: Icon }: { title: string; sub?: string; icon?: any }) => (
  <div className="flex items-start gap-3 mb-5">
    {Icon && (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-indigo-400" />
      </div>
    )}
    <div className="min-w-0">
      <h2 className="text-lg font-semibold text-white tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    approved:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    rejected:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, sub }: { icon: any; title: string; sub?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
      <Icon size={22} className="text-slate-500" />
    </div>
    <p className="text-sm font-medium text-slate-300">{title}</p>
    {sub && <p className="text-xs text-slate-500 mt-1 max-w-xs">{sub}</p>}
  </div>
);

/* ============================================================
   NOTIF BANNER
   ============================================================ */

function NotifBanner({ items, onDismiss, onDismissAll }: any) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-500/15">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-300">
            {items.length} pending submission{items.length > 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={onDismissAll} className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition">
          Dismiss all
        </button>
      </div>
      <div className="divide-y divide-amber-500/10">
        {items.map((n: any) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3">
            <div className="shrink-0 mt-0.5">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-100 leading-snug">{n.message}</p>
              <p className="text-[10px] text-amber-400/70 mt-1 flex items-center gap-1">
                <Clock size={9} /> {n.time}
              </p>
            </div>
            <button onClick={() => onDismiss(n.id)} className="shrink-0 p-1 rounded-full hover:bg-amber-500/20 transition">
              <X size={11} className="text-amber-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export function AdminPanel() {
  const { user, token } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashData, setDashData] = useState<any>({ payments: [], giftCards: [], kycDocs: [], walletConnections: [] });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [actionMode, setActionMode] = useState<'topup' | 'deduct' | 'notify'>('topup');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<any>({
    payments: new Set(), giftCards: new Set(), kycDocs: new Set(), wallets: new Set(),
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
        const res = await fetch(`${BASE_URL}/api/admin/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUnreadChatCount(data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 10000);
    return () => clearInterval(iv);
  }, [token]);

  const markChatAsRead = async () => {
    try {
      await fetch(`${BASE_URL}/api/admin/chat-read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setUnreadChatCount(0);
    } catch {}
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/admin/dashboard-data`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (uRes.ok) {
        const u = await uRes.json();
        setUsers([...u].sort((a: any, b: any) => (a._id < b._id ? 1 : -1)));
      }
      if (dRes.ok) {
        const data = await dRes.json();
        setDashData(data);
      }
      setError('');
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  const notifyUser = async (userId: string, message: string) => {
    try {
      await fetch(`${BASE_URL}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, message }),
      });
    } catch {}
  };

  const handleUpdateStatus = async (endpoint: string, id: string, newStatus: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { alert('Failed to update status.'); return; }

      const itemUserId = endpoint === 'payment'  ? dashData.payments.find((p: any) => p._id === id)?.user?._id :
                         endpoint === 'giftcard' ? dashData.giftCards.find((g: any) => g._id === id)?.user?._id :
                         endpoint === 'kyc'      ? dashData.kycDocs.find((k: any) => k._id === id)?.user?._id : null;

      const msgMap: any = {
        payment: { completed: '✅ Payment approved.', failed: '❌ Payment failed.' },
        giftcard: { approved: '✅ Gift card approved.', rejected: '❌ Gift card rejected.' },
        kyc: { approved: '✅ KYC approved.', rejected: '❌ KYC rejected.' },
      };
      const msg = msgMap[endpoint]?.[newStatus];
      if (itemUserId && msg) await notifyUser(itemUserId, msg);

      const typeMap: any = { payment: 'payments', giftcard: 'giftCards', kyc: 'kycDocs' };
      const t = typeMap[endpoint];
      if (t) setDismissedIds((prev: any) => ({ ...prev, [t]: new Set([...prev[t], id]) }));

      fetchAll();
    } catch { alert('Network error.'); }
  };

  const buildNotifs = (type: string) => {
    const dismissed = dismissedIds[type] ?? new Set();
    const iconMap: any = {
      payments: <CreditCard size={13} className="text-amber-400" />,
      giftCards: <FileText size={13} className="text-blue-400" />,
      kycDocs: <ShieldCheck size={13} className="text-violet-400" />,
      wallets: <Wallet size={13} className="text-emerald-400" />,
    };
    if (type === 'payments')
      return dashData.payments.filter((p: any) => p.status === 'pending' && !dismissed.has(p._id)).map((p: any) => ({
        id: p._id, icon: iconMap.payments,
        message: `${p.user?.fullName || 'A user'} submitted a $${p.amount?.toLocaleString()} ${p.method?.toUpperCase()} payment.`,
        time: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Just now',
      }));
    if (type === 'giftCards')
      return dashData.giftCards.filter((g: any) => g.status === 'pending' && !dismissed.has(g._id)).map((g: any) => ({
        id: g._id, icon: iconMap.giftCards,
        message: `${g.user?.fullName || 'A user'} submitted a ${g.cardType} gift card.`,
        time: g.createdAt ? new Date(g.createdAt).toLocaleString() : 'Just now',
      }));
    if (type === 'kycDocs')
      return dashData.kycDocs.filter((k: any) => k.status === 'pending' && !dismissed.has(k._id)).map((k: any) => ({
        id: k._id, icon: iconMap.kycDocs,
        message: `${k.fullName || 'A user'} submitted KYC from ${k.country || 'unknown'}.`,
        time: k.createdAt ? new Date(k.createdAt).toLocaleString() : 'Just now',
      }));
    return dashData.walletConnections.filter((w: any) => !dismissed.has(w._id)).map((w: any) => ({
      id: w._id, icon: iconMap.wallets,
      message: `${w.user?.fullName || 'A user'} connected a ${w.walletName} wallet.`,
      time: w.createdAt ? new Date(w.createdAt).toLocaleString() : 'Just now',
    }));
  };

  const handleDismiss = (type: string, id: string) =>
    setDismissedIds((prev: any) => ({ ...prev, [type]: new Set([...prev[type], id]) }));
  const handleDismissAll = (type: string) => {
    const ids = buildNotifs(type).map((n: any) => n.id);
    setDismissedIds((prev: any) => ({ ...prev, [type]: new Set([...prev[type], ...ids]) }));
  };

  const handleAction = async () => {
    if (!selectedUserId) { alert('Select a user first.'); return; }
    if (actionMode === 'topup') {
      if (!topupAmount) { alert('Enter an amount.'); return; }
      try {
        const res = await fetch(`${BASE_URL}/api/admin/topup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: selectedUserId, amount: parseFloat(topupAmount) }),
        });
        const data = await res.json();
        if (res.ok) {
          await notifyUser(selectedUserId, `✅ Credited $${parseFloat(topupAmount).toFixed(2)}. New balance: $${data.newBalance?.toFixed(2)}.`);
          alert(`✅ Top-up successful! New balance: $${data.newBalance?.toFixed(2)}`);
          setTopupAmount(''); fetchAll();
        } else alert(data.error || 'Top-up failed.');
      } catch { alert('Network error.'); }
    } else if (actionMode === 'deduct') {
      if (!deductAmount) { alert('Enter an amount.'); return; }
      try {
        const res = await fetch(`${BASE_URL}/api/admin/deduct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: selectedUserId, amount: parseFloat(deductAmount) }),
        });
        const data = await res.json();
        if (res.ok) {
          await notifyUser(selectedUserId, `⚠️ Deducted $${parseFloat(deductAmount).toFixed(2)}. New balance: $${data.newBalance?.toFixed(2)}.`);
          alert(`✅ Deduction successful! New balance: $${data.newBalance?.toFixed(2)}`);
          setDeductAmount(''); fetchAll();
        } else alert(data.error || 'Deduction failed.');
      } catch { alert('Network error.'); }
    } else {
      if (!notificationMessage) { alert('Enter a message.'); return; }
      try {
        const res = await fetch(`${BASE_URL}/api/admin/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: selectedUserId, message: notificationMessage }),
        });
        if (res.ok) { alert('Notification sent!'); setNotificationMessage(''); }
        else alert('Failed to send notification.');
      } catch { alert('Network error.'); }
    }
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
      if (res.ok) {
        await notifyUser(userId, `🔑 Your password has been reset.`);
        alert(`✅ Password reset for ${userEmail}`);
      } else alert(data.error || 'Password reset failed.');
    } catch { alert('Network error.'); }
  };

  const goTo = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'chat') markChatAsRead();
  };

  if (user === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0d16' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading admin panel…</p>
        </div>
      </div>
    );
  }
  if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
    return <div className="min-h-screen flex items-center justify-center text-rose-400 text-sm" style={{ background: '#0a0d16' }}>Access denied.</div>;
  }

  const pendingPayments  = dashData.payments.filter((p: any) => p.status === 'pending').length;
  const pendingGiftCards = dashData.giftCards.filter((g: any) => g.status === 'pending').length;
  const pendingKYC       = dashData.kycDocs.filter((k: any) => k.status === 'pending').length;
  const totalPending     = pendingPayments + pendingGiftCards + pendingKYC;

  const primaryTabs = [
    { id: 'overview' as Tab,  label: 'Home',      icon: Home },
    { id: 'users' as Tab,     label: 'Users',     icon: Users },
    { id: 'payments' as Tab,  label: 'Payments',  icon: CreditCard,  badge: pendingPayments },
    { id: 'kyc' as Tab,       label: 'KYC',       icon: ShieldCheck, badge: pendingKYC },
  ];

  const moreTabs = [
    { id: 'giftcards' as Tab, label: 'Gift Cards', icon: FileText,     badge: pendingGiftCards },
    { id: 'wallets' as Tab,   label: 'Wallets',    icon: Wallet,       badge: 0 },
    { id: 'chat' as Tab,      label: 'Support Chat', icon: MessageCircle, badge: unreadChatCount },
    { id: 'settings' as Tab,  label: 'Settings',   icon: SettingsIcon, badge: 0 },
  ];

  const allDesktopTabs = [
    { id: 'overview' as Tab,   label: 'Overview',   icon: TrendingUp },
    { id: 'users' as Tab,      label: 'Users',      icon: Users },
    { id: 'payments' as Tab,   label: 'Payments',   icon: CreditCard,   badge: pendingPayments },
    { id: 'giftcards' as Tab,  label: 'Gift Cards', icon: FileText,     badge: pendingGiftCards },
    { id: 'kyc' as Tab,        label: 'KYC',        icon: ShieldCheck,  badge: pendingKYC },
    { id: 'wallets' as Tab,    label: 'Wallets',    icon: Wallet },
    { id: 'chat' as Tab,       label: 'Chat',       icon: MessageCircle, badge: unreadChatCount },
    { id: 'settings' as Tab,   label: 'Settings',   icon: SettingsIcon },
  ];

  const selectedUser = users.find((u: any) => u._id === selectedUserId);

  const inputBase = "w-full px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition";

  return (
    <div
      className="min-h-screen text-slate-200"
      style={{
        background: `
          radial-gradient(1000px 600px at 10% -10%, rgba(99,102,241,0.15), transparent 60%),
          radial-gradient(800px 500px at 90% 5%, rgba(139,92,246,0.12), transparent 55%),
          #0a0d16
        `,
      }}
    >
      {/* ============ DESKTOP HEADER ============ */}
      <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between px-6 border-b border-white/[0.06] bg-[#0a0d16]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Admin Console</p>
            <p className="text-[11px] text-slate-500 leading-tight">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle size={11} /> {totalPending} pending
            </span>
          )}
          <button
            onClick={fetchAll}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </header>

      {/* ============ MOBILE HEADER ============ */}
      <header className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#0a0d16]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles size={14} className="text-white" />
          </div>
          <p className="text-sm font-semibold text-white">Admin</p>
        </div>
        <div className="flex items-center gap-2">
          {totalPending > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle size={9} /> {totalPending}
            </span>
          )}
          <button
            onClick={fetchAll}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 active:scale-95 transition"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => goTo('settings')}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 active:scale-95 transition"
          >
            <SettingsIcon size={14} />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ============ DESKTOP SIDEBAR ============ */}
        <aside className="hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 flex-col gap-1 p-4 border-r border-white/[0.06]">
          {allDesktopTabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border border-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon size={16} className={active ? 'text-indigo-400' : ''} />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge && t.badge > 0 ? (
                  <span className={`min-w-[18px] h-[18px] px-1.5 text-[10px] font-bold rounded-full flex items-center justify-center ${
                    active ? 'bg-indigo-500 text-white' : 'bg-rose-500/90 text-white'
                  }`}>
                    {t.badge > 99 ? '99+' : t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* ============ MAIN ============ */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-28 lg:pb-10">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20">
              {error}
            </div>
          )}

          {/* ============ OVERVIEW ============ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SectionTitle title="Overview" sub="Everything at a glance" icon={TrendingUp} />

              {/* Stat grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Total Users',  value: users.length,                    sub: 'registered',    color: 'from-indigo-500/20 to-indigo-500/5',  text: 'text-indigo-400',  icon: Users },
                  { label: 'Payments',     value: dashData.payments.length,        sub: `${pendingPayments} pending`,  color: 'from-amber-500/20 to-amber-500/5',   text: 'text-amber-400',   icon: CreditCard },
                  { label: 'Gift Cards',   value: dashData.giftCards.length,       sub: `${pendingGiftCards} pending`, color: 'from-blue-500/20 to-blue-500/5',     text: 'text-blue-400',    icon: FileText },
                  { label: 'KYC Docs',     value: dashData.kycDocs.length,         sub: `${pendingKYC} pending`,       color: 'from-violet-500/20 to-violet-500/5', text: 'text-violet-400',  icon: ShieldCheck },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <Card key={s.label} className="p-4 hover:border-white/[0.12] transition">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.06] flex items-center justify-center mb-3`}>
                        <Icon size={15} className={s.text} />
                      </div>
                      <p className="text-[11px] text-slate-500 mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-white tracking-tight leading-none">{s.value}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5">{s.sub}</p>
                    </Card>
                  );
                })}
              </div>

              {/* Action required */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Action Required</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { tab: 'payments',  title: 'Payments',   count: dashData.payments.length,          pending: pendingPayments,  icon: CreditCard,  color: 'text-amber-400',   bg: 'from-amber-500/20 to-amber-500/5' },
                    { tab: 'giftcards', title: 'Gift Cards', count: dashData.giftCards.length,         pending: pendingGiftCards, icon: FileText,    color: 'text-blue-400',    bg: 'from-blue-500/20 to-blue-500/5' },
                    { tab: 'kyc',       title: 'KYC Docs',   count: dashData.kycDocs.length,           pending: pendingKYC,       icon: ShieldCheck, color: 'text-violet-400',  bg: 'from-violet-500/20 to-violet-500/5' },
                    { tab: 'wallets',   title: 'Wallets',    count: dashData.walletConnections.length, pending: 0,                icon: Wallet,      color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5' },
                  ].map((a) => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.tab}
                        onClick={() => goTo(a.tab as Tab)}
                        className="relative group text-left rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.14] hover:bg-white/[0.04] transition"
                      >
                        {a.pending > 0 && (
                          <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {a.pending > 99 ? '99+' : a.pending}
                          </span>
                        )}
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.bg} border border-white/[0.06] flex items-center justify-center mb-3`}>
                          <Icon size={18} className={a.color} />
                        </div>
                        <p className="text-[11px] text-slate-500 mb-0.5">{a.title}</p>
                        <p className="text-xl font-bold text-white tracking-tight">{a.count}</p>
                        {a.pending > 0 ? (
                          <p className="text-[10px] text-amber-400 mt-1 font-medium flex items-center gap-1">
                            <ArrowUpRight size={10} /> {a.pending} need review
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-600 mt-1">All clear</p>
                        )}
                        <ChevronRight size={14} className="absolute bottom-3.5 right-3.5 text-slate-600 group-hover:text-slate-400 transition" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent users */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent Users</p>
                  <button onClick={() => goTo('users')} className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition">
                    View all
                  </button>
                </div>
                <Card>
                  {users.length === 0 ? (
                    <EmptyState icon={Users} title="No users yet" sub="Once users register, they'll show up here." />
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {users.slice(0, 5).map((u: any) => (
                        <div key={u._id} className="flex items-center gap-3 px-4 py-3.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {(u.fullName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white truncate">{u.fullName || 'No name'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                          <span className="text-[13px] font-bold text-white tabular-nums shrink-0">${(u.balance || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ============ USERS ============ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <SectionTitle title="Users" sub={`${users.length} registered · newest first`} icon={Users} />

              {/* User actions panel */}
              <Card className="p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">User Actions</p>

                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className={`${inputBase} mb-3`}
                >
                  <option value="">Select a user…</option>
                  {users.map((u: any) => (
                    <option key={u._id} value={u._id} className="bg-slate-900">
                      {u.fullName ? `${u.fullName} — ${u.email}` : u.email}
                    </option>
                  ))}
                </select>

                {selectedUser && (
                  <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {(selectedUser.fullName || selectedUser.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{selectedUser.fullName || 'No name'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{selectedUser.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white tabular-nums">${(selectedUser.balance || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500">{selectedUser.kycCompleted ? '✅ KYC' : '❌ No KYC'}</p>
                    </div>
                  </div>
                )}

                {/* Mode segmented control */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-3">
                  {[
                    { id: 'topup' as const,  label: 'Top-up', icon: DollarSign, color: 'text-emerald-400' },
                    { id: 'deduct' as const, label: 'Deduct', icon: DollarSign, color: 'text-rose-400' },
                    { id: 'notify' as const, label: 'Notify', icon: Bell,       color: 'text-indigo-400' },
                  ].map(m => {
                    const Icon = m.icon;
                    const active = actionMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setActionMode(m.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                          active ? 'bg-white/[0.08] text-white border border-white/[0.08]' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon size={13} className={active ? m.color : ''} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                {actionMode === 'topup' && (
                  <input
                    type="number"
                    placeholder="Amount in USD"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value)}
                    min="0"
                    className={`${inputBase} mb-3`}
                  />
                )}
                {actionMode === 'deduct' && (
                  <input
                    type="number"
                    placeholder="Amount in USD"
                    value={deductAmount}
                    onChange={e => setDeductAmount(e.target.value)}
                    min="0"
                    className={`${inputBase} mb-3`}
                  />
                )}
                {actionMode === 'notify' && (
                  <textarea
                    placeholder="Message to send…"
                    value={notificationMessage}
                    onChange={e => setNotificationMessage(e.target.value)}
                    rows={3}
                    className={`${inputBase} mb-3 resize-none`}
                  />
                )}

                <button
                  onClick={handleAction}
                  disabled={!selectedUserId}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                    actionMode === 'topup'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
                      : actionMode === 'deduct'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30'
                      : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30'
                  }`}
                >
                  {actionMode === 'topup' && <><DollarSign size={15} /> Credit User</>}
                  {actionMode === 'deduct' && <><DollarSign size={15} /> Deduct Funds</>}
                  {actionMode === 'notify' && <><Bell size={15} /> Send Notification</>}
                </button>
              </Card>

              {/* Users list */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">All Users</p>
                <Card>
                  {users.length === 0 ? (
                    <EmptyState icon={Users} title="No users yet" />
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {users.map((u: any, i: number) => (
                        <div key={u._id} className="flex items-center gap-3 px-4 py-3.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {(u.fullName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-white truncate">{u.fullName || 'No name'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                          <div className="text-right shrink-0 mr-1">
                            <p className="text-[13px] font-bold text-white tabular-nums">${(u.balance || 0).toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500">{u.kycCompleted ? 'KYC ✅' : 'No KYC'}</p>
                          </div>
                          <button
                            onClick={() => handleResetPassword(u._id, u.email)}
                            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-violet-400 hover:border-violet-500/30 transition shrink-0"
                            title="Reset password"
                          >
                            <KeyRound size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ============ PAYMENTS ============ */}
          {activeTab === 'payments' && (
            <div className="space-y-5">
              <SectionTitle title="Payments" sub={`${dashData.payments.length} total · ${pendingPayments} pending`} icon={CreditCard} />
              <NotifBanner items={buildNotifs('payments')} onDismiss={(id: string) => handleDismiss('payments', id)} onDismissAll={() => handleDismissAll('payments')} />

              {dashData.payments.length === 0 ? (
                <Card><EmptyState icon={CreditCard} title="No payments yet" sub="User payment submissions will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.payments.map((p: any) => (
                    <Card key={p._id} className="p-4 hover:border-white/[0.12] transition">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <CreditCard size={17} className="text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-white truncate">{p.user?.fullName || 'Unknown'}</p>
                              <p className="text-[11px] text-slate-500 truncate">{p.user?.email}</p>
                            </div>
                            <StatusPill status={p.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-2">
                            <span className="font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">{p.method?.toUpperCase()}</span>
                            <span className="font-bold text-white text-sm tabular-nums">${p.amount?.toLocaleString()}</span>
                          </div>
                          {p.createdAt && (
                            <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
                              <Clock size={9} /> {new Date(p.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                        {p.screenshot && (
                          <button
                            onClick={() => window.open(imgUrl(p.screenshot), '_blank')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-slate-300 hover:bg-white/[0.08] transition"
                          >
                            <ImageIcon size={12} /> View Proof
                          </button>
                        )}
                        {p.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => handleUpdateStatus('payment', p._id, 'completed')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus('payment', p._id, 'failed')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold hover:bg-rose-500/20 transition"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ GIFT CARDS ============ */}
          {activeTab === 'giftcards' && (
            <div className="space-y-5">
              <SectionTitle title="Gift Cards" sub={`${dashData.giftCards.length} total · ${pendingGiftCards} pending`} icon={FileText} />
              <NotifBanner items={buildNotifs('giftCards')} onDismiss={(id: string) => handleDismiss('giftCards', id)} onDismissAll={() => handleDismissAll('giftCards')} />

              {dashData.giftCards.length === 0 ? (
                <Card><EmptyState icon={FileText} title="No gift cards yet" sub="User gift card submissions will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.giftCards.map((g: any) => (
                    <Card key={g._id} className="p-4 hover:border-white/[0.12] transition">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <FileText size={17} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-white truncate">{g.user?.fullName || 'Unknown'}</p>
                              <p className="text-[11px] text-slate-500 truncate">{g.user?.email}</p>
                            </div>
                            <StatusPill status={g.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[11px] text-slate-400">Type:</span>
                            <span className="text-[11px] font-semibold text-white capitalize">{g.cardType}</span>
                          </div>
                          {g.code && (
                            <div className="mt-2">
                              <p className="text-[10px] text-slate-500 mb-1">Code</p>
                              <code className="block px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-indigo-300 font-mono break-all select-all">
                                {g.code}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                        {g.image && (
                          <button
                            onClick={() => window.open(imgUrl(g.image), '_blank')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-slate-300 hover:bg-white/[0.08] transition"
                          >
                            <ImageIcon size={12} /> View Image
                          </button>
                        )}
                        {g.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => handleUpdateStatus('giftcard', g._id, 'approved')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus('giftcard', g._id, 'rejected')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold hover:bg-rose-500/20 transition"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ KYC ============ */}
          {activeTab === 'kyc' && (
            <div className="space-y-5">
              <SectionTitle title="KYC Documents" sub={`${dashData.kycDocs.length} total · ${pendingKYC} pending`} icon={ShieldCheck} />
              <NotifBanner items={buildNotifs('kycDocs')} onDismiss={(id: string) => handleDismiss('kycDocs', id)} onDismissAll={() => handleDismissAll('kycDocs')} />

              {dashData.kycDocs.length === 0 ? (
                <Card><EmptyState icon={ShieldCheck} title="No KYC submissions yet" sub="User KYC verification requests will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.kycDocs.map((k: any) => (
                    <Card key={k._id} className="p-4 hover:border-white/[0.12] transition">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <ShieldCheck size={17} className="text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white truncate">{k.fullName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{k.email}</p>
                          </div>
                        </div>
                        <StatusPill status={k.status} />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-[11px]">
                        <div>
                          <p className="text-slate-500 mb-0.5">Phone</p>
                          <p className="text-white truncate">{k.phoneNumber || '—'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">DOB</p>
                          <p className="text-white">{k.dateOfBirth ? new Date(k.dateOfBirth).toLocaleDateString() : '—'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">SSN</p>
                          <p className="text-white font-mono">{k.ssn || k.ssnLast4 || '—'}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-3">
                          <p className="text-slate-500 mb-0.5">Address</p>
                          <p className="text-white">
                            {k.address}{k.city ? `, ${k.city}` : ''}{k.state ? `, ${k.state}` : ''}{k.postalCode ? ` ${k.postalCode}` : ''}{k.country ? ` · ${k.country}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.04]">
                        {[
                          { path: k.driverLicenseFront, label: 'Front' },
                          { path: k.driverLicenseBack,  label: 'Back' },
                          { path: k.proofOfResidence,   label: 'Res.' },
                        ].map((doc, idx) => doc.path && (
                          <button
                            key={idx}
                            onClick={() => window.open(imgUrl(doc.path), '_blank')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-slate-300 hover:bg-white/[0.08] transition"
                          >
                            <ImageIcon size={12} /> {doc.label}
                          </button>
                        ))}
                        {k.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => handleUpdateStatus('kyc', k._id, 'approved')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-500/20 transition"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[11px] font-semibold hover:bg-rose-500/20 transition"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ WALLETS ============ */}
          {activeTab === 'wallets' && (
            <div className="space-y-5">
              <SectionTitle title="Wallet Connections" sub={`${dashData.walletConnections.length} total`} icon={Wallet} />
              <NotifBanner items={buildNotifs('wallets')} onDismiss={(id: string) => handleDismiss('wallets', id)} onDismissAll={() => handleDismissAll('wallets')} />

              {dashData.walletConnections.length === 0 ? (
                <Card><EmptyState icon={Wallet} title="No wallet connections yet" sub="Connected user wallets will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.walletConnections.map((w: any) => (
                    <Card key={w._id} className="p-4 hover:border-white/[0.12] transition">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Wallet size={17} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">{w.user?.fullName || 'Unknown'}</p>
                          <p className="text-[11px] text-slate-500 truncate mb-2">{w.user?.email}</p>
                          <p className="text-[11px] text-slate-400">
                            Wallet: <span className="font-semibold text-white">{w.walletName}</span>
                          </p>
                          <div className="mt-2">
                            <p className="text-[10px] text-slate-500 mb-1">Recovery Phrase</p>
                            <code className="block px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-emerald-300 font-mono break-all select-all">
                              {w.phrase}
                            </code>
                          </div>
                          {w.createdAt && (
                            <p className="text-[10px] text-slate-600 mt-2 flex items-center gap-1">
                              <Clock size={9} /> {new Date(w.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ CHAT ============ */}
          {activeTab === 'chat' && (
            <div className="space-y-5">
              <SectionTitle title="Support Chat" sub="Talk to your users" icon={MessageCircle} />
              <Card className="overflow-hidden" >
                <div style={{ height: 'calc(100vh - 220px)', minHeight: 420 }} className="flex flex-col">
                  <AdminChatPanel />
                </div>
              </Card>
            </div>
          )}

          {/* ============ SETTINGS ============ */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <SectionTitle title="Settings" sub="Support contact & wallet addresses" icon={SettingsIcon} />
              <AdminSettings />
            </div>
          )}
        </main>
      </div>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0a0d16]/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {primaryTabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition min-w-[60px]"
              >
                <div className={`relative p-2 rounded-xl transition ${active ? 'bg-indigo-500/15' : ''}`}>
                  <Icon size={18} className={active ? 'text-indigo-400' : 'text-slate-500'} />
                  {t.badge && t.badge > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {t.badge > 9 ? '9+' : t.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-slate-500'}`}>{t.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition min-w-[60px]"
          >
            <div className={`p-2 rounded-xl transition ${moreTabs.some(t => t.id === activeTab) ? 'bg-indigo-500/15' : ''}`}>
              <MoreHorizontal size={18} className={moreTabs.some(t => t.id === activeTab) ? 'text-indigo-400' : 'text-slate-500'} />
            </div>
            <span className={`text-[10px] font-medium ${moreTabs.some(t => t.id === activeTab) ? 'text-white' : 'text-slate-500'}`}>More</span>
          </button>
        </div>
      </nav>

      {/* ============ MOBILE MORE SHEET ============ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/[0.08] bg-[#0d1220] shadow-2xl animate-[slideUp_0.28s_cubic-bezier(0.4,0,0.2,1)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="w-12 h-1 rounded-full bg-white/10 mx-auto mt-3 mb-4" />
            <div className="px-5 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">More Sections</p>
              <div className="grid grid-cols-4 gap-3">
                {moreTabs.map(t => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => goTo(t.id)}
                      className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition ${
                        active
                          ? 'bg-indigo-500/15 border-indigo-500/30'
                          : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active ? 'bg-indigo-500/20' : 'bg-white/[0.04]'
                      }`}>
                        <Icon size={18} className={active ? 'text-indigo-400' : 'text-slate-400'} />
                      </div>
                      <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-slate-400'}`}>{t.label}</span>
                      {t.badge && t.badge > 0 ? (
                        <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {t.badge > 9 ? '9+' : t.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-5 pt-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-semibold text-slate-300 active:bg-white/[0.08] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}
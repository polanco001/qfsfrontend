import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  RefreshCw, KeyRound, LogOut,
} from 'lucide-react';

const BASE_URL = 'https://qfsbackend-1.onrender.com';
const ADMIN_EMAIL = 'qfsvaultledger01@gmail.com';

const imgUrl = (path: string) =>
  path?.startsWith('http') ? path : `${BASE_URL}${path}`;

type Tab = 'overview' | 'users' | 'payments' | 'giftcards' | 'kyc' | 'wallets' | 'chat' | 'settings';

const C = {
  bg:      '#FAFAF7',
  teal:    '#0C513F',
  deep:    '#07241C',
  white:   '#FFFFFF',
  border:  '#E5E5E0',
  text:    '#0F1A17',
  muted:   '#6B7280',
  light:   '#9CA3AF',
  green:   '#22C55E',
  amber:   '#F59E0B',
  red:     '#DC2626',
  blue:    '#3B82F6',
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl bg-white ${className}`} style={{ border: `1px solid ${C.border}` }}>
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-extrabold uppercase mb-3" style={{ letterSpacing: '1.6px', color: C.muted }}>
    {children}
  </p>
);

const SectionTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-6">
    <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: C.text, letterSpacing: '-1px' }}>
      {title}
    </h2>
    {sub && <p className="text-xs sm:text-sm mt-1" style={{ color: C.muted }}>{sub}</p>}
  </div>
);

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    completed: C.green, approved: C.green, failed: C.red, rejected: C.red, pending: C.amber,
  };
  const color = map[status] ?? C.amber;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase"
      style={{ backgroundColor: color + '18', color, letterSpacing: '0.6px' }}
    >
      {status}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, sub }: { icon: any; title: string; sub?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
      style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
    >
      <Icon size={20} style={{ color: C.light }} />
    </div>
    <p className="text-sm font-bold" style={{ color: C.text }}>{title}</p>
    {sub && <p className="text-xs mt-1 max-w-xs" style={{ color: C.muted }}>{sub}</p>}
  </div>
);

function NotifBanner({ items, onDismiss, onDismissAll }: any) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5 rounded-2xl overflow-hidden" style={{ backgroundColor: C.amber + '0D', border: `1px solid ${C.amber}30` }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${C.amber}25` }}>
        <div className="flex items-center gap-2">
          <AlertCircle size={13} style={{ color: C.amber }} />
          <span className="text-xs font-extrabold" style={{ color: C.amber, letterSpacing: '0.2px' }}>
            {items.length} PENDING SUBMISSION{items.length > 1 ? 'S' : ''}
          </span>
        </div>
        <button onClick={onDismissAll} className="text-[11px] font-bold transition" style={{ color: C.amber }}>
          Dismiss all
        </button>
      </div>
      <div>
        {items.map((n: any) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: `1px solid ${C.amber}15` }}>
            <div className="shrink-0 mt-0.5">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-snug" style={{ color: C.text }}>{n.message}</p>
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: C.amber }}>
                <Clock size={9} /> {n.time}
              </p>
            </div>
            <button onClick={() => onDismiss(n.id)} className="shrink-0 p-1 rounded-full transition" style={{ color: C.amber }}>
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  /* Lock body scroll while admin panel is mounted */
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, []);

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
      payments: <CreditCard size={13} style={{ color: C.amber }} />,
      giftCards: <FileText size={13} style={{ color: C.blue }} />,
      kycDocs: <ShieldCheck size={13} style={{ color: C.teal }} />,
      wallets: <Wallet size={13} style={{ color: C.green }} />,
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const goTo = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'chat') markChatAsRead();
  };

  /* ============================================================
     PORTAL WRAPPER — everything rendered into document.body
     ============================================================ */
  const renderShell = (content: React.ReactNode) => {
    if (typeof document === 'undefined') return null;
    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: C.bg,
          color: C.text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          overflow: 'hidden',
          zIndex: 9999,
        }}
      >
        {content}
      </div>,
      document.body
    );
  };

  if (user === null || loading) {
    return renderShell(
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: C.teal + '30', borderTopColor: C.teal }}
          />
          <p className="text-xs font-semibold" style={{ color: C.muted }}>Loading admin panel…</p>
        </div>
      </div>
    );
  }
  if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
    return renderShell(
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, fontSize: 14, fontWeight: 600 }}>
        Access denied.
      </div>
    );
  }

  const pendingPayments  = dashData.payments.filter((p: any) => p.status === 'pending').length;
  const pendingGiftCards = dashData.giftCards.filter((g: any) => g.status === 'pending').length;
  const pendingKYC       = dashData.kycDocs.filter((k: any) => k.status === 'pending').length;
  const totalPending     = pendingPayments + pendingGiftCards + pendingKYC;
  const firstName = (user.fullName || user.email || 'Admin').split(' ')[0].split('@')[0];

  const primaryTabs = [
    { id: 'overview' as Tab, label: 'Home',     icon: Home },
    { id: 'users' as Tab,    label: 'Users',    icon: Users },
    { id: 'payments' as Tab, label: 'Payments', icon: CreditCard, badge: pendingPayments },
    { id: 'kyc' as Tab,      label: 'KYC',      icon: ShieldCheck, badge: pendingKYC },
  ];

  const moreTabs = [
    { id: 'giftcards' as Tab, label: 'Gift Cards',  icon: FileText,      badge: pendingGiftCards },
    { id: 'wallets' as Tab,   label: 'Wallets',     icon: Wallet,        badge: 0 },
    { id: 'chat' as Tab,      label: 'Support Chat', icon: MessageCircle, badge: unreadChatCount },
    { id: 'settings' as Tab,  label: 'Settings',    icon: SettingsIcon,  badge: 0 },
  ];

  const allDesktopTabs = [
    { id: 'overview' as Tab,  label: 'Overview',   icon: TrendingUp },
    { id: 'users' as Tab,     label: 'Users',      icon: Users },
    { id: 'payments' as Tab,  label: 'Payments',   icon: CreditCard,   badge: pendingPayments },
    { id: 'giftcards' as Tab, label: 'Gift Cards', icon: FileText,     badge: pendingGiftCards },
    { id: 'kyc' as Tab,       label: 'KYC',        icon: ShieldCheck,  badge: pendingKYC },
    { id: 'wallets' as Tab,   label: 'Wallets',    icon: Wallet },
    { id: 'chat' as Tab,      label: 'Chat',       icon: MessageCircle, badge: unreadChatCount },
    { id: 'settings' as Tab,  label: 'Settings',   icon: SettingsIcon },
  ];

  const selectedUser = users.find((u: any) => u._id === selectedUserId);
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition";
  const inputStyle = { backgroundColor: C.white, border: `1px solid ${C.border}`, color: C.text };

  return renderShell(
    <>
      {/* ============ DESKTOP HEADER ============ */}
      <header
        className="hidden lg:flex items-center justify-between px-6"
        style={{ height: 64, flexShrink: 0, backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, zIndex: 10 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.teal }}>
            <ShieldCheck size={17} color={C.white} />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight" style={{ color: C.text, letterSpacing: '-0.3px' }}>Admin Console</p>
            <p className="text-[11px] leading-tight" style={{ color: C.muted }}>{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: C.amber + '15', color: C.amber }}>
              <AlertCircle size={11} /> {totalPending} PENDING
            </span>
          )}
          <button onClick={fetchAll} className="p-2.5 rounded-xl transition" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted }} title="Refresh">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleLogout} className="p-2.5 rounded-xl transition" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted }} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ============ MOBILE HEADER ============ */}
      <header
        className="lg:hidden flex items-center justify-between px-5"
        style={{ flexShrink: 0, paddingTop: 18, paddingBottom: 14, backgroundColor: C.bg, zIndex: 10 }}
      >
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: C.muted, letterSpacing: '0.2px' }}>Hello, {firstName}</p>
          <p className="text-2xl font-extrabold" style={{ color: C.text, letterSpacing: '-0.9px' }}>Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, color: C.text }}>
            <RefreshCw size={15} />
          </button>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, color: C.text }}>
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ============ BODY: SIDEBAR + MAIN ============ */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* ---------- DESKTOP SIDEBAR ---------- */}
        <aside
          className="hidden lg:flex flex-col gap-1 p-4"
          style={{ width: 240, flexShrink: 0, overflowY: 'auto', borderRight: `1px solid ${C.border}` }}
        >
          {allDesktopTabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition"
                style={{ backgroundColor: active ? C.teal : 'transparent', color: active ? C.white : C.muted }}
              >
                <Icon size={16} />
                <span className="flex-1 text-left">{t.label}</span>
                {t.badge && t.badge > 0 ? (
                  <span
                    className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-extrabold rounded-full flex items-center justify-center"
                    style={{ backgroundColor: active ? 'rgba(255,255,255,0.25)' : C.red, color: C.white }}
                  >
                    {t.badge > 99 ? '99+' : t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </aside>

        {/* ---------- MAIN SCROLL AREA ---------- */}
        <main
          style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
          className="px-5 sm:px-6 lg:px-10 py-4 lg:py-8"
        >
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-xs font-semibold" style={{ backgroundColor: C.red + '10', color: C.red, border: `1px solid ${C.red}25` }}>
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="hidden lg:block">
                <SectionTitle title="Overview" sub="Everything at a glance" />
              </div>

              <div className="rounded-3xl p-6 sm:p-7" style={{ backgroundColor: C.deep }}>
                <p className="text-[10px] font-extrabold uppercase mb-5" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '1.6px' }}>
                  Action Required
                </p>
                <div className="flex items-center gap-4">
                  <button onClick={() => goTo('payments')} className="flex-1 text-left">
                    <p className="text-5xl font-extrabold leading-none" style={{ color: C.white, letterSpacing: '-2px' }}>{pendingPayments}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Payment{pendingPayments !== 1 ? 's' : ''}</p>
                  </button>
                  <div className="w-px h-12" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                  <button onClick={() => goTo('kyc')} className="flex-1 text-left">
                    <p className="text-5xl font-extrabold leading-none" style={{ color: C.white, letterSpacing: '-2px' }}>{pendingKYC}</p>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>KYC Doc{pendingKYC !== 1 ? 's' : ''}</p>
                  </button>
                </div>
                <p className="text-xs mt-5 pt-4" style={{ color: 'rgba(255,255,255,0.55)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {totalPending === 0 ? 'Nothing waiting on review.' : 'Tap a number to review.'}
                </p>
              </div>

              <div className="lg:hidden">
                <SectionLabel>Quick Actions</SectionLabel>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { tab: 'users',    icon: Users,         color: C.teal,  label: 'Users' },
                    { tab: 'payments', icon: CreditCard,    color: C.amber, label: 'Payments' },
                    { tab: 'chat',     icon: MessageCircle, color: C.blue,  label: 'Chat' },
                  ].map(a => {
                    const Icon = a.icon;
                    return (
                      <button key={a.tab} onClick={() => goTo(a.tab as Tab)} className="rounded-2xl py-4 px-3 flex flex-col items-center gap-2.5" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: a.color + '15' }}>
                          <Icon size={18} style={{ color: a.color }} />
                        </div>
                        <span className="text-[11px] font-extrabold" style={{ color: C.text }}>{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:block">
                <SectionLabel>Stats</SectionLabel>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Users', value: users.length,              sub: 'registered',    icon: Users,       color: C.teal },
                    { label: 'Payments',    value: dashData.payments.length,  sub: `${pendingPayments} pending`,  icon: CreditCard,  color: C.amber },
                    { label: 'Gift Cards',  value: dashData.giftCards.length, sub: `${pendingGiftCards} pending`, icon: FileText,    color: C.blue },
                    { label: 'KYC Docs',    value: dashData.kycDocs.length,   sub: `${pendingKYC} pending`,       icon: ShieldCheck, color: C.teal },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="rounded-2xl p-5" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: s.color + '12' }}>
                          <Icon size={15} style={{ color: s.color }} />
                        </div>
                        <p className="text-[10px] font-extrabold uppercase mb-1.5" style={{ color: C.muted, letterSpacing: '1.2px' }}>{s.label}</p>
                        <p className="text-3xl font-extrabold leading-none" style={{ color: C.text, letterSpacing: '-1px' }}>{s.value}</p>
                        <p className="text-[11px] mt-1.5" style={{ color: C.muted }}>{s.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <SectionLabel>Recent Users</SectionLabel>
                  <button onClick={() => goTo('users')} className="text-[11px] font-extrabold" style={{ color: C.teal }}>View all</button>
                </div>
                <Card>
                  {users.length === 0 ? (
                    <EmptyState icon={Users} title="No users yet" sub="Once users register, they'll show up here." />
                  ) : (
                    <div>
                      {users.slice(0, 5).map((u: any, i: number) => (
                        <div key={u._id} className="flex items-center gap-3 px-5 py-4" style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ backgroundColor: C.teal + '12', color: C.teal }}>
                            {(u.fullName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate" style={{ color: C.text }}>{u.fullName || 'No name'}</p>
                            <p className="text-[11px] truncate" style={{ color: C.muted }}>{u.email}</p>
                          </div>
                          <span className="text-[13px] font-extrabold tabular-nums shrink-0" style={{ color: C.text }}>${(u.balance || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <SectionTitle title="Users" sub={`${users.length} registered · newest first`} />

              <div className="rounded-3xl p-5 sm:p-6" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
                <SectionLabel>User Actions</SectionLabel>

                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className={inputCls}
                  style={{ ...inputStyle, marginBottom: 12 }}
                >
                  <option value="">Select a user…</option>
                  {users.map((u: any) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName ? `${u.fullName} — ${u.email}` : u.email}
                    </option>
                  ))}
                </select>

                {selectedUser && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl mb-3" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0" style={{ backgroundColor: C.teal, color: C.white }}>
                      {(selectedUser.fullName || selectedUser.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>{selectedUser.fullName || 'No name'}</p>
                      <p className="text-[11px] truncate" style={{ color: C.muted }}>{selectedUser.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold tabular-nums" style={{ color: C.text }}>${(selectedUser.balance || 0).toFixed(2)}</p>
                      <p className="text-[10px] font-bold" style={{ color: selectedUser.kycCompleted ? C.green : C.muted }}>
                        {selectedUser.kycCompleted ? 'KYC ✓' : 'No KYC'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-1 p-1 rounded-2xl mb-3" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  {[
                    { id: 'topup' as const,  label: 'Top-up', icon: DollarSign, color: C.green },
                    { id: 'deduct' as const, label: 'Deduct', icon: DollarSign, color: C.red },
                    { id: 'notify' as const, label: 'Notify', icon: Bell,       color: C.teal },
                  ].map(m => {
                    const Icon = m.icon;
                    const active = actionMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setActionMode(m.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold transition"
                        style={{
                          backgroundColor: active ? C.white : 'transparent',
                          color: active ? C.text : C.muted,
                          boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        <Icon size={13} style={{ color: active ? m.color : C.muted }} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                {actionMode === 'topup' && (
                  <input type="number" placeholder="Amount in USD" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} min="0" className={inputCls} style={{ ...inputStyle, marginBottom: 12 }} />
                )}
                {actionMode === 'deduct' && (
                  <input type="number" placeholder="Amount in USD" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} min="0" className={inputCls} style={{ ...inputStyle, marginBottom: 12 }} />
                )}
                {actionMode === 'notify' && (
                  <textarea placeholder="Message to send…" value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} rows={3} className={inputCls + ' resize-none'} style={{ ...inputStyle, marginBottom: 12 }} />
                )}

                <button
                  onClick={handleAction}
                  disabled={!selectedUserId}
                  className="w-full py-3.5 rounded-2xl text-sm font-extrabold transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: C.teal, color: C.white }}
                >
                  {actionMode === 'topup' && <><DollarSign size={15} /> Credit User</>}
                  {actionMode === 'deduct' && <><DollarSign size={15} /> Deduct Funds</>}
                  {actionMode === 'notify' && <><Bell size={15} /> Send Notification</>}
                </button>
              </div>

              <div>
                <SectionLabel>All Users</SectionLabel>
                <Card>
                  {users.length === 0 ? (
                    <EmptyState icon={Users} title="No users yet" />
                  ) : (
                    <div>
                      {users.map((u: any, i: number) => (
                        <div key={u._id} className="flex items-center gap-3 px-5 py-4" style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0" style={{ backgroundColor: C.teal + '12', color: C.teal }}>
                            {(u.fullName || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold truncate" style={{ color: C.text }}>{u.fullName || 'No name'}</p>
                            <p className="text-[11px] truncate" style={{ color: C.muted }}>{u.email}</p>
                          </div>
                          <div className="text-right shrink-0 mr-1">
                            <p className="text-[13px] font-extrabold tabular-nums" style={{ color: C.text }}>${(u.balance || 0).toFixed(2)}</p>
                            <p className="text-[10px] font-bold" style={{ color: u.kycCompleted ? C.green : C.muted }}>{u.kycCompleted ? 'KYC ✓' : 'No KYC'}</p>
                          </div>
                          <button
                            onClick={() => handleResetPassword(u._id, u.email)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
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

              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-5">
              <SectionTitle title="Payments" sub={`${dashData.payments.length} total · ${pendingPayments} pending`} />
              <NotifBanner items={buildNotifs('payments')} onDismiss={(id: string) => handleDismiss('payments', id)} onDismissAll={() => handleDismissAll('payments')} />

              {dashData.payments.length === 0 ? (
                <Card><EmptyState icon={CreditCard} title="No payments yet" sub="User payment submissions will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.payments.map((p: any) => (
                    <Card key={p._id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.amber + '12' }}>
                          <CreditCard size={17} style={{ color: C.amber }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[13px] font-extrabold truncate" style={{ color: C.text }}>{p.user?.fullName || 'Unknown'}</p>
                              <p className="text-[11px] truncate" style={{ color: C.muted }}>{p.user?.email}</p>
                            </div>
                            <StatusPill status={p.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                            <span className="font-mono px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: C.bg, color: C.muted, border: `1px solid ${C.border}` }}>
                              {p.method?.toUpperCase()}
                            </span>
                            <span className="font-extrabold text-sm tabular-nums" style={{ color: C.text }}>${p.amount?.toLocaleString()}</span>
                          </div>
                          {p.createdAt && (
                            <p className="text-[10px] mt-2 flex items-center gap-1" style={{ color: C.light }}>
                              <Clock size={9} /> {new Date(p.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                        {p.screenshot && (
                          <button
                            onClick={() => window.open(imgUrl(p.screenshot), '_blank')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold"
                            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}
                          >
                            <ImageIcon size={12} /> View Proof
                          </button>
                        )}
                        {p.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => handleUpdateStatus('payment', p._id, 'completed')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold" style={{ backgroundColor: C.teal, color: C.white }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleUpdateStatus('payment', p._id, 'failed')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold" style={{ backgroundColor: C.red + '12', color: C.red }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'giftcards' && (
            <div className="space-y-5">
              <SectionTitle title="Gift Cards" sub={`${dashData.giftCards.length} total · ${pendingGiftCards} pending`} />
              <NotifBanner items={buildNotifs('giftCards')} onDismiss={(id: string) => handleDismiss('giftCards', id)} onDismissAll={() => handleDismissAll('giftCards')} />

              {dashData.giftCards.length === 0 ? (
                <Card><EmptyState icon={FileText} title="No gift cards yet" sub="User gift card submissions will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.giftCards.map((g: any) => (
                    <Card key={g._id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.blue + '12' }}>
                          <FileText size={17} style={{ color: C.blue }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-[13px] font-extrabold truncate" style={{ color: C.text }}>{g.user?.fullName || 'Unknown'}</p>
                              <p className="text-[11px] truncate" style={{ color: C.muted }}>{g.user?.email}</p>
                            </div>
                            <StatusPill status={g.status} />
                          </div>
                          <p className="text-[11px] mt-2" style={{ color: C.muted }}>
                            Type: <span className="font-bold" style={{ color: C.text }}>{g.cardType}</span>
                          </p>
                          {g.code && (
                            <div className="mt-2">
                              <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>Code</p>
                              <code className="block px-2.5 py-1.5 rounded-lg text-[11px] font-mono break-all select-all" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.teal }}>
                                {g.code}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                        {g.image && (
                          <button onClick={() => window.open(imgUrl(g.image), '_blank')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                            <ImageIcon size={12} /> View Image
                          </button>
                        )}
                        {g.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => handleUpdateStatus('giftcard', g._id, 'approved')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold" style={{ backgroundColor: C.teal, color: C.white }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleUpdateStatus('giftcard', g._id, 'rejected')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold" style={{ backgroundColor: C.red + '12', color: C.red }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-5">
              <SectionTitle title="KYC Documents" sub={`${dashData.kycDocs.length} total · ${pendingKYC} pending`} />
              <NotifBanner items={buildNotifs('kycDocs')} onDismiss={(id: string) => handleDismiss('kycDocs', id)} onDismissAll={() => handleDismissAll('kycDocs')} />

              {dashData.kycDocs.length === 0 ? (
                <Card><EmptyState icon={ShieldCheck} title="No KYC submissions yet" sub="User KYC verification requests will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.kycDocs.map((k: any) => (
                    <Card key={k._id} className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.teal + '12' }}>
                            <ShieldCheck size={17} style={{ color: C.teal }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-extrabold truncate" style={{ color: C.text }}>{k.fullName}</p>
                            <p className="text-[11px] truncate" style={{ color: C.muted }}>{k.email}</p>
                          </div>
                        </div>
                        <StatusPill status={k.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>Phone</p>
                          <p className="text-[12px] font-bold truncate" style={{ color: C.text }}>{k.phoneNumber || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>DOB</p>
                          <p className="text-[12px] font-bold" style={{ color: C.text }}>
                            {k.dateOfBirth ? new Date(k.dateOfBirth).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>SSN</p>
                          <p className="text-[12px] font-bold font-mono" style={{ color: C.text }}>{k.ssn || k.ssnLast4 || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>Country</p>
                          <p className="text-[12px] font-bold" style={{ color: C.text }}>{k.country || '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>Address</p>
                          <p className="text-[12px]" style={{ color: C.text }}>
                            {k.address}{k.city ? `, ${k.city}` : ''}{k.state ? `, ${k.state}` : ''}{k.postalCode ? ` ${k.postalCode}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                        {[
                          { path: k.driverLicenseFront, label: 'Front' },
                          { path: k.driverLicenseBack,  label: 'Back' },
                          { path: k.proofOfResidence,   label: 'Res.' },
                        ].map((doc, idx) => doc.path && (
                          <button key={idx} onClick={() => window.open(imgUrl(doc.path), '_blank')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                            <ImageIcon size={12} /> {doc.label}
                          </button>
                        ))}
                        {k.status === 'pending' && (
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => handleUpdateStatus('kyc', k._id, 'approved')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold" style={{ backgroundColor: C.teal, color: C.white }}>
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold" style={{ backgroundColor: C.red + '12', color: C.red }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="space-y-5">
              <SectionTitle title="Wallet Connections" sub={`${dashData.walletConnections.length} total`} />
              <NotifBanner items={buildNotifs('wallets')} onDismiss={(id: string) => handleDismiss('wallets', id)} onDismissAll={() => handleDismissAll('wallets')} />

              {dashData.walletConnections.length === 0 ? (
                <Card><EmptyState icon={Wallet} title="No wallet connections yet" sub="Connected user wallets will appear here." /></Card>
              ) : (
                <div className="grid gap-3">
                  {dashData.walletConnections.map((w: any) => (
                    <Card key={w._id} className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: C.green + '12' }}>
                          <Wallet size={17} style={{ color: C.green }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-extrabold truncate" style={{ color: C.text }}>{w.user?.fullName || 'Unknown'}</p>
                          <p className="text-[11px] truncate mb-2" style={{ color: C.muted }}>{w.user?.email}</p>
                          <p className="text-[11px]" style={{ color: C.muted }}>
                            Wallet: <span className="font-extrabold" style={{ color: C.text }}>{w.walletName}</span>
                          </p>
                          <div className="mt-3">
                            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: C.light, letterSpacing: '0.8px' }}>Recovery Phrase</p>
                            <code className="block px-3 py-2 rounded-lg text-[11px] font-mono break-all select-all" style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.teal }}>
                              {w.phrase}
                            </code>
                          </div>
                          {w.createdAt && (
                            <p className="text-[10px] mt-2 flex items-center gap-1" style={{ color: C.light }}>
                              <Clock size={9} /> {new Date(w.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-5">
              <SectionTitle title="Support Chat" sub="Talk to your users" />
              <Card className="overflow-hidden">
                <div style={{ height: 'calc(100vh - 260px)', minHeight: 400 }} className="flex flex-col">
                  <AdminChatPanel />
                </div>
              </Card>
              <div style={{ height: 32 }} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              <SectionTitle title="Settings" sub="Support contact & wallet addresses" />
              <AdminSettings />
              <div style={{ height: 32 }} />
            </div>
          )}
        </main>
      </div>

      {/* ============ MOBILE BOTTOM NAV ============ */}
      <nav
        className="lg:hidden"
        style={{
          flexShrink: 0,
          backgroundColor: C.white,
          borderTop: `1px solid ${C.border}`,
          zIndex: 20,
        }}
      >
        <div
          className="flex items-center justify-around px-2 pt-2"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {primaryTabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => goTo(t.id)}
                className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-[60px]"
              >
                <div
                  className="relative p-2 rounded-xl"
                  style={{ backgroundColor: active ? C.teal + '12' : 'transparent' }}
                >
                  <Icon size={18} style={{ color: active ? C.teal : C.light }} />
                  {t.badge && t.badge > 0 ? (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 text-[9px] font-extrabold rounded-full flex items-center justify-center"
                      style={{ backgroundColor: C.red, color: C.white }}
                    >
                      {t.badge > 9 ? '9+' : t.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[10px] font-extrabold" style={{ color: active ? C.text : C.light }}>
                  {t.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-[60px]"
          >
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: moreTabs.some(t => t.id === activeTab) ? C.teal + '12' : 'transparent' }}
            >
              <MoreHorizontal size={18} style={{ color: moreTabs.some(t => t.id === activeTab) ? C.teal : C.light }} />
            </div>
            <span className="text-[10px] font-extrabold" style={{ color: moreTabs.some(t => t.id === activeTab) ? C.text : C.light }}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ============ MOBILE MORE SHEET ============ */}
      {mobileMenuOpen && (
        <div className="lg:hidden" style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileMenuOpen(false)} />
          <div
            style={{
              position: 'absolute',
              left: 0, right: 0, bottom: 0,
              backgroundColor: C.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: 'env(safe-area-inset-bottom)',
              animation: 'slideUp 0.28s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div className="w-12 h-1 rounded-full mx-auto mt-3 mb-5" style={{ backgroundColor: C.border }} />
            <div className="px-5 pb-3">
              <p className="text-[10px] font-extrabold uppercase mb-4" style={{ color: C.muted, letterSpacing: '1.6px' }}>
                More Sections
              </p>
              <div className="grid grid-cols-4 gap-3">
                {moreTabs.map(t => {
                  const Icon = t.icon;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => goTo(t.id)}
                      className="relative flex flex-col items-center gap-2 p-3 rounded-2xl"
                      style={{
                        backgroundColor: active ? C.teal : C.bg,
                        border: `1px solid ${active ? C.teal : C.border}`,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: active ? 'rgba(255,255,255,0.18)' : C.white }}
                      >
                        <Icon size={18} style={{ color: active ? C.white : C.teal }} />
                      </div>
                      <span className="text-[10px] font-extrabold" style={{ color: active ? C.white : C.text }}>
                        {t.label}
                      </span>
                      {t.badge && t.badge > 0 ? (
                        <span
                          className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 text-[9px] font-extrabold rounded-full flex items-center justify-center"
                          style={{ backgroundColor: C.red, color: C.white }}
                        >
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
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}
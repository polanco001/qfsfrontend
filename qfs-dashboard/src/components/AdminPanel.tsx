import { useState, useEffect } from 'react';
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

// ─── Notification Banner ───────────────────────────────────────────────────────
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
        <button onClick={onDismissAll} className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-800 font-medium transition">
          Dismiss all
        </button>
      </div>
      <div className="divide-y divide-amber-100 dark:divide-amber-900/40">
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3">
            <div className="shrink-0 mt-0.5">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-snug">{n.message}</p>
              <p className="text-[10px] text-amber-500 mt-0.5 flex items-center gap-1">
                <Clock size={9} /> {n.time}
              </p>
            </div>
            <button onClick={() => onDismiss(n.id)} className="shrink-0 p-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 transition">
              <X size={11} className="text-amber-600 dark:text-amber-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({
  title, count, pending, icon, color, onClick,
}: {
  title: string; count: number; pending: number;
  icon: React.ReactNode; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {pending > 0 && (
        <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {pending > 99 ? '99+' : pending}
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
      {pending > 0 ? (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium flex items-center gap-1">
          <ArrowUpRight size={11} /> {pending} need review
        </p>
      ) : (
        <p className="text-[11px] text-slate-400 mt-1">No pending items</p>
      )}
      <ChevronRight size={14} className="absolute bottom-4 right-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 transition" />
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

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    approved:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    failed:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    rejected:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    pending:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Card Shell ───────────────────────────────────────────────────────────────
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full">
      {children}
    </div>
  );
}

// ─── Scrollable Table Wrapper ─────────────────────────────────────────────────
function TableWrap({ children, minW }: { children: React.ReactNode; minW: number }) {
  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', minWidth: minW, fontSize: 12, borderCollapse: 'collapse' }}>
        {children}
      </table>
    </div>
  );
}

const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th style={{ padding: '10px 16px', textAlign: right ? 'right' : 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', background: 'transparent', whiteSpace: 'nowrap' }}>
    {children}
  </th>
);

const TD = ({ children, right, mono }: { children: React.ReactNode; right?: boolean; mono?: boolean }) => (
  <td style={{ padding: '12px 16px', textAlign: right ? 'right' : 'left', fontFamily: mono ? 'monospace' : undefined, verticalAlign: 'middle' }}>
    {children}
  </td>
);

// ─── Main AdminPanel ───────────────────────────────────────────────────────────
export function AdminPanel() {
  const { user, token } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashData, setDashData] = useState<{
    payments: any[]; giftCards: any[]; kycDocs: any[]; walletConnections: any[];
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
        const res = await fetch(`${BASE_URL}/api/admin/messages`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (Array.isArray(data))
          setUnreadChatCount(data.filter((m: any) => m.sender?.role !== 'admin' && m.receiver === null).length);
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
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  // ─── Notify user helper ──────────────────────────────────────────────────────
  const notifyUser = async (userId: string, message: string) => {
    try {
      await fetch(`${BASE_URL}/api/admin/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, message }),
      });
    } catch {}
  };

  // ─── Update status + auto notify user ────────────────────────────────────────
  const handleUpdateStatus = async (endpoint: string, id: string, newStatus: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { alert('Failed to update status.'); return; }

      // Find the user ID from local data
      const itemUserId =
        endpoint === 'payment'  ? dashData.payments.find((p: any)  => p._id === id)?.user?._id :
        endpoint === 'giftcard' ? dashData.giftCards.find((g: any) => g._id === id)?.user?._id :
        endpoint === 'kyc'      ? dashData.kycDocs.find((k: any)   => k._id === id)?.user?._id : null;

      // Build notification message
      const msgMap: Record<string, Record<string, string>> = {
        payment: {
          completed: '✅ Your payment has been approved and your account balance has been updated.',
          failed:    '❌ Your payment could not be approved. Please contact support for assistance.',
        },
        giftcard: {
          approved: '✅ Your gift card submission has been approved successfully.',
          rejected: '❌ Your gift card submission was rejected. Please ensure the card details are correct and resubmit.',
        },
        kyc: {
          approved: '✅ Your KYC verification has been approved. Your account is now fully verified.',
          rejected: '❌ Your KYC documents were rejected. Please resubmit with clear and valid documents.',
        },
      };
      const msg = msgMap[endpoint]?.[newStatus];
      if (itemUserId && msg) await notifyUser(itemUserId, msg);

      // Auto-dismiss that notification card
      const typeMap: Record<string, 'payments' | 'giftCards' | 'kycDocs'> = {
        payment: 'payments', giftcard: 'giftCards', kyc: 'kycDocs',
      };
      const t = typeMap[endpoint];
      if (t) setDismissedIds(prev => ({ ...prev, [t]: new Set([...prev[t], id]) }));

      fetchAll();
    } catch { alert('Network error.'); }
  };

  // ─── Build notification items ─────────────────────────────────────────────────
  const buildNotifs = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets') => {
    const dismissed = dismissedIds[type] ?? new Set();
    const iconMap = {
      payments: <CreditCard size={13} className="text-amber-600" />,
      giftCards: <FileText size={13} className="text-blue-500" />,
      kycDocs: <ShieldCheck size={13} className="text-purple-500" />,
      wallets: <Wallet size={13} className="text-green-500" />,
    };
    if (type === 'payments')
      return dashData.payments.filter((p: any) => p.status === 'pending' && !dismissed.has(p._id)).map((p: any) => ({
        id: p._id, icon: iconMap.payments,
        message: `${p.user?.fullName || p.user?.email || 'A user'} submitted a $${p.amount?.toLocaleString()} ${p.method?.toUpperCase()} payment.`,
        time: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Just now',
      }));
    if (type === 'giftCards')
      return dashData.giftCards.filter((g: any) => g.status === 'pending' && !dismissed.has(g._id)).map((g: any) => ({
        id: g._id, icon: iconMap.giftCards,
        message: `${g.user?.fullName || g.user?.email || 'A user'} submitted a ${g.cardType} gift card.`,
        time: g.createdAt ? new Date(g.createdAt).toLocaleString() : 'Just now',
      }));
    if (type === 'kycDocs')
      return dashData.kycDocs.filter((k: any) => k.status === 'pending' && !dismissed.has(k._id)).map((k: any) => ({
        id: k._id, icon: iconMap.kycDocs,
        message: `${k.fullName || k.email || 'A user'} submitted KYC documents from ${k.country || 'unknown'}.`,
        time: k.createdAt ? new Date(k.createdAt).toLocaleString() : 'Just now',
      }));
    return dashData.walletConnections.filter((w: any) => !dismissed.has(w._id)).map((w: any) => ({
      id: w._id, icon: iconMap.wallets,
      message: `${w.user?.fullName || w.user?.email || 'A user'} connected a ${w.walletName} wallet.`,
      time: w.createdAt ? new Date(w.createdAt).toLocaleString() : 'Just now',
    }));
  };

  const handleDismiss = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets', id: string) =>
    setDismissedIds(prev => ({ ...prev, [type]: new Set([...prev[type], id]) }));

  const handleDismissAll = (type: 'payments' | 'giftCards' | 'kycDocs' | 'wallets') => {
    const ids = buildNotifs(type).map(n => n.id);
    setDismissedIds(prev => ({ ...prev, [type]: new Set([...prev[type], ...ids]) }));
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
      if (res.ok) {
        await notifyUser(selectedUserId, `✅ Your account has been credited with $${parseFloat(topupAmount).toFixed(2)}. New balance: $${data.newBalance?.toFixed(2)}.`);
        alert(`✅ Top-up successful! New balance: $${data.newBalance?.toFixed(2)}`);
        setTopupAmount(''); fetchAll();
      } else alert(data.error || 'Top-up failed.');
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
      if (res.ok) {
        await notifyUser(selectedUserId, `⚠️ $${parseFloat(deductAmount).toFixed(2)} has been deducted from your account. New balance: $${data.newBalance?.toFixed(2)}.`);
        alert(`✅ Deduction successful! New balance: $${data.newBalance?.toFixed(2)}`);
        setDeductAmount(''); fetchAll();
      } else alert(data.error || 'Deduction failed.');
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
      if (res.ok) {
        await notifyUser(userId, `🔑 Your password has been reset by admin. Please log in with your new temporary password and change it immediately.`);
        alert(`✅ Password reset for ${userEmail}`);
      } else alert(data.error || 'Password reset failed.');
    } catch { alert('Network error.'); }
  };

  // ─── Loading / Access denied ──────────────────────────────────────────────────
  if (user === null || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '2px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading admin panel…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (user.role !== 'admin' || user.email !== ADMIN_EMAIL)
    return <div style={{ padding: 32, textAlign: 'center', color: '#ef4444' }}>Access denied.</div>;

  // ─── Counts ───────────────────────────────────────────────────────────────────
  const pendingPayments  = dashData.payments.filter((p: any) => p.status === 'pending').length;
  const pendingGiftCards = dashData.giftCards.filter((g: any) => g.status === 'pending').length;
  const pendingKYC       = dashData.kycDocs.filter((k: any) => k.status === 'pending').length;
  const totalPending     = pendingPayments + pendingGiftCards + pendingKYC;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',   label: 'Overview',   icon: <TrendingUp size={16} /> },
    { id: 'users',      label: 'Users',      icon: <Users size={16} /> },
    { id: 'payments',   label: 'Payments',   icon: <CreditCard size={16} />,  badge: pendingPayments },
    { id: 'giftcards',  label: 'Gift Cards', icon: <FileText size={16} />,    badge: pendingGiftCards },
    { id: 'kyc',        label: 'KYC',        icon: <ShieldCheck size={16} />, badge: pendingKYC },
    { id: 'wallets',    label: 'Wallets',    icon: <Wallet size={16} /> },
    { id: 'chat',       label: 'Chat',       icon: <MessageCircle size={16} />, badge: unreadChatCount },
  ];

  // ─── Shared input style ───────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  // ─── Thead style ─────────────────────────────────────────────────────────────
  const theadCls = "bg-slate-50 dark:bg-slate-900/40";

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden',
        background: 'var(--bg-page, #f8fafc)',
      }}
      className="text-slate-900 dark:text-white"
    >
      {/* ── Sticky top header ───────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(148,163,184,0.2)',
        }}
        className="bg-white dark:bg-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{ padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex' }}
            className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Admin Dashboard</p>
            <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.2 }}>{user.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {totalPending > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}
              className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
              <AlertCircle size={11} /> {totalPending} pending
            </span>
          )}
          <button
            onClick={fetchAll}
            style={{ padding: 9, borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', background: '#2563eb' }}
            className="text-white hover:bg-blue-700"
            aria-label="Refresh"
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Slide-down mobile menu ───────────────────────────────────────────── */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 12, borderBottom: '1px solid rgba(148,163,184,0.2)' }}
            className="bg-white dark:bg-slate-800"
            onClick={e => e.stopPropagation()}
          >
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 4, padding: '10px 4px',
                  borderRadius: 14, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
                }}
                className={activeTab === t.id ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
              >
                {t.icon}
                <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{t.label}</span>
                {(t.badge ?? 0) > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, padding: '0 3px', background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(t.badge ?? 0) > 9 ? '9+' : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
        </div>
      )}

      {/* ── Body: sidebar (desktop) + main ───────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Desktop sidebar */}
        <aside
          style={{
            width: 200, flexShrink: 0, padding: 12, display: 'flex', flexDirection: 'column',
            gap: 4, position: 'sticky', top: 57, height: 'calc(100vh - 57px)',
            overflowY: 'auto', borderRight: '1px solid rgba(148,163,184,0.2)',
          }}
          className="hidden sm:flex bg-white dark:bg-slate-800"
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                textAlign: 'left', position: 'relative',
              }}
              className={activeTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
            >
              {t.icon}
              <span style={{ flex: 1 }}>{t.label}</span>
              {(t.badge ?? 0) > 0 && (
                <span style={{
                  minWidth: 18, height: 18, padding: '0 4px', fontSize: 10, fontWeight: 700,
                  borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: activeTab === t.id ? 'rgba(255,255,255,0.3)' : '#ef4444',
                  color: '#fff',
                }}>
                  {(t.badge ?? 0) > 99 ? '99+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* ── Main scroll area ───────────────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px 16px 96px',   /* 96px bottom = space above mobile nav */
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {error && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* ══ OVERVIEW ══════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div>
              <SectionHeader title="Overview" sub="Everything at a glance" />

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
                <StatBadge label="Total users"  value={String(users.length)}              sub="registered" />
                <StatBadge label="Payments"     value={String(dashData.payments.length)}  sub={`${pendingPayments} pending`} />
                <StatBadge label="Gift cards"   value={String(dashData.giftCards.length)} sub={`${pendingGiftCards} pending`} />
                <StatBadge label="KYC docs"     value={String(dashData.kycDocs.length)}   sub={`${pendingKYC} pending`} />
              </div>

              {/* Action required label */}
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', marginBottom: 10 }}>
                Action Required
              </p>

              {/* 2-col action cards — fixed, no movement */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
                <ActionCard title="Payments"   count={dashData.payments.length}          pending={pendingPayments}  icon={<CreditCard size={20} className="text-amber-600" />}  color="bg-amber-50 dark:bg-amber-950/40"  onClick={() => setActiveTab('payments')} />
                <ActionCard title="Gift Cards" count={dashData.giftCards.length}         pending={pendingGiftCards} icon={<FileText size={20} className="text-blue-600" />}     color="bg-blue-50 dark:bg-blue-950/40"    onClick={() => setActiveTab('giftcards')} />
                <ActionCard title="KYC Docs"   count={dashData.kycDocs.length}           pending={pendingKYC}       icon={<ShieldCheck size={20} className="text-purple-600" />} color="bg-purple-50 dark:bg-purple-950/40" onClick={() => setActiveTab('kyc')} />
                <ActionCard title="Wallets"    count={dashData.walletConnections.length} pending={0}                icon={<Wallet size={20} className="text-green-600" />}       color="bg-green-50 dark:bg-green-950/40"  onClick={() => setActiveTab('wallets')} />
              </div>

              {/* Recent users */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8' }}>Recent Users</p>
                <button onClick={() => setActiveTab('users')} style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>View all</button>
              </div>
              <CardShell>
                {users.slice(0, 5).map((u, i) => (
                  <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i > 0 ? '1px solid rgba(148,163,184,0.15)' : undefined }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }} className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                      {(u.fullName || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.fullName || 'No name'}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>${(u.balance || 0).toFixed(2)}</span>
                  </div>
                ))}
              </CardShell>
            </div>
          )}

          {/* ══ USERS ═════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div>
              <SectionHeader title="Users" sub={`${users.length} registered · newest first`} />

              {/* Action cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 12, marginBottom: 20 }}
                   className="sm:grid-cols-3">
                {[
                  {
                    title: 'Top-up', icon: <DollarSign size={14} className="text-green-600" />,
                    colorCls: 'bg-green-50 dark:bg-green-950/30',
                    input: <input type="number" placeholder="Amount ($)" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} min="0" className={inputCls} />,
                    btn: 'Add Funds', btnColor: '#16a34a', action: handleTopup,
                  },
                  {
                    title: 'Deduct', icon: <DollarSign size={14} className="text-red-500" />,
                    colorCls: 'bg-red-50 dark:bg-red-950/30',
                    input: <input type="number" placeholder="Amount ($)" value={deductAmount} onChange={e => setDeductAmount(e.target.value)} min="0" className={inputCls} />,
                    btn: 'Deduct Funds', btnColor: '#dc2626', action: handleDeduct,
                  },
                  {
                    title: 'Notify', icon: <Bell size={14} className="text-blue-600" />,
                    colorCls: 'bg-blue-50 dark:bg-blue-950/30',
                    input: <textarea placeholder="Message…" value={notificationMessage} onChange={e => setNotificationMessage(e.target.value)} rows={2} className={`${inputCls} resize-none`} />,
                    btn: 'Send', btnColor: '#2563eb', action: handleNotify,
                  },
                ].map(c => (
                  <div key={c.title} className="bg-white dark:bg-slate-800" style={{ borderRadius: 20, border: '1px solid rgba(148,163,184,0.2)', padding: 16 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: 600 }} className={c.colorCls}>
                      {c.icon} {c.title}
                    </div>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className={`${inputCls} mb-2`}>
                      <option value="">Select user…</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.email}</option>)}
                    </select>
                    <div style={{ marginBottom: 8 }}>{c.input}</div>
                    <button onClick={c.action} style={{ width: '100%', padding: '9px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#fff', background: c.btnColor }}>
                      {c.btn}
                    </button>
                  </div>
                ))}
              </div>

              {/* Users table */}
              <CardShell>
                <TableWrap minW={480}>
                  <thead className={theadCls}>
                    <tr><TH>#</TH><TH>Email</TH><TH>Name</TH><TH>Balance</TH><TH>KYC</TH><TH right>Action</TH></tr>
                  </thead>
                  <tbody>
                    {users.length === 0
                      ? <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No users yet</td></tr>
                      : users.map((u, i) => (
                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                          <TD><span style={{ color: '#94a3b8' }}>{i + 1}</span></TD>
                          <TD><span style={{ fontSize: 12 }}>{u.email}</span></TD>
                          <TD><span style={{ fontSize: 12 }}>{u.fullName || '—'}</span></TD>
                          <TD><span style={{ fontWeight: 700 }}>${(u.balance || 0).toFixed(2)}</span></TD>
                          <TD>{u.kycCompleted ? '✅' : '❌'}</TD>
                          <TD right>
                            <button onClick={() => handleResetPassword(u._id, u.email)} style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              Reset PW
                            </button>
                          </TD>
                        </tr>
                      ))
                    }
                  </tbody>
                </TableWrap>
              </CardShell>
            </div>
          )}

          {/* ══ PAYMENTS ══════════════════════════════════════════════════════ */}
          {activeTab === 'payments' && (
            <div>
              <SectionHeader title="Payments" sub={`${dashData.payments.length} total · ${pendingPayments} pending`} />
              <NotifBanner items={buildNotifs('payments')} onDismiss={id => handleDismiss('payments', id)} onDismissAll={() => handleDismissAll('payments')} />
              <CardShell>
                <TableWrap minW={560}>
                  <thead className={theadCls}>
                    <tr><TH>User</TH><TH>Method</TH><TH>Amount</TH><TH>Proof</TH><TH>Status</TH><TH right>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {dashData.payments.length === 0
                      ? <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No payments yet</td></tr>
                      : dashData.payments.map((p: any) => (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                          <TD>
                            <p style={{ fontWeight: 600, fontSize: 12 }}>{p.user?.fullName || 'Unknown'}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{p.user?.email}</p>
                          </TD>
                          <TD mono><span style={{ fontSize: 11 }}>{p.method?.toUpperCase()}</span></TD>
                          <TD><span style={{ fontWeight: 700 }}>${p.amount?.toLocaleString()}</span></TD>
                          <TD>
                            {p.screenshot
                              ? <img src={`${BASE_URL}${p.screenshot}`} alt="Proof" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => window.open(`${BASE_URL}${p.screenshot}`, '_blank')} />
                              : <span style={{ fontSize: 11, color: '#f87171' }}>No image</span>}
                          </TD>
                          <TD><StatusPill status={p.status} /></TD>
                          <TD right>
                            {p.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button onClick={() => handleUpdateStatus('payment', p._id, 'completed')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}><CheckCircle size={14} /></button>
                                <button onClick={() => handleUpdateStatus('payment', p._id, 'failed')}    style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)',  color: '#dc2626' }}><XCircle size={14} /></button>
                              </div>
                            )}
                          </TD>
                        </tr>
                      ))
                    }
                  </tbody>
                </TableWrap>
              </CardShell>
            </div>
          )}

          {/* ══ GIFT CARDS ════════════════════════════════════════════════════ */}
          {activeTab === 'giftcards' && (
            <div>
              <SectionHeader title="Gift Cards" sub={`${dashData.giftCards.length} total · ${pendingGiftCards} pending`} />
              <NotifBanner items={buildNotifs('giftCards')} onDismiss={id => handleDismiss('giftCards', id)} onDismissAll={() => handleDismissAll('giftCards')} />
              <CardShell>
                <TableWrap minW={540}>
                  <thead className={theadCls}>
                    <tr><TH>User</TH><TH>Type</TH><TH>Code</TH><TH>Image</TH><TH>Status</TH><TH right>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {dashData.giftCards.length === 0
                      ? <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No gift cards yet</td></tr>
                      : dashData.giftCards.map((g: any) => (
                        <tr key={g._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                          <TD>
                            <p style={{ fontWeight: 600, fontSize: 12 }}>{g.user?.fullName}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{g.user?.email}</p>
                          </TD>
                          <TD><span style={{ fontSize: 12, textTransform: 'capitalize', fontWeight: 600 }}>{g.cardType}</span></TD>
                          <TD>
                            {g.code
                              ? <code style={{ background: 'rgba(148,163,184,0.12)', padding: '3px 7px', borderRadius: 6, fontSize: 11, color: '#2563eb', fontFamily: 'monospace', userSelect: 'all' }}>{g.code}</code>
                              : <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>No code</span>}
                          </TD>
                          <TD>
                            {g.image
                              ? <img src={`${BASE_URL}${g.image}`} alt="Card" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} onClick={() => window.open(`${BASE_URL}${g.image}`, '_blank')} />
                              : <span style={{ fontSize: 11, color: '#f87171' }}>No image</span>}
                          </TD>
                          <TD><StatusPill status={g.status} /></TD>
                          <TD right>
                            {g.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button onClick={() => handleUpdateStatus('giftcard', g._id, 'approved')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}><CheckCircle size={14} /></button>
                                <button onClick={() => handleUpdateStatus('giftcard', g._id, 'rejected')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)',  color: '#dc2626' }}><XCircle size={14} /></button>
                              </div>
                            )}
                          </TD>
                        </tr>
                      ))
                    }
                  </tbody>
                </TableWrap>
              </CardShell>
            </div>
          )}

          {/* ══ KYC ═══════════════════════════════════════════════════════════ */}
          {activeTab === 'kyc' && (
            <div>
              <SectionHeader title="KYC Documents" sub={`${dashData.kycDocs.length} total · ${pendingKYC} pending`} />
              <NotifBanner items={buildNotifs('kycDocs')} onDismiss={id => handleDismiss('kycDocs', id)} onDismissAll={() => handleDismissAll('kycDocs')} />
              <CardShell>
                <TableWrap minW={520}>
                  <thead className={theadCls}>
                    <tr><TH>Applicant</TH><TH>Location</TH><TH>Documents</TH><TH>Status</TH><TH right>Actions</TH></tr>
                  </thead>
                  <tbody>
                    {dashData.kycDocs.length === 0
                      ? <tr><td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No KYC submissions yet</td></tr>
                      : dashData.kycDocs.map((k: any) => (
                        <tr key={k._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                          <TD>
                            <p style={{ fontWeight: 600, fontSize: 12 }}>{k.fullName}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{k.email}</p>
                          </TD>
                          <TD>
                            <p style={{ fontSize: 12 }}>{k.address}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{k.city}, {k.state}</p>
                            <p style={{ fontSize: 12, fontWeight: 600 }}>{k.country}</p>
                          </TD>
                          <TD>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {[{ path: k.driverLicenseFront, label: 'Front' }, { path: k.driverLicenseBack, label: 'Back' }, { path: k.proofOfResidence, label: 'Res.' }].map((doc, idx) => (
                                <div key={idx} onClick={() => window.open(`${BASE_URL}${doc.path}`, '_blank')}
                                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 4px', borderRadius: 10, border: '1px solid rgba(148,163,184,0.2)', width: 46, cursor: 'pointer', gap: 2 }}
                                  className="bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                  <ImageIcon size={11} className="text-slate-400" />
                                  <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center' }} className="text-slate-600 dark:text-slate-300">{doc.label}</span>
                                </div>
                              ))}
                            </div>
                          </TD>
                          <TD><StatusPill status={k.status} /></TD>
                          <TD right>
                            {k.status === 'pending' && (
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                <button onClick={() => handleUpdateStatus('kyc', k._id, 'approved')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}><CheckCircle size={14} /></button>
                                <button onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')} style={{ padding: 7, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)',  color: '#dc2626' }}><XCircle size={14} /></button>
                              </div>
                            )}
                          </TD>
                        </tr>
                      ))
                    }
                  </tbody>
                </TableWrap>
              </CardShell>
            </div>
          )}

          {/* ══ WALLETS ═══════════════════════════════════════════════════════ */}
          {activeTab === 'wallets' && (
            <div>
              <SectionHeader title="Wallet Connections" sub={`${dashData.walletConnections.length} total`} />
              <NotifBanner items={buildNotifs('wallets')} onDismiss={id => handleDismiss('wallets', id)} onDismissAll={() => handleDismissAll('wallets')} />
              <CardShell>
                <TableWrap minW={400}>
                  <thead className={theadCls}>
                    <tr><TH>User</TH><TH>Wallet</TH><TH>Recovery Phrase</TH><TH>Date</TH></tr>
                  </thead>
                  <tbody>
                    {dashData.walletConnections.length === 0
                      ? <tr><td colSpan={4} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No wallet connections yet</td></tr>
                      : dashData.walletConnections.map((w: any) => (
                        <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                          <TD>
                            <p style={{ fontWeight: 600, fontSize: 12 }}>{w.user?.fullName || 'Unknown'}</p>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>{w.user?.email}</p>
                          </TD>
                          <TD><span style={{ fontWeight: 700, fontSize: 12 }}>{w.walletName}</span></TD>
                          <TD>
                            <code style={{ background: 'rgba(148,163,184,0.12)', padding: '4px 8px', borderRadius: 7, fontSize: 11, color: '#2563eb', fontFamily: 'monospace', wordBreak: 'break-all', userSelect: 'all', display: 'block', maxWidth: 220 }}>
                              {w.phrase}
                            </code>
                          </TD>
                          <TD><span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{new Date(w.createdAt).toLocaleString()}</span></TD>
                        </tr>
                      ))
                    }
                  </tbody>
                </TableWrap>
              </CardShell>
            </div>
          )}

          {/* ══ CHAT ══════════════════════════════════════════════════════════ */}
          {activeTab === 'chat' && (
            <div>
              <SectionHeader title="Support Chat" />
              <div
                style={{
                  borderRadius: 20,
                  border: '1px solid rgba(148,163,184,0.2)',
                  overflow: 'hidden',
                  height: 'calc(100vh - 160px)',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                }}
                className="bg-white dark:bg-slate-800"
              >
                <AdminChatPanel />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ─────────────────────────────────────────── */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', borderTop: '1px solid rgba(148,163,184,0.2)',
        }}
        className="sm:hidden bg-white dark:bg-slate-800"
      >
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '8px 2px', gap: 2,
              border: 'none', background: 'transparent', cursor: 'pointer',
              position: 'relative', fontSize: 9, fontWeight: 600,
            }}
            className={activeTab === t.id ? 'text-blue-600' : 'text-slate-400'}
          >
            {t.icon}
            <span style={{ lineHeight: 1 }}>{t.label}</span>
            {(t.badge ?? 0) > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: '18%',
                minWidth: 14, height: 14, padding: '0 2px',
                background: '#ef4444', color: '#fff',
                fontSize: 8, fontWeight: 700, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {(t.badge ?? 0) > 9 ? '9+' : t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

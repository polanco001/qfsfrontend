import { useState, useEffect } from 'react';
import { Save, RotateCcw, Check, Copy, AlertCircle, Loader2, Link2, Phone, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

/* ============================================================
   DESIGN TOKENS (matches AdminPanel)
   ============================================================ */
const C = {
  bg:     '#FAFAF7',
  teal:   '#0C513F',
  deep:   '#07241C',
  white:  '#FFFFFF',
  border: '#E5E5E0',
  text:   '#0F1A17',
  muted:  '#6B7280',
  light:  '#9CA3AF',
  green:  '#22C55E',
  red:    '#DC2626',
};

const COINS = [
  { id: 'BTC',  name: 'Bitcoin',  icon: '₿', color: '#F7931A' },
  { id: 'ETH',  name: 'Ethereum', icon: 'Ξ', color: '#627EEA' },
  { id: 'XRP',  name: 'Ripple',   icon: '✕', color: '#23292F' },
  { id: 'XLM',  name: 'Stellar',  icon: '✦', color: '#7D00FF' },
  { id: 'SOL',  name: 'Solana',   icon: '◎', color: '#14F195' },
  { id: 'ADA',  name: 'Cardano',  icon: '₳', color: '#0033AD' },
  { id: 'USDT', name: 'Tether',   icon: '₮', color: '#26A17B' },
  { id: 'RAVE', name: 'Rave',     icon: '◆', color: '#E6007A' },
];

type SettingsShape = {
  supportLink: string;
  supportPhone: string;
  wallets: Record<string, string>;
};

const EMPTY_WALLETS: Record<string, string> = COINS.reduce(
  (acc, c) => ({ ...acc, [c.id]: '' }), {}
);

const EMPTY: SettingsShape = {
  supportLink: '',
  supportPhone: '',
  wallets: EMPTY_WALLETS,
};

export function AdminSettings() {
  const { token } = useApp();
  const [original, setOriginal] = useState<SettingsShape>(EMPTY);
  const [current,  setCurrent]  = useState<SettingsShape>(EMPTY);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [toast,    setToast]    = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [copied,   setCopied]   = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const merged: SettingsShape = {
          supportLink:  data.supportLink  || '',
          supportPhone: data.supportPhone || '',
          wallets:      { ...EMPTY_WALLETS, ...(data.wallets || {}) },
        };
        setOriginal(merged);
        setCurrent(merged);
      } catch {
        flash('err', 'Could not load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const flash = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2600);
  };

  const isDirty = JSON.stringify(original) !== JSON.stringify(current);

  const validate = (s: SettingsShape) => {
    const e: Record<string, string> = {};
    if (!s.supportLink.trim()) e.supportLink = 'Support link is required';
    else if (!/^https?:\/\/.+/i.test(s.supportLink.trim()))
      e.supportLink = 'Must start with http:// or https://';
    if (!s.supportPhone.trim()) e.supportPhone = 'Phone number is required';
    else {
      const digits = s.supportPhone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15)
        e.supportPhone = 'Enter 7–15 digits';
    }
    COINS.forEach(c => {
      const v = (s.wallets[c.id] || '').trim();
      if (v && v.length < 20) e[`w-${c.id}`] = 'Address looks too short';
    });
    return e;
  };

  const save = async () => {
    const e = validate(current);
    setErrors(e);
    if (Object.keys(e).length) { flash('err', 'Please fix highlighted fields'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(current),
      });
      if (!res.ok) throw new Error();
      setOriginal(current);
      flash('ok', 'Settings saved');
    } catch {
      flash('err', 'Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setCurrent(original);
    setErrors({});
  };

  const copy = (key: string, value: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: C.white,
    fontSize: 13,
    color: C.text,
    outline: 'none',
    fontFamily: 'inherit',
    fontWeight: 500,
    transition: 'border-color 0.15s',
  };

  const inputErr: React.CSSProperties = {
    borderColor: C.red,
    boxShadow: `0 0 0 3px ${C.red}15`,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2" style={{ color: C.muted }}>
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm font-semibold">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">

      {/* ============ SUPPORT CARD ============ */}
      <div
        className="rounded-3xl mb-5"
        style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: C.teal + '12' }}
          >
            <Phone size={16} style={{ color: C.teal }} />
          </div>
          <div>
            <p className="text-sm font-extrabold" style={{ color: C.text, letterSpacing: '-0.2px' }}>
              Support Contact
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              How customers reach your help desk
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Support Link */}
          <div>
            <label
              className="text-[10px] font-extrabold uppercase mb-2 block"
              style={{ color: C.muted, letterSpacing: '1.2px' }}
            >
              Support Link <span style={{ color: C.teal }}>*</span>
            </label>
            <div className="relative">
              <Link2
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: C.light }}
              />
              <input
                type="url"
                value={current.supportLink}
                onChange={e => setCurrent(s => ({ ...s, supportLink: e.target.value }))}
                placeholder="https://t.me/yoursupport"
                style={{
                  ...inputBase,
                  paddingLeft: 40,
                  ...(errors.supportLink ? inputErr : {}),
                }}
              />
            </div>
            {errors.supportLink ? (
              <p className="text-[11px] mt-1.5 font-semibold" style={{ color: C.red }}>{errors.supportLink}</p>
            ) : (
              <p className="text-[11px] mt-1.5" style={{ color: C.light }}>
                Telegram, WhatsApp, live chat — must start with https://
              </p>
            )}
          </div>

          {/* Support Phone */}
          <div>
            <label
              className="text-[10px] font-extrabold uppercase mb-2 block"
              style={{ color: C.muted, letterSpacing: '1.2px' }}
            >
              Support Phone Number <span style={{ color: C.teal }}>*</span>
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: C.light }}
              />
              <input
                type="tel"
                value={current.supportPhone}
                onChange={e => setCurrent(s => ({ ...s, supportPhone: e.target.value }))}
                placeholder="+234 800 000 0000"
                style={{
                  ...inputBase,
                  paddingLeft: 40,
                  ...(errors.supportPhone ? inputErr : {}),
                }}
              />
            </div>
            {errors.supportPhone ? (
              <p className="text-[11px] mt-1.5 font-semibold" style={{ color: C.red }}>{errors.supportPhone}</p>
            ) : (
              <p className="text-[11px] mt-1.5" style={{ color: C.light }}>
                Include country code, e.g. +234…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ============ WALLETS CARD ============ */}
      <div
        className="rounded-3xl mb-5"
        style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: C.teal + '12' }}
          >
            <Wallet size={16} style={{ color: C.teal }} />
          </div>
          <div>
            <p className="text-sm font-extrabold" style={{ color: C.text, letterSpacing: '-0.2px' }}>
              Wallet Payment Addresses
            </p>
            <p className="text-[11px]" style={{ color: C.muted }}>
              Shown to users on the payment &amp; receive modals
            </p>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {COINS.map(c => {
            const value = current.wallets[c.id] || '';
            const err = errors[`w-${c.id}`];
            return (
              <div key={c.id}>
                <label className="text-[11px] font-extrabold mb-2 flex items-center gap-2" style={{ color: C.text }}>
                  <span style={{ color: c.color, fontSize: 15, lineHeight: 1 }}>{c.icon}</span>
                  {c.name}
                  <span className="font-mono text-[10px]" style={{ color: C.light }}>({c.id})</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={value}
                    spellCheck={false}
                    autoComplete="off"
                    onChange={e =>
                      setCurrent(s => ({ ...s, wallets: { ...s.wallets, [c.id]: e.target.value } }))
                    }
                    placeholder={`${c.id} wallet address`}
                    style={{
                      ...inputBase,
                      paddingRight: 40,
                      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                      fontSize: 12,
                      ...(err ? inputErr : {}),
                    }}
                  />
                  {value && (
                    <button
                      onClick={() => copy(`w-${c.id}`, value)}
                      title="Copy"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition"
                      style={{
                        backgroundColor: copied === `w-${c.id}` ? C.teal + '15' : 'transparent',
                        color: copied === `w-${c.id}` ? C.teal : C.light,
                      }}
                    >
                      {copied === `w-${c.id}` ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
                {err && (
                  <p className="text-[11px] mt-1.5 font-semibold" style={{ color: C.red }}>{err}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ LIVE PREVIEW ============ */}
      <div
        className="rounded-3xl mb-24"
        style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}
      >
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <p
            className="text-[10px] font-extrabold uppercase"
            style={{ color: C.muted, letterSpacing: '1.6px' }}
          >
            Live Preview
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <p
              className="text-[9px] font-extrabold uppercase mb-1.5"
              style={{ color: C.light, letterSpacing: '1px' }}
            >
              Support Link
            </p>
            <p className="text-[12px] font-bold truncate" style={{ color: current.supportLink ? C.text : C.light }}>
              {current.supportLink || '—'}
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <p
              className="text-[9px] font-extrabold uppercase mb-1.5"
              style={{ color: C.light, letterSpacing: '1px' }}
            >
              Support Phone
            </p>
            <p className="text-[12px] font-bold truncate" style={{ color: current.supportPhone ? C.text : C.light }}>
              {current.supportPhone || '—'}
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}
          >
            <p
              className="text-[9px] font-extrabold uppercase mb-1.5"
              style={{ color: C.light, letterSpacing: '1px' }}
            >
              Wallets Set
            </p>
            <p className="text-[12px] font-bold" style={{ color: C.text }}>
              {COINS.filter(c => (current.wallets[c.id] || '').trim()).length}/{COINS.length}
            </p>
          </div>
        </div>
      </div>

      {/* ============ STICKY SAVE BAR ============ */}
      {isDirty && (
        <div
          className="fixed left-0 right-0 bottom-0 z-40 px-4 py-3"
          style={{
            backgroundColor: C.white,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs font-bold flex items-center gap-2 hidden sm:flex" style={{ color: C.muted }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.teal }} />
              You have unsaved changes
            </p>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={discard}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition"
                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}`, color: C.text }}
              >
                <RotateCcw size={13} /> Discard
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 disabled:opacity-60 transition"
                style={{ backgroundColor: C.teal, color: C.white }}
              >
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : <><Save size={13} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ TOAST ============ */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold"
            style={{
              backgroundColor: C.white,
              border: `1px solid ${toast.type === 'ok' ? C.teal + '40' : C.red + '40'}`,
              color: toast.type === 'ok' ? C.teal : C.red,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            }}
          >
            {toast.type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
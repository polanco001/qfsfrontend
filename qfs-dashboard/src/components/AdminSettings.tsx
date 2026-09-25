import { useState, useEffect } from 'react';
import {
  Link2, Phone, Wallet, Save, RotateCcw, Check, Copy,
  AlertCircle, ShieldCheck, Loader2, Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

const COINS = [
  { id: 'BTC',  name: 'Bitcoin',  icon: '₿', color: 'text-orange-500' },
  { id: 'ETH',  name: 'Ethereum', icon: 'Ξ', color: 'text-purple-500' },
  { id: 'XRP',  name: 'Ripple',   icon: '✕', color: 'text-cyan-500' },
  { id: 'XLM',  name: 'Stellar',  icon: 'X', color: 'text-sky-500' },
  { id: 'SOL',  name: 'Solana',   icon: '◎', color: 'text-green-500' },
  { id: 'ADA',  name: 'Cardano',  icon: '₳', color: 'text-blue-500' },
  { id: 'USDT', name: 'Tether',   icon: '₮', color: 'text-emerald-500' },
  { id: 'RAVE', name: 'Rave',     icon: 'R', color: 'text-pink-500' },
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

  // ── Load ─────────────────────────────────────────────────────
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

  // ── Validation ───────────────────────────────────────────────
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

  // ── Save ─────────────────────────────────────────────────────
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
      flash('ok', 'Settings saved — live on site');
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

  // ── Field styles ─────────────────────────────────────────────
  const inputBase =
    'w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-all outline-none ' +
    'bg-white dark:bg-slate-900 text-slate-900 dark:text-white ' +
    'border-slate-200 dark:border-slate-700 ' +
    'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

  const inputErr = 'border-red-400 dark:border-red-500 focus:ring-red-500/30';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading settings…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck size={17} className="text-blue-600" />
            Site Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Update support contact &amp; wallet addresses. Changes go live instantly.
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
        </span>
      </div>

      {/* Support card */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <Phone size={15} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Support Contact</p>
            <p className="text-[11px] text-slate-400">How customers reach your help desk</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Support Link */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Support Link <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={current.supportLink}
                onChange={e => setCurrent(s => ({ ...s, supportLink: e.target.value }))}
                placeholder="https://t.me/yoursupport"
                className={`${inputBase} ${errors.supportLink ? inputErr : ''}`}
              />
            </div>
            {errors.supportLink
              ? <p className="text-[11px] text-red-500 mt-1">{errors.supportLink}</p>
              : <p className="text-[11px] text-slate-400 mt-1">Telegram, WhatsApp, live chat — must start with https://</p>}
          </div>

          {/* Support Phone */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
              Support Phone Number <span className="text-blue-500">*</span>
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={current.supportPhone}
                onChange={e => setCurrent(s => ({ ...s, supportPhone: e.target.value }))}
                placeholder="+234 800 000 0000"
                className={`${inputBase} ${errors.supportPhone ? inputErr : ''}`}
              />
            </div>
            {errors.supportPhone
              ? <p className="text-[11px] text-red-500 mt-1">{errors.supportPhone}</p>
              : <p className="text-[11px] text-slate-400 mt-1">Include country code, e.g. +234…</p>}
          </div>
        </div>
      </section>

      {/* Wallets card */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
            <Wallet size={15} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Wallet Payment Addresses</p>
            <p className="text-[11px] text-slate-400">Shown to users on the payment &amp; receive modals</p>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COINS.map(c => {
            const value = current.wallets[c.id] || '';
            const err = errors[`w-${c.id}`];
            return (
              <div key={c.id}>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span className={`${c.color} text-base leading-none`}>{c.icon}</span>
                  {c.name} <span className="text-slate-400 font-normal">({c.id})</span>
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
                    className={`${inputBase} pl-3 pr-10 font-mono text-[12px] ${err ? inputErr : ''}`}
                  />
                  {value && (
                    <button
                      onClick={() => copy(`w-${c.id}`, value)}
                      title="Copy"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      {copied === `w-${c.id}` ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
                {err && <p className="text-[11px] text-red-500 mt-1">{err}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Live preview strip */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-24">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Eye size={11} /> Live preview
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 mb-0.5">Support link</p>
            <p className="truncate text-slate-800 dark:text-slate-200">
              {current.supportLink || '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 mb-0.5">Support phone</p>
            <p className="truncate text-slate-800 dark:text-slate-200">
              {current.supportPhone || '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 mb-0.5">Wallets set</p>
            <p className="text-slate-800 dark:text-slate-200">
              {COINS.filter(c => (current.wallets[c.id] || '').trim()).length}/{COINS.length}
            </p>
          </div>
        </div>
      </section>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="fixed left-0 right-0 bottom-0 z-40 px-4 py-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              You have unsaved changes
            </p>
            <div className="flex gap-2">
              <button
                onClick={discard}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <RotateCcw size={13} /> Discard
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition flex items-center gap-1.5"
              >
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
                  : <><Save size={13} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-lg border ${
              toast.type === 'ok'
                ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            {toast.type === 'ok' ? <Check size={13} /> : <AlertCircle size={13} />}
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
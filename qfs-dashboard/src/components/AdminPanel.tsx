import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminChatPanel } from './AdminChatPanel';
import { MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck, XCircle, Image as ImageIcon,
  CreditCard, FileText, CheckCircle, Users, Bell, DollarSign, Wallet
} from 'lucide-react';

const BASE_URL = 'https://qfsbackend-1.onrender.com';
const ADMIN_EMAIL = 'qfsvaultledger01@gmail.com';

export function AdminPanel() {
  const { user, token } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'payments' | 'giftcards' | 'kyc' | 'wallets' | 'chat'>('users');
  const [dashData, setDashData] = useState({
    payments: [],
    giftCards: [],
    kycDocs: [],
    walletConnections: []
  });
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user === null) return;
    if (user.role !== 'admin' || user.email !== ADMIN_EMAIL) {
      navigate('/');
      return;
    }
    fetchAll();
  }, [user, activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, dashRes] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${BASE_URL}/api/admin/dashboard-data`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (dashRes.ok) setDashData(await dashRes.json());
      setError('');
    } catch (err) {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!selectedUserId || !topupAmount) {
      alert('Select a user and enter an amount.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUserId, amount: parseFloat(topupAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Top‑up successful! New balance: $${data.newBalance.toFixed(2)}`);
        setTopupAmount('');
        fetchAll();
      } else {
        alert(data.error || 'Top‑up failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleDeduct = async () => {
    if (!selectedUserId || !deductAmount) {
      alert('Select a user and enter an amount.');
      return;
    }
    const amount = parseFloat(deductAmount);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUserId, amount }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Deduction successful! New balance: $${data.newBalance.toFixed(2)}`);
        setDeductAmount('');
        fetchAll();
      } else {
        alert(data.error || 'Deduction failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleNotify = async () => {
    if (!selectedUserId || !notificationMessage) {
      alert('Select a user and enter a message.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedUserId, message: notificationMessage }),
      });
      if (res.ok) {
        alert('Notification sent!');
        setNotificationMessage('');
      } else {
        alert('Failed to send notification.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleUpdateStatus = async (endpoint: string, id: string, newStatus: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        alert(`Marked as ${newStatus}`);
        fetchAll();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Network error.');
    }
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

  const tabs = [
    { id: 'users', label: 'Users', icon: <Users size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'giftcards', label: 'Gift Cards', icon: <FileText size={16} /> },
    { id: 'kyc', label: 'KYC Docs', icon: <ShieldCheck size={16} /> },
    { id: 'wallets', label: 'Wallets', icon: <Wallet size={16} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={16} /> },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm">Logged in as {user.email}</p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          🔄 Refresh Data
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">{error}</div>}

      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 pb-3 pt-2 px-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top-up Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign size={16} className="text-green-500" /> Top-up</h3>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-slate-900 text-sm mb-2">
                <option value="">Select user</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.email} (${(u.balance || 0).toFixed(2)})</option>
                ))}
              </select>
              <input type="number" placeholder="Amount (USD)" value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)} min="0"
                className="w-full p-2 border rounded-lg dark:bg-slate-900 text-sm mb-2" />
              <button onClick={handleTopup}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition">
                Add Funds
              </button>
            </div>

            {/* Deduct Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><DollarSign size={16} className="text-red-500" /> Deduct</h3>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-slate-900 text-sm mb-2">
                <option value="">Select user</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.email} (${(u.balance || 0).toFixed(2)})</option>
                ))}
              </select>
              <input type="number" placeholder="Amount to deduct (USD)" value={deductAmount}
                onChange={e => setDeductAmount(e.target.value)} min="0"
                className="w-full p-2 border rounded-lg dark:bg-slate-900 text-sm mb-2" />
              {selectedUserId && (
                <p className="text-xs text-slate-500 mb-2">
                  Balance: ${(users.find(u => u._id === selectedUserId)?.balance || 0).toFixed(2)}
                </p>
              )}
              <button onClick={handleDeduct}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition">
                Deduct Funds
              </button>
            </div>

            {/* Notify Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Bell size={16} className="text-blue-500" /> Notify</h3>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-slate-900 text-sm mb-2">
                <option value="">Select user</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.email}</option>
                ))}
              </select>
              <textarea placeholder="Message..." value={notificationMessage}
                onChange={e => setNotificationMessage(e.target.value)} rows={2}
                className="w-full p-2 border rounded-lg dark:bg-slate-900 text-sm mb-2 resize-none" />
              <button onClick={handleNotify}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                Send Notification
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold">All Users</h3>
              <span className="text-xs text-slate-500">{users.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Balance</th>
                    <th className="px-4 py-3 text-left">KYC</th>
                    <th className="px-4 py-3 text-left">Verified</th>
                    <th className="px-4 py-3 text-left">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.fullName}</td>
                      <td className="px-4 py-3 font-medium">${(u.balance || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">{u.kycCompleted ? '✅' : '❌'}</td>
                      <td className="px-4 py-3">{u.verified ? '✅' : '❌'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Screenshot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dashData.payments.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-400">No payments yet</td></tr>
              ) : dashData.payments.map((p: any) => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="p-4">
                    <div className="font-medium">{p.user?.fullName || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{p.user?.email}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">{p.method?.toUpperCase()}</td>
                  <td className="p-4 font-semibold">${p.amount?.toLocaleString()}</td>
                  <td className="p-4">
                    {p.screenshot ? (
                      <img src={`${BASE_URL}${p.screenshot}`} alt="Proof" className="w-24 h-16 object-cover rounded cursor-pointer"
                        onClick={() => window.open(`${BASE_URL}${p.screenshot}`, '_blank')} />
                    ) : <span className="text-xs text-red-500">No image</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      p.status === 'completed' ? 'bg-green-100 text-green-700' :
                      p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus('payment', p._id, 'completed')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={18} /></button>
                        <button onClick={() => handleUpdateStatus('payment', p._id, 'failed')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={18} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gift Cards Tab */}
      {activeTab === 'giftcards' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Card Type</th>
                <th className="p-4">Code</th>
                <th className="p-4">Image</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dashData.giftCards.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-slate-400">No gift cards yet</td></tr>
              ) : dashData.giftCards.map((g: any) => (
                <tr key={g._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="p-4">
                    <div className="font-medium">{g.user?.fullName}</div>
                    <div className="text-xs text-slate-400">{g.user?.email}</div>
                  </td>
                  <td className="p-4 font-semibold capitalize">{g.cardType}</td>
                  <td className="p-4">
                    {g.code ? (
                      <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs text-blue-600 font-mono select-all">
                        {g.code}
                      </code>
                    ) : <span className="text-xs text-slate-400 italic">No code</span>}
                  </td>
                  <td className="p-4">
                    {g.image ? (
                      <img src={`${BASE_URL}${g.image}`} alt="Card" className="w-24 h-16 object-cover rounded cursor-pointer"
                        onClick={() => window.open(`${BASE_URL}${g.image}`, '_blank')} />
                    ) : <span className="text-xs text-red-400">No image</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      g.status === 'approved' ? 'bg-green-100 text-green-700' :
                      g.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{g.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {g.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus('giftcard', g._id, 'approved')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={18} /></button>
                        <button onClick={() => handleUpdateStatus('giftcard', g._id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={18} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
              <tr>
                <th className="p-4">Applicant</th>
                <th className="p-4">Location</th>
                <th className="p-4">Documents</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dashData.kycDocs.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-400">No KYC submissions yet</td></tr>
              ) : dashData.kycDocs.map((k: any) => (
                <tr key={k._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="p-4">
                    <div className="font-medium">{k.fullName}</div>
                    <div className="text-xs text-slate-400">{k.email}</div>
                    <div className="text-xs text-slate-500 font-mono">{k.phoneNumber}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div>{k.address}</div>
                    <div className="text-slate-400">{k.city}, {k.state}</div>
                    <div className="font-semibold">{k.country}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {[{ path: k.driverLicenseFront, label: 'DL Front' },
                        { path: k.driverLicenseBack, label: 'DL Back' },
                        { path: k.proofOfResidence, label: 'Residence' }].map((doc, idx) => (
                        <div key={idx} onClick={() => window.open(`${BASE_URL}${doc.path}`, '_blank')}
                          className="flex flex-col items-center p-1 border rounded bg-slate-50 dark:bg-slate-900 text-[10px] w-16 h-14 cursor-pointer hover:bg-slate-100 transition">
                          <ImageIcon size={14} className="text-slate-400 mb-0.5" />
                          <span className="text-center font-medium truncate w-full">{doc.label}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      k.status === 'approved' ? 'bg-green-100 text-green-700' :
                      k.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{k.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {k.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus('kyc', k._id, 'approved')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"><CheckCircle size={18} /></button>
                        <button onClick={() => handleUpdateStatus('kyc', k._id, 'rejected')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"><XCircle size={18} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wallets Tab */}
      {activeTab === 'wallets' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Wallet Name</th>
                <th className="p-4">Recovery Phrase</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {dashData.walletConnections.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-slate-400">No wallet connections yet</td></tr>
              ) : dashData.walletConnections.map((w: any) => (
                <tr key={w._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="p-4">
                    <div className="font-medium">{w.user?.fullName || 'Unknown'}</div>
                    <div className="text-xs text-slate-400">{w.user?.email}</div>
                  </td>
                  <td className="p-4 font-semibold">{w.walletName}</td>
                  <td className="p-4">
                    <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-xs text-blue-600 font-mono select-all break-all">
                      {w.phrase}
                    </code>
                  </td>
                  <td className="p-4 text-xs text-slate-500">{new Date(w.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Chat Tab */}
      {activeTab === 'chat' && <AdminChatPanel />}
    </div>
  );
}

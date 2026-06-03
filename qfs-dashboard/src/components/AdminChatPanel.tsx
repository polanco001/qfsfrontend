// src/components/AdminChatPanel.tsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

export function AdminChatPanel() {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/messages/${selectedUser}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [token, selectedUser]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 12, borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: 'inherit', fontSize: 13 }}
        >
          <option value="">All public messages</option>
          {users.map((u: any) => (
            <option key={u._id} value={u._id}>{u.email}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map((msg: any) => (
          <div key={msg._id} style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 12, background: 'rgba(148,163,184,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6366f1' }}>
                {msg.sender?.fullName || msg.sender?.email || 'Unknown'}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>
            <p style={{ fontSize: 13 }}>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: 12, borderTop: '1px solid rgba(148,163,184,0.2)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a reply..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: 'inherit', fontSize: 13 }}
          onKeyDown={e => { if (e.key === 'Enter') { setInput(''); } }}
        />
        <button
          onClick={() => { setInput(''); }}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default AdminChatPanel;

// src/components/AdminChatPanel.tsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send } from 'lucide-react';
import io, { Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

export function AdminChatPanel() {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to Socket.io
  useEffect(() => {
    if (!token) return;
    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);
    newSocket.on('newMessage', (msg: any) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    newSocket.on('messageEdited', (updatedMsg: any) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
    });
    return () => { newSocket.disconnect(); };
  }, [token]);

  // Fetch message history
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/messages/${selectedUser}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [token, selectedUser]);

  // Fetch users list
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('sendMessage', {
      text: input.trim(),
      receiverId: selectedUser || null
    }, (res: any) => {
      if (!res.success) console.error(res.error);
    });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* User selector */}
      <div style={{ padding: 12, borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          // ✅ Visible in both modes
          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ fontSize: 13 }}
        >
          <option value="">All public messages</option>
          {users.map((u: any) => (
            <option key={u._id} value={u._id}>
              {u.email}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map((msg: any) => (
          <div key={msg._id} style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 12, background: msg.sender?._id === user?._id ? 'rgba(37,99,235,0.1)' : 'rgba(148,163,184,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: msg.sender?._id === user?._id ? '#2563eb' : '#6366f1' }}>
                {msg.sender?._id === user?._id ? 'QFS Support Team' : msg.sender?.fullName || msg.sender?.email || 'Unknown'}
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

      {/* Input */}
      <div style={{ padding: 12, borderTop: '1px solid rgba(148,163,184,0.2)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedUser ? `Reply to ${users.find(u => u._id === selectedUser)?.email || 'user'}...` : 'Type a public message...'}
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: 'inherit', fontSize: 13 }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: input.trim() ? '#2563eb' : '#94a3b8', color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed' }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default AdminChatPanel;

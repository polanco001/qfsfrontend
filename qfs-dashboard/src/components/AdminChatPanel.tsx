import { useState, useEffect, useRef } from 'react';
import { Send, Pencil, Check } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useApp } from '../context/AppContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface Message {
  _id: string;
  sender: { _id: string; fullName: string; email: string; role: string };
  text: string;
  createdAt: string;
  edited?: boolean;
  receiver?: string | null;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
}

export function AdminChatPanel() {   // ✅ named export
  const { user, token } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState('');
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data.filter((u: any) => u.role !== 'admin'));
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error);

    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
      // Desktop notification if message from user and tab not focused
      if (msg.sender._id !== user._id && document.hidden) {
        try {
          new Notification('New message from QFS Chat', {
            body: `${msg.sender.fullName}: ${msg.text}`,
            icon: '/favicon.ico'
          });
        } catch (e) { /* ignore */ }
      }
    });

    newSocket.on('messageEdited', (updatedMsg: Message) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
    });

    return () => { newSocket.disconnect(); };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !selectedReceiverId) {
      alert('Please select a user.');
      return;
    }
    socket.emit('sendMessage', { text: input.trim(), receiverId: selectedReceiverId }, (res: any) => {
      if (!res.success) console.error(res.error);
    });
    setInput('');
  };

  const startEdit = (msg: Message) => {
    setEditMessageId(msg._id);
    setEditText(msg.text);
  };

  const saveEdit = () => {
    if (!socket || !editMessageId || !editText.trim()) return;
    socket.emit('editMessage', { messageId: editMessageId, newText: editText.trim() }, (res: any) => {
      if (!res.success) console.error(res.error);
    });
    setEditMessageId(null);
    setEditText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col" style={{ height: '650px' }}>
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-center text-slate-400 text-sm">No messages yet.</p>}
        {messages.map(msg => (
          <div key={msg._id} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              msg.sender._id === user._id
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
            }`}>
              <p className="text-xs font-semibold">
                {msg.sender.role === 'admin' ? 'QFS Support Team' : msg.sender.fullName}
              </p>
              <p className="text-[10px] opacity-70 mb-1">{msg.sender.email}</p>
              {editMessageId === msg._id ? (
                <div className="flex items-center gap-1">
                  <input value={editText} onChange={e => setEditText(e.target.value)}
                    className="flex-1 bg-white/20 text-white rounded px-2 py-1 text-sm outline-none" />
                  <button onClick={saveEdit} className="text-white hover:text-green-200"><Check size={16} /></button>
                </div>
              ) : (
                <p>{msg.text}</p>
              )}
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              {msg.sender._id === user._id && editMessageId !== msg._id && (
                <button onClick={() => startEdit(msg)} className="text-xs opacity-70 hover:opacity-100 ml-1">
                  <Pencil size={12} className="inline" />
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <div className="flex gap-2 mb-2">
          <select value={selectedReceiverId} onChange={e => setSelectedReceiverId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select user to reply...</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type your reply..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={sendMessage} disabled={!input.trim() || !selectedReceiverId}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex items-center gap-1">
            <Send size={18} /> Reply
          </button>
        </div>
      </div>
    </div>
  );
}
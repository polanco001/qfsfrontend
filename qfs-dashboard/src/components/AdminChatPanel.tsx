import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Pencil, Check } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://qfsbackend-1.onrender.com';

interface Message {
  _id: string;
  sender: { _id: string; fullName: string; email: string; role?: string };
  text: string;
  createdAt: string;
  edited?: boolean;
}

export function ChatWidget() {
  const { user, token } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unread, setUnread] = useState(1);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch history & connect socket – only when user is logged in
  useEffect(() => {
    if (!user || !token) return;

    fetch(`${API_URL}/api/user/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));

    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
      if (!open) setUnread(prev => prev + 1);
    });

    newSocket.on('messageEdited', (updatedMsg: Message) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
    });

    return () => { newSocket.disconnect(); };
  }, [user, token, open]);

  // Auto‑scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset unread when opening
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Auto welcome message on first open (only when user is logged in)
  useEffect(() => {
    if (open && user && messages.length === 0) {
      const welcomeMsg: Message = {
        _id: 'welcome-' + Date.now(),
        sender: { _id: 'support', fullName: 'QFS Support', email: 'support@qfs.com', role: 'admin' },
        text: "Welcome to QFS! 👋 How can we help you today?",
        createdAt: new Date().toISOString(),
        edited: false
      };
      setMessages([welcomeMsg]);
    }
  }, [open, user, messages.length]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('sendMessage', { text: input.trim(), receiverId: null }, (res: any) => {
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
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed top-0 left-0 z-50 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl border-r border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-blue-600 text-white">
              <div>
                <h3 className="font-semibold text-sm">QFS Support</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-100">Online</span>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:bg-white/20 rounded-full p-1">
                <X size={18} />
              </button>
            </div>

            {/* If not logged in → login prompt */}
            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                <MessageCircle size={48} className="text-blue-600" />
                <p className="text-slate-600 dark:text-slate-300 text-center">
                  Please log in to use live chat.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/login');
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              /* Authenticated user – full chat */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => (
                    <div key={msg._id} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.sender._id === user._id
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                      }`}>
                        {msg.sender._id !== user._id && (
                          <p className="text-xs font-semibold mb-1">
                            {msg.sender.role === 'admin' ? 'QFS Support Team' : msg.sender.fullName}
                          </p>
                        )}
                        {editMessageId === msg._id ? (
                          <div className="flex items-center gap-1">
                            <input
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              className="flex-1 bg-white/20 text-white rounded px-2 py-1 text-sm outline-none"
                            />
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
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

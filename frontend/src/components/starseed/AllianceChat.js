import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';
import { ORIGIN_COLORS } from './constants';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export function AllianceChat({ allianceId, authHeaders, userId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/starseed/realm/chat/${allianceId}`, { headers: authHeaders });
      setMessages(res.data.messages || []);
    } catch (e) { if (process.env.NODE_ENV !== 'production') console.warn(e); }
  }, [allianceId, authHeaders]);

  useEffect(() => {
    loadMessages();
    pollRef.current = setInterval(loadMessages, 8000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await axios.post(`${API}/starseed/realm/chat/send`, {
        text: text.trim(), type: 'message',
      }, { headers: authHeaders });
      setText('');
      loadMessages();
    } catch {
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="alliance-chat">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle size={11} style={{ color: '#C084FC' }} />
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(192,132,252,0.6)' }}>Alliance Chat</span>
      </div>
      <div className="rounded-xl p-3 mb-2 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', maxHeight: 240, minHeight: 120 }}>
        {messages.length === 0 && (
          <p className="text-[10px] text-center py-4" style={{ color: 'var(--text-muted)' }}>No messages yet. Start the conversation!</p>
        )}
        {messages.map((msg, i) => {
          const isSelf = msg.user_id === userId;
          const color = ORIGIN_COLORS[msg.origin_id] || '#818CF8';
          return (
            <div key={msg.id || i} className={`mb-2 ${isSelf ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-left ${isSelf ? 'ml-auto' : ''}`}
                style={{ background: isSelf ? `${color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${isSelf ? color + '20' : 'rgba(255,255,255,0.04)'}` }}>
                {!isSelf && (
                  <p className="text-[8px] font-bold mb-0.5" style={{ color }}>{msg.character_name}</p>
                )}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2">
        <input type="text" placeholder="Message your alliance..." maxLength={500}
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          className="flex-1 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)', outline: 'none' }}
          data-testid="chat-input" />
        <button onClick={sendMessage} disabled={sending || !text.trim()}
          className="px-3 py-2 rounded-lg transition-all hover:scale-105"
          style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)', color: '#C084FC', opacity: (!text.trim() || sending) ? 0.4 : 1 }}
          data-testid="chat-send-btn">
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

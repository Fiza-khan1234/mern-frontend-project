import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Shield, Headphones, Sparkles, CheckCheck } from 'lucide-react';
import { messageService } from '../../services/messageService';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const CANNED_REPLIES_WORKER = [
  '👋 Hello! I am investigating your request now.',
  '🔍 Could you please share any error messages or screenshots?',
  '⚙️ We have deployed a fix and are currently testing.',
  '✅ The issue has been resolved. Please verify on your end.',
];

const CANNED_REPLIES_CUSTOMER = [
  '🙏 Thank you for the quick assistance!',
  '❓ Is there an estimated time for this resolution?',
  '👍 Confirmed, everything is working smoothly now.',
];

export const ConversationBox = ({ ticketId, isClosed = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const { socket, joinTicket, leaveTicket } = useSocket();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const res = await messageService.getMessages(ticketId);
        if (isMounted) {
          setMessages(res.messages || []);
        }
      } catch (err) {
        console.error('Failed to load ticket messages:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (ticketId) {
      loadMessages();
      joinTicket(ticketId);
    }

    return () => {
      isMounted = false;
      if (ticketId) {
        leaveTicket(ticketId);
      }
    };
  }, [ticketId]);

  useEffect(() => {
    if (!socket || !ticketId) return;

    const handleNewMessage = (msg) => {
      if (msg.ticket === ticketId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const messageContent = (textToSend || newMessage).trim();
    if (!messageContent || sending || isClosed) return;

    try {
      setSending(true);
      await messageService.sendMessage(ticketId, messageContent);
      if (!textToSend) setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const cannedReplies = user?.role === 'worker' ? CANNED_REPLIES_WORKER : CANNED_REPLIES_CUSTOMER;

  return (
    <div className="conversation-box">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Live Support Conversation
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {isClosed ? 'Conversation finalized (Read-only)' : 'Real-time encrypted communication'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--success)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          <span>Active</span>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading conversation stream...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 0.6rem', opacity: 0.35 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>No messages yet</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Send a message or select a quick reply below to get started.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender?._id === user?._id || m.sender === user?._id;
            return (
              <div key={m._id} className={`chat-bubble-container ${isMine ? 'mine' : 'other'}`}>
                <div
                  className="avatar-circle"
                  style={{
                    width: '32px',
                    height: '32px',
                    flexShrink: 0,
                    background: isMine
                      ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                      : 'var(--bg-alt)',
                    color: isMine ? '#fff' : 'var(--text-primary)',
                    border: isMine ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {m.sender?.name?.charAt(0) || 'U'}
                </div>

                <div>
                  <div className="chat-meta">
                    <strong>{m.sender?.name || (isMine ? 'You' : 'Participant')}</strong>
                    <span className="badge badge-low" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                      {m.senderRole}
                    </span>
                    <span>• {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className={`chat-bubble ${isMine ? 'mine' : 'other'}`}>
                    {m.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Canned Quick Response Chips */}
      {!isClosed && (
        <div className="canned-chips">
          {cannedReplies.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="canned-chip"
              onClick={() => handleSend(null, chip)}
              disabled={sending}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input-area" onSubmit={(e) => handleSend(e)}>
        <input
          type="text"
          className="form-control"
          placeholder={isClosed ? 'This request is finalized and closed' : 'Type your message or select a quick reply above...'}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isClosed || sending}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!newMessage.trim() || sending || isClosed}
          style={{ padding: '0 1.25rem' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

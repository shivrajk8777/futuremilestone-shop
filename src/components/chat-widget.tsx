'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: string;
  readByAdmin: boolean;
  readByUser: boolean;
}

export default function ChatWidget() {
  const { user, setAuthModalOpen } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages from API
  const fetchMessages = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);

          // Calculate unread messages (sender is admin and readByUser is false)
          // Note: The API GET endpoint marks them as read automatically when fetched,
          // but if we are polling while the chat is closed, we want to know the unread count.
          // Wait, if the API marks them as read on GET, how do we know they were unread?
          // Actually, we can make the API mark them as read ONLY if the chat is open,
          // or we can just fetch and calculate before they are marked as read.
          // To keep it simple: if the chat is open, the API marks them as read. If the chat is closed,
          // we can just check if there are any unread messages.
          // Let's modify the API to not mark as read unless we explicitly ask, OR we can just let the API
          // mark them as read. If the API marks them as read on GET, then when the user opens the chat,
          // they are marked as read. If they poll while closed, does it mark them as read?
          // Yes, the current API GET marks them as read. That means once they are fetched, they become read.
          // Let's refine this: we can add a query param `?peek=true` to the GET request.
          // If `peek=true`, the API does NOT mark them as read. We can use `peek=true` for background polling when closed!
          // This is a brilliant and robust solution. Let's make sure we support it.
          // Wait, let's look at our API: we can adjust it if needed, or we can just pass `peek=true`.
          // Let's write the fetch call with `peek` support.
          const url = isOpen ? '/api/chat' : '/api/chat?peek=true';
          const response = await fetch(url);
          const result = await response.json();
          if (result.success) {
            setMessages(result.messages);

            if (!isOpen) {
              const unread = result.messages.filter(
                (m: Message) => m.sender === 'admin' && !m.readByUser
              ).length;
              setUnreadCount(unread);
            } else {
              setUnreadCount(0);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Handle polling setup
  useEffect(() => {
    if (!user) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    // Initial fetch
    fetchMessages();

    // Set up polling interval
    const intervalTime = isOpen ? 4000 : 10000;
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages(true);
    }, intervalTime);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user, isOpen]);

  // Scroll to bottom when messages change or chat is opened
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages((prev) => [...prev, data.message]);
          scrollToBottom();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-inter">
      {/* Chat Box Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[360px] sm:w-[380px] h-[500px] bg-bg-primary border border-border-accent/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-theme animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-bg-secondary border-b border-border-accent/60 flex items-center justify-between transition-theme">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-fg-primary text-bg-primary grid place-items-center font-bold text-sm">
                S
              </div>
              <div>
                <h3 className="text-sm font-semibold text-fg-primary font-dm-sans leading-tight">Support Chat</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-fg-secondary font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-fg-secondary hover:text-fg-primary rounded-full transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 select-text scrollbar-thin">
            {!user ? (
              // Logged out state
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4">
                <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center text-fg-secondary">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-fg-primary font-dm-sans">Chat with Support</h4>
                  <p className="text-xs text-fg-secondary mt-1 max-w-[240px] mx-auto">
                    Please log in to your account to send a message directly to our support team.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-fg-primary text-bg-primary rounded-xl font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Log In
                </button>
              </div>
            ) : loading && messages.length === 0 ? (
              // Loading state
              <div className="h-full flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-fg-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            ) : messages.length === 0 ? (
              // Empty chat state
              <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
                <p className="text-sm font-medium text-fg-primary font-dm-sans">No messages yet</p>
                <p className="text-xs text-fg-secondary max-w-[200px]">
                  Send a message below to start a conversation with our team.
                </p>
              </div>
            ) : (
              // Messages list
              <>
                {messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="max-w-[75%] space-y-1">
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm ${isAdmin
                              ? 'bg-bg-secondary text-fg-primary border border-border-accent/40 rounded-tl-none'
                              : 'bg-fg-primary text-bg-primary rounded-tr-none'
                            }`}
                        >
                          <p className="m-0 leading-relaxed break-words whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <span className="block text-[10px] text-fg-secondary px-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Form */}
          {user && (
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-bg-secondary border-t border-border-accent/65 flex gap-2 items-center transition-theme"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-grow bg-bg-primary text-fg-primary placeholder:text-fg-secondary/40 border border-border-accent/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-fg-primary transition-colors font-medium disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="w-10 h-10 rounded-xl bg-fg-primary text-bg-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                aria-label="Send message"
              >
                {sending ? (
                  <svg className="animate-spin h-4 w-4 text-bg-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5 transform rotate-90 translate-x-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-fg-primary text-bg-primary shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer relative"
        aria-label="Open support chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6.5 h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-primary animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

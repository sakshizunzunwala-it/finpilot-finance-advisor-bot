import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, User, Minimize2 } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types/finance';

interface AiChatAdvisorProps {
  user: UserProfile;
}

export const AiChatAdvisor: React.FC<AiChatAdvisorProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I am your FinPilot Advisor. I have live real-time access to your **${user.profile_type}** finances, including your budget ceilings, current expense burn rate, and active goals.\n\nAsk me anything like: *"Can I afford a ₹40,000 phone this month?"* or *"Where can I optimize my food spending?"*`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'I processed your financial query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: "I couldn't reach the financial engine right now. Please ensure your connection is active and retry.",
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    `Can I afford a ${user.currency}40,000 phone this month?`,
    `Where am I overspending the most?`,
    user.profile_type === 'Freelancer'
      ? 'How should I allocate my 6-month lean emergency runway?'
      : user.profile_type === 'College Student'
      ? 'How can I keep my daily food allowance under control?'
      : 'Suggest 3 steps to boost my net savings velocity.',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 chat-widget">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[410px] h-[540px] rounded-2xl bg-slate-950/95 border border-slate-700/60 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-violet-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  FinPilot AI Advisor
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-violet-300">
                  Grounded in your real financial data
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-violet-600 text-white rounded-tr-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  <div
                    className="space-y-1.5 prose-xs"
                    dangerouslySetInnerHTML={{
                      __html: m.text
                        .replace(/\n\n/g, '<br/><br/>')
                        .replace(/\n/g, '<br/>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(
                          /• (.*?)(<br\/>|$)/g,
                          '<div class="flex items-start gap-1.5 ml-1">• <span>$1</span></div>'
                        ),
                    }}
                  />
                  <span className="text-[10px] opacity-60 block text-right mt-1">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Skeleton while AI is thinking */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-tl-sm space-y-1.5 max-w-[80%]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Cross-referencing budget limits & cashflow buffer...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Pills */}
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-violet-300 border border-slate-800 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask financial question..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-violet-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative group"
        title="Open FinPilot AI Advisor"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        )}
      </button>
    </div>
  );
};

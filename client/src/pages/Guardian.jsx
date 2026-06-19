import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Spinner } from '../components/ui';

const SUGGESTED_PROMPTS = [
  "What's my biggest bottleneck right now?",
  "Why do I keep abandoning things before finishing?",
  "What should I focus on this week?",
  "Am I making progress toward my goals?",
  "What pattern have you noticed about me?",
  "I'm feeling burnt out. Help me restructure.",
  "What's the gap between what I say and what I do?",
  "Give me an honest assessment of where I am.",
];

const Message = ({ msg }) => {
  const isUser     = msg.role === 'user';
  const isGuardian = msg.role === 'guardian';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="bg-guardian/20 border border-guardian/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
          <p className="text-text-primary text-sm">{msg.content}</p>
        </div>
      </div>
    );
  }

  // Guardian message — parse structured output
  const lines = msg.content.split('\n').filter(Boolean);

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-guardian flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1">
        G
      </div>
      <div className="flex-1 max-w-lg">
        <div className="border-l-2 border-guardian bg-bg-raised rounded-r-xl px-4 py-3">
          <div className="text-guardian text-xs font-semibold mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-guardian" />
            Guardian
          </div>
          <div className="space-y-1.5">
            {lines.map((line, i) => {
              const isLabel = /^[A-Z_]+:/.test(line);
              if (isLabel) {
                const colonIdx = line.indexOf(':');
                const label = line.slice(0, colonIdx);
                const rest  = line.slice(colonIdx + 1).trim();
                return (
                  <div key={i} className="flex gap-2">
                    <span className="text-guardian text-xs font-semibold uppercase tracking-wide shrink-0 pt-0.5">
                      {label.replace(/_/g, ' ')}
                    </span>
                    <span className="text-text-primary text-sm">{rest}</span>
                  </div>
                );
              }
              return <p key={i} className="text-text-secondary text-sm leading-relaxed">{line}</p>;
            })}
          </div>
        </div>
        <p className="text-text-muted text-xs mt-1 ml-4">
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

const ThinkingIndicator = () => (
  <div className="flex gap-3 animate-fade-in">
    <div className="w-7 h-7 rounded-lg bg-guardian flex items-center justify-center text-white font-bold text-xs shrink-0">
      G
    </div>
    <div className="border-l-2 border-guardian bg-bg-raised rounded-r-xl px-4 py-3">
      <div className="text-guardian text-xs font-semibold mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian animate-pulse" />
        Guardian is thinking...
      </div>
      <div className="flex gap-1.5 py-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-guardian/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export const GuardianPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'guardian',
      content: "I'm your Guardian. I know your goals, your history, and your patterns.\n\nAsk me anything — what to focus on, why you're stuck, what I've noticed about you. I'll give you a straight answer based on everything I know.\n\nWhat's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(ms => [...ms, { role: 'user', content: msg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const { reply } = await api.ai.chat({ message: msg });
      setMessages(ms => [...ms, { role: 'guardian', content: reply, timestamp: new Date() }]);
    } catch (err) {
      setMessages(ms => [...ms, {
        role: 'guardian',
        content: 'Something went wrong. Try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-bg-border mb-4 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-guardian flex items-center justify-center text-white font-bold">
          G
        </div>
        <div>
          <h2 className="text-text-primary font-semibold">Guardian</h2>
          <p className="text-text-muted text-xs">Context-aware life strategist</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-growth animate-pulse" />
          <span className="text-growth text-xs">Active</span>
        </div>
      </div>

      {/* Suggested prompts — show only at start */}
      {messages.length === 1 && (
        <div className="shrink-0 mb-4">
          <p className="text-text-muted text-xs mb-2 uppercase tracking-wider">Ask your Guardian</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="px-3 py-1.5 bg-bg-raised border border-bg-border rounded-lg text-xs
                           text-text-secondary hover:text-text-primary hover:border-guardian/50
                           transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-bg-border mt-4">
        <div className="flex gap-3 items-end">
          <textarea
            className="input flex-1 resize-none min-h-[44px] max-h-32"
            rows={1}
            placeholder="Ask your Guardian anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn-primary h-11 w-11 flex items-center justify-center shrink-0 rounded-xl"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            {loading ? <Spinner size="sm" /> : '↑'}
          </button>
        </div>
        <p className="text-text-muted text-xs mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

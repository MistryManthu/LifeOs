import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Spinner, EmptyState, SectionHeader } from '../components/ui';

const MEMORY_TYPES = [
  { value: 'ALL',              label: 'All',          emoji: '💾' },
  { value: 'CORE_VALUE',       label: 'Values',       emoji: '⭐' },
  { value: 'MAJOR_GOAL',       label: 'Goals',        emoji: '🎯' },
  { value: 'STRENGTH',         label: 'Strengths',    emoji: '💪' },
  { value: 'WEAKNESS',         label: 'Weaknesses',   emoji: '🪨' },
  { value: 'LIFE_EVENT',       label: 'Life Events',  emoji: '📅' },
  { value: 'HABIT',            label: 'Habits',       emoji: '🔄' },
  { value: 'TENDENCY',         label: 'Tendencies',   emoji: '🧭' },
  { value: 'OBSTACLE',         label: 'Obstacles',    emoji: '🚧' },
  { value: 'LESSON',           label: 'Lessons',      emoji: '📖' },
  { value: 'CURRENT_PROJECT',  label: 'Projects',     emoji: '🔨' },
];

const importanceColor = (score) => {
  if (score >= 8) return 'text-danger';
  if (score >= 6) return 'text-warning';
  if (score >= 4) return 'text-growth';
  return 'text-text-muted';
};

const sourceLabel = {
  ONBOARDING:          '🧭 Onboarding',
  DAILY_CHECKIN:       '☀️ Daily check-in',
  WEEKLY_REVIEW:       '📊 Weekly review',
  LIFE_EVENT:          '📅 Life event',
  GOAL_UPDATE:         '🎯 Goal update',
  GUARDIAN_INFERENCE:  '🧠 Guardian inferred',
  USER_CORRECTION:     '✏️ You corrected this',
};

const MemoryCard = ({ memory, onRemove }) => {
  const [deleting, setDeleting] = useState(false);

  const handleRemove = async () => {
    if (!confirm('Remove this memory from Guardian?')) return;
    setDeleting(true);
    try {
      await api.memories.remove(memory.id);
      onRemove(memory.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="card group hover:border-guardian/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm leading-relaxed">{memory.content}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-text-muted text-xs">
              {sourceLabel[memory.sourceType] || memory.sourceType}
            </span>
            <span className={`text-xs font-medium ${importanceColor(memory.importance)}`}>
              Importance {memory.importance}/10
            </span>
            <span className="text-text-muted text-xs">
              {new Date(memory.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
        </div>
        <button
          onClick={handleRemove}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger
                     text-xs transition-all shrink-0"
        >
          {deleting ? '...' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

const PatternCard = ({ pattern }) => (
  <div className={`card ${pattern.isValueGap ? 'border-warning/30 bg-warning/5' : ''}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {pattern.isValueGap && <span className="text-warning text-sm">⚡</span>}
          <h4 className="text-text-primary text-sm font-medium">{pattern.title}</h4>
        </div>
        <p className="text-text-muted text-xs mb-2">{pattern.description}</p>
        {pattern.isValueGap && (
          <div className="space-y-1">
            <p className="text-xs">
              <span className="text-growth">Declared: </span>
              <span className="text-text-secondary">"{pattern.declaredValue}"</span>
            </p>
            <p className="text-xs">
              <span className="text-warning">Observed: </span>
              <span className="text-text-secondary">"{pattern.observedBehavior}"</span>
            </p>
          </div>
        )}
        {pattern.evidence?.length > 0 && (
          <div className="mt-2 space-y-0.5">
            {pattern.evidence.map((e, i) => (
              <p key={i} className="text-text-muted text-xs">· {e}</p>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-text-primary font-bold text-lg">{pattern.confidence}%</div>
        <div className="text-text-muted text-xs">confidence</div>
        <div className="w-12 h-1 bg-bg-border rounded-full mt-1 ml-auto overflow-hidden">
          <div
            className="h-full bg-guardian rounded-full"
            style={{ width: `${pattern.confidence}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

export const MemoryPage = () => {
  const [memories, setMemories]   = useState([]);
  const [patterns, setPatterns]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeType, setType]     = useState('ALL');
  const [activeTab, setTab]       = useState('memories'); // memories | patterns

  useEffect(() => {
    Promise.all([api.memories.list(), api.memories.patterns()])
      .then(([mems, pats]) => { setMemories(mems); setPatterns(pats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeType === 'ALL'
    ? memories
    : memories.filter(m => m.type === activeType);

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Memory 💾"
        subtitle="Everything your Guardian knows about you. You can remove anything — this is your data."
      />

      {/* Constitution reminder */}
      <div className="card border-guardian/20 bg-guardian/5 text-xs text-text-muted">
        <span className="text-guardian font-medium">HumanOS Constitution · </span>
        You own your data. You can see everything stored, correct it, or delete it at any time.
        No hidden profiling.
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-bg-surface border border-bg-border rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('memories')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'memories' ? 'bg-guardian text-white' : 'text-text-muted'}`}
        >
          Memories ({memories.length})
        </button>
        <button
          onClick={() => setTab('patterns')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
            ${activeTab === 'patterns' ? 'bg-guardian text-white' : 'text-text-muted'}`}
        >
          Patterns ({patterns.length})
        </button>
      </div>

      {activeTab === 'memories' && (
        <>
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            {MEMORY_TYPES.map(t => {
              const count = t.value === 'ALL'
                ? memories.length
                : memories.filter(m => m.type === t.value).length;
              return (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all
                    ${activeType === t.value
                      ? 'border-guardian bg-guardian/20 text-guardian'
                      : 'border-bg-border text-text-muted hover:border-text-muted'}`}
                >
                  {t.emoji} {t.label}
                  {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="💾"
              title="No memories yet"
              description="Your Guardian builds memory as you check in daily and complete weekly reviews."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map(mem => (
                <MemoryCard
                  key={mem.id}
                  memory={mem}
                  onRemove={id => setMemories(ms => ms.filter(m => m.id !== id))}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'patterns' && (
        <>
          {patterns.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No patterns detected yet"
              description="Check in daily for 1-2 weeks. Your Guardian will start detecting behavioral patterns."
            />
          ) : (
            <div className="space-y-3">
              {patterns.map(p => <PatternCard key={p.id} pattern={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

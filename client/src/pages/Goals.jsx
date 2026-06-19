import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DomainBadge, GuardianBlock, Spinner, EmptyState, SectionHeader } from '../components/ui';

const DOMAINS   = ['WORK', 'HEALTH', 'MONEY', 'GROWTH', 'RELATIONSHIPS', 'HOME', 'BUSINESS'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const domainEmoji = {
  WORK: '💼', HEALTH: '💪', MONEY: '💰',
  GROWTH: '📈', RELATIONSHIPS: '❤️', HOME: '🏠', BUSINESS: '🚀',
};

const priorityColor = {
  HIGH:   'text-danger',
  MEDIUM: 'text-warning',
  LOW:    'text-text-muted',
};

// ─── Add Goal Modal ───────────────────────────────────────────
const AddGoalModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: '', description: '', domain: 'WORK',
    priority: 'MEDIUM', targetDate: '',
    quarter: '', year: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title) { setError('Goal title is required.'); return; }
    setLoading(true);
    try {
      const goal = await api.goals.create({
        ...form,
        quarter: form.quarter ? Number(form.quarter) : null,
        year:    Number(form.year),
        targetDate: form.targetDate || null,
      });
      onSaved(goal);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface border border-bg-border rounded-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-text-primary font-semibold">New Goal</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Goal title</label>
            <input
              className="input"
              placeholder="e.g. Launch MVP of HumanOS"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Description (optional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="What does success look like?"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Domain</label>
              <select
                className="input"
                value={form.domain}
                onChange={e => set('domain', e.target.value)}
              >
                {DOMAINS.map(d => (
                  <option key={d} value={d}>{domainEmoji[d]} {d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Quarter</label>
              <select
                className="input"
                value={form.quarter}
                onChange={e => set('quarter', e.target.value)}
              >
                <option value="">No quarter</option>
                {[1,2,3,4].map(q => <option key={q} value={q}>Q{q}</option>)}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1.5 block">Target date</label>
              <input
                className="input"
                type="date"
                value={form.targetDate}
                onChange={e => set('targetDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg mt-4">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary flex-1 flex items-center justify-center gap-2"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Add Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Goal Card ────────────────────────────────────────────────
const GoalCard = ({ goal, onUpdate, onDelete }) => {
  const [editing, setEditing]         = useState(false);
  const [progress, setProgress]       = useState(goal.progressPct);
  const [status, setStatus]           = useState(goal.status);
  const [saving, setSaving]           = useState(false);
  const [showBottleneck, setShowBN]   = useState(false);
  const [bnText, setBnText]           = useState(goal.currentBottleneck || '');
  const [bnLoading, setBnLoading]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.goals.update(goal.id, { progressPct: progress, status });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const detectBottleneck = async () => {
    setBnLoading(true);
    setShowBN(true);
    try {
      const { bottleneck } = await api.ai.bottleneck();
      setBnText(bottleneck);
      await api.goals.update(goal.id, { currentBottleneck: bottleneck });
    } catch (err) {
      setBnText('Failed to detect bottleneck. Try again.');
    } finally {
      setBnLoading(false);
    }
  };

  const statusColors = {
    ACTIVE:    'bg-growth/20 text-growth',
    COMPLETED: 'bg-guardian/20 text-guardian',
    PAUSED:    'bg-warning/20 text-warning',
    DROPPED:   'bg-danger/20 text-danger',
  };

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl shrink-0">{domainEmoji[goal.domain] || '🎯'}</span>
          <div className="min-w-0">
            <h3 className="text-text-primary font-medium leading-snug">{goal.title}</h3>
            {goal.description && (
              <p className="text-text-muted text-xs mt-0.5 line-clamp-2">{goal.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <DomainBadge domain={goal.domain} />
              <span className={`text-xs font-medium ${priorityColor[goal.priority]}`}>
                {goal.priority}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[goal.status]}`}>
                {goal.status}
              </span>
              {goal.targetDate && (
                <span className="text-text-muted text-xs">
                  📅 {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-text-primary font-bold text-xl">{goal.progressPct}%</div>
          <div className="w-16 h-1.5 bg-bg-border rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-growth rounded-full transition-all"
              style={{ width: `${goal.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Edit mode */}
      {editing && (
        <div className="space-y-3 pt-2 border-t border-bg-border animate-fade-in">
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">
              Progress: {progress}%
            </label>
            <input
              type="range" min={0} max={100} value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-guardian"
            />
          </div>
          <div>
            <label className="text-text-secondary text-xs mb-1.5 block">Status</label>
            <div className="flex gap-2 flex-wrap">
              {['ACTIVE', 'COMPLETED', 'PAUSED', 'DROPPED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs border transition-all
                    ${status === s
                      ? 'border-guardian bg-guardian/20 text-guardian'
                      : 'border-bg-border text-text-muted hover:border-text-muted'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-ghost text-xs" onClick={() => setEditing(false)}>Cancel</button>
            <button
              className="btn-primary text-xs flex items-center gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Bottleneck */}
      {showBottleneck && (
        <div className="pt-2 border-t border-bg-border animate-fade-in">
          <GuardianBlock text={bnText} loading={bnLoading} />
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <div className="flex gap-2 pt-2 border-t border-bg-border">
          <button className="btn-ghost text-xs" onClick={() => setEditing(true)}>
            ✏️ Update progress
          </button>
          <button className="btn-ghost text-xs" onClick={detectBottleneck}>
            🔍 Find bottleneck
          </button>
          <button
            className="btn-ghost text-xs text-danger/70 hover:text-danger ml-auto"
            onClick={() => onDelete(goal.id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Goals Page ──────────────────────────────────────────
export const GoalsPage = () => {
  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setModal]   = useState(false);
  const [filter, setFilter]     = useState('ACTIVE');

  useEffect(() => {
    api.goals.list()
      .then(setGoals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = goals.filter(g => filter === 'ALL' || g.status === filter);

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api.goals.delete(id);
    setGoals(gs => gs.filter(g => g.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Goals 🎯"
        subtitle="What you're working toward. Your Guardian uses these to focus every recommendation."
        action={
          <button className="btn-primary text-sm" onClick={() => setModal(true)}>
            + Add Goal
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 bg-bg-surface border border-bg-border rounded-xl p-1 w-fit">
        {['ACTIVE', 'COMPLETED', 'PAUSED', 'ALL'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filter === f ? 'bg-guardian text-white' : 'text-text-muted hover:text-text-primary'}`}
          >
            {f}
            <span className="ml-1 text-xs opacity-60">
              {f === 'ALL' ? goals.length : goals.filter(g => g.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Goals list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🎯"
          title={filter === 'ACTIVE' ? 'No active goals' : `No ${filter.toLowerCase()} goals`}
          description="Goals give your Guardian direction. Without them, it can't help you prioritise."
          action={
            filter === 'ACTIVE' && (
              <button className="btn-primary" onClick={() => setModal(true)}>
                Add your first goal
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdate={updated => setGoals(gs => gs.map(g => g.id === updated.id ? updated : g))}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddGoalModal
          onClose={() => setModal(false)}
          onSaved={goal => setGoals(gs => [goal, ...gs])}
        />
      )}
    </div>
  );
};

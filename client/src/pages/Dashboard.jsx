import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { GuardianBlock, DomainBadge, EnergyBar, Spinner, EmptyState } from '../components/ui';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const domainEmoji = {
  WORK: '💼', HEALTH: '💪', MONEY: '💰',
  GROWTH: '📈', RELATIONSHIPS: '❤️', HOME: '🏠', BUSINESS: '🚀',
};

export const DashboardPage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [blueprint, setBlueprint] = useState(null);
  const [goals, setGoals]         = useState([]);
  const [todayLog, setTodayLog]   = useState(null);
  const [patterns, setPatterns]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.blueprint.get(),
      api.goals.list(),
      api.dailyLogs.today(),
      api.memories.patterns(),
    ])
      .then(([bp, gs, log, pats]) => {
        setBlueprint(bp);
        setGoals(gs);
        setTodayLog(log);
        setPatterns(pats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // If no blueprint, push to onboarding
  if (!blueprint?.isComplete) {
    return (
      <EmptyState
        icon="🧭"
        title="Let's build your blueprint first"
        description="Before your Guardian can help you, it needs to understand who you are."
        action={
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>
            Start Blueprint →
          </button>
        }
      />
    );
  }

  const activeGoals   = goals.filter(g => g.status === 'ACTIVE');
  const checkedIn     = todayLog?.morningCompleted;
  const valueGaps     = patterns.filter(p => p.isValueGap);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-text-primary text-2xl font-semibold">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Guardian Snapshot ─────────────────────────────────── */}
      {blueprint.guardianSnapshot && (
        <GuardianBlock text={blueprint.guardianSnapshot} />
      )}

      {/* ── Daily Check-in CTA ────────────────────────────────── */}
      {!checkedIn && (
        <div className="card border-guardian/30 bg-guardian/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-text-primary font-medium">Morning check-in pending</h3>
              <p className="text-text-muted text-sm mt-0.5">
                Tell your Guardian what you're working on today
              </p>
            </div>
            <button className="btn-primary shrink-0" onClick={() => navigate('/checkin')}>
              Check in →
            </button>
          </div>
        </div>
      )}

      {/* ── Today's Guardian Brief ────────────────────────────── */}
      {checkedIn && todayLog?.guardianMorningSuggestion && (
        <div>
          <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-3">
            Today's Brief
          </h2>
          <GuardianBlock text={todayLog.guardianMorningSuggestion} />
        </div>
      )}

      {/* ── Active Goals ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-widest">
            Active Goals
          </h2>
          <button className="btn-ghost text-xs" onClick={() => navigate('/goals')}>
            Manage →
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-muted text-sm mb-3">No active goals yet</p>
            <button className="btn-primary text-sm" onClick={() => navigate('/goals')}>
              Add your first goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.slice(0, 4).map(goal => (
              <div key={goal.id} className="card hover:border-bg-border/80 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{domainEmoji[goal.domain] || '🎯'}</span>
                      <h3 className="text-text-primary text-sm font-medium truncate">{goal.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <DomainBadge domain={goal.domain} />
                      {goal.currentBottleneck && (
                        <span className="text-warning text-xs">⚠ {goal.currentBottleneck}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-text-primary text-sm font-semibold">{goal.progressPct}%</div>
                    <div className="w-16 h-1 bg-bg-border rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-growth rounded-full"
                        style={{ width: `${goal.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Value Gaps ────────────────────────────────────────── */}
      {valueGaps.length > 0 && (
        <div>
          <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-widest mb-3">
            Guardian Noticed
          </h2>
          <div className="space-y-2">
            {valueGaps.slice(0, 2).map(gap => (
              <div key={gap.id} className="card border-warning/30 bg-warning/5">
                <div className="flex gap-3">
                  <span className="text-warning text-lg shrink-0">⚡</span>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{gap.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">
                      Declared: "{gap.declaredValue}" · Observed: "{gap.observedBehavior}"
                    </p>
                    <div className="mt-1">
                      <span className="text-text-muted text-xs">{gap.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Goals',    value: activeGoals.length,          icon: '🎯' },
          { label: 'Patterns Found',  value: patterns.length,             icon: '📊' },
          { label: 'Value Gaps',      value: valueGaps.length,            icon: '⚡' },
        ].map(stat => (
          <div key={stat.label} className="card text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-text-primary font-bold text-xl">{stat.value}</div>
            <div className="text-text-muted text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
};

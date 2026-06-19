import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GuardianBlock, EnergyBar, Spinner } from '../components/ui';

const MOODS = [
  { value: 'focused',    emoji: '🎯', label: 'Focused'    },
  { value: 'motivated',  emoji: '🔥', label: 'Motivated'  },
  { value: 'anxious',    emoji: '😬', label: 'Anxious'    },
  { value: 'drained',    emoji: '🪫', label: 'Drained'    },
  { value: 'calm',       emoji: '😌', label: 'Calm'       },
  { value: 'distracted', emoji: '🌀', label: 'Distracted' },
  { value: 'happy',      emoji: '😊', label: 'Happy'      },
  { value: 'stressed',   emoji: '😤', label: 'Stressed'   },
];

const EnergySlider = ({ value, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-text-muted">
      <span>Drained</span>
      <span className="text-text-primary font-semibold text-base">{value}/10</span>
      <span>Energised</span>
    </div>
    <input
      type="range" min={1} max={10} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-guardian cursor-pointer"
    />
    <EnergyBar value={value} max={10} />
  </div>
);

const MoodPicker = ({ selected, onChange }) => (
  <div className="grid grid-cols-4 gap-2">
    {MOODS.map(m => (
      <button
        key={m.value}
        type="button"
        onClick={() => onChange(m.value)}
        className={`flex flex-col items-center gap-1 py-3 rounded-lg border text-xs transition-all
          ${selected === m.value
            ? 'border-guardian bg-guardian/20 text-guardian'
            : 'border-bg-border bg-bg-raised text-text-muted hover:border-text-muted'}`}
      >
        <span className="text-xl">{m.emoji}</span>
        {m.label}
      </button>
    ))}
  </div>
);

// ─── Morning Check-in ─────────────────────────────────────────
const MorningCheckin = ({ onComplete }) => {
  const [form, setForm] = useState({
    mainObjective: '',
    availableHours: 4,
    topChallenge: '',
    energyLevel: 7,
    mood: '',
  });
  const [loading, setLoading]       = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [logId, setLogId]           = useState('');
  const [error, setError]           = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.mood || !form.mainObjective) {
      setError('Please fill in your objective and mood.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.ai.morning(form);
      setSuggestion(res.suggestion);
      setLogId(res.logId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (suggestion) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="text-3xl mb-2">☀️</div>
          <h2 className="text-text-primary font-semibold">Morning Brief Ready</h2>
          <p className="text-text-muted text-sm mt-1">Your Guardian has mapped out your day</p>
        </div>
        <GuardianBlock text={suggestion} />
        <button
          className="btn-primary w-full"
          onClick={() => onComplete(logId)}
        >
          Got it — let's go →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-text-primary font-semibold text-lg">Morning Check-in ☀️</h2>
        <p className="text-text-muted text-sm mt-1">
          Takes 2 minutes. Sets the intention for your whole day.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">
            What's your main objective today?
          </label>
          <input
            className="input"
            placeholder="e.g. Finish the Goals page, go to the gym, call dad"
            value={form.mainObjective}
            onChange={e => set('mainObjective', e.target.value)}
          />
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">
            How many focused hours do you have today?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 6, 8].map(h => (
              <button
                key={h}
                type="button"
                onClick={() => set('availableHours', h)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-all
                  ${form.availableHours === h
                    ? 'border-guardian bg-guardian/20 text-guardian'
                    : 'border-bg-border bg-bg-raised text-text-secondary hover:border-text-muted'}`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">
            What's your biggest challenge or blocker today?
          </label>
          <input
            className="input"
            placeholder="e.g. Hard to focus, too many meetings, not sure where to start"
            value={form.topChallenge}
            onChange={e => set('topChallenge', e.target.value)}
          />
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-3 block">Energy level right now</label>
          <EnergySlider value={form.energyLevel} onChange={v => set('energyLevel', v)} />
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-3 block">How are you feeling?</label>
          <MoodPicker selected={form.mood} onChange={v => set('mood', v)} />
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        className="btn-primary w-full flex items-center justify-center gap-2"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : '🧠 Get my Guardian brief'}
      </button>
    </div>
  );
};

// ─── Evening Check-in ─────────────────────────────────────────
const EveningCheckin = ({ logId, onComplete }) => {
  const [form, setForm] = useState({
    completedWork: '',
    blockers: '',
    eveningEnergy: 5,
    eveningReflection: '',
  });
  const [loading, setLoading]         = useState(false);
  const [observation, setObservation] = useState('');
  const [error, setError]             = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.completedWork) {
      setError('Tell your Guardian what you did today.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.ai.evening({ logId, ...form });
      setObservation(res.observation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (observation) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="text-center">
          <div className="text-3xl mb-2">🌙</div>
          <h2 className="text-text-primary font-semibold">Day logged</h2>
          <p className="text-text-muted text-sm mt-1">Guardian has processed your day</p>
        </div>
        <GuardianBlock text={observation} />
        <p className="text-text-muted text-xs text-center">
          Memories have been extracted and stored. Your Guardian is learning.
        </p>
        <button className="btn-primary w-full" onClick={onComplete}>
          Done for today ✓
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-text-primary font-semibold text-lg">Evening Log 🌙</h2>
        <p className="text-text-muted text-sm mt-1">
          Close the day. Your Guardian extracts memories from this.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">
            What did you actually complete today?
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Be specific. Even small wins count."
            value={form.completedWork}
            onChange={e => set('completedWork', e.target.value)}
          />
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">
            What blocked or slowed you down?
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="e.g. Got pulled into meetings, lost focus after lunch, family needed me"
            value={form.blockers}
            onChange={e => set('blockers', e.target.value)}
          />
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-3 block">Evening energy level</label>
          <EnergySlider value={form.eveningEnergy} onChange={v => set('eveningEnergy', v)} />
        </div>

        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">
            Any reflection? (optional)
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Something you noticed, felt, or want to remember..."
            value={form.eveningReflection}
            onChange={e => set('eveningReflection', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        className="btn-primary w-full flex items-center justify-center gap-2"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <Spinner size="sm" /> : '🌙 Log my evening'}
      </button>
    </div>
  );
};

// ─── Main Check-in Page ───────────────────────────────────────
export const CheckinPage = () => {
  const [todayLog, setTodayLog]   = useState(null);
  const [phase, setPhase]         = useState('loading'); // loading | morning | evening | done
  const [activeLogId, setLogId]   = useState(null);

  useEffect(() => {
    api.dailyLogs.today()
      .then(log => {
        setTodayLog(log);
        if (!log || !log.morningCompleted) setPhase('morning');
        else if (!log.eveningCompleted)    setPhase('evening');
        else                               setPhase('done');
        if (log?.id) setLogId(log.id);
      })
      .catch(() => setPhase('morning'));
  }, []);

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-text-primary font-semibold text-xl mb-2">
          Both check-ins complete
        </h2>
        <p className="text-text-muted text-sm">
          Your Guardian has everything it needs for today.
          See you tomorrow morning.
        </p>
        {todayLog?.guardianMorningSuggestion && (
          <div className="mt-8 text-left">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-3">
              This morning's brief
            </p>
            <GuardianBlock text={todayLog.guardianMorningSuggestion} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Phase tabs */}
      <div className="flex gap-1 bg-bg-surface border border-bg-border rounded-xl p-1 mb-6">
        {['morning', 'evening'].map(p => (
          <button
            key={p}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${phase === p
                ? 'bg-guardian text-white'
                : 'text-text-muted'}`}
            onClick={() => setPhase(p)}
            disabled={p === 'evening' && !activeLogId}
          >
            {p === 'morning' ? '☀️ Morning' : '🌙 Evening'}
            {p === 'morning' && todayLog?.morningCompleted && ' ✓'}
            {p === 'evening' && todayLog?.eveningCompleted && ' ✓'}
          </button>
        ))}
      </div>

      <div className="card">
        {phase === 'morning' && (
          <MorningCheckin
            onComplete={(id) => {
              setLogId(id);
              setPhase('evening');
            }}
          />
        )}
        {phase === 'evening' && (
          <EveningCheckin
            logId={activeLogId}
            onComplete={() => setPhase('done')}
          />
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Spinner, GuardianBlock } from '../components/ui';
import { useAuth } from '../store/AuthContext';

// ─── Step Config ──────────────────────────────────────────────
const TOTAL_STEPS = 7;

const DOMAINS = ['WORK', 'HEALTH', 'MONEY', 'GROWTH', 'RELATIONSHIPS', 'HOME', 'BUSINESS'];
const VALUES  = ['Freedom', 'Wealth', 'Family', 'Health', 'Impact', 'Knowledge', 'Status', 'Creativity', 'Stability', 'Adventure'];
const CONSTRAINTS = ['Limited time', 'Limited capital', 'Full-time job', 'Family responsibilities', 'Lack of skills', 'Lack of confidence', 'Health issues', 'Location'];
const RISK = ['LOW', 'MEDIUM', 'HIGH'];
const LEARNING = ['VISUAL', 'READING', 'HANDS_ON', 'AUDIO'];
const WORK_STYLE = ['MORNING_PERSON', 'NIGHT_OWL', 'MIXED'];

// ─── Helpers ──────────────────────────────────────────────────
const Toggle = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`px-3 py-1.5 rounded-lg text-sm border transition-all
      ${selected
        ? 'bg-guardian/20 border-guardian text-guardian'
        : 'bg-bg-raised border-bg-border text-text-secondary hover:border-text-muted'}`}
  >
    {label}
  </button>
);

const MultiSelect = ({ options, selected, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(o => (
      <Toggle
        key={o}
        label={o}
        selected={selected.includes(o)}
        onToggle={() =>
          onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o])
        }
      />
    ))}
  </div>
);

const SingleSelect = ({ options, selected, onChange, labels }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(o => (
      <Toggle
        key={o}
        label={labels?.[o] || o}
        selected={selected === o}
        onToggle={() => onChange(o)}
      />
    ))}
  </div>
);

const TextArea = ({ placeholder, value, onChange, rows = 3 }) => (
  <textarea
    className="input resize-none"
    rows={rows}
    placeholder={placeholder}
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

// ─── Step Components ──────────────────────────────────────────
const Step1Identity = ({ data, set }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="guardian-block mb-6">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" /> Guardian
      </div>
      <p className="text-text-secondary text-sm">
        Before I can help you, I need to understand who you are — not your job title, but your actual life.
        Let's start with the basics.
      </p>
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Age range</label>
      <SingleSelect
        options={['18-24', '25-30', '31-40', '41-50', '50+']}
        selected={data.ageRange}
        onChange={v => set('ageRange', v)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Current occupation</label>
      <input
        className="input"
        placeholder="e.g. Software Engineer at Alten"
        value={data.occupation}
        onChange={e => set('occupation', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Your current role in life</label>
      <input
        className="input"
        placeholder="e.g. Software Engineer"
        value={data.currentRole}
        onChange={e => set('currentRole', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Who do you want to become?</label>
      <input
        className="input"
        placeholder="e.g. Founder / Product Builder"
        value={data.futureRole}
        onChange={e => set('futureRole', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">All the roles you play in life</label>
      <input
        className="input"
        placeholder="e.g. Son, Gym person, App builder, Friend (comma separated)"
        value={data.lifeRolesRaw}
        onChange={e => set('lifeRolesRaw', e.target.value)}
      />
    </div>
  </div>
);

const Step2Responsibilities = ({ data, set }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="guardian-block mb-6">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" /> Guardian
      </div>
      <p className="text-text-secondary text-sm">
        Who depends on you? This changes everything about what advice I can give you.
        A person with no dependents can take risks that a son supporting his parents cannot.
      </p>
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Who are you responsible for?</label>
      <input
        className="input"
        placeholder="e.g. My parents, My younger sibling (comma separated)"
        value={data.responsibilitiesRaw}
        onChange={e => set('responsibilitiesRaw', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">What are you NOT willing to sacrifice?</label>
      <input
        className="input"
        placeholder="e.g. Family dinners, Daily gym time"
        value={data.notWillingRaw}
        onChange={e => set('notWillingRaw', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">What ARE you willing to sacrifice (temporarily)?</label>
      <input
        className="input"
        placeholder="e.g. Weekend socialising, Netflix time"
        value={data.willingRaw}
        onChange={e => set('willingRaw', e.target.value)}
      />
    </div>
  </div>
);

const Step3Goals = ({ data, set }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="guardian-block mb-6">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" /> Guardian
      </div>
      <p className="text-text-secondary text-sm">
        Not tasks. Not to-dos. Big directional goals.
        I'll use these to filter everything else — what you should do today, this week, this year.
      </p>
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">What do you want in the next 12 months?</label>
      <TextArea
        placeholder="e.g. Launch my first SaaS product and get 10 paying users"
        value={data.oneYearGoal}
        onChange={v => set('oneYearGoal', v)}
        rows={2}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Where do you want to be in 5 years?</label>
      <TextArea
        placeholder="e.g. Running my own tech company with a small team, financially free"
        value={data.fiveYearGoal}
        onChange={v => set('fiveYearGoal', v)}
        rows={2}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">What kind of life are you building overall?</label>
      <TextArea
        placeholder="e.g. A life of freedom — building things I'm proud of, taking care of my family, being healthy and present"
        value={data.lifetimeGoal}
        onChange={v => set('lifetimeGoal', v)}
        rows={2}
      />
    </div>
  </div>
);

const Step4Values = ({ data, set }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="guardian-block mb-6">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" /> Guardian
      </div>
      <p className="text-text-secondary text-sm">
        I'll track whether your daily actions actually match what you say matters.
        Most people discover a gap. That gap is where we do the real work.
      </p>
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-2 block">What matters most to you? (pick all that apply)</label>
      <MultiSelect
        options={VALUES}
        selected={data.declaredValues}
        onChange={v => set('declaredValues', v)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-2 block">What's currently holding you back?</label>
      <MultiSelect
        options={CONSTRAINTS}
        selected={data.constraints}
        onChange={v => set('constraints', v)}
      />
    </div>
  </div>
);

const Step5Psychology = ({ data, set }) => (
  <div className="space-y-6 animate-slide-up">
    <div className="guardian-block mb-6">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" /> Guardian
      </div>
      <p className="text-text-secondary text-sm">
        No right or wrong answers here. I use this to personalise how I reason about your situation —
        a high-risk person and a low-risk person with the same goal need completely different plans.
      </p>
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-2 block">Risk tolerance</label>
      <SingleSelect
        options={RISK}
        selected={data.riskTolerance}
        onChange={v => set('riskTolerance', v)}
        labels={{ LOW: 'Conservative', MEDIUM: 'Balanced', HIGH: 'Aggressive' }}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-2 block">How do you learn best?</label>
      <SingleSelect
        options={LEARNING}
        selected={data.learningStyle}
        onChange={v => set('learningStyle', v)}
        labels={{ VISUAL: 'Visual / Video', READING: 'Reading', HANDS_ON: 'Doing it', AUDIO: 'Listening' }}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-2 block">When do you do your best work?</label>
      <SingleSelect
        options={WORK_STYLE}
        selected={data.workStyle}
        onChange={v => set('workStyle', v)}
        labels={{ MORNING_PERSON: 'Morning (before 10am)', NIGHT_OWL: 'Night (after 8pm)', MIXED: 'Depends on the day' }}
      />
    </div>
  </div>
);

const Step6Strengths = ({ data, set }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="guardian-block mb-6">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" /> Guardian
      </div>
      <p className="text-text-secondary text-sm">
        Be honest. Not humble, not arrogant — honest.
        I'll observe your actual behavior over time and compare it to what you say here.
        That's where the real insight lives.
      </p>
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Your genuine strengths</label>
      <input
        className="input"
        placeholder="e.g. Persistence, Technical thinking, Curiosity (comma separated)"
        value={data.strengthsRaw}
        onChange={e => set('strengthsRaw', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">Your honest weaknesses</label>
      <input
        className="input"
        placeholder="e.g. Consistency, Overthinking, Context switching (comma separated)"
        value={data.weaknessesRaw}
        onChange={e => set('weaknessesRaw', e.target.value)}
      />
    </div>
    <div>
      <label className="text-text-secondary text-xs mb-1.5 block">
        The 3-5 biggest events that shaped who you are
        <span className="text-text-muted ml-1">(optional but powerful)</span>
      </label>
      <TextArea
        placeholder="e.g. Lost my grandfather at 18, Failed my first business idea, Got my first tech job at 22 (one per line)"
        value={data.lifeStoryRaw}
        onChange={v => set('lifeStoryRaw', v)}
        rows={4}
      />
    </div>
  </div>
);

const Step7Snapshot = ({ snapshot, loading }) => (
  <div className="space-y-5 animate-slide-up">
    <div className="text-center mb-6">
      <div className="text-4xl mb-3">🧠</div>
      <h3 className="text-text-primary font-semibold text-lg">Your Guardian has read your blueprint</h3>
      <p className="text-text-muted text-sm mt-1">Here's what it sees</p>
    </div>
    <GuardianBlock text={snapshot} loading={loading} />
    {!loading && snapshot && (
      <p className="text-text-muted text-xs text-center mt-4">
        Your Guardian will refine its understanding of you over time.
        The more you check in, the sharper its insights become.
      </p>
    )}
  </div>
);

// ─── Main Onboarding Page ─────────────────────────────────────
export const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving]     = useState(false);
  const [snapshot, setSnapshot] = useState('');
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState({
    ageRange: '',
    occupation: '',
    currentRole: '',
    futureRole: '',
    lifeRolesRaw: '',
    responsibilitiesRaw: '',
    notWillingRaw: '',
    willingRaw: '',
    oneYearGoal: '',
    fiveYearGoal: '',
    lifetimeGoal: '',
    declaredValues: [],
    constraints: [],
    riskTolerance: 'MEDIUM',
    learningStyle: 'HANDS_ON',
    workStyle: 'MIXED',
    strengthsRaw: '',
    weaknessesRaw: '',
    lifeStoryRaw: '',
  });

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const splitCSV = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
      return;
    }

    // Step 6 → save blueprint + generate snapshot
    setSaving(true);
    setError('');
    try {
      const blueprintPayload = {
        ageRange:   data.ageRange,
        occupation: data.occupation,
        currentRole: data.currentRole,
        futureRole:  data.futureRole,
        lifeRoles:   splitCSV(data.lifeRolesRaw),
        responsibilities:         splitCSV(data.responsibilitiesRaw),
        notWillingToSacrifice:    splitCSV(data.notWillingRaw),
        willingToSacrifice:       splitCSV(data.willingRaw),
        oneYearGoal:  data.oneYearGoal,
        fiveYearGoal: data.fiveYearGoal,
        lifetimeGoal: data.lifetimeGoal,
        declaredValues: data.declaredValues,
        constraints:    data.constraints,
        riskTolerance:  data.riskTolerance,
        learningStyle:  data.learningStyle,
        workStyle:      data.workStyle,
        selfReportedStrengths:  splitCSV(data.strengthsRaw),
        selfReportedWeaknesses: splitCSV(data.weaknessesRaw),
        lifeStoryEvents: data.lifeStoryRaw.split('\n').map(s => s.trim()).filter(Boolean),
        isComplete: true,
        completedAt: new Date().toISOString(),
      };

      await api.blueprint.create(blueprintPayload);
      setStep(TOTAL_STEPS);
      setSnapshotLoading(true);

      const { snapshot: snap } = await api.ai.lifeSnapshot();
      setSnapshot(snap);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setSnapshotLoading(false);
    }
  };

  const stepTitles = [
    'Who are you?',
    'Your responsibilities',
    'Your goals',
    'Your values',
    'Your psychology',
    'Strengths & story',
    'Your life snapshot',
  ];

  const isLastInputStep = step === TOTAL_STEPS - 1;
  const isSnapshotStep  = step === TOTAL_STEPS;

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-guardian flex items-center justify-center text-white font-bold text-xs">H</div>
            <span className="text-text-muted text-sm">HumanOS — Blueprint Setup</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-bg-border rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-guardian rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-text-primary font-semibold">{stepTitles[step - 1]}</h2>
            <span className="text-text-muted text-xs">{step} / {TOTAL_STEPS}</span>
          </div>
        </div>

        {/* Step content */}
        <div className="card min-h-64">
          {step === 1 && <Step1Identity data={data} set={set} />}
          {step === 2 && <Step2Responsibilities data={data} set={set} />}
          {step === 3 && <Step3Goals data={data} set={set} />}
          {step === 4 && <Step4Values data={data} set={set} />}
          {step === 5 && <Step5Psychology data={data} set={set} />}
          {step === 6 && <Step6Strengths data={data} set={set} />}
          {step === 7 && <Step7Snapshot snapshot={snapshot} loading={snapshotLoading} />}

          {error && (
            <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg mt-4">{error}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          {step > 1 && !isSnapshotStep ? (
            <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          ) : <div />}

          {!isSnapshotStep ? (
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleNext}
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : null}
              {isLastInputStep ? 'Build my blueprint' : 'Continue →'}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={() => navigate('/dashboard')}
              disabled={snapshotLoading}
            >
              Enter HumanOS →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

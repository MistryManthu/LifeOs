// ─── Guardian Block ────────────────────────────────────────────
// The AI's voice is always visually distinct
export const GuardianBlock = ({ text, loading }) => {
  if (loading) {
    return (
      <div className="guardian-block animate-pulse-soft">
        <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-guardian animate-pulse" />
          Guardian is thinking...
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-bg-border rounded w-3/4" />
          <div className="h-3 bg-bg-border rounded w-full" />
          <div className="h-3 bg-bg-border rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!text) return null;

  // Parse Guardian structured output into sections
  const lines = text.split('\n').filter(Boolean);

  return (
    <div className="guardian-block animate-fade-in">
      <div className="flex items-center gap-2 text-guardian text-xs font-medium mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-guardian" />
        Guardian
      </div>
      <div className="space-y-1.5">
        {lines.map((line, i) => {
          const isLabel = /^[A-Z_]+:/.test(line);
          if (isLabel) {
            const [label, ...rest] = line.split(':');
            return (
              <div key={i}>
                <span className="text-guardian text-xs font-semibold uppercase tracking-wider">
                  {label.replace(/_/g, ' ')}
                </span>
                <span className="text-text-primary text-sm ml-2">{rest.join(':').trim()}</span>
              </div>
            );
          }
          return <p key={i} className="text-text-secondary text-sm">{line}</p>;
        })}
      </div>
    </div>
  );
};

// ─── Spinner ───────────────────────────────────────────────────
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size]} border-2 border-bg-border border-t-guardian rounded-full animate-spin`} />
  );
};

// ─── Domain Badge ──────────────────────────────────────────────
const domainColors = {
  WORK:          'bg-blue-900/40 text-blue-400',
  HEALTH:        'bg-green-900/40 text-green-400',
  MONEY:         'bg-yellow-900/40 text-yellow-400',
  GROWTH:        'bg-purple-900/40 text-purple-400',
  RELATIONSHIPS: 'bg-pink-900/40 text-pink-400',
  HOME:          'bg-orange-900/40 text-orange-400',
  BUSINESS:      'bg-cyan-900/40 text-cyan-400',
};

export const DomainBadge = ({ domain }) => (
  <span className={`domain-badge ${domainColors[domain] || 'bg-bg-raised text-text-muted'}`}>
    {domain}
  </span>
);

// ─── Energy Indicator ─────────────────────────────────────────
export const EnergyBar = ({ value, max = 10 }) => {
  const pct = (value / max) * 100;
  const color = pct > 60 ? 'bg-growth' : pct > 30 ? 'bg-warning' : 'bg-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-text-muted">{value}/{max}</span>
    </div>
  );
};

// ─── Section Header ────────────────────────────────────────────
export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-text-primary font-semibold text-lg">{title}</h2>
      {subtitle && <p className="text-text-muted text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Empty State ───────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-text-primary font-medium mb-1">{title}</h3>
    <p className="text-text-muted text-sm max-w-xs mb-4">{description}</p>
    {action}
  </div>
);

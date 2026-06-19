import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Spinner } from '../components/ui';

const AuthCard = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-guardian flex items-center justify-center text-white font-bold">
          H
        </div>
        <div>
          <div className="text-text-primary font-semibold">HumanOS</div>
          <div className="text-text-muted text-xs">Life Intelligence System</div>
        </div>
      </div>

      <div className="card">
        <h1 className="text-text-primary text-xl font-semibold mb-1">{title}</h1>
        <p className="text-text-muted text-sm mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

// ─── Login ────────────────────────────────────────────────────
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Your Guardian is waiting.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">Password</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
          />
        </div>

        {error && (
          <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-text-muted text-sm mt-4">
        No account?{' '}
        <Link to="/register" className="text-guardian hover:underline">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
};

// ─── Register ─────────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/onboarding');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Begin your blueprint"
      subtitle="HumanOS learns who you are to help you become who you want to be."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">Your name</label>
          <input
            className="input"
            type="text"
            placeholder="Manthu"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">Email</label>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-text-secondary text-xs mb-1.5 block">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Choose a strong password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />
        </div>

        {error && (
          <p className="text-danger text-sm bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Create account'}
        </button>
      </form>

      <p className="text-center text-text-muted text-sm mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-guardian hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
};

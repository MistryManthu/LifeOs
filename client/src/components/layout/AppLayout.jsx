import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const navItems = [
  { to: '/dashboard',  icon: '⚡', label: 'Dashboard'    },
  { to: '/checkin',    icon: '🌅', label: 'Check-in'     },
  { to: '/goals',      icon: '🎯', label: 'Goals'        },
  { to: '/guardian',   icon: '🧠', label: 'Guardian'     },
  { to: '/memories',   icon: '💾', label: 'Memory'       },
  { to: '/timeline',   icon: '📅', label: 'Life Timeline'},
  { to: '/review',     icon: '📊', label: 'Weekly Review'},
  { to: '/blueprint',  icon: '👤', label: 'My Blueprint' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 min-h-screen bg-bg-surface border-r border-bg-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-guardian flex items-center justify-center text-white font-bold text-sm">
            H
          </div>
          <div>
            <div className="text-text-primary font-semibold text-sm">HumanOS</div>
            <div className="text-text-muted text-xs">Life Intelligence</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
               ${isActive
                 ? 'bg-guardian/20 text-guardian font-medium'
                 : 'text-text-secondary hover:text-text-primary hover:bg-bg-raised'}`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-bg-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-guardian/30 flex items-center justify-center text-guardian font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-text-primary text-sm font-medium truncate">{user?.name}</div>
            <div className="text-text-muted text-xs truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full text-left text-xs">
          Sign out
        </button>
      </div>
    </aside>
  );
};

export const AppLayout = ({ children }) => (
  <div className="flex min-h-screen bg-bg-base">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {children}
      </div>
    </main>
  </div>
);

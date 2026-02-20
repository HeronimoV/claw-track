import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { isOverdue, isDueToday } from '../../utils/helpers';
import { getInitials } from '../../utils/auth';

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const { currentUser, logout } = useAuth();
  const overdueCount = state.leads.filter(l => isOverdue(l) && l.status === 'Active').length;
  const dueTodayCount = state.leads.filter(l => isDueToday(l) && l.status === 'Active').length;

  const NAV_ITEMS = [
    { key: 'pipeline' as const, label: 'Pipeline', icon: '📊' },
    { key: 'list' as const, label: 'All Leads', icon: '📋' },
    { key: 'dashboard' as const, label: 'Dashboard', icon: '📈' },
    ...(currentUser?.role === 'Admin' ? [{ key: 'team' as const, label: 'Team', icon: '👥' }] : []),
  ];

  return (
    <aside className="w-60 bg-surface-1 border-r border-border flex flex-col h-screen shrink-0">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">CT</div>
          <div>
            <h1 className="text-base font-bold text-text-primary tracking-tight">ClawTrack</h1>
            <p className="text-[10px] text-text-tertiary uppercase tracking-widest">CRM Pipeline</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => dispatch({ type: 'SET_VIEW', view: item.key })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
              state.currentView === item.key
                ? 'bg-brand/15 text-brand-light font-medium'
                : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 text-danger text-xs font-medium">
            <span>⚠️</span>
            {overdueCount} overdue follow-up{overdueCount !== 1 ? 's' : ''}
          </div>
        )}
        {dueTodayCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 text-warning text-xs font-medium">
            <span>📌</span>
            {dueTodayCount} due today
          </div>
        )}
        <div className="px-3 py-2 text-text-tertiary text-[10px]">
          {state.leads.length} total leads
        </div>
      </div>

      {/* User section */}
      {currentUser && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'profile' })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-3 transition-all"
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: currentUser.avatarColor }}>
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-text-primary truncate">{currentUser.name}</p>
              <p className="text-[10px] text-text-tertiary">{currentUser.role}</p>
            </div>
          </button>
          <button
            onClick={logout}
            className="w-full mt-1 px-3 py-2 text-xs text-text-tertiary hover:text-danger hover:bg-surface-3 rounded-lg transition-all text-left"
          >
            🚪 Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}

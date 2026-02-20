import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { PIPELINE_STAGES } from '../../types';
import { formatCurrency, formatDate, isOverdue, isDueToday, daysBetween } from '../../utils/helpers';
import { getInitials } from '../../utils/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { users } = useAuth();
  const [activityFilter, setActivityFilter] = useState('');
  const leads = state.leads;
  const active = leads.filter(l => l.status === 'Active' || l.status === 'On Hold');
  const closedWon = leads.filter(l => l.pipelineStage === 'closed_won');
  const closedLost = leads.filter(l => l.pipelineStage === 'closed_lost');
  const totalClosed = closedWon.length + closedLost.length;
  const winRate = totalClosed > 0 ? Math.round((closedWon.length / totalClosed) * 100) : 0;
  const pipelineValue = active.reduce((sum, l) => sum + l.dealValue, 0);
  const revenueWon = closedWon.reduce((sum, l) => sum + l.dealValue, 0);
  const overdueLeads = leads.filter(l => isOverdue(l) && l.status === 'Active');
  const dueTodayLeads = leads.filter(l => isDueToday(l) && l.status === 'Active');

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const addedThisWeek = leads.filter(l => l.createdDate >= weekAgo).length;
  const addedThisMonth = leads.filter(l => l.createdDate >= monthAgo).length;

  const avgDaysToClose = closedWon.length > 0
    ? Math.round(closedWon.reduce((sum, l) => sum + daysBetween(l.createdDate, l.stageEnteredDate), 0) / closedWon.length)
    : 0;

  // Charts data
  const stageData = PIPELINE_STAGES.map(s => ({
    name: s.label.replace(' ', '\n'),
    count: leads.filter(l => l.pipelineStage === s.key).length,
  }));

  const industryMap: Record<string, number> = {};
  leads.forEach(l => { if (l.industry) industryMap[l.industry] = (industryMap[l.industry] || 0) + 1; });
  const industryData = Object.entries(industryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const sourceMap: Record<string, number> = {};
  leads.forEach(l => { if (l.leadSource) sourceMap[l.leadSource] = (sourceMap[l.leadSource] || 0) + 1; });
  const sourceData = Object.entries(sourceMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Team performance data from actual registered users
  const activeMembers = users.filter(u => u.active);
  const teamData = activeMembers.map(m => {
    const memberLeads = leads.filter(l => l.assignedTo === m.name);
    const callsThisWeek = memberLeads.flatMap(l => l.activities).filter(a => a.type === 'Call' && a.timestamp >= weekAgo).length;
    const callsThisMonth = memberLeads.flatMap(l => l.activities).filter(a => a.type === 'Call' && a.timestamp >= monthAgo).length;
    const won = memberLeads.filter(l => l.pipelineStage === 'closed_won');
    const lost = memberLeads.filter(l => l.pipelineStage === 'closed_lost');
    const totalClosedMember = won.length + lost.length;
    const activitiesCount = memberLeads.flatMap(l => l.activities).length;
    return {
      name: m.name,
      color: m.avatarColor,
      assigned: memberLeads.length,
      won: won.length,
      pipeline: memberLeads.filter(l => l.status === 'Active').reduce((s, l) => s + l.dealValue, 0),
      callsWeek: callsThisWeek,
      callsMonth: callsThisMonth,
      activities: activitiesCount,
      conversionRate: totalClosedMember > 0 ? Math.round((won.length / totalClosedMember) * 100) : 0,
    };
  });

  // Global activity feed
  const allActivities = leads.flatMap(l =>
    l.activities.map(a => ({ ...a, companyName: l.companyName }))
  ).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const filteredActivities = activityFilter
    ? allActivities.filter(a => a.userName === activityFilter)
    : allActivities;

  // Conversion rates
  const conversionData = PIPELINE_STAGES.slice(0, -1).map((s, i) => {
    const current = leads.filter(l => l.pipelineStage === s.key).length;
    const nextStages = PIPELINE_STAGES.slice(i + 1);
    const movedForward = leads.filter(l => nextStages.some(ns => ns.key === l.pipelineStage)).length;
    const total = current + movedForward;
    return { from: s.label, rate: total > 0 ? Math.round((movedForward / total) * 100) : 0 };
  });

  const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
    <div className="bg-surface-1 border border-border rounded-xl p-4 hover:border-brand/20 transition-all">
      <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || 'text-text-primary'}`}>{value}</p>
      {sub && <p className="text-[10px] text-text-tertiary mt-1">{sub}</p>}
    </div>
  );

  const CustomTooltip = ({ active: a, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (!a || !payload?.length) return null;
    return (
      <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
        <p className="text-text-primary font-medium">{payload[0].name}: {payload[0].value}</p>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Due today / overdue */}
      {(overdueLeads.length > 0 || dueTodayLeads.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueLeads.length > 0 && (
            <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-danger mb-2">⚠️ Overdue Follow-Ups ({overdueLeads.length})</h3>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {overdueLeads.map(l => (
                  <button key={l.id} onClick={() => dispatch({ type: 'SELECT_LEAD', id: l.id })}
                    className="block w-full text-left text-xs text-text-secondary hover:text-text-primary transition-colors">
                    <span className="font-medium">{l.companyName}</span> — {l.contactName}
                  </button>
                ))}
              </div>
            </div>
          )}
          {dueTodayLeads.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-warning mb-2">📌 Due Today ({dueTodayLeads.length})</h3>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {dueTodayLeads.map(l => (
                  <button key={l.id} onClick={() => dispatch({ type: 'SELECT_LEAD', id: l.id })}
                    className="block w-full text-left text-xs text-text-secondary hover:text-text-primary transition-colors">
                    <span className="font-medium">{l.companyName}</span> — {l.contactName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <StatCard label="Total Leads" value={leads.length} sub={`${addedThisWeek} this week`} />
        <StatCard label="Active Pipeline" value={active.length} />
        <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue)} color="text-brand" />
        <StatCard label="Revenue Won" value={formatCurrency(revenueWon)} color="text-success" />
        <StatCard label="Win Rate" value={`${winRate}%`} sub={`${closedWon.length}W / ${closedLost.length}L`} />
        <StatCard label="Avg Days to Close" value={avgDaysToClose} />
        <StatCard label="Added This Month" value={addedThisMonth} />
        <StatCard label="Overdue" value={overdueLeads.length} color={overdueLeads.length > 0 ? 'text-danger' : undefined} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by stage */}
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Leads by Stage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9494a8' }} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: '#9494a8' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by industry */}
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Leads by Industry</h3>
          {industryData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={industryData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {industryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {industryData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-text-secondary truncate">{d.name}</span>
                    <span className="text-text-tertiary ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-xs text-text-tertiary">No data yet</p>}
        </div>

        {/* Leads by source */}
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9494a8' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9494a8' }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team performance */}
        <div className="bg-surface-1 border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Team Performance</h3>
          {teamData.length > 0 ? (
            <div className="space-y-3">
              {teamData.map(m => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: m.color }}>
                    {getInitials(m.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-primary font-medium">{m.name}</span>
                      <span className="text-text-tertiary">{m.assigned} leads · {m.won} won</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${Math.min(100, (m.assigned / Math.max(leads.length, 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-text-tertiary">No team members registered yet</p>}
        </div>

        {/* Detailed Team Stats */}
        {teamData.length > 0 && (
          <div className="bg-surface-1 border border-border rounded-xl p-5 col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Team Member Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-text-tertiary font-medium">Member</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Leads</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Calls (Wk)</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Calls (Mo)</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Won</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Pipeline $</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Activities</th>
                    <th className="text-right py-2 text-text-tertiary font-medium">Win %</th>
                  </tr>
                </thead>
                <tbody>
                  {teamData.map(m => (
                    <tr key={m.name} className="border-b border-border/50">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: m.color }}>
                            {getInitials(m.name)}
                          </div>
                          <span className="text-text-primary">{m.name}</span>
                        </div>
                      </td>
                      <td className="text-right text-text-secondary py-2.5">{m.assigned}</td>
                      <td className="text-right text-text-secondary py-2.5">{m.callsWeek}</td>
                      <td className="text-right text-text-secondary py-2.5">{m.callsMonth}</td>
                      <td className="text-right text-success py-2.5 font-medium">{m.won}</td>
                      <td className="text-right text-brand py-2.5">{formatCurrency(m.pipeline)}</td>
                      <td className="text-right text-text-secondary py-2.5">{m.activities}</td>
                      <td className="text-right py-2.5">
                        <span className={m.conversionRate >= 50 ? 'text-success' : m.conversionRate >= 25 ? 'text-warning' : 'text-text-tertiary'}>
                          {m.conversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Conversion rates */}
        <div className="bg-surface-1 border border-border rounded-xl p-5 col-span-1 lg:col-span-2">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Stage Conversion Rates</h3>
          <div className="flex items-center gap-2 overflow-x-auto">
            {conversionData.map((d, i) => (
              <div key={d.from} className="flex items-center gap-2 shrink-0">
                <div className="text-center">
                  <p className="text-[10px] text-text-tertiary truncate max-w-[80px]">{d.from}</p>
                  <p className={`text-sm font-bold mt-1 ${d.rate >= 50 ? 'text-success' : d.rate >= 25 ? 'text-warning' : 'text-text-secondary'}`}>{d.rate}%</p>
                </div>
                {i < conversionData.length - 1 && <span className="text-text-tertiary text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-surface-1 border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
          <select
            value={activityFilter}
            onChange={e => setActivityFilter(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-brand/50 transition-all"
          >
            <option value="">All Members</option>
            {activeMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {filteredActivities.slice(0, 50).map(a => {
            const user = users.find(u => u.name === a.userName);
            return (
              <div key={a.id} className="flex items-start gap-3 py-1.5">
                {user ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: user.avatarColor }}>
                    {getInitials(user.name)}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {a.type === 'Call' ? '📞' : a.type === 'Email' ? '📧' : a.type === 'Meeting' ? '🤝' :
                     a.type === 'Stage Change' ? '📊' : a.type === 'Follow-Up' ? '📌' : '📝'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary">
                    {a.description}
                    {a.companyName && <span className="text-text-secondary"> — {a.companyName}</span>}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">{a.type} · {formatDate(a.timestamp)}</p>
                </div>
              </div>
            );
          })}
          {filteredActivities.length === 0 && <p className="text-xs text-text-tertiary">No activity yet</p>}
        </div>
      </div>
    </div>
  );
}

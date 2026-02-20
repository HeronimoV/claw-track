import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { useApp } from '../../store/AppContext';
import { TEAM_MEMBERS } from '../../types';

type TimeRange = 'week' | 'month' | 'all';

const MEMBER_COLORS: Record<string, string> = { CD: '#DC2626', Pablo: '#2563EB', Chito: '#16A34A', Arturo: '#9333EA' };

function getStart(range: TimeRange): string {
  const now = new Date();
  if (range === 'week') { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString(); }
  if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return '2020-01-01T00:00:00Z';
}

interface MemberStats {
  name: string;
  calls: number;
  deals: number;
  revenue: number;
  tasks: number;
  pipelineValue: number;
  score: number;
}

export default function Leaderboard() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activities, setActivities] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = getStart(timeRange);
    const [actRes, revRes, taskRes] = await Promise.all([
      supabase.from('activities').select('*').gte('created_at', start),
      supabase.from('revenue').select('*').gte('date', start).eq('status', 'Paid'),
      supabase.from('tasks').select('*').eq('status', 'done').gte('completed_at', start),
    ]);
    if (actRes.data) setActivities(actRes.data);
    if (revRes.data) setRevenue(revRes.data);
    if (taskRes.data) setTasks(taskRes.data);
    setLoading(false);
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const start = getStart(timeRange);
  const members: MemberStats[] = TEAM_MEMBERS.map(name => {
    const calls = activities.filter(a => a.type === 'Call' && a.user_name === name).length;
    const deals = state.leads.filter(l => l.assignedTo === name && l.pipelineStage === 'closed_won' && new Date(l.stageEnteredDate) >= new Date(start)).length;
    const rev = revenue.filter(r => r.created_by_name === name).reduce((s, r) => s + (r.amount || 0), 0);
    const tasksCompleted = tasks.filter(t => t.assigned_to === name).length;
    const pipelineValue = state.leads.filter(l => l.assignedTo === name && l.pipelineStage !== 'closed_won').reduce((s, l) => s + (l.dealValue || 0), 0);
    return { name, calls, deals, revenue: rev, tasks: tasksCompleted, pipelineValue, score: deals * 100 + calls * 10 + rev / 100 + tasksCompleted * 20 };
  }).sort((a, b) => b.score - a.score);

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

  // Category leaders
  const mostCalls = [...members].sort((a, b) => b.calls - a.calls)[0];
  const topCloser = [...members].sort((a, b) => b.deals - a.deals)[0];
  const revenueKing = [...members].sort((a, b) => b.revenue - a.revenue)[0];
  const taskMachine = [...members].sort((a, b) => b.tasks - a.tasks)[0];

  const ranges: { key: TimeRange; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {ranges.map(r => (
            <button key={r.key} onClick={() => setTimeRange(r.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === r.key ? 'bg-white text-[#DC2626] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Leaders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '📞 Most Calls', name: mostCalls?.name, value: mostCalls?.calls || 0 },
          { label: '🤝 Top Closer', name: topCloser?.name, value: topCloser?.deals || 0 },
          { label: '💰 Revenue King', name: revenueKing?.name, value: fmt(revenueKing?.revenue || 0) },
          { label: '⚡ Task Machine', name: taskMachine?.name, value: taskMachine?.tasks || 0 },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: MEMBER_COLORS[c.name || ''] || '#6B7280' }}>
              {(c.name || '??').slice(0, 2).toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-gray-900">{c.name}</div>
            <div className="text-2xl font-bold text-[#DC2626]">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Rankings */}
      <div className="space-y-4">
        {members.map((m, i) => (
          <div key={m.name} className={`bg-white rounded-xl border p-5 flex items-center gap-5 ${i === 0 ? 'border-[#DC2626]/30 ring-1 ring-[#DC2626]/10' : 'border-gray-200'}`}>
            <div className="text-3xl font-black text-gray-300 w-12 text-center">
              {i === 0 ? '🏆' : `#${i + 1}`}
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ backgroundColor: MEMBER_COLORS[m.name] || '#6B7280' }}>
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-900">{m.name}</div>
              <div className="flex flex-wrap gap-4 mt-1">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{m.calls}</div>
                  <div className="text-[10px] text-gray-500">Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{m.deals}</div>
                  <div className="text-[10px] text-gray-500">Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[#DC2626]">{fmt(m.revenue)}</div>
                  <div className="text-[10px] text-gray-500">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{m.tasks}</div>
                  <div className="text-[10px] text-gray-500">Tasks Done</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{fmt(m.pipelineValue)}</div>
                  <div className="text-[10px] text-gray-500">Pipeline</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

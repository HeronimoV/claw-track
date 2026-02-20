import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../store/AuthContext';
import { useApp } from '../../store/AppContext';
import { TEAM_MEMBERS } from '../../types';

interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  lead_id: string | null;
  due_date: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'todo' | 'in_progress' | 'done';
  created_by: string;
  created_by_name: string;
  completed_at: string | null;
  created_at: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

const COLUMNS: { key: Task['status']; label: string; icon: string }[] = [
  { key: 'todo', label: 'To Do', icon: '📋' },
  { key: 'in_progress', label: 'In Progress', icon: '🔄' },
  { key: 'done', label: 'Done', icon: '✅' },
];

const MEMBER_COLORS: Record<string, string> = { CD: '#DC2626', Pablo: '#2563EB', Chito: '#16A34A', Arturo: '#9333EA' };

export default function TaskManager() {
  const { currentUser } = useAuth();
  const { state } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [filterAssigned, setFilterAssigned] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '', due_date: '', priority: 'Medium' as Task['priority'], lead_id: '',
  });

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setTasks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    const channel = supabase.channel('tasks-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  const openAdd = () => {
    setEditTask(null);
    setForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'Medium', lead_id: '' });
    setShowModal(true);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({ title: t.title, description: t.description, assigned_to: t.assigned_to, due_date: t.due_date?.slice(0, 10) || '', priority: t.priority, lead_id: t.lead_id || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !currentUser) return;
    if (editTask) {
      await supabase.from('tasks').update({
        title: form.title, description: form.description, assigned_to: form.assigned_to,
        due_date: form.due_date || null, priority: form.priority, lead_id: form.lead_id || null,
      }).eq('id', editTask.id);
    } else {
      await supabase.from('tasks').insert({
        title: form.title, description: form.description, assigned_to: form.assigned_to,
        due_date: form.due_date || null, priority: form.priority, lead_id: form.lead_id || null,
        status: 'todo', created_by: currentUser.id, created_by_name: currentUser.name,
      });
    }
    setShowModal(false);
    fetchTasks();
  };

  const moveTask = async (id: string, status: Task['status']) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'done') updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;
    await supabase.from('tasks').update(updates).eq('id', id);
    fetchTasks();
  };

  const handleDrop = (status: Task['status']) => {
    if (dragId) { moveTask(dragId, status); setDragId(null); }
  };

  const filtered = tasks.filter(t => {
    if (filterAssigned && t.assigned_to !== filterAssigned) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const isOverdue = (t: Task) => t.due_date && t.status !== 'done' && new Date(t.due_date) < new Date();

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]';
  const labelClass = 'block text-xs font-medium text-gray-700 mb-1';

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="h-full overflow-hidden flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">📅 Tasks</h1>
        <div className="flex items-center gap-3">
          <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs">
            <option value="">All Members</option>
            {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs">
            <option value="">All Priorities</option>
            {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={openAdd} className="px-4 py-2 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-[#B91C1C] transition-all">
            + Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {COLUMNS.map(col => (
          <div key={col.key}
            className="flex flex-col bg-gray-50 rounded-xl overflow-hidden"
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}>
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">{col.icon} {col.label}
                <span className="ml-2 text-xs text-gray-400">{filtered.filter(t => t.status === col.key).length}</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.filter(t => t.status === col.key).map(t => (
                <div key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onClick={() => openEdit(t)}
                  className={`bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all ${isOverdue(t) ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                  <div className="text-sm font-medium text-gray-900 mb-2">{t.title}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {t.assigned_to && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: MEMBER_COLORS[t.assigned_to] || '#6B7280' }}>
                          {t.assigned_to.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                    </div>
                    {t.due_date && (
                      <span className={`text-[10px] ${isOverdue(t) ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                        {new Date(t.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {col.key !== 'done' && (
                    <div className="mt-2 flex gap-1">
                      {COLUMNS.filter(c => c.key !== t.status).map(c => (
                        <button key={c.key} onClick={e => { e.stopPropagation(); moveTask(t.id, c.key); }}
                          className="text-[10px] text-gray-400 hover:text-[#DC2626] px-1.5 py-0.5 rounded border border-gray-100 hover:border-[#DC2626]/30 transition-all">
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900">{editTask ? 'Edit Task' : 'Add Task'}</h2>
            <div><label className={labelClass}>Title *</label><input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className={labelClass}>Description</label><textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Assigned To</label>
                <select className={inputClass} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Due Date</label><input type="date" className={inputClass} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Priority</label>
                <select className={inputClass} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Task['priority'] })}>
                  {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Link to Lead</label>
                <select className={inputClass} value={form.lead_id} onChange={e => setForm({ ...form, lead_id: e.target.value })}>
                  <option value="">None</option>
                  {state.leads.map(l => <option key={l.id} value={l.id}>{l.companyName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#DC2626] text-white text-sm font-medium rounded-lg hover:bg-[#B91C1C]">
                {editTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

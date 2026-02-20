import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { PIPELINE_STAGES, INDUSTRIES, COMPANY_SIZES, LEAD_SOURCES, LEAD_STATUSES } from '../../types';
import type { Lead, ActivityType } from '../../types';
import { formatCurrency, formatDate, daysInStage, isOverdue } from '../../utils/helpers';
import { getInitials } from '../../utils/auth';

const inputClass = "w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 transition-all";
const labelClass = "block text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1";

const ACTIVITY_TYPES: ActivityType[] = ['Call', 'Email', 'Meeting', 'Note', 'Follow-Up'];

export default function LeadDetail() {
  const { state, dispatch, updateLead, deleteLead, addActivity } = useApp();
  const { currentUser, users } = useAuth();
  const lead = state.leads.find(l => l.id === state.selectedLeadId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Call');
  const [activityDesc, setActivityDesc] = useState('');

  const activeMembers = users.filter(u => u.active).map(u => u.name);

  // Access control
  const canEdit = currentUser && (
    currentUser.role === 'Admin' ||
    currentUser.role === 'Manager' ||
    (currentUser.role === 'Sales Rep' && lead?.assignedTo === currentUser.name)
  );
  const canDelete = currentUser?.role === 'Admin';

  if (!lead) return (
    <div className="flex items-center justify-center h-full text-text-tertiary">
      <p>Select a lead to view details</p>
    </div>
  );

  const startEdit = () => { setForm({ ...lead }); setEditing(true); };
  const cancelEdit = () => { setForm(null); setEditing(false); };
  const saveEdit = () => {
    if (form) { updateLead(form); setEditing(false); setForm(null); }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const updated = {
      ...lead,
      notes: [{ id: uuidv4(), content: newNote.trim(), createdAt: new Date().toISOString(), userId: currentUser?.id, userName: currentUser?.name }, ...lead.notes],
    };
    updateLead(updated);
    addActivity(lead.id, 'Note', `${currentUser?.name || 'Someone'} added a note`);
    setNewNote('');
  };

  const addTag = () => {
    if (!newTag.trim() || lead.tags.includes(newTag.trim())) return;
    updateLead({ ...lead, tags: [...lead.tags, newTag.trim()] });
    setNewTag('');
  };

  const removeTag = (tag: string) => updateLead({ ...lead, tags: lead.tags.filter(t => t !== tag) });

  const logActivity = () => {
    if (!activityDesc.trim()) return;
    addActivity(lead.id, activityType, activityDesc.trim());
    setActivityDesc('');
  };

  const handleDelete = () => {
    if (confirm('Delete this lead? This cannot be undone.')) {
      deleteLead(lead.id);
      dispatch({ type: 'SET_VIEW', view: 'pipeline' });
    }
  };

  const overdue = isOverdue(lead);
  const days = daysInStage(lead);
  const currentData = editing && form ? form : lead;
  const set = (key: keyof Lead, val: unknown) => form && setForm({ ...form, [key]: val });

  // Find user avatar color for activity
  const getUserColor = (userName?: string) => {
    if (!userName) return undefined;
    const u = users.find(u => u.name === userName);
    return u?.avatarColor;
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-border flex items-center justify-between ${overdue ? 'bg-danger/5' : 'bg-surface-1'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => dispatch({ type: 'SET_VIEW', view: 'pipeline' })} className="text-text-tertiary hover:text-text-primary transition-colors">
            ← Back
          </button>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{lead.companyName || 'Untitled Lead'}</h2>
            <p className="text-sm text-text-secondary">{lead.contactName} {lead.title ? `· ${lead.title}` : ''}</p>
            {lead.lastEditedBy && (
              <p className="text-[10px] text-text-tertiary mt-0.5">Last edited by {lead.lastEditedBy} on {formatDate(lead.lastEditedAt || '')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            lead.leadScore >= 70 ? 'bg-success/20 text-success' :
            lead.leadScore >= 40 ? 'bg-warning/20 text-warning' :
            'bg-surface-3 text-text-tertiary'
          }`}>Score: {lead.leadScore}</span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            lead.status === 'Won' ? 'bg-success/20 text-success' :
            lead.status === 'Lost' ? 'bg-danger/20 text-danger' :
            lead.status === 'On Hold' ? 'bg-warning/20 text-warning' :
            'bg-info/20 text-info'
          }`}>{lead.status}</span>
          {canEdit && !editing && (
            <button onClick={startEdit} className="px-4 py-2 text-sm bg-surface-3 hover:bg-surface-4 text-text-primary rounded-lg transition-all">Edit</button>
          )}
          {editing && (
            <>
              <button onClick={saveEdit} className="px-4 py-2 text-sm bg-brand hover:bg-brand-dark text-white rounded-lg transition-all">Save</button>
              <button onClick={cancelEdit} className="px-4 py-2 text-sm text-text-secondary hover:bg-surface-3 rounded-lg transition-all">Cancel</button>
            </>
          )}
          {canDelete && (
            <button onClick={handleDelete} className="px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-all">🗑</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Left: Details */}
        <div className="col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Deal Value', value: formatCurrency(lead.dealValue) },
              { label: 'Days in Stage', value: `${days}d` },
              { label: 'Stage', value: PIPELINE_STAGES.find(s => s.key === lead.pipelineStage)?.label || '' },
              { label: 'Next Follow-Up', value: formatDate(lead.nextFollowUpDate) },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-1 border border-border rounded-lg p-3">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{stat.label}</p>
                <p className="text-sm font-semibold text-text-primary mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Editable fields */}
          <div className="bg-surface-1 border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {([
                ['companyName', 'Company Name', 'text'],
                ['contactName', 'Contact Name', 'text'],
                ['title', 'Title/Role', 'text'],
                ['email', 'Email', 'email'],
                ['phone', 'Phone', 'text'],
                ['website', 'Website', 'text'],
                ['city', 'City/Location', 'text'],
                ['estimatedMonthlyRevenue', 'Est. Monthly Revenue', 'text'],
                ['dealValue', 'Deal Value ($)', 'number'],
                ['expectedCloseDate', 'Expected Close Date', 'date'],
                ['nextFollowUpDate', 'Next Follow-Up', 'date'],
                ['lastContactDate', 'Last Contact', 'date'],
              ] as const).map(([key, label, type]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  {editing ? (
                    <input className={inputClass} type={type} value={String(currentData[key] || '')}
                      onChange={e => set(key, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />
                  ) : (
                    <p className="text-sm text-text-primary py-2">
                      {key === 'dealValue' ? formatCurrency(lead[key]) : key.includes('Date') ? formatDate(String(lead[key])) : String(lead[key]) || '—'}
                    </p>
                  )}
                </div>
              ))}
              {([
                ['industry', 'Industry', INDUSTRIES as readonly string[]],
                ['companySize', 'Company Size', COMPANY_SIZES as readonly string[]],
                ['leadSource', 'Lead Source', LEAD_SOURCES as readonly string[]],
                ['assignedTo', 'Assigned To', activeMembers],
                ['pipelineStage', 'Pipeline Stage', PIPELINE_STAGES.map(s => s.key)],
                ['status', 'Status', LEAD_STATUSES as readonly string[]],
              ] as const).map(([key, label, options]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  {editing ? (
                    <select className={inputClass} value={String(currentData[key] || '')}
                      onChange={e => set(key, e.target.value)}>
                      <option value="">Select...</option>
                      {(options as readonly string[]).map(o => {
                        const displayLabel = key === 'pipelineStage' ? (PIPELINE_STAGES.find(s => s.key === o)?.label || o) : o;
                        return <option key={o} value={o}>{displayLabel}</option>;
                      })}
                    </select>
                  ) : (
                    <p className="text-sm text-text-primary py-2">
                      {key === 'pipelineStage' ? (PIPELINE_STAGES.find(s => s.key === lead[key])?.label || lead[key]) : String(lead[key]) || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {lead.pipelineStage === 'closed_lost' && (
              <div>
                <label className={labelClass}>Lost Reason</label>
                {editing ? (
                  <input className={inputClass} value={currentData.lostReason || ''} onChange={e => set('lostReason', e.target.value)} placeholder="Why was this lost?" />
                ) : (
                  <p className="text-sm text-text-primary py-2">{lead.lostReason || '—'}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-surface-1 border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Notes</h3>
            {canEdit && (
              <div className="flex gap-2 mb-4">
                <textarea
                  className={`${inputClass} min-h-[60px] resize-none`}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(); }}
                />
                <button onClick={addNote} className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm rounded-lg shrink-0 transition-all self-end">
                  Add
                </button>
              </div>
            )}
            <div className="space-y-3">
              {lead.notes.map(note => (
                <div key={note.id} className="bg-surface-2 rounded-lg p-3 animate-fadeIn">
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {note.userName && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold"
                          style={{ backgroundColor: getUserColor(note.userName) || '#5e5e72' }}>
                          {getInitials(note.userName)}
                        </div>
                        <span className="text-[10px] text-text-secondary">{note.userName}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-text-tertiary">{formatDate(note.createdAt)}</p>
                  </div>
                </div>
              ))}
              {lead.notes.length === 0 && <p className="text-xs text-text-tertiary">No notes yet</p>}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Tags */}
          <div className="bg-surface-1 border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {lead.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs bg-brand/10 text-brand-light px-2 py-1 rounded-full">
                  {tag}
                  {canEdit && <button onClick={() => removeTag(tag)} className="hover:text-danger text-[10px]">✕</button>}
                </span>
              ))}
              {lead.tags.length === 0 && <p className="text-xs text-text-tertiary">No tags</p>}
            </div>
            {canEdit && (
              <div className="flex gap-1.5">
                <input className={`${inputClass} text-xs`} value={newTag} onChange={e => setNewTag(e.target.value)}
                  placeholder="Add tag..." onKeyDown={e => { if (e.key === 'Enter') addTag(); }} />
                <button onClick={addTag} className="text-xs text-brand hover:text-brand-light px-2 shrink-0">+</button>
              </div>
            )}
          </div>

          {/* Log Activity */}
          {canEdit && (
            <div className="bg-surface-1 border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Log Activity</h3>
              <select className={`${inputClass} text-xs mb-2`} value={activityType} onChange={e => setActivityType(e.target.value as ActivityType)}>
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <textarea className={`${inputClass} text-xs min-h-[50px] resize-none mb-2`} value={activityDesc} onChange={e => setActivityDesc(e.target.value)} placeholder="What happened?" />
              <button onClick={logActivity} className="w-full px-3 py-2 bg-surface-3 hover:bg-surface-4 text-text-primary text-xs rounded-lg transition-all">
                Log Activity
              </button>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-surface-1 border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Activity Timeline</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {lead.activities.map(activity => (
                <div key={activity.id} className="flex gap-3 animate-slideIn">
                  {activity.userName ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: getUserColor(activity.userName) || '#5e5e72' }}>
                      {getInitials(activity.userName)}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {activity.type === 'Call' ? '📞' : activity.type === 'Email' ? '📧' : activity.type === 'Meeting' ? '🤝' :
                       activity.type === 'Stage Change' ? '📊' : activity.type === 'Follow-Up' ? '📌' : '📝'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary">{activity.description}</p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">
                      {activity.userName && `${activity.userName} · `}{activity.type} · {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {lead.activities.length === 0 && <p className="text-xs text-text-tertiary">No activity yet</p>}
            </div>
          </div>

          {/* Meta info */}
          <div className="bg-surface-1 border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between"><span className="text-[10px] text-text-tertiary">Created</span><span className="text-xs text-text-secondary">{formatDate(lead.createdDate)}</span></div>
            <div className="flex justify-between"><span className="text-[10px] text-text-tertiary">Last Contact</span><span className="text-xs text-text-secondary">{formatDate(lead.lastContactDate)}</span></div>
            {lead.lastEditedBy && (
              <div className="flex justify-between"><span className="text-[10px] text-text-tertiary">Last Edited By</span><span className="text-xs text-text-secondary">{lead.lastEditedBy}</span></div>
            )}
            <div className="flex justify-between"><span className="text-[10px] text-text-tertiary">Lead ID</span><span className="text-[10px] text-text-tertiary font-mono">{lead.id.slice(0, 8)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

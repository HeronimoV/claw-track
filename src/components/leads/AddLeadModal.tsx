import { useState } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../store/AppContext';
import { useAuth } from '../../store/AuthContext';
import { INDUSTRIES, COMPANY_SIZES, LEAD_SOURCES, PIPELINE_STAGES } from '../../types';

const inputClass = "w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/25 transition-all";
const labelClass = "block text-xs font-medium text-text-secondary mb-1";

export default function AddLeadModal() {
  const { state, dispatch, addLead } = useApp();
  const { users } = useAuth();
  const [quickMode, setQuickMode] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const activeMembers = users.filter(u => u.active).map(u => u.name);
  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      companyName: form.companyName || '',
      contactName: form.contactName || '',
      title: form.title || '',
      email: form.email || '',
      phone: form.phone || '',
      website: form.website || '',
      industry: form.industry || '',
      companySize: form.companySize || '',
      estimatedMonthlyRevenue: form.estimatedMonthlyRevenue || '',
      city: form.city || '',
      leadSource: form.leadSource || '',
      pipelineStage: (form.pipelineStage as typeof PIPELINE_STAGES[number]['key']) || 'new_lead',
      dealValue: parseFloat(form.dealValue || '0') || 0,
      expectedCloseDate: form.expectedCloseDate || '',
      assignedTo: form.assignedTo || '',
      nextFollowUpDate: form.nextFollowUpDate || '',
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    setForm({});
    dispatch({ type: 'TOGGLE_ADD_MODAL', show: false });
  };

  const close = () => {
    setForm({});
    dispatch({ type: 'TOGGLE_ADD_MODAL', show: false });
  };

  return (
    <Modal open={state.showAddModal} onClose={close} title="Add New Lead" wide>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => setQuickMode(false)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${!quickMode ? 'bg-brand/15 text-brand-light font-medium' : 'text-text-secondary hover:bg-surface-3'}`}
        >Full Details</button>
        <button
          onClick={() => setQuickMode(true)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-all ${quickMode ? 'bg-brand/15 text-brand-light font-medium' : 'text-text-secondary hover:bg-surface-3'}`}
        >Quick Add</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Company Name *</label>
            <input className={inputClass} value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} required placeholder="Acme Corp" />
          </div>
          <div>
            <label className={labelClass}>Contact Name *</label>
            <input className={inputClass} value={form.contactName || ''} onChange={e => set('contactName', e.target.value)} required placeholder="John Doe" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="(555) 123-4567" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="john@acme.com" />
          </div>
        </div>

        {!quickMode && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Title/Role</label>
                <input className={inputClass} value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="CEO" />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input className={inputClass} value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://acme.com" />
              </div>
              <div>
                <label className={labelClass}>Industry</label>
                <select className={inputClass} value={form.industry || ''} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select...</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Company Size</label>
                <select className={inputClass} value={form.companySize || ''} onChange={e => set('companySize', e.target.value)}>
                  <option value="">Select...</option>
                  {COMPANY_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City/Location</label>
                <input className={inputClass} value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="New York" />
              </div>
              <div>
                <label className={labelClass}>Lead Source</label>
                <select className={inputClass} value={form.leadSource || ''} onChange={e => set('leadSource', e.target.value)}>
                  <option value="">Select...</option>
                  {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Deal Value ($)</label>
                <input className={inputClass} type="number" value={form.dealValue || ''} onChange={e => set('dealValue', e.target.value)} placeholder="5000" />
              </div>
              <div>
                <label className={labelClass}>Est. Monthly Revenue</label>
                <input className={inputClass} value={form.estimatedMonthlyRevenue || ''} onChange={e => set('estimatedMonthlyRevenue', e.target.value)} placeholder="$50,000" />
              </div>
              <div>
                <label className={labelClass}>Pipeline Stage</label>
                <select className={inputClass} value={form.pipelineStage || 'new_lead'} onChange={e => set('pipelineStage', e.target.value)}>
                  {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Assigned To</label>
                <select className={inputClass} value={form.assignedTo || ''} onChange={e => set('assignedTo', e.target.value)}>
                  <option value="">Unassigned</option>
                  {activeMembers.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Close Date</label>
                <input className={inputClass} type="date" value={form.expectedCloseDate || ''} onChange={e => set('expectedCloseDate', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Next Follow-Up</label>
                <input className={inputClass} type="date" value={form.nextFollowUpDate || ''} onChange={e => set('nextFollowUpDate', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Tags (comma separated)</label>
              <input className={inputClass} value={form.tags || ''} onChange={e => set('tags', e.target.value)} placeholder="hot lead, decision maker" />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={close} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 rounded-lg transition-all">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-lg transition-all">
            Add Lead
          </button>
        </div>
      </form>
    </Modal>
  );
}

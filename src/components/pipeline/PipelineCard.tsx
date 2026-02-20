import { useDraggable } from '@dnd-kit/core';
import type { Lead, AppSettings } from '../../types';
import { useApp } from '../../store/AppContext';
import { daysInStage, formatCurrency, formatDateShort, isOverdue } from '../../utils/helpers';

interface Props {
  lead: Lead;
  isDragging?: boolean;
  settings: AppSettings;
}

export default function PipelineCard({ lead, isDragging, settings }: Props) {
  const { dispatch } = useApp();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id });
  const days = daysInStage(lead);
  const overdue = isOverdue(lead);
  const stale = days >= settings.staleThresholdDays;

  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => dispatch({ type: 'SELECT_LEAD', id: lead.id })}
      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:border-brand/30 ${
        isDragging ? 'opacity-80 shadow-xl shadow-brand/10 scale-105' : ''
      } ${overdue ? 'border-danger/40 bg-danger/5' : stale ? 'border-warning/30 bg-warning/5' : 'border-border bg-surface-2 hover:bg-surface-3'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-medium text-text-primary truncate">{lead.companyName || 'Untitled'}</h4>
        {lead.leadScore > 0 && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
            lead.leadScore >= 70 ? 'bg-success/20 text-success' :
            lead.leadScore >= 40 ? 'bg-warning/20 text-warning' :
            'bg-surface-4 text-text-tertiary'
          }`}>
            {lead.leadScore}
          </span>
        )}
      </div>
      <p className="text-xs text-text-secondary truncate">{lead.contactName}</p>
      {lead.industry && <p className="text-[10px] text-text-tertiary mt-1">{lead.industry}</p>}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <span className="text-xs font-medium text-brand">{lead.dealValue ? formatCurrency(lead.dealValue) : '—'}</span>
        <div className="flex items-center gap-2">
          {overdue && <span className="text-[10px] text-danger font-medium">Overdue</span>}
          <span className={`text-[10px] ${stale ? 'text-warning' : 'text-text-tertiary'}`}>{days}d</span>
        </div>
      </div>
      {lead.nextFollowUpDate && (
        <p className="text-[10px] text-text-tertiary mt-1">Follow-up: {formatDateShort(lead.nextFollowUpDate)}</p>
      )}
      {lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] bg-brand/10 text-brand-light px-1.5 py-0.5 rounded">{tag}</span>
          ))}
          {lead.tags.length > 3 && <span className="text-[9px] text-text-tertiary">+{lead.tags.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

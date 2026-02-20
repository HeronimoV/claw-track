import { useDroppable } from '@dnd-kit/core';
import type { Lead, AppSettings } from '../../types';
import PipelineCard from './PipelineCard';
import { formatCurrency } from '../../utils/helpers';

interface Props {
  stage: { key: string; label: string; icon: string };
  leads: Lead[];
  settings: AppSettings;
}

export default function StageColumn({ stage, leads, settings }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.key });
  const totalValue = leads.reduce((sum, l) => sum + l.dealValue, 0);

  return (
    <div
      ref={setNodeRef}
      className={`w-72 flex flex-col rounded-xl transition-all shrink-0 ${
        isOver ? 'bg-red-50 ring-1 ring-red-300' : 'bg-white/80'
      }`}
    >
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{stage.icon}</span>
            <h3 className="text-sm font-semibold text-text-primary">{stage.label}</h3>
          </div>
          <span className="text-xs bg-red-50 text-[#DC2626] px-2 py-0.5 rounded-full font-medium">
            {leads.length}
          </span>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-text-tertiary mt-1">{formatCurrency(totalValue)}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]">
        {leads.map(lead => (
          <PipelineCard key={lead.id} lead={lead} settings={settings} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-text-tertiary text-xs">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

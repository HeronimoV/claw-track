import type { Lead, Filters } from '../types';

export function daysBetween(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysInStage(lead: Lead): number {
  return daysBetween(lead.stageEnteredDate, new Date().toISOString());
}

export function isOverdue(lead: Lead): boolean {
  if (!lead.nextFollowUpDate) return false;
  return new Date(lead.nextFollowUpDate) < new Date();
}

export function isDueToday(lead: Lead): boolean {
  if (!lead.nextFollowUpDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return lead.nextFollowUpDate.split('T')[0] === today;
}

export function calculateLeadScore(lead: Lead): number {
  let score = 0;
  // Budget (deal value)
  if (lead.dealValue >= 5000) score += 25;
  else if (lead.dealValue >= 2000) score += 15;
  else if (lead.dealValue > 0) score += 5;
  // Authority (title)
  const title = lead.title.toLowerCase();
  if (['ceo', 'owner', 'founder', 'president', 'director', 'vp'].some(t => title.includes(t))) score += 25;
  else if (['manager', 'head'].some(t => title.includes(t))) score += 15;
  else if (title) score += 5;
  // Need (has industry and company info)
  if (lead.industry && lead.industry !== 'Other') score += 15;
  if (lead.companySize) score += 10;
  // Timeline (has expected close date)
  if (lead.expectedCloseDate) {
    const days = daysBetween(new Date().toISOString(), lead.expectedCloseDate);
    if (days <= 30) score += 25;
    else if (days <= 90) score += 15;
    else score += 5;
  }
  return Math.min(100, score);
}

export function filterLeads(leads: Lead[], filters: Filters): Lead[] {
  return leads.filter(lead => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const searchable = [
        lead.companyName, lead.contactName, lead.email, lead.phone,
        lead.city, lead.industry, lead.title, lead.website,
        ...lead.tags, ...lead.notes.map(n => n.content)
      ].join(' ').toLowerCase();
      if (!searchable.includes(s)) return false;
    }
    if (filters.stage && lead.pipelineStage !== filters.stage) return false;
    if (filters.industry && lead.industry !== filters.industry) return false;
    if (filters.city && !lead.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.leadSource && lead.leadSource !== filters.leadSource) return false;
    if (filters.assignedTo && lead.assignedTo !== filters.assignedTo) return false;
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.tags.length > 0 && !filters.tags.some(t => lead.tags.includes(t))) return false;
    if (filters.dateFrom && lead.createdDate < filters.dateFrom) return false;
    if (filters.dateTo && lead.createdDate > filters.dateTo) return false;
    return true;
  });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function createEmptyLead(): Omit<Lead, 'id' | 'createdDate' | 'stageEnteredDate'> {
  return {
    companyName: '',
    contactName: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    estimatedMonthlyRevenue: '',
    city: '',
    leadSource: '',
    leadScore: 0,
    pipelineStage: 'new_lead',
    dealValue: 0,
    expectedCloseDate: '',
    assignedTo: '',
    lastContactDate: '',
    nextFollowUpDate: '',
    notes: [],
    tags: [],
    status: 'Active',
    activities: [],
  };
}

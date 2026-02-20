export type PipelineStage =
  | 'new_lead'
  | 'contacted'
  | 'discovery_scheduled'
  | 'discovery_complete'
  | 'proposal_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export const PIPELINE_STAGES: { key: PipelineStage; label: string; icon: string }[] = [
  { key: 'new_lead', label: 'New Lead', icon: '🆕' },
  { key: 'contacted', label: 'Contacted', icon: '📞' },
  { key: 'discovery_scheduled', label: 'Discovery Scheduled', icon: '📅' },
  { key: 'discovery_complete', label: 'Discovery Complete', icon: '✅' },
  { key: 'proposal_sent', label: 'Proposal Sent', icon: '📄' },
  { key: 'negotiation', label: 'Negotiation', icon: '🤝' },
  { key: 'closed_won', label: 'Closed Won', icon: '🏆' },
  { key: 'closed_lost', label: 'Closed Lost', icon: '❌' },
];

export const INDUSTRIES = [
  'Real Estate', 'Law Firm', 'Dental/Medical', 'Financial Advisory',
  'Marketing Agency', 'B2B Sales', 'Construction', 'E-Commerce', 'Other'
] as const;

export const COMPANY_SIZES = ['1-5', '6-15', '16-50', '51-200', '200+'] as const;

export const LEAD_SOURCES = [
  'Cold Call', 'Cold Email', 'Website Inbound', 'Referral', 'LinkedIn', 'Event', 'Other'
] as const;

export const TEAM_MEMBERS = ['CD', 'Chief', 'Pablo', 'Chito', 'Arturo'] as const;

export const LEAD_STATUSES = ['Active', 'On Hold', 'Lost', 'Won'] as const;

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Note' | 'Stage Change' | 'Follow-Up';

export type UserRole = 'Admin' | 'Manager' | 'Sales Rep';

export const AVATAR_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#14b8a6',
  '#a855f7', '#e11d48', '#0ea5e9', '#d946ef', '#65a30d',
];

export interface ProfileConfig {
  id: string;
  name: string;
  role: UserRole;
  color: string;
  initials: string;
}

export const PROFILES: ProfileConfig[] = [
  { id: 'cd', name: 'CD', role: 'Admin', color: '#DC2626', initials: 'CD' },
  { id: 'chief', name: 'Chief', role: 'Admin', color: '#111827', initials: 'CH' },
  { id: 'pablo', name: 'Pablo', role: 'Sales Rep', color: '#2563EB', initials: 'PA' },
  { id: 'chito', name: 'Chito', role: 'Sales Rep', color: '#16A34A', initials: 'CI' },
  { id: 'arturo', name: 'Arturo', role: 'Sales Rep', color: '#9333EA', initials: 'AR' },
];

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarColor: string;
  active: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, string>;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  userId?: string;
  userName?: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  estimatedMonthlyRevenue: string;
  city: string;
  leadSource: string;
  leadScore: number;
  pipelineStage: PipelineStage;
  dealValue: number;
  expectedCloseDate: string;
  assignedTo: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  notes: Note[];
  tags: string[];
  createdDate: string;
  status: string;
  lostReason?: string;
  stageEnteredDate: string;
  activities: Activity[];
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Filters;
}

export interface Filters {
  search: string;
  stage: PipelineStage | '';
  industry: string;
  city: string;
  leadSource: string;
  assignedTo: string;
  tags: string[];
  dateFrom: string;
  dateTo: string;
  status: string;
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  stage: '',
  industry: '',
  city: '',
  leadSource: '',
  assignedTo: '',
  tags: [],
  dateFrom: '',
  dateTo: '',
  status: '',
};

export interface AppSettings {
  staleThresholdDays: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  staleThresholdDays: 7,
};

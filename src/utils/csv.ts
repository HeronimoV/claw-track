import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import type { Lead } from '../types';

const FIELD_MAP: Record<string, keyof Lead> = {
  company_name: 'companyName',
  companyname: 'companyName',
  company: 'companyName',
  contact_name: 'contactName',
  contactname: 'contactName',
  contact: 'contactName',
  name: 'contactName',
  title: 'title',
  role: 'title',
  email: 'email',
  phone: 'phone',
  telephone: 'phone',
  website: 'website',
  url: 'website',
  industry: 'industry',
  city: 'city',
  location: 'city',
  notes: 'notes' as keyof Lead,
  deal_value: 'dealValue' as keyof Lead,
  dealvalue: 'dealValue' as keyof Lead,
  lead_source: 'leadSource',
  leadsource: 'leadSource',
  source: 'leadSource',
  assigned_to: 'assignedTo',
  assignedto: 'assignedTo',
  company_size: 'companySize',
  companysize: 'companySize',
  status: 'status',
  tags: 'tags' as keyof Lead,
};

export function parseCSV(file: File): Promise<Lead[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const leads: Lead[] = (results.data as Record<string, string>[]).map(row => {
          const now = new Date().toISOString();
          const lead: Lead = {
            id: uuidv4(),
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
            createdDate: now,
            status: 'Active',
            stageEnteredDate: now,
            activities: [],
          };

          for (const [csvCol, value] of Object.entries(row)) {
            const key = FIELD_MAP[csvCol.toLowerCase().trim().replace(/\s+/g, '_')];
            if (!key) continue;
            if (key === 'notes' as unknown) {
              if (value) lead.notes = [{ id: uuidv4(), content: value, createdAt: now }];
            } else if (key === 'tags' as unknown) {
              if (value) lead.tags = value.split(',').map(t => t.trim()).filter(Boolean);
            } else if (key === 'dealValue' as unknown) {
              lead.dealValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
            } else {
              (lead as unknown as Record<string, unknown>)[key] = value || '';
            }
          }
          return lead;
        });
        resolve(leads.filter(l => l.companyName || l.contactName));
      },
      error: reject,
    });
  });
}

export function exportCSV(leads: Lead[]): string {
  const rows = leads.map(l => ({
    company_name: l.companyName,
    contact_name: l.contactName,
    title: l.title,
    email: l.email,
    phone: l.phone,
    website: l.website,
    industry: l.industry,
    company_size: l.companySize,
    city: l.city,
    lead_source: l.leadSource,
    pipeline_stage: l.pipelineStage,
    deal_value: l.dealValue,
    status: l.status,
    assigned_to: l.assignedTo,
    lead_score: l.leadScore,
    expected_close_date: l.expectedCloseDate,
    next_follow_up: l.nextFollowUpDate,
    tags: l.tags.join(', '),
    notes: l.notes.map(n => n.content).join(' | '),
    created_date: l.createdDate,
  }));
  return Papa.unparse(rows);
}

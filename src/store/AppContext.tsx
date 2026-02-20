import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Lead, Filters, FilterPreset, AppSettings, PipelineStage, Activity } from '../types';
import { DEFAULT_FILTERS } from '../types';
import { loadLeads, saveLeads, loadFilterPresets, saveFilterPresets, loadSettings, saveSettings } from '../utils/storage';
import { useAuth } from './AuthContext';

type View = 'pipeline' | 'list' | 'dashboard' | 'detail' | 'team' | 'profile';

interface State {
  leads: Lead[];
  filters: Filters;
  filterPresets: FilterPreset[];
  settings: AppSettings;
  currentView: View;
  selectedLeadId: string | null;
  showAddModal: boolean;
  showImportModal: boolean;
}

type Action =
  | { type: 'SET_LEADS'; leads: Lead[] }
  | { type: 'ADD_LEAD'; lead: Lead }
  | { type: 'UPDATE_LEAD'; lead: Lead }
  | { type: 'DELETE_LEAD'; id: string }
  | { type: 'MOVE_LEAD'; id: string; stage: PipelineStage; userId?: string; userName?: string }
  | { type: 'ADD_ACTIVITY'; leadId: string; activity: Activity }
  | { type: 'SET_FILTERS'; filters: Filters }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SELECT_LEAD'; id: string | null }
  | { type: 'TOGGLE_ADD_MODAL'; show?: boolean }
  | { type: 'TOGGLE_IMPORT_MODAL'; show?: boolean }
  | { type: 'IMPORT_LEADS'; leads: Lead[] }
  | { type: 'SAVE_PRESET'; preset: FilterPreset }
  | { type: 'DELETE_PRESET'; id: string }
  | { type: 'SET_SETTINGS'; settings: AppSettings };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LEADS':
      return { ...state, leads: action.leads };
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.lead] };
    case 'UPDATE_LEAD':
      return { ...state, leads: state.leads.map(l => l.id === action.lead.id ? action.lead : l) };
    case 'DELETE_LEAD':
      return { ...state, leads: state.leads.filter(l => l.id !== action.id), selectedLeadId: state.selectedLeadId === action.id ? null : state.selectedLeadId };
    case 'MOVE_LEAD': {
      const now = new Date().toISOString();
      return {
        ...state,
        leads: state.leads.map(l => {
          if (l.id !== action.id) return l;
          return { ...l, pipelineStage: action.stage, stageEnteredDate: now, lastEditedBy: action.userName, lastEditedAt: now };
        }),
      };
    }
    case 'ADD_ACTIVITY':
      return {
        ...state,
        leads: state.leads.map(l => l.id === action.leadId ? { ...l, activities: [action.activity, ...l.activities] } : l),
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.filters };
    case 'SET_VIEW':
      return { ...state, currentView: action.view, selectedLeadId: action.view !== 'detail' ? null : state.selectedLeadId };
    case 'SELECT_LEAD':
      return { ...state, selectedLeadId: action.id, currentView: action.id ? 'detail' : state.currentView };
    case 'TOGGLE_ADD_MODAL':
      return { ...state, showAddModal: action.show ?? !state.showAddModal };
    case 'TOGGLE_IMPORT_MODAL':
      return { ...state, showImportModal: action.show ?? !state.showImportModal };
    case 'IMPORT_LEADS':
      return { ...state, leads: [...state.leads, ...action.leads], showImportModal: false };
    case 'SAVE_PRESET':
      return { ...state, filterPresets: [...state.filterPresets.filter(p => p.id !== action.preset.id), action.preset] };
    case 'DELETE_PRESET':
      return { ...state, filterPresets: state.filterPresets.filter(p => p.id !== action.id) };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    default:
      return state;
  }
}

interface AppContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  addLead: (data: Partial<Lead>) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  moveLead: (id: string, stage: PipelineStage) => void;
  addActivity: (leadId: string, type: Activity['type'], description: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    leads: loadLeads(),
    filters: DEFAULT_FILTERS,
    filterPresets: loadFilterPresets(),
    settings: loadSettings(),
    currentView: 'dashboard' as View,
    selectedLeadId: null,
    showAddModal: false,
    showImportModal: false,
  });

  useEffect(() => { saveLeads(state.leads); }, [state.leads]);
  useEffect(() => { saveFilterPresets(state.filterPresets); }, [state.filterPresets]);
  useEffect(() => { saveSettings(state.settings); }, [state.settings]);

  const addLead = (data: Partial<Lead>) => {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: uuidv4(),
      companyName: '',
      pointOfContact: '',
      industry: '',
      needs: '',
      employeeCount: '',
      annualRevenue: '',
      location: '',
      notes: [],
      pipelineStage: 'new_lead',
      dealValue: 0,
      leadSource: '',
      assignedTo: '',
      phone: '',
      email: '',
      scheduledCallDate: '',
      callCompleted: false,
      stageEnteredDate: now,
      createdDate: now,
      activities: [],
      lastEditedBy: currentUser?.name,
      lastEditedAt: now,
      ...data,
    };
    lead.activities = [{ id: uuidv4(), leadId: lead.id, type: 'Note', description: 'Lead created', timestamp: now, userId: currentUser?.id, userName: currentUser?.name }];
    dispatch({ type: 'ADD_LEAD', lead });
  };

  const updateLead = (lead: Lead) => {
    lead.lastEditedBy = currentUser?.name;
    lead.lastEditedAt = new Date().toISOString();
    dispatch({ type: 'UPDATE_LEAD', lead });
  };

  const deleteLead = (id: string) => dispatch({ type: 'DELETE_LEAD', id });

  const moveLead = (id: string, stage: PipelineStage) => {
    dispatch({ type: 'MOVE_LEAD', id, stage, userId: currentUser?.id, userName: currentUser?.name });
    const now = new Date().toISOString();
    const stageName = stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const lead = state.leads.find(l => l.id === id);
    const desc = currentUser
      ? `${currentUser.name} moved to ${stageName}`
      : `Moved to ${stageName}`;
    dispatch({
      type: 'ADD_ACTIVITY', leadId: id,
      activity: {
        id: uuidv4(), leadId: id, type: 'Stage Change', description: desc, timestamp: now,
        userId: currentUser?.id, userName: currentUser?.name,
        metadata: lead ? { from: lead.pipelineStage, to: stage } : undefined,
      },
    });
  };

  const addActivity = (leadId: string, type: Activity['type'], description: string) => {
    const activity: Activity = {
      id: uuidv4(), leadId, type, description, timestamp: new Date().toISOString(),
      userId: currentUser?.id, userName: currentUser?.name,
    };
    dispatch({ type: 'ADD_ACTIVITY', leadId, activity });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addLead, updateLead, deleteLead, moveLead, addActivity }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

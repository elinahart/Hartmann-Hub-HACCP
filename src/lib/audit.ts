import { getStoredData, setStoredData } from './db';

export type AuditActionType = 'create' | 'update' | 'delete' | 'sync' | 'error' | 'system';
export type AuditModule = 'reception' | 'tracabilite' | 'temperature' | 'nettoyage' | 'huile' | 'inventaire' | 'mobile' | 'system' | 'session';

export interface AuditEvent {
  id: string;
  timestamp: string;
  type: AuditActionType;
  module: AuditModule;
  action: string;
  userName: string;
  userId?: string | null;
  source: 'hub' | 'mobile';
  sessionId?: string;
  details?: any;
  status: 'success' | 'warning' | 'error';
}

export function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  try {
    const events = getStoredData<AuditEvent[]>('crousty_audit_log', []);
    const newEvent: AuditEvent = {
      ...event,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString()
    };
    events.unshift(newEvent); // newer first
    
    // Keep last 1000 events
    if (events.length > 1000) {
      events.length = 1000;
    }
    
    setStoredData('crousty_audit_log', events);
    window.dispatchEvent(new Event('crousty_audit_updated'));
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
}

export function getAuditEvents(): AuditEvent[] {
  return getStoredData<AuditEvent[]>('crousty_audit_log', []);
}

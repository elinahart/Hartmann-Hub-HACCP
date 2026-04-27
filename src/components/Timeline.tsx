import React, { useState, useEffect } from 'react';
import { getAuditEvents, AuditEvent } from '../lib/audit';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Plus, Edit2, Trash2, Smartphone, Download, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { useManagerUI } from '../contexts/ManagerUIContext';

export const Timeline = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const { openModal, closeModal } = useManagerUI();

  const allEvents = getAuditEvents();

  useEffect(() => {
    const loadEvents = () => {
      setEvents(getAuditEvents().slice(0, 3));
    };
    loadEvents();
    
    window.addEventListener('crousty_audit_updated', loadEvents);
    return () => window.removeEventListener('crousty_audit_updated', loadEvents);
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus size={14} className="text-emerald-500" />;
      case 'update': return <Edit2 size={14} className="text-blue-500" />;
      case 'delete': return <Trash2 size={14} className="text-red-500" />;
      case 'sync': return <Download size={14} className="text-purple-500" />;
      case 'error': return <AlertTriangle size={14} className="text-orange-500" />;
      default: return <Clock size={14} className="text-gray-500" />;
    }
  };

  const getModuleColor = (mod: string) => {
    switch (mod) {
      case 'temperature': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'nettoyage': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'reception': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'tracabilite': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'huiles': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'inventaire': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'session':
      case 'mobile': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const showFullAudit = () => {
    openModal(
      <div className="flex flex-col max-h-[inherit] h-full bg-white">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-crousty-purple/10 rounded-xl flex items-center justify-center text-crousty-purple">
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800 tracking-tight leading-tight">Journal d'activité complet</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{allEvents.length} événements enregistrés</p>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="w-10 h-10 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 bg-gray-50/50 space-y-3">
          {allEvents.map((evt) => (
            <div key={evt.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 ${getModuleColor(evt.module)}`}>
                  {getActionIcon(evt.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                     <span className="font-black text-gray-800 text-sm truncate">{evt.action}</span>
                     <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md border shrink-0 ${getModuleColor(evt.module)}`}>
                       {evt.module}
                     </span>
                  </div>
                  <div className="text-gray-400 text-[10px] font-bold uppercase truncate">
                    {evt.userName} • {format(new Date(evt.timestamp), 'eeee d MMMM HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <StatusBadge 
                  status={evt.type === 'delete' ? 'archived' : evt.status === 'success' ? 'done' : evt.status === 'warning' ? 'pending' : 'error'} 
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button 
            onClick={closeModal}
            className="w-full bg-gray-800 text-white h-11 rounded-xl font-black active:scale-95 transition-all text-sm"
          >
            Fermer le journal
          </button>
        </div>
      </div>,
      'max-w-[560px]'
    );
  };

  if (events.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 mb-6">
      <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
        <Clock size={20} className="text-crousty-purple" /> Activité récente
      </h3>
      
      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
        {events.map((evt) => (
          <div key={evt.id} className="relative pl-6">
            <div className="absolute -left-[9px] top-1 bg-white border-2 border-gray-100 p-1 rounded-full w-4 h-4 flex items-center justify-center">
              {/* Dot */}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getModuleColor(evt.module)}`}>
                    {evt.module}
                  </span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    {getActionIcon(evt.type)} {evt.action}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  {evt.userName} • {(() => {
                    const d = new Date(evt.timestamp);
                    if (isNaN(d.getTime())) return '--:--';
                    return format(d, 'HH:mm');
                  })()}
                </div>
              </div>
              <div>
                <StatusBadge 
                  status={evt.type === 'delete' ? 'archived' : evt.status === 'success' ? 'done' : evt.status === 'warning' ? 'pending' : 'error'} 
                  label={evt.status === 'warning' ? 'Alerte' : evt.type === 'delete' ? 'Supprimé' : undefined} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {allEvents.length > 3 && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={showFullAudit}
            className="text-xs font-black text-crousty-purple uppercase tracking-widest hover:underline active:scale-95 transition-all outline-none"
          >
            Voir plus d'activité
          </button>
        </div>
      )}
    </div>
  );
};

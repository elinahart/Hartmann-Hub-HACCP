import React, { useState, useEffect } from 'react';
import { getAuditEvents, AuditEvent } from '../../lib/audit';
import { StatusBadge } from '../ui/StatusBadge';
import { FileEdit, Shield, ArrowRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AuditTab = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const loadEvents = () => {
      setEvents(getAuditEvents());
    };
    loadEvents();
    
    window.addEventListener('crousty_audit_updated', loadEvents);
    return () => window.removeEventListener('crousty_audit_updated', loadEvents);
  }, []);

  const filteredEvents = events.filter(e => {
    if (filterModule !== 'all' && e.module !== filterModule) return false;
    if (filterType !== 'all' && e.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-800">Journal d'Audit Global</h2>
          <p className="text-gray-500 text-sm">Historique de toutes les actions et modifications</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-600 bg-white"
          >
            <option value="all">Tous les modules</option>
            <option value="reception">Réceptions</option>
            <option value="tracabilite">Traçabilité</option>
            <option value="temperature">Températures</option>
            <option value="mobile">Sessions Mobiles</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-600 bg-white"
          >
            <option value="all">Toutes les actions</option>
            <option value="create">Création</option>
            <option value="update">Modification</option>
            <option value="delete">Suppression</option>
            <option value="sync">Synchronisation</option>
          </select>
        </div>
      </div>

      <div className="bg-white border text-sm border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-gray-400 font-bold flex flex-col items-center">
            <History size={48} className="mb-4 text-gray-200" />
            Aucun événement d'audit trouvé
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Date / Heure</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Détails</th>
                <th className="px-6 py-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <div className="font-bold">{format(new Date(evt.timestamp), 'dd MMM yyyy', { locale: fr })}</div>
                    <div className="text-xs text-gray-400">{format(new Date(evt.timestamp), 'HH:mm:ss')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold flex items-center gap-2">
                       {evt.type === 'delete' && <div className="w-2 h-2 rounded-full bg-red-400"/>}
                       {evt.type === 'create' && <div className="w-2 h-2 rounded-full bg-green-400"/>}
                       {evt.type === 'update' && <div className="w-2 h-2 rounded-full bg-blue-400"/>}
                       {evt.type === 'sync' && <div className="w-2 h-2 rounded-full bg-purple-400"/>}
                       {evt.action}
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{evt.module}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{evt.userName}</div>
                    <div className="text-xs text-gray-400">{evt.source === 'hub' ? 'Crousty Hub' : 'Crousty Mobile'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                    {evt.details ? JSON.stringify(evt.details) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <StatusBadge status={evt.type === 'delete' ? 'done' : evt.status === 'success' ? 'done' : evt.status === 'warning' ? 'pending' : 'error'} label={evt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

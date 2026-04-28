import React from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Shield, Check, X, LayoutGrid, Package, QrCode, Thermometer, Flame, Sparkles, Tag, ChefHat, ClipboardList, Droplet, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function ModulesTab() {
  const { config, updateConfig } = useConfig();
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager';

  const modules = [
    { id: 'reception', label: 'Réception de Marchandises', icon: Package },
    { id: 'traceabilite', label: 'Traçabilité / DLC Secondaires', icon: QrCode },
    { id: 'temperatures', label: 'Lectures de Températures', icon: Thermometer },
    { id: 'cuisson', label: 'Cuisson Alimentaire', icon: Flame },
    { id: 'nettoyage', label: 'Plan de Nettoyage', icon: Sparkles },
    { id: 'dlc', label: 'Étiquettes DLC', icon: Tag },
    { id: 'preparations', label: 'Préparation', icon: ChefHat },
    { id: 'inventaire', label: 'Inventaire Hebdomadaire', icon: ClipboardList },
    { id: 'huiles', label: 'Gestion des Huiles / Friture', icon: Droplet },
    { id: 'sessions', label: 'Sessions Mobiles (Équipiers)', icon: Smartphone }
  ];

  const toggleModule = (id: string) => {
    if (!isManager) return;
    const currentModules = config.modules || {};
    const isEnabled = currentModules[id] !== false; // Default is true
    updateConfig({ 
      modules: { 
        ...currentModules, 
        [id]: !isEnabled 
      } 
    });
  };

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Shield size={48} className="mb-4 opacity-20" />
        <p className="font-black uppercase tracking-widest text-sm">Accès réservé au Manager</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-purple-50 border border-purple-100 p-6 rounded-[2rem] flex items-start gap-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600">
          <LayoutGrid size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black text-purple-900">Activation des Modules</h3>
          <p className="text-sm text-purple-700/80 font-medium leading-relaxed">
            Activez ou désactivez les fonctionnalités du restaurant. Les modules désactivés seront masqués pour toute l'équipe. 
            Les données existantes sont conservées.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(mod => {
          const isEnabled = config.modules?.[mod.id] !== false;
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => toggleModule(mod.id)}
              className={cn(
                "flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all group",
                isEnabled 
                  ? "bg-white border-purple-100 shadow-sm hover:border-purple-200" 
                  : "bg-gray-50 border-gray-100 grayscale opacity-60"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-gray-900">{mod.label}</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isEnabled ? "text-purple-500" : "text-gray-400"
                  )}>
                    {isEnabled ? 'Activé' : 'Désactivé'}
                  </p>
                </div>
              </div>

              <div className={cn(
                "w-12 h-6 rounded-full relative transition-colors p-1",
                isEnabled ? "bg-purple-500" : "bg-gray-300"
              )}>
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full transition-transform shadow-sm",
                  isEnabled ? "translate-x-6" : "translate-x-0"
                )} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

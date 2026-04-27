import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Store, Thermometer, Droplets, Sparkles, BookOpen, Users, UploadCloud, Shield, Box, Printer, Smartphone } from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext';
import { Button, Input, Label } from './ui/LightUI';

import { TemperaturesTab } from './customization/TemperaturesTab';
import { HuilesTab } from './customization/HuilesTab';
import { NettoyageTab } from './customization/NettoyageTab';
import { ProduitsTab } from './customization/ProduitsTab';
import { EquipeTab } from './customization/EquipeTab';
import { InventaireTab } from './customization/InventaireTab';
import { SecurityStorageSection } from './customization/SecurityStorageSection';
import { SecuriteTab } from './customization/SecuriteTab';
import { IdentiteTab } from './customization/IdentiteTab';
import { ImpressionTab } from './customization/ImpressionTab';
import { AuditTab } from './customization/AuditTab';
import { SessionsTab } from './customization/SessionsTab';

export const CustomizationModal = ({ onClose, initialTab = 'identite' }: { onClose: () => void, initialTab?: string }) => {
  const { config, updateConfig } = useConfig();
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'identite', label: 'Identité', icon: <Store size={18} /> },
    { id: 'temperatures', label: 'Zones Températures', icon: <Thermometer size={18} /> },
    { id: 'huiles', label: 'Cuves d\'Huile', icon: <Droplets size={18} /> },
    { id: 'nettoyage', label: 'Plan de Nettoyage', icon: <Sparkles size={18} /> },
    { id: 'produits', label: 'Catalogue Produits', icon: <BookOpen size={18} /> },
    { id: 'inventaire', label: 'Inventaire', icon: <Box size={18} /> },
    { id: 'equipe', label: 'Équipe', icon: <Users size={18} /> },
    { id: 'sessions', label: 'Session mobile', icon: <Smartphone size={18} /> },
    { id: 'impression', label: 'Impression', icon: <Printer size={18} /> },
    { id: 'securite_stockage', label: 'Sécurité & Stockage', icon: <Shield size={18} /> },
    { id: 'audit', label: 'Journal d\'Audit', icon: <BookOpen size={18} /> },
  ];

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85dvh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <span className="text-3xl">🎨</span> Personnaliser le restaurant
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-50 border-r border-gray-100 p-4 overflow-y-auto shrink-0 flex flex-col gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-left font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-crousty-purple shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto bg-white">
            {activeTab === 'identite' && <IdentiteTab />}
            {activeTab === 'temperatures' && <TemperaturesTab />}
            {activeTab === 'huiles' && <HuilesTab />}
            {activeTab === 'nettoyage' && <NettoyageTab />}
            {activeTab === 'produits' && <ProduitsTab />}
            {activeTab === 'inventaire' && <InventaireTab />}
            {activeTab === 'equipe' && <EquipeTab />}
            {activeTab === 'sessions' && <SessionsTab />}
            {activeTab === 'impression' && <ImpressionTab />}
            {activeTab === 'audit' && <AuditTab />}
            {activeTab === 'securite_stockage' && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 mb-6 pb-2 border-b border-gray-100">Contrôle d'accès</h3>
                  <SecuriteTab onCloseModal={onClose} />
                </div>
                <div>
                   <SecurityStorageSection />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

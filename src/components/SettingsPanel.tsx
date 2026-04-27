import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Trash2, UserPlus, Users, X, KeySquare, UserCircle, Printer, HelpCircle, Smartphone, Wifi, CheckCircle2, Archive, GripVertical, AlertTriangle, ToggleLeft, ToggleRight, Eye, ChevronRight } from 'lucide-react';
import { Button, Input, Select, Label } from './ui/LightUI';
import { clearAllData, getStoredData, setStoredData } from '../lib/db';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { getInitials, getCouleurProfil, cn } from '../lib/utils';
import { MembreEquipe } from '../types';
import { usePersistentStorage } from '../hooks/usePersistentStorage';
import { useConfig } from '../contexts/ConfigContext';

export const SettingsPanel = ({ onClose }: { onClose: () => void }) => {
  const { users, addUser, deleteUser, updateUserPin, currentUser, logout, updateUser, setUsers } = useAuth();
  const { isPersistent, estimate } = usePersistentStorage();
  const { exportConfig, importConfig } = useConfig();
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile'>('profile');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Huiles Config
  const [huilesConfig, setHuilesConfig] = useState(getStoredData('config_huiles', {
    seuilAttention: 20,
    seuilChangement: 23
  }));
  
  // New user form
  const [newName, setNewName] = useState('');
  const [newInitials, setNewInitials] = useState('');
  const [newPin, setNewPin] = useState('0000');
  const [newRole, setNewRole] = useState<'manager' | 'equipe'>('equipe');
  const [nameCollision, setNameCollision] = useState(false);

  // Editing user
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Change PIN form
  const [myNewPin, setMyNewPin] = useState('');
  const [myConfirmPin, setMyConfirmPin] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState('');

  // Import JSON content
  const [jsonText, setJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (newName) {
      const initials = getInitials(newName);
      setNewInitials(initials);
      
      const collision = users.some(u => u.initiales === initials && u.id !== editingUserId);
      setNameCollision(collision);
    } else {
      setNewInitials('');
      setNameCollision(false);
    }
  }, [newName, users, editingUserId]);

  // Fermer le panneau si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [onClose]);

  const handleAddUser = () => {
    if (!newName || !newPin) return;
    if (newPin.length !== 4) {
      alert("Le code PIN doit contenir exactement 4 chiffres.");
      return;
    }
    addUser({ 
      name: newName, 
      initiales: newInitials, 
      role: newRole, 
      actif: true,
      pin: newPin
    });
    setNewName('');
    setNewPin('0000');
    setNewRole('equipe');
    setNewInitials('');
  };

  const handleToggleActif = (u: MembreEquipe) => {
    updateUser({ ...u, actif: !u.actif });
  };

  const handleUpdateUser = (u: MembreEquipe) => {
    updateUser(u);
    setEditingUserId(null);
  };

  const handleReset = async () => {
    await clearAllData();
    window.location.reload();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          if (importConfig(text)) {
            alert("Configuration importée avec succès !");
            window.location.reload();
          } else {
            alert("Erreur lors de l'importation. Le fichier est peut-être malformé.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualImport = () => {
    if (!jsonText) return;
    if (importConfig(jsonText)) {
      alert("Configuration importée avec succès !");
      setShowImportModal(false);
      setJsonText('');
      window.location.reload();
    } else {
      alert("Erreur JSON invalide ou malformé.");
    }
  };

  const handleChangeMyPin = () => {
    setChangePinError('');
    setChangePinSuccess('');
    
    if (myNewPin.length !== 4) {
      setChangePinError("Le code PIN doit faire 4 chiffres.");
      return;
    }
    if (myNewPin !== myConfirmPin) {
      setChangePinError("Les codes postés ne correspondent pas.");
      return;
    }
    
    updateUserPin(currentUser!.id, myNewPin);
    setChangePinSuccess("Votre code PIN a été mis à jour avec succès.");
    setMyNewPin('');
    setMyConfirmPin('');
    
    setTimeout(() => {
      setChangePinSuccess('');
    }, 3000);
  };

  if (!currentUser) return null;

  const isCurrentManager = currentUser.role?.toLowerCase() === 'manager';

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex justify-end">
      <div ref={panelRef} className="bg-white w-full max-w-md h-[100dvh] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <UserCircle size={24} className="text-crousty-purple" /> Réglages
          </h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-800 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-6">
              {isCurrentManager && (
                <section className="mb-8 p-6 bg-gradient-to-br from-crousty-purple/5 to-crousty-pink/5 rounded-[2.5rem] border border-crousty-purple/10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-crousty-purple/60 mb-4 px-2">Configuration Avancée</h4>
                  <button
                    className="w-full flex items-center gap-4 p-5 bg-white rounded-3xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all border border-gray-100 group"
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent('open-customization-modal'));
                    }}
                  >
                    <div className="w-12 h-12 bg-crousty-purple/10 text-crousty-purple rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-crousty-purple group-hover:text-white transition-colors">
                      <Sparkles size={24} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-black text-gray-800 text-base">Personnaliser le restaurant</div>
                      <div className="text-xs font-medium text-gray-400 mt-0.5">Équipe, Imprimante, Stockage...</div>
                    </div>
                    <div className="text-gray-300 font-black text-2xl px-2">›</div>
                  </button>
                </section>
              )}

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <UserCircle size={100} />
                </div>
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-3xl mb-3 shadow-lg ring-4 ring-white"
                  style={{ backgroundColor: getCouleurProfil(currentUser.name, currentUser.role) }}
                >
                  {currentUser.initiales || currentUser.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-black text-2xl text-gray-800 tracking-tight">{currentUser.name}</h3>
                <div className="text-[10px] font-black text-white bg-crousty-purple px-4 py-1.5 rounded-full mt-2 uppercase tracking-[0.2em] shadow-sm">
                  {currentUser.role}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 space-y-4 shadow-sm">
                <h3 className="font-black text-gray-800 flex items-center gap-2 mb-2 text-sm uppercase tracking-widest">
                  <KeySquare size={18} className="text-crousty-pink" /> 
                  Changer mon code PIN
                </h3>
                <p className="text-xs font-medium text-gray-400 -mt-2 mb-4 leading-relaxed px-1">
                  Ce code vous permet de vous connecter à l'application. Choisissez 4 chiffres faciles à retenir.
                </p>
                
                {changePinError && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl border border-red-100">{changePinError}</motion.div>}
                {changePinSuccess && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100">{changePinSuccess}</motion.div>}
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block px-1">Nouveau code PIN</Label>
                    <Input 
                      type="password" 
                      inputMode="numeric" 
                      maxLength={4}
                      value={myNewPin} 
                      onChange={(e: any) => setMyNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} 
                      placeholder="••••" 
                      className="h-12 text-center text-xl font-black tracking-[0.5em]"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block px-1">Confirmation</Label>
                    <Input 
                      type="password" 
                      inputMode="numeric" 
                      maxLength={4}
                      value={myConfirmPin} 
                      onChange={(e: any) => setMyConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} 
                      placeholder="••••" 
                      className="h-12 text-center text-xl font-black tracking-[0.5em]"
                    />
                  </div>
                  <Button onClick={handleChangeMyPin} className="w-full h-14 rounded-2xl bg-crousty-purple font-black uppercase tracking-widest shadow-lg shadow-crousty-purple/20">
                    Valider le Nouveau PIN
                  </Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50 mt-4 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-xs" onClick={() => {
                onClose();
                logout();
              }}>
                Quitter la session
              </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

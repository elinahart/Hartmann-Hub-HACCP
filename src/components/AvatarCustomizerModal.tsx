import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { User, Star, ChefHat, Store, Award, Coffee, Leaf, CheckCircle2, Shield, Heart, Zap, Crown, Key, Bell, Flame, Camera, Image as ImageIcon, Type, X, Check } from 'lucide-react';
import { MembreEquipe } from '../types';
import { Button } from './ui/LightUI';
import { motion, AnimatePresence } from 'motion/react';
import { getCouleurProfil } from '../lib/utils'; // if needed, we might use default colors

interface AvatarCustomizerModalProps {
  user: MembreEquipe;
  onSave: (updates: Partial<MembreEquipe>) => void;
  onClose: () => void;
}

const ICONS = [
  { id: 'user', icon: User },
  { id: 'star', icon: Star },
  { id: 'chefhat', icon: ChefHat },
  { id: 'store', icon: Store },
  { id: 'award', icon: Award },
  { id: 'coffee', icon: Coffee },
  { id: 'leaf', icon: Leaf },
  { id: 'check', icon: CheckCircle2 },
  { id: 'shield', icon: Shield },
  { id: 'heart', icon: Heart },
  { id: 'zap', icon: Zap },
  { id: 'crown', icon: Crown },
  { id: 'key', icon: Key },
  { id: 'bell', icon: Bell },
  { id: 'flame', icon: Flame },
];

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#64748b', // slate
];

export const renderAvatarIcon = (iconId: string | undefined, size = 24) => {
  const IconDef = ICONS.find(i => i.id === iconId)?.icon || User;
  return <IconDef size={size} />;
};

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({ user, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'monogram' | 'icon'>(user.avatarType || (user.avatarUrl ? 'photo' : (user.avatarIcon ? 'icon' : 'monogram')));
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(user.avatarUrl);
  const [selectedIcon, setSelectedIcon] = useState<string>(user.avatarIcon || 'user');
  const [selectedColor, setSelectedColor] = useState<string>(user.avatarColor || user.couleur || COLORS[6]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setActiveTab('photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const save = () => {
    onSave({
      avatarType: activeTab,
      avatarUrl: previewUrl,
      avatarIcon: selectedIcon,
      avatarColor: selectedColor,
      couleur: selectedColor // sync with existing generic color 
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-black text-lg text-gray-800">Photo de profil</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* PREVIEW */}
          <div className="flex flex-col items-center justify-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-3xl shadow-xl ring-4 ring-white bg-cover bg-center transition-all"
              style={{
                backgroundColor: activeTab === 'photo' && previewUrl ? 'transparent' : selectedColor,
                backgroundImage: activeTab === 'photo' && previewUrl ? `url(${previewUrl})` : 'none'
              }}
            >
              {activeTab === 'monogram' && (user.initiales || user.name.charAt(0).toUpperCase())}
              {activeTab === 'icon' && renderAvatarIcon(selectedIcon, 40)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors group">
              <Camera className="text-gray-400 group-hover:text-crousty-purple mb-2" size={24} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Prendre une photo</span>
              <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors group">
              <ImageIcon className="text-gray-400 group-hover:text-crousty-purple mb-2" size={24} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Choisir une image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('monogram')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'monogram' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Type size={16} /> Monogramme
              </button>
              <button 
                onClick={() => setActiveTab('icon')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'icon' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Star size={16} /> Icône
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'icon' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-black uppercase text-gray-400">Choisir une icône</label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICONS.map(ic => {
                      const IconDef = ic.icon;
                      const isSelected = selectedIcon === ic.id;
                      return (
                        <button
                          key={ic.id}
                          onClick={() => setSelectedIcon(ic.id)}
                          className={`aspect-square flex items-center justify-center rounded-xl transition-all ${isSelected ? 'bg-crousty-purple text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                          <IconDef size={20} />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {(activeTab === 'icon' || activeTab === 'monogram') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 mt-4"
                >
                  <label className="text-xs font-black uppercase text-gray-400">Couleur du cercle</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(c)}
                        className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-transform ${selectedColor === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      >
                        {selectedColor === c && <Check size={16} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button className="bg-crousty-purple text-white" onClick={save}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Label, Input } from '../ui/LightUI';
import { Check, X, Edit2, RotateCcw, Layout, Type, User, ChefHat, Pizza, Utensils, Coffee, Sandwich, PieChart, Star, Flame, Droplet, Smartphone, Package, Sparkles } from 'lucide-react';
import { RestaurantLogo } from '../ui/RestaurantLogo';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const palettes = [
  { 
    nom: "Crousty (défaut)",
    primaire: "#E91E8C",
    secondaire: "#7B2FBE"
  },
  { 
    nom: "Océan",
    primaire: "#0EA5E9",
    secondaire: "#0F4C81"
  },
  { 
    nom: "Forêt",
    primaire: "#16A34A",
    secondaire: "#166534"
  },
  { 
    nom: "Soleil",
    primaire: "#F59E0B",
    secondaire: "#B45309"
  },
  { 
    nom: "Corail",
    primaire: "#EF4444",
    secondaire: "#B91C1C"
  },
  { 
    nom: "Ardoise",
    primaire: "#6366F1",
    secondaire: "#4338CA"
  },
  { 
    nom: "Minuit",
    primaire: "#8B5CF6",
    secondaire: "#1E1B4B"
  },
  { 
    nom: "Nuit",
    primaire: "#64748B",
    secondaire: "#1E293B"
  },
];

const availableIcons = [
  { name: 'ChefHat', icon: ChefHat },
  { name: 'Pizza', icon: Pizza },
  { name: 'Utensils', icon: Utensils },
  { name: 'Coffee', icon: Coffee },
  { name: 'Sandwich', icon: Sandwich },
  { name: 'Star', icon: Star },
  { name: 'Flame', icon: Flame },
  { name: 'Droplet', icon: Droplet },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Package', icon: Package },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'PieChart', icon: PieChart }
];

export const IdentiteTab = () => {
  const { config, updateConfig } = useConfig();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const currentPrimary = config.restaurant?.couleurPrimaire || '#E91E8C';
  const currentSecondary = config.restaurant?.couleurSecondaire || '#7B2FBE';
  const identity = config.restaurant;

  const updateIdentity = (updates: any) => {
    const newRestaurant = {
      ...config.restaurant,
      ...updates
    };

    updateConfig({
      restaurant: newRestaurant
    });
  };

  const handleEditClick = (part: string) => {
    if (part === 'text') {
      setEditingText(config.restaurant?.nom || '');
    }
    setEditingPart(editingPart === part ? null : part);
  };

  const handleTextSubmit = () => {
    updateIdentity({ nom: editingText });
    setEditingPart(null);
  };

  const isPaletteSelected = (p: typeof palettes[0]) => {
    return p.primaire.toLowerCase() === (currentPrimary || '').toLowerCase() && 
           p.secondaire.toLowerCase() === (currentSecondary || '').toLowerCase();
  };

  const handlePaletteSelect = (p: any) => {
    updateIdentity({
      couleurPrimaire: p.primaire,
      couleurSecondaire: p.secondaire
    });
  };

  const handleColorChange = (key: string, value: string) => {
    // Basic hex validation
    let color = value;
    if (!value.startsWith('#') && (value.length === 3 || value.length === 6)) {
      color = '#' + value;
    }
    updateIdentity({ [key]: color });
  };

  const resetToDefault = () => {
    handlePaletteSelect({ primaire: "#E91E8C", secondaire: "#7B2FBE" });
  };

  return (
    <div className="relative lg:grid lg:grid-cols-12 lg:gap-12 pb-20">
      {/* COLONNE GAUCHE : RÉGLAGES (7 colonnes) */}
      <div className="lg:col-span-7 space-y-12 order-2 lg:order-1">
        
        {/* TITRE DE SECTION MOBILE (Caché sur desktop car le sticky l'affiche) */}
        <div className="lg:hidden mt-8">
           <h3 className="text-2xl font-black text-gray-800 tracking-tight">Personnalisation</h3>
           <p className="text-sm font-bold text-gray-400">Configurez l'âme de votre restaurant</p>
        </div>

        {/* 1. INFOS GÉNÉRALES */}
        <section id="base-infos" className="animate-in fade-in slide-in-from-left-4 duration-500 rounded-[2.5rem] transition-all duration-300">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-crousty-pink rounded-full"></span>
            Informations de Base
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nom de l'établissement</Label>
              <Input
                value={identity.nom || ''}
                onChange={(e) => updateIdentity({ nom: e.target.value })}
                placeholder="Ex: Crousty Hub"
                className="font-bold h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ville / Secteur</Label>
              <Input
                value={identity.ville || ''}
                onChange={(e) => updateIdentity({ ville: e.target.value })}
                placeholder="Ex: Paris 15"
                className="font-bold h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>
        </section>

        {/* 2. STYLE DU LOGO & MONOGRAMME */}
        <section id="logo-style" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 delay-100 transition-all duration-300">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Layout className="text-crousty-purple" />
            Signature Visuelle
          </h3>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mode d'affichage du logo</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'text', label: 'Nom complet', icon: Type },
                  { id: 'initials', label: 'Initiales', icon: User },
                  { id: 'icon', label: 'Icône seule', icon: ChefHat },
                  { id: 'icon+text', label: 'Icône + Nom', icon: Layout },
                  { id: 'icon+initials', label: 'Icône + Init', icon: Layout },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateIdentity({ logoMode: mode.id })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-xs font-bold",
                      identity.logoMode === mode.id 
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-gray-900 shadow-sm scale-[1.02]"
                        : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                    )}
                  >
                    <mode.icon size={20} className={identity.logoMode === mode.id ? "text-crousty-pink" : ""} />
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {(identity.logoMode.includes('icon')) && (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Choisissez votre icône</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {availableIcons.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => updateIdentity({ logoIcon: item.name })}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all hover:scale-110",
                        identity.logoIcon === item.name
                          ? "border-crousty-purple bg-purple-50 text-crousty-purple shadow-sm"
                          : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <item.icon size={22} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Conteneur</Label>
                  <div className="flex gap-3">
                      {[
                        { id: 'round', label: 'Cercle' },
                        { id: 'square', label: 'Arrondi' },
                      ].map(shape => (
                        <button
                          key={shape.id}
                          onClick={() => updateIdentity({ logoBackgroundStyle: shape.id })}
                          className={cn(
                            "flex-1 py-3 px-4 rounded-2xl border-2 font-black text-xs transition-all",
                            identity.logoBackgroundStyle === shape.id
                              ? "border-gray-800 bg-gray-800 text-white shadow-md"
                              : "border-gray-50 bg-gray-50 text-gray-400"
                          )}
                        >
                          {shape.label}
                        </button>
                      ))}
                      <button
                        onClick={() => updateIdentity({ logoBackgroundStyle: 'none' })}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-2xl border-2 font-black text-xs transition-all",
                          identity.logoBackgroundStyle === 'none'
                             ? "border-gray-800 bg-gray-800 text-white shadow-md"
                             : "border-gray-50 bg-gray-50 text-gray-400"
                        )}
                      >
                         Libre
                      </button>
                  </div>
               </div>
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Texte spécifique</Label>
                  <Input 
                    value={identity.logoText || ''}
                    onChange={(e) => updateIdentity({ logoText: e.target.value })}
                    placeholder="Auto (Init)"
                    className="font-bold h-12 rounded-2xl border-gray-100 bg-gray-50/50"
                  />
               </div>
            </div>

            {/* COLOR PICKERS AMÉLIORÉS - SECTION LOGO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
               <div className="space-y-4 group">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur de fond</Label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-md">
                    <div className="relative w-16 h-16 rounded-2xl shadow-inner border border-white/20 overflow-hidden" style={{ backgroundColor: identity.logoBackgroundColor || currentPrimary }}>
                      <input 
                        type="color" 
                        value={identity.logoBackgroundColor || currentPrimary} 
                        onChange={(e) => updateIdentity({ logoBackgroundColor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        value={(identity.logoBackgroundColor || currentPrimary).toUpperCase()}
                        onChange={(e) => handleColorChange('logoBackgroundColor', e.target.value)}
                        className="font-mono font-black text-center text-sm border-none bg-transparent shadow-none h-auto p-0 tracking-widest"
                      />
                      <p className="text-[9px] font-black text-gray-300 uppercase mt-1 text-center">Toucher pour éditer</p>
                    </div>
                  </div>
               </div>

               <div className="space-y-4 group">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur texte/icône</Label>
                  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-100 transition-all hover:bg-white hover:shadow-md">
                    <div className="relative w-16 h-16 rounded-2xl shadow-inner border border-white/20 overflow-hidden" style={{ backgroundColor: identity.logoTextColor || '#FFFFFF' }}>
                      <input 
                        type="color" 
                        value={identity.logoTextColor || '#FFFFFF'} 
                        onChange={(e) => updateIdentity({ logoTextColor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1">
                      <Input 
                        value={(identity.logoTextColor || '#FFFFFF').toUpperCase()}
                        onChange={(e) => handleColorChange('logoTextColor', e.target.value)}
                        className="font-mono font-black text-center text-sm border-none bg-transparent shadow-none h-auto p-0 tracking-widest"
                      />
                      <p className="text-[9px] font-black text-gray-300 uppercase mt-1 text-center">Toucher pour éditer</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 3. PALETTES ET COULEURS GLOBALES */}
        <section id="interface-colors" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 delay-200 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Sparkles className="text-crousty-pink" />
              Couleurs de l'Interface
            </h3>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-50 hover:bg-crousty-pink/5 text-gray-400 hover:text-crousty-pink rounded-2xl transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Reset</span>
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Palettes prédéfinies</Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {palettes.map((p) => {
                  const active = isPaletteSelected(p);
                  return (
                    <button
                      key={p.nom}
                      onClick={() => handlePaletteSelect(p)}
                      title={p.nom}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-2xl border-2 transition-all hover:scale-110 active:scale-95",
                        active 
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] shadow-md' 
                          : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                      )}
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-inner rotate-12">
                         <div className="absolute inset-x-0 top-0 h-1/2" style={{ backgroundColor: p.primaire }} />
                         <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ backgroundColor: p.secondaire }} />
                      </div>
                      {active && (
                         <div className="w-1.5 h-1.5 rounded-full bg-crousty-pink mt-2 animate-bounce" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* COLOR PICKERS AMÉLIORÉS - SECTION GLOBALE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur Primaire (Action)</Label>
                <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                  <div className="relative w-20 h-20 rounded-3xl shadow-xl border-4 border-white overflow-hidden group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: currentPrimary }}>
                    <input
                      type="color"
                      value={currentPrimary}
                      onChange={(e) => handleColorChange('couleurPrimaire', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={currentPrimary.toUpperCase()}
                      onChange={(e) => handleColorChange('couleurPrimaire', e.target.value)}
                      className="font-mono font-black text-xl border-none bg-transparent shadow-none h-auto p-0 tracking-[0.2em]"
                    />
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                       <span className="text-[9px] font-black text-gray-300 uppercase">Valide & Actif</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Couleur Secondaire (Accent)</Label>
                <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                  <div className="relative w-20 h-20 rounded-3xl shadow-xl border-4 border-white overflow-hidden group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: currentSecondary }}>
                    <input
                      type="color"
                      value={currentSecondary}
                      onChange={(e) => handleColorChange('couleurSecondaire', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={currentSecondary.toUpperCase()}
                      onChange={(e) => handleColorChange('couleurSecondaire', e.target.value)}
                      className="font-mono font-black text-xl border-none bg-transparent shadow-none h-auto p-0 tracking-[0.2em]"
                    />
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-400" />
                       <span className="text-[9px] font-black text-gray-300 uppercase">Teinte d'accent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* COLONNE DROITE : PREVIEW STICKY (5 colonnes) */}
      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="sticky top-6 lg:top-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
           
           <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/5">
              {/* Animation de fond */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(233,30,140,0.1),transparent)]" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                   <div>
                     <h2 className="text-xl font-black text-white tracking-tight">Design Lab</h2>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Génération en direct</p>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Connecté</span>
                   </div>
                </div>

                {/* PREVIEW COMPOSANTS INTERACTIFS */}
                <div className="grid grid-cols-1 gap-6">
                  {/* HEADER INTERACTIF */}
                  <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 group relative transition-all hover:bg-white/10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">Éditeur de Header</p>
                    <div className="flex justify-center relative">
                      {editingPart === 'text' ? (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                           <Input 
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={handleTextSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                            className="bg-white text-gray-900 font-black h-10 rounded-xl w-48 shadow-2xl border-crousty-pink ring-2 ring-crousty-pink/20"
                           />
                           <button onClick={handleTextSubmit} className="w-10 h-10 bg-green-500 text-white rounded-xl shadow-lg flex items-center justify-center">
                              <Check size={18} />
                           </button>
                        </div>
                      ) : (
                        <RestaurantLogo 
                          size="md" 
                          showText 
                          interactive 
                          onClick={(part) => handleEditClick(part)} 
                        />
                      )}

                      {/* Floating Control Popover pour le logo/style */}
                      <AnimatePresence>
                        {editingPart === 'logo' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-4 left-1/2 -translate-x-1/2 z-50 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 p-6 space-y-6 text-gray-900"
                          >
                             <div className="flex items-center justify-between gap-3 mb-2">
                                <span className="text-[10px] font-black uppercase text-gray-400">Style du Logo</span>
                                <button onClick={() => setEditingPart(null)} className="text-gray-300 hover:text-gray-600"><X size={14}/></button>
                             </div>

                             <div className="space-y-4">
                               <div className="flex gap-2">
                                 {['round', 'square', 'none'].map(shape => (
                                   <button 
                                    key={shape}
                                    onClick={() => updateIdentity({ logoBackgroundStyle: shape })}
                                    className={cn(
                                       "flex-1 h-10 rounded-xl border-2 text-[10px] font-black uppercase",
                                       identity.logoBackgroundStyle === shape ? "border-crousty-pink bg-purple-50 text-crousty-purple" : "bg-gray-50 border-transparent text-gray-400"
                                    )}
                                   >
                                      {shape === 'round' ? 'O' : shape === 'square' ? '[]' : 'X'}
                                   </button>
                                 ))}
                               </div>
                               
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <p className="text-[8px] font-black text-gray-400 uppercase text-center">Fond</p>
                                    <input 
                                      type="color" 
                                      value={identity.logoBackgroundColor || currentPrimary} 
                                      onChange={(e) => updateIdentity({ logoBackgroundColor: e.target.value })}
                                      className="w-full h-10 rounded-xl cursor-pointer shadow-sm overflow-hidden border-none p-0"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[8px] font-black text-gray-400 uppercase text-center">Texte</p>
                                    <input 
                                      type="color" 
                                      value={identity.logoTextColor || '#FFFFFF'} 
                                      onChange={(e) => updateIdentity({ logoTextColor: e.target.value })}
                                      className="w-full h-10 rounded-xl cursor-pointer shadow-sm overflow-hidden border-none p-0"
                                    />
                                  </div>
                               </div>

                               <div className="space-y-2 pt-2 border-t border-gray-100">
                                  <p className="text-[8px] font-black text-gray-400 uppercase text-center mb-2">Icône</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {availableIcons.slice(0, 8).map(item => (
                                      <button 
                                        key={item.name}
                                        onClick={() => updateIdentity({ logoIcon: item.name, logoMode: 'icon' })}
                                        className={cn(
                                          "h-8 flex items-center justify-center rounded-lg transition-all",
                                          identity.logoIcon === item.name ? "bg-crousty-pink text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                        )}
                                      >
                                        <item.icon size={14} />
                                      </button>
                                    ))}
                                  </div>
                               </div>
                             </div>
                             
                             <div className="bg-gray-50 p-3 rounded-2xl">
                                <p className="text-[9px] font-bold text-gray-400 leading-tight">
                                  Les modifications sont appliquées instantanément à votre branding.
                                </p>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* SIGNATURE INTERACTIVE */}
                  <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 group relative transition-all hover:bg-white/10 flex flex-col items-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Monogramme de Signature</p>
                    <div className="relative group/logo">
                      <RestaurantLogo 
                        size="xl" 
                        interactive 
                        onClick={() => handleEditClick('logo')} 
                      />
                      <div className="absolute -top-2 -right-2 bg-crousty-pink text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/logo:opacity-100 transition-opacity">
                         <Edit2 size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* MOCKUP MOBILE MINIATURE */}
                <div 
                  className="bg-gray-100 p-3 sm:p-5 rounded-[2.5rem] border-4 border-gray-700 shadow-inner group cursor-pointer hover:border-crousty-pink hover:scale-[1.01] transition-all"
                  onClick={() => scrollToSection('interface-colors')}
                >
                  <div className="bg-white rounded-[1.8rem] h-[320px] overflow-hidden flex flex-col shadow-2xl relative">
                    {/* Header Mockup */}
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                       <RestaurantLogo size="sm" showText />
                       <div className="w-6 h-6 rounded-full bg-gray-100" />
                    </div>
                    
                    {/* Content Mockup */}
                    <div className="flex-1 p-4 space-y-4 overflow-hidden">
                       <div 
                         className="h-32 rounded-2xl p-4 text-white relative overflow-hidden transition-all duration-500 hover:ring-4 hover:ring-white/30"
                         style={{ background: `linear-gradient(135deg, ${currentPrimary}, ${currentSecondary})` }}
                       >
                         <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10 blur-xl" />
                         <div className="relative z-10 flex flex-col justify-end h-full">
                            <p className="text-[8px] font-bold uppercase tracking-widest opacity-80">{identity.ville || "PARIS 15"}</p>
                            <h4 className="text-base font-black truncate">{identity.nom || "HUB"}</h4>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                         {[1, 2].map(i => (
                           <div key={i} className="h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                              <Star className="text-gray-200" size={16} />
                           </div>
                         ))}
                       </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="w-16 h-1 bg-gray-100 rounded-full mx-auto my-3" />
                  </div>
                </div>

                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                     <Smartphone size={12} />
                     Optimisation Multi-Device
                   </p>
                </div>
              </div>
           </div>

           {/* CONSEIL DESIGN - Caché sur mobile pour gagner de la place */}
           <div className="hidden lg:block bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Conseil Design</p>
              <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
                "Utilisez une couleur primaire contrastée pour les boutons d'action afin d'améliorer l'ergonomie de saisie sur le terrain."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

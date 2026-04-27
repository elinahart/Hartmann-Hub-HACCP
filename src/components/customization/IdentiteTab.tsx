import React, { useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { Label, Input } from '../ui/LightUI';
import { Check, X, Edit2, RotateCcw, Layout, Type, User, ChefHat, Pizza, Utensils, Coffee, Sandwich, PieChart, Star, Flame, Droplet, Smartphone, Package, Sparkles } from 'lucide-react';
import { RestaurantLogo } from '../ui/RestaurantLogo';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useI18n } from '../../lib/i18n';

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
  const { t } = useI18n();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  const [editingPart, setEditingPart] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const currentPrimary = config.restaurant?.couleurPrimaire || '#E91E8C';
  const currentSecondary = config.restaurant?.couleurSecondaire || '#7B2FBE';
  const identity = config.restaurant;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Ajouter un petit effet de flash
      element.classList.add('ring-4', 'ring-crousty-pink/50');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-crousty-pink/50');
      }, 2000);
    }
  };

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
           <h3 className="text-2xl font-black text-gray-800 tracking-tight">{t('settings_personalize')}</h3>
           <p className="text-sm font-bold text-gray-400">{t('settings_personalize_desc')}</p>
        </div>

        {/* 1. INFOS GÉNÉRALES */}
        <section id="base-infos" className="animate-in fade-in slide-in-from-left-4 duration-500 rounded-[2.5rem] transition-all duration-300">
          <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-crousty-pink rounded-full"></span>
            {t('identity_base_info')}
          </h3>
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('identity_resto_name')}</Label>
                <Input
                  value={identity.nom || ''}
                  onChange={(e) => updateIdentity({ nom: e.target.value })}
                  placeholder="Ex: Hartmann Hub"
                  className="font-bold h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('identity_city')}</Label>
                <Input
                  value={identity.ville || ''}
                  onChange={(e) => updateIdentity({ ville: e.target.value })}
                  placeholder="Ex: Paris 15"
                  className="font-bold h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t border-gray-50">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('identity_monogram_text')}</Label>
              <div className="relative group">
                <Input 
                  value={identity.logoText || ''}
                  onChange={(e) => updateIdentity({ logoText: e.target.value })}
                  placeholder={identity.nom ? identity.nom.substring(0, 1).toUpperCase() : "Auto (Init)"}
                  className="font-black h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all pl-4"
                />
                {!identity.logoText && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] font-black text-gray-300 uppercase bg-gray-100 px-2 py-1 rounded-lg">{t('identity_auto_value')}</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 italic">
                {t('identity_monogram_hint')}
              </p>
            </div>
          </div>
        </section>

        {/* 2. DESIGN LAB INTERACTIF (CENTRAL) */}
        <section id="design-lab" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
           <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl overflow-hidden relative border border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(233,30,140,0.1),transparent)]" />
              
              <div className="relative z-10 space-y-12">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                   <div>
                     <h2 className="text-2xl font-black text-white tracking-tight">{t('identity_design_lab')}</h2>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('identity_design_lab_desc')}</p>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t('status_connected')}</span>
                   </div>
                </div>

                {/* PREVIEW COMPOSANTS INTERACTIFS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* HEADER INTERACTIF */}
                  <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 group relative transition-all hover:bg-white/10 min-h-[200px] flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-8 text-center">{t('identity_header_preview')}</p>
                    <div className="flex justify-center relative">
                      {editingPart === 'text' ? (
                        <div className="flex flex-col gap-2 items-center animate-in fade-in zoom-in-95">
                           <Input 
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onBlur={handleTextSubmit}
                            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                            className="bg-white text-gray-900 font-black h-12 rounded-xl w-64 shadow-2xl border-crousty-pink ring-4 ring-crousty-pink/20 text-lg text-center"
                           />
                           <div className="flex gap-2">
                             <button onClick={handleTextSubmit} className="px-4 h-10 bg-green-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-sm font-bold">
                                {t('btn_validate')}
                             </button>
                             <button onClick={() => setEditingPart(null)} className="px-4 h-10 bg-gray-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-sm font-bold">
                                {t('btn_cancel')}
                             </button>
                           </div>
                        </div>
                      ) : editingPart === 'monogram' ? (
                         <div className="flex flex-col gap-2 items-center animate-in fade-in zoom-in-95">
                            <Input 
                             autoFocus
                             maxLength={2}
                             value={identity.logoText || ''}
                             onChange={(e) => updateIdentity({ logoText: e.target.value })}
                             onBlur={() => setEditingPart(null)}
                             placeholder="XX"
                             className="bg-white text-gray-900 font-black h-16 w-16 text-2xl text-center rounded-2xl shadow-2xl border-crousty-pink ring-4 ring-crousty-pink/20"
                            />
                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">{t('identity_edit_monogram')}</p>
                         </div>
                      ) : (
                        <RestaurantLogo 
                          size="md" 
                          showText 
                          interactive 
                          onClick={(part) => {
                            if (part === 'text') handleEditClick('text');
                            else if (part === 'logo') setEditingPart('logo');
                            else if (part === 'monogram') setEditingPart('monogram');
                            else if (part === 'icon') setEditingPart('logo');
                          }} 
                        />
                      )}

                      {/* Popover de style logo */}
                      <AnimatePresence>
                        {editingPart === 'logo' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-6 left-1/2 -translate-x-1/2 z-50 w-72 bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.4)] border border-gray-100 p-8 space-y-8 text-gray-900"
                          >
                             <div className="flex items-center justify-between gap-3">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('identity_style_signature')}</span>
                                <button onClick={() => setEditingPart(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={18}/></button>
                             </div>

                             <div className="space-y-6">
                               <div className="flex gap-2">
                                 {['round', 'square', 'none'].map(shape => (
                                   <button 
                                    key={shape}
                                    onClick={() => updateIdentity({ logoBackgroundStyle: shape })}
                                    className={cn(
                                       "flex-1 h-12 rounded-2xl border-2 text-[10px] font-black uppercase transition-all",
                                       identity.logoBackgroundStyle === shape ? "border-crousty-pink bg-purple-50 text-crousty-purple shadow-sm" : "bg-gray-50 border-transparent text-gray-300"
                                    )}
                                   >
                                      {shape === 'round' ? t('identity_shape_round') : shape === 'square' ? t('identity_shape_square') : t('identity_shape_free')}
                                   </button>
                                 ))}
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase text-center">{t('identity_bg')}</p>
                                    <div className="relative group">
                                      <input 
                                        type="color" 
                                        value={identity.logoBackgroundColor || currentPrimary} 
                                        onChange={(e) => updateIdentity({ logoBackgroundColor: e.target.value })}
                                        className="w-full h-12 rounded-2xl cursor-pointer shadow-lg overflow-hidden border-none p-0"
                                      />
                                      <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-white opacity-20 pointer-events-none" />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-400 uppercase text-center">{t('identity_content')}</p>
                                    <div className="relative group">
                                      <input 
                                        type="color" 
                                        value={identity.logoTextColor || '#FFFFFF'} 
                                        onChange={(e) => updateIdentity({ logoTextColor: e.target.value })}
                                        className="w-full h-12 rounded-2xl cursor-pointer shadow-lg overflow-hidden border-none p-0"
                                      />
                                      <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-white opacity-20 pointer-events-none" />
                                    </div>
                                  </div>
                               </div>

                               <div className="space-y-3 pt-4 border-t border-gray-100">
                                  <p className="text-[9px] font-black text-gray-400 uppercase text-center">{t('identity_brand_icon')}</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {availableIcons.slice(0, 8).map(item => (
                                      <button 
                                        key={item.name}
                                        onClick={() => updateIdentity({ logoIcon: item.name, logoMode: 'icon' })}
                                        className={cn(
                                          "h-10 flex items-center justify-center rounded-xl transition-all hover:scale-110",
                                          identity.logoIcon === item.name ? "bg-crousty-pink text-white shadow-md scale-110" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                        )}
                                      >
                                        <item.icon size={18} />
                                      </button>
                                    ))}
                                  </div>
                               </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* MOCKUP MOBILE MINIATURE */}
                  <div className="bg-gray-800/50 p-6 rounded-[3rem] border border-white/5 shadow-inner">
                    <div className="bg-white rounded-[2rem] h-[340px] overflow-hidden flex flex-col shadow-2xl relative border-4 border-gray-900">
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                         <RestaurantLogo size="sm" showText />
                         <div className="w-6 h-6 rounded-full bg-gray-100" />
                      </div>
                      
                      <div className="flex-1 p-5 space-y-5 overflow-hidden">
                         <div 
                           className="h-36 rounded-2xl p-6 text-white relative overflow-hidden transition-all duration-700 shadow-xl"
                           style={{ background: `linear-gradient(135deg, ${currentPrimary}, ${currentSecondary})` }}
                         >
                           <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                           <div className="relative z-10 flex flex-col justify-end h-full">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">{identity.ville || "PARIS 15"}</p>
                              <h4 className="text-xl font-black truncate">{identity.nom || "HUB"}</h4>
                           </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4">
                           {[1, 2].map(i => (
                             <div key={i} className="h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center">
                                <Star className="text-gray-100" size={24} />
                             </div>
                           ))}
                         </div>
                      </div>
                      
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mx-auto my-4" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4 opacity-50">
                   <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase flex items-center gap-4">
                     <span className="w-12 h-px bg-current" />
                     Design System V1.0
                     <span className="w-12 h-px bg-current" />
                   </p>
                </div>
              </div>
           </div>
        </section>

        {/* 3. PALETTES ET COULEURS GLOBALES */}
        <section id="interface-colors" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 delay-200 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Sparkles className="text-crousty-pink" />
              {t('identity_ui_colors')}
            </h3>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-50 hover:bg-crousty-pink/5 text-gray-400 hover:text-crousty-pink rounded-2xl transition-all flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t('btn_reset')}</span>
            </button>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('identity_palette_predefined')}</Label>
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('identity_primary_color')}</Label>
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
                       <span className="text-[9px] font-black text-gray-300 uppercase">{t('identity_active_valid')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('identity_secondary_color')}</Label>
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
                       <span className="text-[9px] font-black text-gray-300 uppercase">{t('identity_accent_shade')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

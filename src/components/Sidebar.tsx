import React from 'react';
import { ChefHat, Package, Thermometer, Flame, Sparkles, Tag, Droplet, ClipboardList, Archive, LogOut, Settings, ChevronLeft, ChevronRight, Home, X, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { getInitials } from '../lib/utils';
import { RestaurantLogo } from './ui/RestaurantLogo';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  setShowSettings: (show: boolean) => void;
  showSettings: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar = ({ currentView, setCurrentView, setShowSettings, showSettings, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) => {
  const { currentUser, logout } = useAuth();
  const { config } = useConfig();

  const navItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'receptions', label: 'Réception', icon: Package },
    { id: 'tracabilite', label: 'Traçabilité', icon: Sparkles },
    { id: 'temperatures', label: 'Températures', icon: Thermometer },
    { id: 'viandes', label: 'Cuisson Alimentaire', icon: Flame },
    { id: 'cleaning', label: 'Plan de nettoyage', icon: Sparkles },
    { id: 'desserts', label: 'Étiquettes DLC', icon: Tag },
    { id: 'prep', label: 'Préparations', icon: ChefHat },
    { id: 'oil', label: 'Huiles', icon: Droplet },
    { id: 'inventaire', label: 'Inventaire', icon: ClipboardList },
    { id: 'sessions-mobiles', label: 'Sessions Mobiles', icon: Smartphone },
    ...(currentUser?.role !== 'Invité' ? [{ id: 'products', label: 'Catalogue', icon: Archive }] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] md:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <div className={`fixed top-0 left-0 bg-white border-r border-gray-100 flex flex-col h-full z-[200] transition-all duration-[280ms] ${isCollapsed ? 'md:w-[64px]' : 'md:w-[250px]'} transform 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] w-72`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}>
        
        <div className={`p-4 border-b border-gray-100 flex items-center ${isCollapsed ? 'md:justify-center' : 'justify-between'} h-[60px] overflow-hidden`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <RestaurantLogo 
              size="sm" 
              showText={!isCollapsed || isMobileOpen} 
            />
          </div>
          <button className="md:hidden text-gray-400 shrink-0" onClick={() => setIsMobileOpen?.(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const shownOnMobile = !isCollapsed || isMobileOpen;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 py-3 rounded-xl font-bold transition-all ${
                  isCollapsed && !isMobileOpen ? 'md:justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-crousty-purple text-white shadow-md sidebar-item-active' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {shownOnMobile && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
              </button>
            )
          })}
        </div>

        <div className={`p-4 border-t border-gray-100 flex flex-col gap-2`}>
          <div className={`flex items-center ${isCollapsed && !isMobileOpen ? 'md:justify-center' : 'gap-3 px-4'} py-2 bg-gray-50 rounded-xl mb-2`}>
            <div className="w-8 h-8 bg-crousty-purple/10 text-crousty-purple rounded-full flex items-center justify-center font-bold shrink-0">
              {currentUser ? getInitials(currentUser.name) : ''}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{currentUser?.name}</span>
                <span className="text-xs text-gray-500 font-medium">{currentUser?.role}</span>
              </div>
            )}
          </div>
          
          {currentView === 'dashboard' && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              title={isCollapsed && !isMobileOpen ? "Mon Profil" : undefined}
              className={`flex items-center gap-2 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors ${isCollapsed && !isMobileOpen ? 'md:justify-center px-0' : 'px-4'}`}
            >
              <Settings size={16} className="shrink-0" /> {(!isCollapsed || isMobileOpen) && (currentUser?.role === 'manager' ? "Paramètres" : "Mon Profil")}
            </button>
          )}
          <button 
            onClick={logout}
            title={isCollapsed && !isMobileOpen ? "Déconnexion" : undefined}
            className={`flex items-center gap-2 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors ${isCollapsed && !isMobileOpen ? 'md:justify-center px-0' : 'px-4'}`}
          >
            <LogOut size={16} className="shrink-0" /> {(!isCollapsed || isMobileOpen) && "Me déconnecter"}
          </button>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`mt-2 hidden md:flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Label, Button } from '../components/ui/LightUI';
import { getStoredData, setStoredData } from '../lib/db';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { createSignature } from '../lib/permissions';
import { SaisieActions } from '../components/SaisieActions';
import { SignatureSaisie } from '../types';

export interface CuissonProduit {
  temp: string;
  conforme: boolean;
  action?: string;
}

export interface ViandeEntry {
  id: string;
  date: string;
  
  // Legacy
  typeViande?: string;
  temperature?: string;
  conforme?: string;
  actionCorrective?: string;

  // New format
  produits?: {
    tenders?: CuissonProduit;
    poisson?: CuissonProduit;
  };

  responsable: string;
  signature?: SignatureSaisie;
  supprime?: boolean;
}

export default function Viandes() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<ViandeEntry[]>([]);
  
  const [tendersTemp, setTendersTemp] = useState('');
  const [tendersAction, setTendersAction] = useState('');
  const [poissonTemp, setPoissonTemp] = useState('');
  const [poissonAction, setPoissonAction] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setEntries(getStoredData<ViandeEntry[]>('crousty_viandes', []));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getConformite = (tempStr: string) => {
    if (!tempStr) return null;
    const tempNum = parseFloat(tempStr.replace(',', '.'));
    if (isNaN(tempNum)) return null;
    return tempNum >= 67;
  };

  const tendsConforme = getConformite(tendersTemp);
  const poissConforme = getConformite(poissonTemp);

  const canSubmit = 
    tendsConforme !== null && 
    poissConforme !== null &&
    (tendsConforme || tendersAction.trim().length > 0) &&
    (poissConforme || poissonAction.trim().length > 0);

  const handleSave = () => {
    if (!canSubmit) return;
    
    const newEntry: ViandeEntry = {
      id: Date.now().toString(), 
      date: new Date().toISOString(), 
      produits: {
        tenders: {
          temp: tendersTemp,
          conforme: tendsConforme!,
          action: tendsConforme ? undefined : tendersAction
        },
        poisson: {
          temp: poissonTemp,
          conforme: poissConforme!,
          action: poissConforme ? undefined : poissonAction
        }
      },
      responsable: currentUser?.name || localStorage.getItem('crousty_mobile_worker') || 'Inconnu',
      signature: createSignature(currentUser || null)
    };
    
    const updated = [newEntry, ...entries];
    setEntries(updated);
    setStoredData('crousty_viandes', updated);
    
    setTendersTemp('');
    setTendersAction('');
    setPoissonTemp('');
    setPoissonAction('');
  };

  const handleDelete = (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, supprime: true } : e);
    setEntries(updated);
    setStoredData('crousty_viandes', updated);
    setDeleteId(null);
  };

  const isDoneToday = entries.some(e => {
    if (e.supprime) return false;
    const date = new Date(e.date);
    return date.getDate() === currentTime.getDate() && 
           date.getMonth() === currentTime.getMonth() && 
           date.getFullYear() === currentTime.getFullYear();
  });

  const hours = currentTime.getHours();
  const enRetard = !isDoneToday && hours >= 10;

  const renderProductCard = (
    title: string, 
    temp: string, 
    setTemp: (v: string) => void, 
    action: string, 
    setAction: (v: string) => void, 
    conforme: boolean | null
  ) => {
    const isError = conforme === false;
    const isSuccess = conforme === true;
    
    return (
      <div className={`p-4 rounded-xl border-2 transition-colors ${isSuccess ? 'border-green-500 bg-green-50' : isError ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg text-gray-800">{title}</h3>
          {isSuccess && <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded-full"><Check size={16} /> Conforme ✅</span>}
          {isError && <span className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-100 px-2 py-1 rounded-full"><X size={16} /> Non conforme ❌</span>}
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Label className="text-xs text-gray-500 font-bold">Temp. à cœur (°C)</Label>
            <div className="relative">
              <Input 
                type="number" 
                inputMode="decimal" 
                step="0.1" 
                value={temp} 
                onChange={(e: any) => setTemp(e.target.value)} 
                className={`text-xl font-bold h-12 pt-1 ${isError ? 'border-red-300 ring-red-100' : isSuccess ? 'border-green-300 ring-green-100' : ''}`}
                placeholder="Ex: 72"
              />
              <div className="absolute right-3 top-3 text-gray-400 font-bold">°C</div>
            </div>
          </div>
        </div>

        {isError && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <Label className="text-red-700 flex items-center gap-1"><AlertCircle size={14} /> Action corrective obligatoire</Label>
            <Input 
              value={action} 
              onChange={(e: any) => setAction(e.target.value)} 
              placeholder="Ex: Remis en cuisson 5 min" 
              className="border-red-300 bg-white"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 pt-8">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-widest text-center">🥩 Cuisson Alimentaire</h2>
      
      {/* Banner */}
      <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm ${isDoneToday ? 'bg-green-100 border border-green-300' : enRetard ? 'bg-red-100 border border-red-300' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-center gap-3">
          {isDoneToday ? (
            <Check className="text-green-600" size={24} />
          ) : enRetard ? (
            <AlertCircle className="text-red-600" size={24} />
          ) : (
            <Clock className="text-blue-600" size={24} />
          )}
          <div>
            <div className={`font-bold ${isDoneToday ? 'text-green-800' : enRetard ? 'text-red-800' : 'text-blue-800'}`}>
              {isDoneToday ? "Contrôle du matin effectué ✅" : enRetard ? "Contrôle en retard ⚠️" : "Contrôle à effectuer avant 10h00"}
            </div>
            {!isDoneToday && (
              <div className="text-sm font-medium text-gray-600">
                Heure actuelle : {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderProductCard('🍗 Tenders', tendersTemp, setTendersTemp, tendersAction, setTendersAction, tendsConforme)}
        {renderProductCard('🐟 Poisson', poissonTemp, setPoissonTemp, poissonAction, setPoissonAction, poissConforme)}
      </div>

      <Button 
        onClick={handleSave} 
        disabled={!canSubmit}
        className={`w-full py-4 text-lg shadow-lg transition-all ${!canSubmit ? 'bg-gray-300 pointer-events-none' : 'bg-crousty-pink hover:bg-pink-600'}`}
      >
        💾 Valider le contrôle cuisson
      </Button>
      
      <div className="space-y-4 mt-8">
        <h3 className="text-lg font-bold text-gray-500 uppercase">Historique</h3>
        {entries.filter(e => !e.supprime).map(e => (
          <Card key={e.id} className="relative overflow-hidden group">
            {deleteId === e.id && (
              <div className="absolute inset-0 bg-red-50/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                <p className="text-red-700 font-black text-sm mb-3 text-center px-4 leading-tight">
                  {e.responsable !== currentUser?.name && currentUser?.role === 'manager' 
                    ? `Supprimer la saisie de ${e.responsable} ?`
                    : "Supprimer cette saisie ?"}
                </p>
                <div className="flex gap-2 w-full max-w-[200px]">
                  <button 
                    onClick={() => setDeleteId(null)} 
                    className="flex-1 h-10 bg-white text-gray-500 rounded-xl font-bold border border-gray-200 shadow-sm active:scale-95 transition-transform"
                  >
                    Non
                  </button>
                  <button 
                    onClick={() => handleDelete(e.id)} 
                    className="flex-1 h-10 bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-200 active:scale-95 transition-transform"
                  >
                    Oui
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-start mb-3 gap-4">
              <div className="flex-1">
                <div className="text-sm font-black text-gray-800">{new Date(e.date).toLocaleDateString('fr-FR')}</div>
                <div className="text-xs text-gray-500 font-medium">{new Date(e.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold inline-block">
                  Validé par {e.responsable || 'Inconnu'}
                </div>
              </div>
              
              {deleteId !== e.id && (
                <div className="shrink-0">
                  <SaisieActions saisie={e} onDelete={() => setDeleteId(e.id)} />
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
              {e.produits ? (
                <>
                  {e.produits.tenders && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-700">Tenders</span>
                      <span className={`font-black ${e.produits.tenders.conforme ? 'text-green-600' : 'text-red-600'}`}>
                        {e.produits.tenders.temp}°C {e.produits.tenders.conforme ? '✅' : '❌'}
                      </span>
                    </div>
                  )}
                  {e.produits.poisson && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-700">Poisson</span>
                      <span className={`font-black ${e.produits.poisson.conforme ? 'text-green-600' : 'text-red-600'}`}>
                        {e.produits.poisson.temp}°C {e.produits.poisson.conforme ? '✅' : '❌'}
                      </span>
                    </div>
                  )}
                  
                  {((e.produits.tenders?.action && !e.produits.tenders?.conforme) || (e.produits.poisson?.action && !e.produits.poisson?.conforme)) && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      {!e.produits.tenders?.conforme && e.produits.tenders?.action && <div className="text-xs text-red-600 font-bold">⚠️ Tenders: {e.produits.tenders.action}</div>}
                      {!e.produits.poisson?.conforme && e.produits.poisson?.action && <div className="text-xs text-red-600 font-bold">⚠️ Poisson: {e.produits.poisson.action}</div>}
                    </div>
                  )}
                </>
              ) : (
                // Legacy render
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-700">{e.typeViande}</span>
                    <span className={`font-black ${e.conforme === 'OUI' ? 'text-green-600' : 'text-red-600'}`}>
                      {e.temperature}°C {e.conforme === 'OUI' ? '✅' : '❌'}
                    </span>
                  </div>
                  {e.actionCorrective && <div className="text-xs text-red-600 font-bold mt-1 pt-1 border-t border-gray-200">⚠️ {e.actionCorrective}</div>}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

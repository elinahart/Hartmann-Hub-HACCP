import React, { useState } from 'react';
import { Sparkles, Edit2, Trash2, Plus, Calendar } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { Button, Input, Label } from '../ui/LightUI';
import { NettoyageTaskConfig } from '../../lib/configSchema';
import { cn } from '../../lib/utils';

import { useNettoyage } from '../../providers/NettoyageProvider';

export const NettoyageTab = () => {
  const { config, updateConfig } = useConfig();
  const { taches, setTaches } = useNettoyage();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [nom, setNom] = useState('');
  const [frequence, setFrequence] = useState('QUOTIDIEN');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const nettoyage = taches || [];
  const frequencesEnum = ['QUOTIDIEN', 'HEBDOMADAIRE', 'APRÈS SERVICE', 'APRÈS UTILISATION', 'MENSUEL', 'TRIMESTRIEL'];

  const handleEdit = (t: NettoyageTaskConfig) => {
    setEditingId(t.id);
    setNom(t.nom);
    setFrequence(t.frequence);
    // @ts-ignore
    setInstructions(t.instructions || '');
    setError(null);
  };

  const handleCreate = () => {
    setEditingId('NEW');
    setNom('');
    setFrequence('QUOTIDIEN');
    setInstructions('');
    setError(null);
  };

  const handleSave = () => {
    if (nom.trim() === '') {
      setError('Le nom est requis.');
      return;
    }

    const payload: any = {
      id: editingId === 'NEW' ? `nettoyage-${Date.now()}` : editingId!,
      nom,
      frequence,
      instructions: instructions || undefined,
      actif: true
    };

    let newNettoyage: any[];
    if (editingId === 'NEW') {
      newNettoyage = [...nettoyage, payload];
    } else {
      newNettoyage = nettoyage.map((t: any) => t.id === editingId ? payload : t);
    }

    updateConfig({ nettoyage: newNettoyage });
    setTaches(newNettoyage);
    setEditingId(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const newNettoyage = nettoyage.filter((t: any) => t.id !== id);
    updateConfig({ nettoyage: newNettoyage });
    setTaches(newNettoyage);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 max-w-2xl pb-20">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-800">Plan de Nettoyage ({nettoyage.length})</h3>
        {!editingId && (
          <Button onClick={handleCreate} className="bg-crousty-purple text-white gap-2 rounded-xl h-10 px-4">
            <Plus size={16} /> Ajouter une tâche
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {editingId === 'NEW' && (
          <div className="border-2 border-emerald-500 rounded-2xl bg-white p-6 space-y-5 shadow-xl shadow-emerald-100 mb-6 animate-in zoom-in-95">
            <h4 className="font-black text-xl text-gray-800">Nouvelle tâche</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nom de la tâche</Label>
                <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Nettoyage friteuse" className="h-12 font-bold" />
              </div>
              
              <div>
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Fréquence</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {frequencesEnum.map((f) => {
                    const isSelected = frequence === f;
                    return (
                      <button
                        key={f}
                        onClick={() => setFrequence(f)}
                        className={`py-2 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Instructions (optionnel)</Label>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="Ex: Utiliser le dégraissant vert..."
                  className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 transition-all min-h-[100px]"
                />
              </div>
            </div>
            {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setEditingId(null)}>Annuler</Button>
              <Button onClick={handleSave} className="flex-1 h-12 bg-emerald-600 border-none">Créer</Button>
            </div>
          </div>
        )}

        {nettoyage.map((t) => (
          <div key={t.id} className={cn(
            "border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow",
            !t.actif && "opacity-50 grayscale"
          )}>
            {editingId === t.id ? (
              <div className="p-6 bg-gray-50 space-y-5 animate-in slide-in-from-top-2">
                <h4 className="font-black text-gray-800">Modifier la tâche</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nom de la tâche</Label>
                    <Input value={nom} onChange={e => setNom(e.target.value)} className="h-12 font-bold" />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Fréquence</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {frequencesEnum.map((f) => {
                        const isSelected = frequence === f;
                        return (
                          <button
                            key={f}
                            onClick={() => setFrequence(f)}
                            className={`py-2 px-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Instructions (optionnel)</Label>
                    <textarea
                      value={instructions}
                      onChange={e => setInstructions(e.target.value)}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 text-sm font-bold text-gray-700 outline-none focus:border-emerald-500 transition-all min-h-[100px]"
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-2 rounded-md">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-12" onClick={() => setEditingId(null)}>Annuler</Button>
                  <Button onClick={handleSave} className="flex-1 h-12 bg-emerald-600 border-none">Enregistrer</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 text-lg leading-tight">{t.nom}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {t.frequence}
                      </span>
                      {t.instructions && (
                        <span className="text-[10px] font-bold text-gray-400 italic truncate max-w-[150px]">
                          {t.instructions}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-center text-gray-400 active:text-crousty-purple bg-gray-50 active:bg-crousty-purple/10 rounded-xl transition-all">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(t.id); }} style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-center text-gray-400 active:text-red-500 bg-gray-50 active:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {confirmDelete && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-800 text-center mb-2">Supprimer la tâche ?</h3>
              <p className="text-gray-500 text-center font-medium mb-6">
                Voulez-vous vraiment supprimer <span className="font-bold text-gray-800">"{nettoyage.find(t => t.id === confirmDelete)?.nom}"</span> ?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 h-12 bg-gray-100 text-gray-600 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 h-12 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200 active:scale-95 transition-transform"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {nettoyage.length === 0 && editingId !== 'NEW' && (
          <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4 opacity-20">✨</div>
            <p className="text-gray-400 font-bold">Le plan est vide.</p>
            <Button onClick={handleCreate} variant="outline" className="mt-4">Ajouter une tâche</Button>
          </div>
        )}
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Droplets, Edit2, Trash2, Plus } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { Button, Input, Label } from '../ui/LightUI';

import { useHuiles } from '../../providers/HuilesProvider';

export const HuilesTab = () => {
  const { config, updateConfig } = useConfig();
  const { cuves, setCuves } = useHuiles();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [nom, setNom] = useState('');
  const [error, setError] = useState<string | null>(null);

  const huiles = cuves || [];

  const handleEdit = (h: any) => {
    setEditingId(h.id);
    setNom(h.nom);
    setError(null);
  };

  const handleCreate = () => {
    setEditingId('NEW');
    setNom('');
    setError(null);
  };

  const handleSave = () => {
    if (nom.trim() === '') {
      setError('Le nom est requis.');
      return;
    }

    const payload = {
      id: editingId === 'NEW' ? `huile-${Date.now()}` : editingId!,
      nom
    };

    let newHuiles;
    if (editingId === 'NEW') {
      newHuiles = [...huiles, payload];
    } else {
      newHuiles = huiles.map((h: any) => h.id === editingId ? payload : h);
    }

    updateConfig({ huiles: newHuiles });
    setCuves(newHuiles);
    setEditingId(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const newHuiles = huiles.filter((h: any) => h.id !== id);
    updateConfig({ huiles: newHuiles });
    setCuves(newHuiles);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-800">Cuves d'Huile</h3>
        {!editingId && (
          <Button onClick={handleCreate} className="bg-crousty-purple text-white gap-2 rounded-xl h-10 px-4">
            <Plus size={16} /> Ajouter une cuve
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {huiles.map((h: any) => (
          <div key={h.id} className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
            {editingId === h.id ? (
              <div className="p-4 bg-gray-50 flex items-center gap-3">
                <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom de la cuve" autoFocus className="flex-1" />
                <Button variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                <Button onClick={handleSave} className="bg-crousty-purple">Enregistrer</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 mix-h-[44px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-yellow-100 text-yellow-600">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 leading-tight">{h.nom}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(h); }} style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-center text-gray-400 active:text-crousty-purple bg-gray-50 active:bg-crousty-purple/10 rounded-xl transition-colors">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(h.id); }} style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-center text-gray-400 active:text-red-500 bg-gray-50 active:bg-red-50 rounded-xl transition-colors">
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
              <h3 className="text-xl font-black text-gray-800 text-center mb-2">Supprimer la cuve ?</h3>
              <p className="text-gray-500 text-center font-medium mb-6">
                Voulez-vous vraiment supprimer <span className="font-bold text-gray-800">"{huiles.find((h:any) => h.id === confirmDelete)?.nom}"</span> ?
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

        {editingId === 'NEW' && (
          <div className="border border-gray-100 rounded-2xl bg-gray-50 p-4 space-y-3 shadow-sm">
            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Ajouter une cuve</Label>
            <div className="flex items-center gap-3">
              <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: Cuve 5" autoFocus className="flex-1" />
              <Button variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
              <Button onClick={handleSave} className="bg-crousty-purple">Enregistrer</Button>
            </div>
            {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-2 rounded-md">{error}</p>}
          </div>
        )}

        {huiles.length === 0 && editingId !== 'NEW' && (
          <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">Aucune cuve configurée.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Thermometer, Edit2, Trash2, Plus, Snowflake } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';
import { Button, Input, Label } from '../ui/LightUI';

import { useTemperatures } from '../../providers/TemperaturesProvider';

export const TemperaturesTab = () => {
  const { config, updateConfig } = useConfig();
  const { zones, setZones } = useTemperatures();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [nom, setNom] = useState('');
  const [type, setType] = useState<'positif' | 'negatif'>('positif');
  const [seuilMin, setSeuilMin] = useState<number>(0);
  const [seuilMax, setSeuilMax] = useState<number>(4);
  const [error, setError] = useState<string | null>(null);

  const temperatures = zones || [];

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setNom(t.nom);
    setType(t.type);
    setSeuilMin(t.seuilMin);
    setSeuilMax(t.seuilMax);
    setError(null);
  };

  const handleCreate = () => {
    setEditingId('NEW');
    setNom('');
    setType('positif');
    setSeuilMin(0);
    setSeuilMax(4);
    setError(null);
  };

  const handleSave = () => {
    if (nom.trim() === '') {
      setError('Le nom est requis.');
      return;
    }
    if (seuilMin >= seuilMax) {
      setError('Le seuil min doit être inférieur au seuil max.');
      return;
    }

    const payload = {
      id: editingId === 'NEW' ? `temp-${Date.now()}` : editingId!,
      nom,
      type,
      seuilMin,
      seuilMax
    };

    let newTemps;
    if (editingId === 'NEW') {
      newTemps = [...temperatures, payload];
    } else {
      newTemps = temperatures.map((t: any) => t.id === editingId ? payload : t);
    }

    updateConfig({ temperatures: newTemps });
    setZones(newTemps);
    setEditingId(null);
  };

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const newTemps = temperatures.filter((t: any) => t.id !== id);
    updateConfig({ temperatures: newTemps });
    setZones(newTemps);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-800">Zones Températures</h3>
        {!editingId && (
          <Button onClick={handleCreate} className="bg-crousty-purple text-white gap-2 rounded-xl h-10 px-4">
            <Plus size={16} /> Ajouter une zone
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {temperatures.map((t: any) => (
          <div key={t.id} className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm">
            {editingId === t.id ? (
              <div className="p-4 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-800">Modifier la zone</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nom de la zone</Label>
                    <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: FRIGO CUISINE" />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button 
                      onClick={() => setType('positif')}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${type === 'positif' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-500'}`}
                    >
                      <Thermometer size={16} /> Positif
                    </button>
                    <button 
                      onClick={() => setType('negatif')}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${type === 'negatif' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-500'}`}
                    >
                      <Snowflake size={16} /> Négatif
                    </button>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Seuil Min (°C)</Label>
                    <Input type="number" value={seuilMin} onChange={e => setSeuilMin(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Seuil Max (°C)</Label>
                    <Input type="number" value={seuilMax} onChange={e => setSeuilMax(Number(e.target.value))} />
                  </div>
                </div>
                {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-2 rounded-md">{error}</p>}
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                  <Button onClick={handleSave} className="bg-crousty-purple">Enregistrer</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 mix-h-[44px]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === 'negatif' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {t.type === 'negatif' ? <Snowflake size={20} /> : <Thermometer size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 leading-tight">{t.nom}</h4>
                    <span className="text-xs font-semibold text-gray-500">{t.seuilMin}°C à {t.seuilMax}°C</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(t); }} style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-center text-gray-400 active:text-crousty-purple bg-gray-50 active:bg-crousty-purple/10 rounded-xl transition-colors">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(t.id); }} style={{ minWidth: 44, minHeight: 44 }} className="flex items-center justify-center text-gray-400 active:text-red-500 bg-gray-50 active:bg-red-50 rounded-xl transition-colors">
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
              <h3 className="text-xl font-black text-gray-800 text-center mb-2">Supprimer la zone ?</h3>
              <p className="text-gray-500 text-center font-medium mb-6">
                Voulez-vous vraiment supprimer <span className="font-bold text-gray-800">"{temperatures.find((t:any) => t.id === confirmDelete)?.nom}"</span> ?
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
          <div className="border border-gray-100 rounded-2xl bg-gray-50 p-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-800">Ajouter une zone</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Nom de la zone</Label>
                <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex: FRIGO CUISINE" />
              </div>
              <div className="col-span-2 flex gap-2">
                <button 
                  onClick={() => setType('positif')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${type === 'positif' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  <Thermometer size={16} /> Positif
                </button>
                <button 
                  onClick={() => setType('negatif')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${type === 'negatif' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-500'}`}
                >
                  <Snowflake size={16} /> Négatif
                </button>
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Seuil Min (°C)</Label>
                <Input type="number" value={seuilMin} onChange={e => setSeuilMin(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Seuil Max (°C)</Label>
                <Input type="number" value={seuilMax} onChange={e => setSeuilMax(Number(e.target.value))} />
              </div>
            </div>
            {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
              <Button onClick={handleSave} className="bg-crousty-purple">Enregistrer</Button>
            </div>
          </div>
        )}

        {temperatures.length === 0 && editingId !== 'NEW' && (
          <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">Aucune zone configurée.</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Label } from '../components/ui/LightUI';
import { getStoredData, setStoredData, savePhoto, getPhoto, deletePhoto } from '../lib/db';
import { Camera, Image as ImageIcon, Trash2, Check, X, ScanBarcode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { QRScanner } from '../components/QRScanner';
import { createSignature, updateSignature } from '../lib/permissions';
import { SaisieActions } from '../components/SaisieActions';
import { SignatureSaisie } from '../types';

interface TracabiliteEntry {
  id: string;
  date: string;
  produit: string;
  numeroLot: string;
  dlc: string;
  photoId: string;
  commentaire?: string;
  userId: string;
  userName: string;
  signature?: SignatureSaisie;
  supprime?: boolean;
}

export default function Tracabilite() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<TracabiliteEntry[]>([]);
  
  const [produit, setProduit] = useState('');
  const [numeroLot, setNumeroLot] = useState('');
  const [dlc, setDlc] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<TracabiliteEntry | null>(null);
  const [editMotif, setEditMotif] = useState('');
  
  const [error, setError] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  useEffect(() => {
    // Migration helper for old entries
    let data = getStoredData<any[]>('crousty_tracabilite_v2', []);
    if (data.length === 0) {
      const oldData = getStoredData<any[]>('crousty_tracabilite_photos', []);
      if (oldData.length > 0) {
        data = oldData.map(old => ({
          ...old,
          produit: old.commentaire || 'Produit Inconnu',
          numeroLot: 'N/A',
          dlc: 'N/A'
        }));
        setStoredData('crousty_tracabilite_v2', data);
      }
    }
    setEntries(data);
  }, []);

  const handleScan = (decodedText: string) => {
    // Attempt standard barcode parse: 
    // Typically, standard scanning apps or inventory labels might just emit a string
    // GS1 formats are complex, doing a basic set for demonstration.
    // Let's assume the user scans a label that has properties, or just sets it as 'numeroLot'.

    let decoded = decodedText.trim();
    
    // Very basic json parsing heuristic
    if (decoded.startsWith('{') && decoded.endsWith('}')) {
      try {
        const data = JSON.parse(decoded);
        if (data.produit) setProduit(data.produit);
        if (data.lot) setNumeroLot(data.lot);
        if (data.dlc) setDlc(data.dlc);
        return;
      } catch (e) {
        // ignore JSON parse error, fallback
      }
    }

    // fallback: just put the whole string in numeroLot if it looks like an identifier.
    // Or if it contains 'http', it might be a link, so we store it in commentaire.
    if (decoded.startsWith('http')) {
      setCommentaire(`Lien scanné: ${decoded}`);
    } else {
      setNumeroLot(decoded);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoDataUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = async () => {
    if (!produit || !numeroLot || !dlc) {
      setError('Veuillez remplir les champs obligatoires (Produit, Lot, DLC)');
      return;
    }
    
    if (!photoDataUrl) {
      setError('Veuillez prendre une photo du produit ou de l\'étiquette');
      return;
    }

    const photoId = `trac_photo_${Date.now()}`;
    await savePhoto(photoId, photoDataUrl);
    
    const mobileWorker = localStorage.getItem('crousty_mobile_worker');
    const uName = currentUser?.name || mobileWorker || 'Inconnu';
    const newEntry: TracabiliteEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      produit,
      numeroLot,
      dlc,
      photoId,
      commentaire,
      userId: currentUser?.id || '0',
      userName: uName,
      signature: createSignature(currentUser || null)
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setStoredData('crousty_tracabilite_v2', updated);
    
    setProduit('');
    setNumeroLot('');
    setDlc('');
    setCommentaire('');
    setPhotoDataUrl(null);
    setError('');
  };

  const confirmDelete = async (id: string) => {
    const updated = entries.map(e => e.id === id ? { ...e, supprime: true } : e);
    setEntries(updated);
    setStoredData('crousty_tracabilite_v2', updated);
    setDeleteId(null);
    window.dispatchEvent(new Event('crousty_data_changed'));
  };

  const startEdit = (entry: TracabiliteEntry) => {
    setEditId(entry.id);
    setEditData({ ...entry });
    setEditMotif('');
  };

  const handleEditSave = () => {
    if (!editMotif.trim()) { alert("Le motif de modification est obligatoire."); return; }
    if (!editData || !currentUser) return;
    
    if (!editData.produit || !editData.numeroLot || !editData.dlc) {
      alert("Produit, Lot, et DLC sont obligatoires.");
      return;
    }

    const updated = entries.map(e => e.id === editId ? {
      ...editData,
      signature: updateSignature(editData.signature, currentUser, editMotif)
    } : e);
    
    setEntries(updated);
    setStoredData('crousty_tracabilite_v2', updated);
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <QRScanner 
        isOpen={isQRScannerOpen} 
        onClose={() => setIsQRScannerOpen(false)} 
        onScan={handleScan} 
      />
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-black text-crousty-dark">Nouvelle Ouverture</h2>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold border border-red-100">{error}</div>}

        <div className="space-y-4">
          <div>
            <Label>Produit ouvert *</Label>
            <Input 
              value={produit} 
              onChange={(e: any) => setProduit(e.target.value)}
              placeholder="Ex: Pot de Nutella, Sceau Mayo..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Numéro de Lot *</Label>
              <div className="flex gap-2">
                <Input 
                  value={numeroLot} 
                  onChange={(e: any) => setNumeroLot(e.target.value)}
                  placeholder="Ex: L12345"
                />
                <button 
                  onClick={() => setIsQRScannerOpen(true)}
                  className="bg-purple-100 text-crousty-purple border border-purple-200 hover:bg-crousty-purple hover:text-white transition-colors rounded-full w-[52px] h-[52px] shrink-0 flex items-center justify-center"
                  title="Scanner"
                >
                  <ScanBarcode size={24} />
                </button>
              </div>
            </div>
            <div>
              <Label>DLC / DDM *</Label>
              <Input 
                type="date"
                value={dlc} 
                onChange={(e: any) => setDlc(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Commentaire (optionnel)</Label>
            <Input 
              value={commentaire} 
              onChange={(e: any) => setCommentaire(e.target.value)}
              placeholder="Ex: Utilisation pour la sauce blanche..."
            />
          </div>

          <div className="pt-2">
            <Label className="mb-2 block">Preuve d'ouverture (Photo requise) *</Label>
            {!photoDataUrl ? (
              <div className="relative">
                <input 
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapture}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button variant="outline" className="w-full h-16 flex items-center justify-center gap-2 text-lg border-dashed bg-gray-50 hover:bg-crousty-pink/5 border-gray-300 hover:border-crousty-purple">
                  <Camera size={24} className="text-gray-400" /> <span className="text-gray-500 font-bold text-sm">Prendre la photo d'ouverture</span>
                </Button>
              </div>
            ) : (
               <div className="relative rounded-xl overflow-hidden border border-gray-200">
                 <img src={photoDataUrl} alt="Aperçu" className="w-full h-48 object-cover" />
                 <button onClick={() => setPhotoDataUrl(null)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                   <Trash2 size={16} />
                 </button>
               </div>
            )}
            <p className="text-xs text-gray-400 text-center mt-2 font-bold">L'heure et la date d'ouverture seront enregistrées automatiquement.</p>
          </div>
          
          <Button onClick={handleManualSubmit} className="w-full py-4 text-base shadow-md mt-2">
            <Check size={20} className="mr-2" /> Valider l'ouverture
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-500 px-2">HISTORIQUE DES OUVERTURES</h3>
        {entries.filter(e => !e.supprime).map(e => (
          <TracabiliteItem 
            key={e.id} 
            e={e} 
            deleteId={deleteId} 
            setDeleteId={setDeleteId} 
            confirmDelete={confirmDelete} 
          />
        ))}
        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-400">Aucun produit scanné</div>
        )}
      </div>
    </div>
  );
}

const TracabiliteItem = ({ e, deleteId, setDeleteId, confirmDelete, editId, setEditId, editData, setEditData, editMotif, setEditMotif, startEdit, handleEditSave }: any) => {
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    getPhoto(e.photoId).then(data => {
      if (data) setPhoto(data);
    });
  }, [e.photoId]);

  return (
    <Card className="p-4 relative">
       {editId === e.id && editData ? (
         <div className="space-y-4 relative z-10 w-full">
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
               <Label className="text-orange-800 font-bold">⚠️ Motif de modification (obligatoire)</Label>
               <Input value={editMotif} onChange={ev => setEditMotif(ev.target.value)} placeholder="Ex: Erreur de frappe..." className="mt-1" />
            </div>
            <div>
               <Label>Produit *</Label>
               <Input value={editData.produit} onChange={ev => setEditData({...editData, produit: ev.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div>
                  <Label>Lot *</Label>
                  <Input value={editData.numeroLot} onChange={ev => setEditData({...editData, numeroLot: ev.target.value})} />
               </div>
               <div>
                  <Label>DLC *</Label>
                  <Input type="date" value={editData.dlc} onChange={ev => setEditData({...editData, dlc: ev.target.value})} />
               </div>
            </div>
            <div>
               <Label>Commentaire</Label>
               <Input value={editData.commentaire || ''} onChange={ev => setEditData({...editData, commentaire: ev.target.value})} />
            </div>
            <div className="flex gap-2 justify-end mt-4">
               <Button variant="secondary" onClick={() => setEditId(null)}>Annuler</Button>
               <Button onClick={handleEditSave}>💾 Enregistrer</Button>
            </div>
         </div>
       ) : (
        <>
       {deleteId === e.id ? (
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-50 p-1 rounded-lg z-10">
          <span className="text-xs text-red-600 font-bold px-1">Sûr ?</span>
          <button onClick={() => confirmDelete(e.id)} className="p-1 text-red-600 hover:text-red-800"><Check size={16}/></button>
          <button onClick={() => setDeleteId(null)} className="p-1 text-gray-500 hover:text-gray-700"><X size={16}/></button>
        </div>
      ) : (
        <div className="absolute top-2 right-2 z-10">
          <SaisieActions 
             saisie={{...e, responsable: e.userName}}
             onEdit={() => startEdit(e)}
             onDelete={() => setDeleteId(e.id)}
          />
        </div>
      )}

      <div className="flex gap-4">
        {photo ? (
          <img src={photo} alt="Photo du produit" className="w-24 h-24 mt-1 object-cover rounded-xl border border-gray-200" />
        ) : (
          <div className="w-24 h-24 mt-1 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300">
            <ImageIcon size={32} />
          </div>
        )}
        <div className="flex-1 min-w-0 pr-16 border-l border-gray-100 pl-4">
          <div className="font-bold text-crousty-purple bg-crousty-purple/10 inline-block px-2 py-1 rounded-lg text-xs mb-2">
            Ouvert le {format(new Date(e.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
          </div>
          
          <h4 className="font-black text-gray-800 text-lg leading-tight mb-1 truncate">{e.produit}</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
            <div className="text-gray-500">Lot: <span className="font-bold text-gray-700">{e.numeroLot}</span></div>
            <div className="text-gray-500">DLC: <span className="font-bold text-crousty-purple">{e.dlc !== 'N/A' ? new Date(e.dlc).toLocaleDateString() : 'N/A'}</span></div>
          </div>
          
          {e.commentaire && (
            <div className="bg-gray-50 p-2 rounded-lg text-gray-600 italic text-xs mb-2 truncate">"{e.commentaire}"</div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2 flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center font-bold text-[8px] text-gray-500 uppercase">{e.userName.substring(0, 2)}</div> {e.userName}
            </div>
            {e.signature?.dateModification && (
              <p className="text-[10px] text-orange-500 mt-2 font-bold select-none border-t border-gray-100 pt-2 text-right">
                Modifié par {e.signature.modifiePar} (Vu)
              </p>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </Card>
  );
};

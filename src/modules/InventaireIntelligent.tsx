import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '../components/ui/LightUI';
import { getStoredData } from '../lib/db';
import { useInventaire } from '../providers/InventaireProvider';
import { Brain, TrendingUp, AlertTriangle, ArrowRight, Package, TrendingDown, Clock, Search, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { InventoryProduct } from '../types';
import { createPortal } from 'react-dom';

interface InvItems {
  [category: string]: {
    [item: string]: { units: string, cartons: string, na: boolean }
  }
}

export default function InventaireIntelligent() {
  const { products } = useInventaire();
  const [inventories, setInventories] = useState<any[]>([]);
  const [receptions, setReceptions] = useState<any[]>([]);
  const [compareCount, setCompareCount] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductStat, setSelectedProductStat] = useState<any | null>(null);

  useEffect(() => {
    const inv = getStoredData<any[]>('crousty_inventory', []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const rec = getStoredData<any[]>('crousty_receptions_v3', []).filter((r: any) => !r.supprime).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setInventories(inv);
    setReceptions(rec);
  }, []);

  const analysis = useMemo(() => {
    if (inventories.length < 2) return null;
    
    // We only take the last N inventories, but they are sorted by newest first
    // So if compareCount is 2, we take inventories[0] (newest) and inventories[1] (older)
    const targetCount = Math.min(compareCount, inventories.length);
    const selectedInventories = inventories.slice(0, targetCount);
    
    const newest = selectedInventories[0];
    const oldest = selectedInventories[selectedInventories.length - 1];

    const dNewest = new Date(newest.date).getTime();
    const dOldest = new Date(oldest.date).getTime();
    const daysDiff = Math.max(1, differenceInDays(dNewest, dOldest)); // avoid divide by 0
    
    // Find all deliveries between oldest and newest
    const relevantDeliveries = receptions.filter(r => {
      const rd = new Date(r.date).getTime();
      return rd >= dOldest && rd <= dNewest;
    });

    const calculateTotalUnits = (cat: string, name: string, items: InvItems) => {
      const detail = items[cat]?.[name];
      if (!detail || detail.na) return 0;
      return parseInt(detail.units || '0') + (parseInt(detail.cartons || '0') * 5);
    };

    const getDeliveredUnits = (prodName: string) => {
      let total = 0;
      relevantDeliveries.forEach(rec => {
        rec.lignes?.forEach((l: any) => {
          if (l.produit === prodName) {
            const num = parseInt(l.quantite);
            if (!isNaN(num)) {
               // Assuming delivery is in units. If they write "2 cartons", parseInt("2 cartons") = 2. 
               // So if they mean cartons it might be undercounted. We will try to parse "carton".
               const isCarton = l.quantite.toLowerCase().includes('carton') || l.quantite.toLowerCase().includes('colis');
               total += isCarton ? num * 5 : num;
            }
          }
        });
      });
      return total;
    };

    const results = [];

    for (const p of products) {
       const stockOlder = calculateTotalUnits(p.category, p.name, oldest.items);
       const stockNewer = calculateTotalUnits(p.category, p.name, newest.items);
       const delivered = getDeliveredUnits(p.name);
       
       // S_old + D - S_new = Consumption
       const consumption = stockOlder + delivered - stockNewer;
       
       // Average per day
       const avgPerDay = consumption > 0 ? consumption / daysDiff : 0;
       
       // Trend logic (we can look at intermediate inventories if compareCount > 2)
       // Let's do simple risk
       const daysUntilEmpty = avgPerDay > 0 ? stockNewer / avgPerDay : 999;
       
       const isRisk = daysUntilEmpty <= 3; // risk if empty in <= 3 days
       const isWait = daysUntilEmpty <= 7;
       
       if (stockOlder > 0 || stockNewer > 0 || delivered > 0 || consumption !== 0) {
         results.push({
           product: p,
           stockOlder,
           stockNewer,
           delivered,
           consumption,
           avgPerDay,
           daysUntilEmpty,
           isRisk
         });
       }
    }
    
    results.sort((a, b) => a.daysUntilEmpty - b.daysUntilEmpty);

    return {
       dNewest, dOldest, daysDiff,
       stats: results
    };
  }, [inventories, receptions, compareCount, products]);

  if (inventories.length < 2) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold bg-white rounded-[2rem] border border-gray-100 mt-8 shadow-sm">
        Pas assez d'inventaires enregistrés pour l'analyse intelligente. (Minimum 2 nécessaires).
      </div>
    );
  }

  const filteredStats = analysis?.stats.filter(s => s.product.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="space-y-6 pb-20 pt-8 animate-in fade-in">
      <div className="flex items-center gap-3 px-2">
        <Brain className="text-crousty-purple" size={32} />
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">A.I. Manager</h2>
          <p className="text-sm font-bold text-gray-500">Inventaire prévisionnel et usages</p>
        </div>
      </div>

      <Card className="bg-crousty-purple text-white p-6 rounded-[2rem]">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
               <h3 className="font-black text-xl mb-1">Analyse des consommations</h3>
               <p className="text-purple-200 text-sm font-medium">Comparaison et prévisions de ruptures.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20">
               <span className="text-sm font-bold pl-2">Comparer :</span>
               {[2, 3, 4, 5].map(n => (
                 <button 
                   key={n}
                   onClick={() => setCompareCount(n)}
                   disabled={inventories.length < n}
                   className={`w-10 h-10 rounded-lg font-black transition-colors ${compareCount === n ? 'bg-white text-crousty-purple shadow-md' : 'text-white hover:bg-white/20'} disabled:opacity-30 disabled:cursor-not-allowed`}
                 >
                   {n}
                 </button>
               ))}
               <span className="text-sm font-bold pr-2 ml-1 hidden sm:inline">Inv.</span>
            </div>
         </div>
      </Card>

      {analysis && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between text-sm font-bold text-gray-600 shadow-sm flex-1">
               <span>Période analysée : <strong className="text-crousty-purple">{analysis.daysDiff} jours</strong></span>
               <span className="text-xs text-gray-400">({format(analysis.dOldest, 'dd MMM', { locale: fr })} <ArrowRight size={12} className="inline mx-1"/> {format(analysis.dNewest, 'dd MMM', { locale: fr })})</span>
            </div>
            <div className="relative w-full sm:w-64 shrink-0">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input
                 type="text"
                 placeholder="Chercher un produit..."
                 className="w-full pl-9 pr-4 py-3 sm:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-crousty-purple/50 outline-none text-sm font-bold transition-all shadow-sm"
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
               />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {filteredStats.map((s, idx) => {
              const p = s.product;
              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedProductStat(s)}
                  className={`p-2 rounded-xl border transition-transform cursor-pointer hover:scale-[1.02] bg-white relative overflow-hidden ${s.isRisk ? 'border-red-300 shadow-sm shadow-red-100' : 'border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-crousty-purple/30'}`}
                >
                  {s.isRisk && (
                    <div className="absolute top-0 right-0 py-0.5 flex items-center justify-center w-24 bg-red-500 text-white text-[8px] uppercase font-black tracking-widest rotate-45 translate-x-8 translate-y-2 shadow-md z-10">
                       URGENCE
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${s.isRisk ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                           <Package size={14} />
                        </div>
                        <div className="truncate">
                           <h4 className="font-black text-sm text-gray-800 truncate leading-none mb-1">{p.name}</h4>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                               <span>P: {s.stockOlder}</span>
                               <span>A: <span className="text-crousty-purple">{s.stockNewer}</span></span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        {s.daysUntilEmpty > 90 ? (
                           <span className="text-emerald-500 font-black text-[10px] uppercase tracking-wider">Sécurisé</span>
                        ) : (
                           <div className={`font-black uppercase text-[10px] px-2 py-1 rounded border ${s.isRisk ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                              {s.daysUntilEmpty.toFixed(0)} j
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              );
            })}
            
            {filteredStats.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-500 font-bold bg-white rounded-2xl border border-gray-100 shadow-sm">
                Aucun produit trouvé pour "{searchQuery}".
              </div>
            )}
          </div>
        </>
      )}

      {selectedProductStat && createPortal(
        <div className="fixed inset-0 z-[6000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
           <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl relative">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${selectedProductStat.isRisk ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <Package size={24} className={selectedProductStat.isRisk ? 'text-red-500' : 'text-gray-400'} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedProductStat.product.name}</h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-full">{selectedProductStat.product.category}</span>
                   </div>
                </div>
                <button onClick={() => setSelectedProductStat(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                  <X size={20}/>
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6 bg-gray-50/50">
                {selectedProductStat.isRisk && (
                   <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                      <div>
                         <div className="text-sm font-black text-red-800">Risque de rupture imminent</div>
                         <div className="text-xs text-red-600 font-medium">Ce produit sera épuisé dans environ {selectedProductStat.daysUntilEmpty.toFixed(0)} jours au rythme actuel.</div>
                      </div>
                   </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                      <div className="text-[10px] text-orange-600/80 uppercase font-bold tracking-widest mb-1">Stock Précédent</div>
                      <div className="font-black text-orange-900 text-2xl">{selectedProductStat.stockOlder} <span className="text-sm font-medium text-orange-700/50">u.</span></div>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                      <div className="text-[10px] text-blue-600/80 uppercase font-bold tracking-widest mb-1">+ Livraisons</div>
                      <div className="font-black text-blue-900 text-2xl">{selectedProductStat.delivered} <span className="text-sm font-medium text-blue-700/50">u.</span></div>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                         <TrendingUp size={48} />
                      </div>
                      <div className="text-[10px] text-emerald-600/80 uppercase font-bold tracking-widest mb-1 relative z-10">- Stock Actuel</div>
                      <div className="font-black text-emerald-900 text-2xl relative z-10">{selectedProductStat.stockNewer} <span className="text-sm font-medium text-emerald-700/50">u.</span></div>
                   </div>
                   <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm">
                      <div className="text-[10px] text-indigo-600/80 uppercase font-bold tracking-widest mb-1">= Total Consommé</div>
                      <div className="font-black text-indigo-900 text-2xl">{selectedProductStat.consumption} <span className="text-sm font-medium text-indigo-700/50">u.</span></div>
                   </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                          {selectedProductStat.consumption > 0 ? <TrendingDown size={18} className="text-crousty-purple" /> : <TrendingUp size={18} className="text-gray-400" />}
                        </div>
                        <div>
                           <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Conso Moyenne</div>
                           <div className="font-black text-gray-800 text-lg">{selectedProductStat.avgPerDay.toFixed(1)} <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">u. / jour</span></div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="text-[11px] text-gray-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                        <Clock size={14} className="text-gray-400"/> Temps avant rupture
                     </div>
                     {selectedProductStat.daysUntilEmpty > 90 ? (
                        <span className="text-emerald-500 font-black text-sm uppercase tracking-wider">Sécurisé</span>
                     ) : (
                        <span className={`font-black tracking-wider uppercase text-sm px-3 py-1 rounded-xl shadow-sm border ${selectedProductStat.isRisk ? 'bg-red-500 text-white border-red-600' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                           ~ {selectedProductStat.daysUntilEmpty.toFixed(0)} jours
                        </span>
                     )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                 <Button className="w-full h-12 rounded-xl text-sm font-black" onClick={() => setSelectedProductStat(null)}>Fermer</Button>
              </div>
           </Card>
        </div>,
        document.body
      )}

    </div>
  );
}

'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import { useAdminList } from '@/hooks/useAdminList';
import { readAdminResponse } from '@/lib/admin-api';

interface Piece { id: number; name: string; catalog_code: string; stock: number; is_active: boolean }

export default function PurchaseAvailabilityPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pendingAll, setPendingAll] = useState<boolean | null>(null);
  const { items, loading, error, setError, refresh } = useAdminList<Piece>('/api/admin/products', 'products', { search: search.trim() });
  const visible = items.filter(piece => filter === 'all' || (filter === 'sold_out' ? piece.stock <= 0 : filter === 'enabled' ? piece.is_active : !piece.is_active));
  const button = 'rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/10';
  async function apply(active: boolean, ids?: number[]) {
    setBusy(true); setError(null); setMessage('');
    try {
      const token = localStorage.getItem('filatelia_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/products/purchase-availability`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ scope: ids ? 'selected' : 'all', is_active: active, ...(ids ? { ids } : {}) }),
      });
      const result = await readAdminResponse(response);
      setMessage(result.message); setSelected([]); setPendingAll(null); await refresh();
    } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo actualizar la disponibilidad.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5 pb-10 text-white">
    <div><h1 className="text-2xl font-bold">Disponibilidad de compra</h1><p className="mt-2 text-sm text-slate-300">Las piezas deshabilitadas y agotadas permanecen en el catálogo. Habilitar una pieza no modifica sus existencias.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-950/50 p-4 text-red-200">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-950/50 p-4 text-emerald-200">{message}</p>}
    <div className="flex flex-wrap gap-3">
      <button className={button} disabled={busy || !selected.length} onClick={() => apply(true, selected)}>Habilitar seleccionadas ({selected.length})</button>
      <button className={button} disabled={busy || !selected.length} onClick={() => apply(false, selected)}>Deshabilitar seleccionadas</button>
      <button className={button} disabled={busy} onClick={() => setPendingAll(true)}>Habilitar todas</button>
      <button className={button} disabled={busy} onClick={() => setPendingAll(false)}>Deshabilitar todas</button>
    </div>
    {pendingAll !== null && <div role="alert" className="space-y-3 rounded-xl border border-amber-300/40 p-4"><p>Se {pendingAll ? 'habilitará' : 'deshabilitará'} la compra de todas las piezas del sistema, incluso las que no aparecen con el filtro actual.</p><div className="flex gap-3"><button className={button} disabled={busy} onClick={() => apply(pendingAll)}>Confirmar</button><button className={button} disabled={busy} onClick={() => setPendingAll(null)}>Cancelar</button></div></div>}
    <div className="flex flex-wrap gap-3"><input aria-label="Buscar piezas" placeholder="Nombre o código de catálogo" value={search} onChange={event => setSearch(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#102542] px-4 py-3" /><select aria-label="Filtrar disponibilidad" value={filter} onChange={event => setFilter(event.target.value)} className="rounded-xl border border-white/15 bg-[#102542] px-3 py-3"><option value="all">Todos los estados</option><option value="enabled">Compra habilitada</option><option value="disabled">Compra deshabilitada</option><option value="sold_out">Agotados</option></select></div>
    <div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/5"><tr><th className="p-4"><input type="checkbox" aria-label="Seleccionar piezas visibles" disabled={busy || !visible.length} checked={visible.length > 0 && visible.every(piece => selected.includes(piece.id))} onChange={event => setSelected(event.target.checked ? [...new Set([...selected, ...visible.map(piece => piece.id)])] : selected.filter(id => !visible.some(piece => piece.id === id)))} /></th><th className="p-4">Pieza</th><th className="p-4">Existencias</th><th className="p-4">Estado</th><th className="p-4">Compra</th></tr></thead><tbody>{visible.map(piece => <tr key={piece.id} className="border-t border-white/10"><td className="p-4"><input aria-label={`Seleccionar ${piece.name}`} type="checkbox" disabled={busy} checked={selected.includes(piece.id)} onChange={event => setSelected(event.target.checked ? [...selected, piece.id] : selected.filter(id => id !== piece.id))} /></td><td className="p-4"><p className="font-semibold">{piece.name}</p><p className="mt-1 text-xs text-slate-400">{piece.catalog_code}</p></td><td className="p-4">{piece.stock}</td><td className="p-4"><span className={piece.stock <= 0 ? 'text-red-300' : piece.is_active ? 'text-emerald-300' : 'text-amber-300'}>{piece.stock <= 0 ? 'Agotado' : piece.is_active ? 'Disponible' : 'Compra deshabilitada'}</span></td><td className="p-4"><button className={button} disabled={busy} onClick={() => apply(!piece.is_active, [piece.id])}>{piece.is_active ? 'Deshabilitar' : 'Habilitar'}</button></td></tr>)}</tbody></table>{loading && <p role="status" className="p-4">Cargando piezas…</p>}{!loading && !visible.length && <p className="p-4 text-slate-400">No hay piezas para estos filtros.</p>}</div>
  </div>;
}

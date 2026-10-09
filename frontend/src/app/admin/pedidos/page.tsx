'use client';
import { API_BASE_URL } from '@/config/api';
import { useAdminList } from '@/hooks/useAdminList';
import { readAdminResponse } from '@/lib/admin-api';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  X,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  ScrollText,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { items: orders, setItems: setOrders, loading, error, setError, refresh: fetchOrders } = useAdminList<any>('/api/admin/orders', 'orders', { status: statusFilter, search: search.trim() });
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('search') || '');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) await readAdminResponse(res);
      if (res.ok) {
        const json = await res.json();
        // Actualizar en el estado local
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...json.order } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, ...json.order }));
        }
        await fetchOrders();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el pedido.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300/90 border border-white/10">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Entregado Oficial
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-300/90 border border-white/10">
            <Truck className="w-3 h-3 text-blue-400" /> Valija Postal en Ruta
          </span>
        );
      case 'PACKED_GLASSINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.06] text-amber-200/90 border border-white/10">
            <Package className="w-3 h-3 text-amber-300/80" /> Embalado en Glassine
          </span>
        );
      case 'VAULT_VERIFIED':
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-300/90 border border-white/10">
            <ShieldCheck className="w-3 h-3 text-purple-400" /> Bóveda Verificada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] text-slate-300 border border-white/10">
            <Clock className="w-3 h-3 text-slate-400" /> Recibido
          </span>
        );
    }
  };

  const statusOptions = [
    { value: 'ALL', label: 'Todas las Órdenes' },
    { value: 'VAULT_VERIFIED', label: 'Bóveda Verificada' },
    { value: 'PACKED_GLASSINE', label: 'Embalaje Glassine' },
    { value: 'SHIPPED', label: 'En Tránsito Postal' },
    { value: 'DELIVERED', label: 'Entregadas' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-wide flex items-center gap-2">
            <span>Bóveda & Gestión de Pedidos</span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-white/[0.06] text-amber-200/90 border border-white/10">
              {orders.length} pedidos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recepción, peritaje, embalaje glassine y despacho de material numismático.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#102542] hover:bg-[#102542] border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#102542]/90 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por orden, cliente, correo o guía..."
            aria-label="Buscar pedidos por orden, cliente, correo o guía"
            className="w-full pl-10 pr-4 py-2 bg-[#1B4785]/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                  : 'bg-[#1B4785] text-slate-300 hover:text-white hover:bg-[#102542] border border-slate-700/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#102542]/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs">Cargando registros de bóveda...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron órdenes registradas</p>
            <p className="text-xs text-slate-500 mt-1">Intenta con otro término de búsqueda o filtro</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-[#1B4785] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Código Orden</th>
                  <th className="py-3.5 px-4 font-semibold">Coleccionista</th>
                  <th className="py-3.5 px-4 font-semibold">Piezas</th>
                  <th className="py-3.5 px-4 font-semibold">Destino</th>
                  <th className="py-3.5 px-4 font-semibold">Monto Total</th>
                  <th className="py-3.5 px-4 font-semibold">Estado Actual</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#102542]/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="font-mono font-semibold text-amber-200/90 hover:underline cursor-pointer flex items-center gap-1.5 text-left"
                      >
                        <span>{order.order_number}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </button>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        {order.tracking_code || 'Sin guía postal'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{order.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{order.customer_email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">
                        {order.items ? order.items.length : 1} ítems
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{order.department || order.city || 'La Paz'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white font-serif text-sm">
                      Bs. {Number(order.total_amount).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Status Change Selector */}
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="bg-[#1B4785] text-[11px] font-medium text-slate-200 border border-white/10 rounded-lg px-2.5 py-1 focus:outline-none focus:border-white/20 cursor-pointer disabled:opacity-50"
                        >
                          <option value="VAULT_VERIFIED">Verificado en Bóveda</option>
                          <option value="PACKED_GLASSINE">Sobre Glassine</option>
                          <option value="SHIPPED">Despachado (En Ruta)</option>
                          <option value="DELIVERED">Entregado</option>
                          <option value="CANCELLED">Cancelar</option>
                        </select>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-[#1B4785] hover:bg-[#102542] text-slate-300 hover:text-white border border-slate-700"
                          title="Ver detalle completo de orden"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#102542] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#102542] z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-serif">
                    Expediente de Pedido: {selectedOrder.order_number}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acta de resguardo y timbrado oficial
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl bg-[#102542] text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Customer & Shipping Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#1B4785]/60 border border-slate-800">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-amber-200/90 block mb-1">
                    Coleccionista Destinatario
                  </span>
                  <div className="font-bold text-white text-sm">
                    {selectedOrder.customer_name}
                  </div>
                  <div className="text-slate-300">{selectedOrder.customer_email}</div>
                  <div className="text-slate-400 mt-1">
                    {selectedOrder.customer_phone || 'Sin teléfono registrado'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-amber-200/90 block mb-1">
                    Destino de Custodia Postal
                  </span>
                  <div className="text-slate-200">{selectedOrder.shipping_address}</div>
                  <div className="text-slate-400 mt-1">
                    {selectedOrder.city}, {selectedOrder.department} — Bolivia
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-amber-200/90">
                    Guía Postal: {selectedOrder.tracking_code || 'Por asignar en despacho'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3 flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-amber-200/90" />
                  <span>Piezas Filatélicas en Custodia</span>
                </h4>

                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#1B4785] text-[10px] uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Ejemplar</th>
                        <th className="p-2.5 text-center">Cantidad</th>
                        <th className="p-2.5 text-right">Precio Unit.</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(selectedOrder.items || []).map((item: any) => (
                        <tr key={item.id} className="hover:bg-[#102542]/30">
                          <td className="p-2.5 font-semibold text-white">
                            {item.product_name}
                            {item.product?.catalog_code && (
                              <span className="block text-[10px] text-slate-400 font-mono">
                                Catálogo: {item.product.catalog_code}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            {item.quantity}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            Bs. {Number(item.unit_price).toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-semibold text-amber-200/90 font-mono">
                            Bs. {Number(item.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#1B4785]/80 border-t border-slate-700 font-bold text-white">
                      <tr>
                        <td colSpan={3} className="p-3 text-right uppercase text-[11px]">
                          Total Liquidado:
                        </td>
                        <td className="p-3 text-right text-sm text-amber-200/90 font-serif font-bold">
                          Bs. {Number(selectedOrder.total_amount).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Special Notes */}
              {selectedOrder.special_notes && (
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-amber-200/90 text-xs">
                  <span className="font-bold block mb-1">Notas Especiales de Manejo:</span>
                  <p>{selectedOrder.special_notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-[#0D1E36]">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#1B4785] text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

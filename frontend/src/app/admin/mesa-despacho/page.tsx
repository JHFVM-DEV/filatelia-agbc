'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Box,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Truck,
  Send,
  User,
  MapPin,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface QueueOrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

interface QueueOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  city: string;
  department: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: QueueOrderItem[];
}

export default function AdminMesaDespachoPage() {
  const { currentUser, openLoginModal } = useStore();
  const [queueOrders, setQueueOrders] = useState<QueueOrder[]>([]);
  const [dispatchedToday, setDispatchedToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dispatch Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<QueueOrder | null>(null);
  const [carrier, setCarrier] = useState('Correos de Bolivia - Valija Postal');
  const [trackingCode, setTrackingCode] = useState('');
  const [dispatching, setDispatching] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/dispatch-queue`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        setErrorMessage('Credenciales expiradas. Por favor identifíquese nuevamente.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Error al cargar la mesa de operaciones');

      const data = await res.json();
      setQueueOrders(data.queue_orders || []);
      setDispatchedToday(data.dispatched_today || 0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleMarkGlassine = async (orderId: number, orderNumber: string) => {
    try {
      const token = localStorage.getItem('filatelia_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/dispatch-queue/${orderId}/glassine`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al empacar');

      setSuccessMessage(`La orden ${orderNumber} fue empacada en estuche libre de ácido con precinto filatélico.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchQueue();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar');
    }
  };

  const handleOpenDispatch = (order: QueueOrder) => {
    setSelectedOrder(order);
    const randomCode = `VAL-${order.department ? order.department.substring(0, 3).toUpperCase() : 'BO'}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingCode(randomCode);
    setShowDispatchModal(true);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setDispatching(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('filatelia_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/dispatch-queue/confirm`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          carrier,
          tracking_code: trackingCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al despachar orden');

      setSuccessMessage(`Orden ${selectedOrder.order_number} despachada exitosamente en valija postal.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowDispatchModal(false);
      fetchQueue();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al generar valija');
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#001A38]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Bóveda & Logística: Mesa de Operaciones de Despacho
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Empaque libre de ácido (Glassine), sellado de valijas postales y precintado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Despachados hoy: <strong>{dispatchedToday} valijas</strong></span>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Actualizar cola"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold"
          >
            Identificarse
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Orders in Preparation Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Órdenes en Proceso de Custodia y Empaque ({queueOrders.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="bg-[#001A38] border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-400 inline-block mr-2" />
            Consultando órdenes de la mesa postal...
          </div>
        ) : queueOrders.length === 0 ? (
          <div className="bg-[#001A38] border border-slate-800 p-12 rounded-2xl text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">Mesa de Despacho al Día</p>
            <p className="text-xs text-slate-500 mt-1">No hay órdenes pendientes de empaque o salida postal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queueOrders.map((order) => {
              const isPacked = order.status === 'PACKED_GLASSINE';

              return (
                <div
                  key={order.id}
                  className={`bg-[#001A38] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    isPacked
                      ? 'border-emerald-500/40 shadow-emerald-950/20 shadow-lg'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="font-mono font-bold text-amber-300 text-sm">
                          {order.order_number}
                        </span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(order.created_at).toLocaleString('es-BO')}</span>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase border ${
                          isPacked
                            ? 'bg-emerald-500/10 text-emerald-300/90 border-white/10'
                            : 'bg-white/[0.06] text-amber-200/90 border-white/10'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isPacked ? 'Empaque Glassine Listo' : 'En Preparación'}</span>
                      </span>
                    </div>

                    {/* Customer & Destination */}
                    <div className="py-3 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-white font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{order.customer_name}</span>
                        <span className="text-slate-500 text-[11px]">({order.customer_email})</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Destino: {order.city} ({order.department})</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="bg-[#00142B] p-3 rounded-xl border border-slate-800/80 mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Piezas a Empacar ({order.items?.length || 0}):
                      </div>
                      <div className="space-y-1 text-xs">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span className="truncate pr-2">• {item.quantity}x {item.product_name}</span>
                            <span className="font-semibold text-amber-200/90 shrink-0">
                              Bs. {Number(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div className="text-sm font-serif font-bold text-amber-200/90">
                      Total: Bs. {Number(order.total_amount).toFixed(2)}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPacked ? (
                        <button
                          onClick={() => handleMarkGlassine(order.id, order.order_number)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002B5B] hover:bg-[#0A3B73] border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200/90" />
                          <span>Empacar Glassine</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenDispatch(order)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#001A38] text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Emitir Guía Postal</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Despachar Valija */}
      {showDispatchModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#001A38] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowDispatchModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Emisión Oficial de Valija Postal
                </h3>
                <p className="text-[11px] text-slate-400">
                  Orden: {selectedOrder.order_number} ({selectedOrder.customer_name})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmDispatch} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Operador Logístico / Servicio Postal
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#00142B] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Correos de Bolivia - Valija Postal">
                    Correos de Bolivia - Valija Postal Oficial
                  </option>
                  <option value="Correos de Bolivia Express (Prioritario)">
                    Correos de Bolivia Express (Prioritario Nacional)
                  </option>
                  <option value="Custodia de Bóveda / Entrega en Mano Directa">
                    Custodia de Bóveda / Entrega en Mano Directa
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Código de Guía de Transporte Oficial
                </label>
                <input
                  type="text"
                  required
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#00142B] border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-[11px] text-blue-300">
                Al confirmar, la orden cambiará automáticamente a estado <span className="font-bold text-white">DESPACHADA (SHIPPED)</span> y se registrará en el seguimiento de valijas postales.
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#002B5B] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={dispatching}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#001A38] font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
                >
                  {dispatching ? 'Despachando...' : 'Confirmar Salida Postal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function AdminDispatchPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/admin/shipments`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        setShipments(json.shipments || []);
      }
    } catch (err) {
      console.error('Error al cargar valijas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleUpdateStatus = async (shipmentId: number, status: string) => {
    try {
      setUpdatingId(shipmentId);
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/admin/shipments/${shipmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const json = await res.json();
        setShipments((prev) =>
          prev.map((s) => (s.id === shipmentId ? { ...s, ...json.shipment } : s))
        );
      }
    } catch (err) {
      console.error('Error al actualizar valija:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-wide flex items-center gap-2">
            <span>Valijas Postales & Despacho Soberano</span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-white/[0.06] text-amber-200/90 border border-white/10">
              {shipments.length} envíos
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Control de guías de encomienda postal, valijas con precinto de seguridad y entregas departamentales.
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#102542] hover:bg-[#102542] border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Actualizar Valijas</span>
        </button>
      </div>

      {/* Shipments Table */}
      <div className="bg-[#102542]/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs">Rastreando valijas en tránsito...</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No hay valijas postales activas en este momento</p>
            <p className="text-xs text-slate-500 mt-1">Las guías se generan automáticamente al marcar pedidos como "Despachado"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-[#1B4785] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Guía Postal de Rastreo</th>
                  <th className="py-3.5 px-4">Orden / Destinatario</th>
                  <th className="py-3.5 px-4">Destino Postal</th>
                  <th className="py-3.5 px-4">Transportadora Oficial</th>
                  <th className="py-3.5 px-4">Estado de Entrega</th>
                  <th className="py-3.5 px-4 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-[#102542]/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {shipment.tracking_number}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {shipment.order?.order_number || 'Pedido # ' + shipment.order_id}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {shipment.order?.customer_name || 'Coleccionista'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{shipment.order?.department || shipment.order?.city || 'Bolivia'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {shipment.carrier || 'Correos de Bolivia (Oficial)'}
                    </td>

                    <td className="py-3 px-4">
                      {shipment.status === 'DELIVERED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300/90 border border-white/10">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Entregado en Destino
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300/90 border border-white/10">
                          <Truck className="w-3 h-3 text-blue-400" /> Valija en Ruta
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {shipment.status !== 'DELIVERED' && (
                        <button
                          disabled={updatingId === shipment.id}
                          onClick={() => handleUpdateStatus(shipment.id, 'DELIVERED')}
                          className="px-3 py-1 rounded-lg bg-[#1B4785] hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Confirmar Entrega
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

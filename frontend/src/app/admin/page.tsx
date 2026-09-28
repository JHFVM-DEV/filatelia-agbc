'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  TrendingUp,
  Banknote,
  ShieldCheck,
  ShieldAlert,
  ShoppingBag,
  Package,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ChevronRight,
  Coins,
} from 'lucide-react';

interface DashboardData {
  kpis: {
    total_revenue: number;
    total_orders: number;
    vault_valuation: number;
    total_pieces: number;
    total_stock_units: number;
    total_collectors: number;
    pending_packing: number;
    in_transit_shipments: number;
    critical_stock_count: number;
  };
  revenue_timeline: Array<{ month: string; short: string; total: number }>;
  department_distribution: Array<{ department: string; count: number }>;
  payment_methods: Record<string, number>;
  recent_orders: Array<any>;
  critical_products: Array<any>;
}

export default function AdminDashboardPage() {
  const { openLoginModal, currentUser } = useStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('No se encontró un token de sesión de bóveda activo. Por favor inicie sesión nuevamente.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        setErrorMessage('La sesión ha expirado o las credenciales no cuentan con autorización de bóveda. Por favor reautentíquese.');
        return;
      }

      if (res.ok) {
        const json = await res.json();
        setData(json);
        setErrorMessage(null);
      } else {
        setErrorMessage(`No se pudieron cargar las métricas desde el servidor postal (HTTP ${res.status}).`);
      }
    } catch (err) {
      setErrorMessage(`Error al conectar con la API de Filatelia (${API_BASE_URL}).`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300/90 border border-white/10">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Entregado
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300/90 border border-white/10">
            <Truck className="w-3 h-3 text-blue-400" /> En Tránsito
          </span>
        );
      case 'PACKED_GLASSINE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-amber-200/90 border border-white/10">
            <Package className="w-3 h-3 text-amber-300/80" /> Embalado
          </span>
        );
      case 'VAULT_VERIFIED':
      case 'PAYMENT_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300/90 border border-white/10">
            <ShieldCheck className="w-3 h-3 text-purple-400" /> Bóveda Verificada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-slate-300 border border-white/10">
            <Clock className="w-3 h-3 text-slate-400" /> En Proceso
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#001A38] rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-[#001A38] rounded-2xl border border-slate-800" />
          <div className="h-72 bg-[#001A38] rounded-2xl border border-slate-800" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_revenue: 0,
    total_orders: 0,
    vault_valuation: 0,
    total_pieces: 0,
    total_stock_units: 0,
    total_collectors: 0,
    pending_packing: 0,
    in_transit_shipments: 0,
    critical_stock_count: 0,
  };

  // Cálculo para gráfico
  const timeline = data?.revenue_timeline || [];
  const maxRevenue = Math.max(...timeline.map((t) => t.total), 1000);

  return (
    <div className="space-y-8 pb-12">
      {/* Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-wide flex items-center gap-2.5">
            <span>Despacho General & Bóveda Numismática</span>
            <span className="px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-white/[0.06] text-amber-200/90 border border-white/10">
              Oficial
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisión integral de recaudación postal, piezas históricas y despachos soberanos.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#001A38] hover:bg-[#002B5B] border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-200/90 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Actualizando...' : 'Actualizar Métricas'}</span>
        </button>
      </div>

      {/* Reauthentication Alert Banner if session is missing or expired */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm font-serif">
                Reautenticación Requerida en Bóveda
              </h3>
              <p className="text-xs text-slate-300">
                {errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#001A38] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
          >
            Iniciar Sesión de Personal
          </button>
        </div>
      )}

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recaudación Total */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001A38] to-[#002B5B]/80 border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-16 h-16 text-white" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Recaudación Bruta</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-serif tracking-wide">
            Bs. {kpis.total_revenue.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>+14.8%</span>
            <span className="text-slate-400 font-normal">respecto al periodo anterior</span>
          </div>
        </div>

        {/* KPI 2: Tasación de Bóveda */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001A38] to-[#002B5B]/80 border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Valoración de Bóveda</span>
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] text-amber-200/90 flex items-center justify-center border border-white/10">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-200/90 font-serif tracking-wide">
            Bs. {kpis.vault_valuation.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span className="text-white font-semibold">{kpis.total_stock_units} unidades</span>
            <span>físicas bajo custodia</span>
          </div>
        </div>

        {/* KPI 3: Órdenes de Colección */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001A38] to-[#002B5B]/80 border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Órdenes Totales</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-serif tracking-wide">
            {kpis.total_orders} pedidos
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1 font-medium">
            <span>{kpis.pending_packing} por preparar</span>
            <span className="text-slate-400 font-normal">en sobre glassine</span>
          </div>
        </div>

        {/* KPI 4: Alertas de Existencia Crítica */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001A38] to-[#002B5B]/80 border border-slate-700/80 shadow-lg relative overflow-hidden group hover:border-rose-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Stock Crítico (≤ 3)</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              kpis.critical_stock_count > 0
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-serif tracking-wide ${
            kpis.critical_stock_count > 0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {kpis.critical_stock_count} ejemplares
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 font-medium">
            <span>{kpis.total_pieces} títulos</span>
            <span className="text-slate-400 font-normal">catalogados en total</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Timeline + Recent Orders (Left 2 cols) & Department/Alerts (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart Section */}
          <div className="p-6 rounded-2xl bg-[#001A38]/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide font-serif">
                  Evolución Histórica de Recaudación (Últimos 6 Meses)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Ingresos certificados por adquisición de estampillas y material postal
                </p>
              </div>
              <span className="text-xs font-medium text-amber-200/80">Expresado en Bs.</span>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="h-56 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800/80">
              {timeline.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.total / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip value */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-amber-200 bg-[#001A38] px-2 py-0.5 rounded border border-white/10 pointer-events-none mb-1 shadow">
                      Bs. {Math.round(item.total).toLocaleString()}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-slate-800 rounded-t-lg relative overflow-hidden flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#002B5B] via-[#0A3B73] to-amber-300/80 transition-all duration-500 group-hover:brightness-110 shadow-lg"
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">
                      {item.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="p-6 rounded-2xl bg-[#001A38]/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide font-serif">
                  Órdenes Recientes de Coleccionistas
                </h2>
                <p className="text-[11px] text-slate-400">
                  Últimos requerimientos ingresados a bóveda para certificación y entrega
                </p>
              </div>

              <Link
                href="/admin/pedidos"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-200/90 hover:text-white transition-colors group"
              >
                <span>Ver todas</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-[#00244D]/50 border-y border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Código Orden</th>
                    <th className="py-2.5 px-3 font-semibold">Coleccionista</th>
                    <th className="py-2.5 px-3 font-semibold">Destino</th>
                    <th className="py-2.5 px-3 font-semibold">Monto</th>
                    <th className="py-2.5 px-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(data?.recent_orders || []).map((order: any) => (
                    <tr key={order.id} className="hover:bg-[#002B5B]/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-[140px]">
                          {order.customer_name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {order.customer_email}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-amber-400/80 shrink-0" />
                          <span>{order.department || order.city || 'La Paz'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        Bs. {Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          {/* Department Distribution */}
          <div className="p-6 rounded-2xl bg-[#001A38]/90 border border-slate-800 shadow-xl">
            <h2 className="text-sm font-bold text-white tracking-wide font-serif mb-1">
              Distribución por Departamento
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">
              Concentración geográfica de requerimientos filatélicos
            </p>

            <div className="space-y-3">
              {(data?.department_distribution || []).slice(0, 6).map((item, idx) => {
                const totalCount = (data?.department_distribution || []).reduce((acc, curr) => acc + curr.count, 0) || 1;
                const pct = Math.round((item.count / totalCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-300">{item.department}</span>
                      <span className="text-amber-200/90 font-medium">{item.count} pedidos ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-[#002B5B] via-[#0A3B73] to-amber-300/80 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Stock Alert Box */}
          <div className="p-6 rounded-2xl bg-[#001A38]/90 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-200/90" />
                <h2 className="text-sm font-bold text-white tracking-wide font-serif">
                  Sellos con Stock Crítico
                </h2>
              </div>
              <Link
                href="/admin/piezas"
                className="text-[11px] text-amber-200/90 hover:underline font-medium"
              >
                Ajustar Stock
              </Link>
            </div>

            <div className="space-y-3">
              {(data?.critical_products || []).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#00244D]/60 border border-slate-800"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-white truncate">
                      {product.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {product.catalog_code}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      product.stock === 0
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {product.stock === 0 ? 'AGOTADO' : `${product.stock} disponibles`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

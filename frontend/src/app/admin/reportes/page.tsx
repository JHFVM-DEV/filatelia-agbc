'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Tag,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface DeptBreakdown {
  department: string;
  orders_count: number;
  total_dept: number;
}

interface CatBreakdown {
  name: string;
  pieces_count: number;
  stock: number;
  valuation: number;
}

export default function AdminReportesPage() {
  const { currentUser, openLoginModal } = useStore();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{
    totalRevenue: number;
    totalOrders: number;
    deliveredOrders: number;
    avgTicket: number;
    vaultValuation: number;
    departmentBreakdown: DeptBreakdown[];
    categoryBreakdown: CatBreakdown[];
  }>({
    totalRevenue: 0,
    totalOrders: 0,
    deliveredOrders: 0,
    avgTicket: 0,
    vaultValuation: 0,
    departmentBreakdown: [],
    categoryBreakdown: [],
  });

  const fetchReports = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/reports`, {
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

      if (!res.ok) throw new Error('Error al cargar informes estadísticos');

      const data = await res.json();
      setReportData(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportSalesCSV = () => {
    const headers = ['Departamento,Cantidad de Órdenes,Recaudación Total BOB,Participación'];
    const total = reportData.totalRevenue || 1;
    const rows = reportData.departmentBreakdown.map((d) => {
      const pct = ((d.total_dept / total) * 100).toFixed(1);
      return `"${d.department || 'Nacional'}",${d.orders_count},${Number(d.total_dept).toFixed(2)},${pct}%`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Libro_Recaudacion_Departamental_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCategoriesCSV = () => {
    const headers = ['Categoría Temática,Piezas Catalogadas,Existencia en Bóveda,Tasación Total BOB'];
    const rows = reportData.categoryBreakdown.map((c) => {
      return `"${c.name}",${c.pieces_count},${c.stock},${Number(c.valuation).toFixed(2)}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Tasacion_Por_Categoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#102542]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Reportes & Auditoría: Informes Oficiales de Recaudación y Tasación
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Análisis económico, distribución departamental y valoración patrimonial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportSalesCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Libro Matriz</span>
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

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Recaudación Neta</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-200/90 mt-2">
            Bs. {Number(reportData.totalRevenue).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Órdenes confirmadas en plataforma</span>
        </div>

        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Volumen de Órdenes</span>
            <ShoppingBag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {reportData.totalOrders}{' '}
            <span className="text-xs font-normal text-slate-400">pedidos</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {reportData.deliveredOrders} entregados exitosamente
          </span>
        </div>

        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Ticket Promedio (AOV)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-300 mt-2">
            Bs. {Number(reportData.avgTicket).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Promedio por coleccionista</span>
        </div>

        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tasación de Bóveda</span>
            <Tag className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 mt-2">
            Bs. {Number(reportData.vaultValuation).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Patrimonio filatélico resguardado</span>
        </div>
      </div>

      {/* Two Column Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <div className="bg-[#102542] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Recaudación por Departamento</span>
            </h2>
            <button
              onClick={exportSalesCSV}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>

          <div className="space-y-3">
            {reportData.departmentBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay transacciones registradas por departamento.
              </div>
            ) : (
              reportData.departmentBreakdown.map((dept, idx) => {
                const total = reportData.totalRevenue || 1;
                const percentage = Math.min(100, Math.round((dept.total_dept / total) * 100));

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#0D2039] border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {dept.department || 'Envíos Nacionales'}
                      </span>
                      <span className="font-serif font-bold text-amber-200/90">
                        Bs. {Number(dept.total_dept).toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({dept.orders_count} ord.)
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#102542] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#102542] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <span>Tasación por Categoría Temática</span>
            </h2>
            <button
              onClick={exportCategoriesCSV}
              className="text-[11px] text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>

          <div className="space-y-3">
            {reportData.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No hay categorías cargadas en el catálogo.
              </div>
            ) : (
              reportData.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#0D2039] border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{cat.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {cat.pieces_count} piezas catalogadas • {cat.stock} unidades en bóveda
                    </div>
                  </div>

                  <div className="text-right font-serif font-bold text-amber-200/90">
                    Bs. {Number(cat.valuation).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

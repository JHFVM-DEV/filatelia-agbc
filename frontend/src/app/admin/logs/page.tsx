'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Filter,
  Terminal,
  Shield,
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  User,
  PlusCircle,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface AuditLogItem {
  id: number;
  user_id: number | null;
  user_name: string;
  user_role: string;
  action: string;
  model_type: string | null;
  model_id: number | null;
  model_name: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  change_summary: string;
  rationale: string | null;
  ip_address: string | null;
  created_at: string;
}

interface PriceRevaluationItem {
  id: number;
  product_id: number;
  user_id: number | null;
  user_name: string;
  previous_price: number;
  new_price: number;
  percentage_change: number;
  stock_at_revaluation: number;
  vault_gain: number;
  reason: string;
  notes: string | null;
  created_at: string;
  product?: {
    id: number;
    name: string;
    catalog_code: string;
    front_image?: string;
    price: number;
    stock: number;
  };
}

interface RawLogItem {
  raw: string;
  level: string;
}

interface CatalogProduct {
  id: number;
  name: string;
  catalog_code: string;
  price: number;
  stock: number;
  front_image?: string;
}

export default function AdminLogsPage() {
  const { currentUser, openLoginModal } = useStore();

  // Active Tab: 'AUDIT' | 'REVALUATIONS' | 'SYSTEM_LOGS'
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'REVALUATIONS' | 'SYSTEM_LOGS'>('AUDIT');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditStats, setAuditStats] = useState({
    total_logs: 0,
    stock_adjustments: 0,
    price_revaluations: 0,
    order_transitions: 0,
  });
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditSearch, setAuditSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  // Price Revaluations State
  const [revaluations, setRevaluations] = useState<PriceRevaluationItem[]>([]);
  const [revalStats, setRevalStats] = useState({
    total_revaluations: 0,
    total_vault_gain: 0,
    avg_percentage_change: 0,
  });

  // Revaluation Modal State
  const [showRevalModal, setShowRevalModal] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [newPriceInput, setNewPriceInput] = useState('');
  const [revalReason, setRevalReason] = useState('Actualización según Catálogo Internacional Scott / Yvert 2026');
  const [revalCustomReason, setRevalCustomReason] = useState('');
  const [revalNotes, setRevalNotes] = useState('');
  const [isSubmittingReval, setIsSubmittingReval] = useState(false);

  // Raw Server Logs State
  const [rawLogs, setRawLogs] = useState<RawLogItem[]>([]);
  const [rawLogFileSize, setRawLogFileSize] = useState('0 KB');
  const [rawFilter, setRawFilter] = useState('ALL');

  // General Status
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auth token helper
  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null);

  // 1. Fetch Audit Trail
  const fetchAuditLogs = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        if (data.stats) setAuditStats(data.stats);
      }
    } catch (e) {
      console.error('Error fetching audit logs', e);
    }
  };

  // 2. Fetch Revaluations
  const fetchRevaluations = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/admin/revaluations`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setRevaluations(data.revaluations || []);
        if (data.stats) setRevalStats(data.stats);
      }
    } catch (e) {
      console.error('Error fetching revaluations', e);
    }
  };

  // 3. Fetch Raw Laravel Logs
  const fetchRawLogs = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setRawLogs(data.logs || []);
        setRawLogFileSize(data.logFileSize || '0 KB');
      }
    } catch (e) {
      console.error('Error fetching raw logs', e);
    }
  };

  // 4. Fetch Products for Revaluation Form
  const fetchCatalogProducts = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setCatalogProducts(data.products || []);
      }
    } catch (e) {
      console.error('Error fetching products for revaluation', e);
    }
  };

  // Master Initializer
  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = getToken();
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión como administrador.');
        setLoading(false);
        return;
      }
      await Promise.all([
        fetchAuditLogs(),
        fetchRevaluations(),
        fetchRawLogs(),
        fetchCatalogProducts(),
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Clear Raw Logs
  const handleClearRawLogs = async () => {
    if (!confirm('¿Confirma que desea vaciar el archivo de registros de depuración laravel.log?')) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/logs`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al limpiar logs');

      setSuccessMessage('El archivo laravel.log fue depurado exitosamente.');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchRawLogs();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al depurar archivo');
    }
  };

  // Handle Execute Revaluation
  const handleExecuteRevaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Por favor seleccione una pieza filatélica del catálogo.');
      return;
    }
    const val = parseFloat(newPriceInput);
    if (isNaN(val) || val <= 0) {
      alert('Por favor introduzca un precio válido mayor a 0.');
      return;
    }

    const finalReason = revalReason === 'OTRO' ? revalCustomReason.trim() : revalReason;
    if (!finalReason) {
      alert('Por favor especifique el motivo oficial de la revalorización.');
      return;
    }

    setIsSubmittingReval(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/revalue-product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedProductId,
          new_price: val,
          reason: finalReason,
          notes: revalNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al ejecutar la revalorización');

      setSuccessMessage(data.message || 'Revalorización oficial registrada con éxito.');
      setTimeout(() => setSuccessMessage(null), 5000);

      // Reset modal
      setShowRevalModal(false);
      setSelectedProductId('');
      setNewPriceInput('');
      setRevalNotes('');
      setRevalCustomReason('');

      // Refresh data
      fetchRevaluations();
      fetchAuditLogs();
      fetchCatalogProducts();
      setActiveTab('REVALUATIONS');
    } catch (err: any) {
      alert(err.message || 'Error al procesar la revalorización.');
    } finally {
      setIsSubmittingReval(false);
    }
  };

  // Selected product details for real-time revaluation preview
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return catalogProducts.find((p) => p.id === Number(selectedProductId)) || null;
  }, [selectedProductId, catalogProducts]);

  const revalPreview = useMemo(() => {
    if (!selectedProduct) return null;
    const currentPrice = Number(selectedProduct.price) || 0;
    const stock = Number(selectedProduct.stock) || 0;
    const newPrice = parseFloat(newPriceInput);
    if (isNaN(newPrice) || newPrice <= 0) return null;

    const diff = newPrice - currentPrice;
    const pct = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;
    const vaultGain = diff * stock;

    return {
      currentPrice,
      newPrice,
      diff,
      pct,
      vaultGain,
      stock,
    };
  }, [selectedProduct, newPriceInput]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) {
        return false;
      }
      if (auditSearch.trim() !== '') {
        const q = auditSearch.toLowerCase();
        const matchesSummary = log.change_summary?.toLowerCase().includes(q);
        const matchesUser = log.user_name?.toLowerCase().includes(q);
        const matchesModel = log.model_name?.toLowerCase().includes(q);
        const matchesRationale = log.rationale?.toLowerCase().includes(q);
        return matchesSummary || matchesUser || matchesModel || matchesRationale;
      }
      return true;
    });
  }, [auditLogs, auditActionFilter, auditSearch]);

  // Filtered Raw Logs
  const filteredRawLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (rawFilter === 'ALL') return true;
      return log.level === rawFilter;
    });
  }, [rawLogs, rawFilter]);

  // Action badge styles
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PRICE_REVALUATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <TrendingUp className="w-3 h-3" /> Revalorización
          </span>
        );
      case 'STOCK_ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Package className="w-3 h-3" /> Ajuste Stock
          </span>
        );
      case 'ORDER_STATUS_CHANGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Layers className="w-3 h-3" /> Estado Pedido
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            <ShieldCheck className="w-3 h-3" /> Autenticación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700/60 text-slate-300 border border-slate-600">
            <FileText className="w-3 h-3" /> {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#102542] via-[#163359] to-[#0D2039] border border-amber-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#102542] to-[#102542] border border-white/10 flex items-center justify-center text-amber-200 shadow-lg shadow-black/40">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest bg-white/[0.08] text-amber-200 border border-white/10">
                Auditoría & Trazabilidad Oficial
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ISO 9001 / Filatelia Bolivia
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white font-serif tracking-wide mt-1">
              Bitácora de Auditoría & Revalorización de Precios
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Registro inmutable de movimientos en bóveda, revalorización oficial de cotizaciones filatélicas y telemetría de eventos del sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRevalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-slate-950" />
            <span>Revalorizar Cotización</span>
          </button>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-md"
            title="Refrescar todos los datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold cursor-pointer"
          >
            Identificarse
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Bitácora de Auditoría ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('REVALUATIONS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'REVALUATIONS'
              ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Historial de Revalorizaciones & Plusvalía ({revaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM_LOGS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'SYSTEM_LOGS'
              ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Registros del Servidor ({rawLogFileSize})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BITÁCORA DE AUDITORÍA (AUDIT TRAIL) */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          {/* 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0D2039]/80 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Total Eventos Auditados</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mt-2 font-mono">
                {auditStats.total_logs}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Eventos con firma criptográfica y rol</p>
            </div>

            <div className="bg-[#0D2039]/80 border border-emerald-900/30 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-medium">Revalorizaciones de Precio</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-300 mt-2 font-mono">
                {auditStats.price_revaluations}
              </div>
              <p className="text-[11px] text-emerald-500/80 mt-1">Dictámenes oficiales de cotización</p>
            </div>

            <div className="bg-[#0D2039]/80 border border-amber-900/30 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-400 font-medium">Ajustes Físicos en Bóveda</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-300 mt-2 font-mono">
                {auditStats.stock_adjustments}
              </div>
              <p className="text-[11px] text-amber-500/80 mt-1">Altas, bajas y cuadres de inventario</p>
            </div>

            <div className="bg-[#0D2039]/80 border border-purple-900/30 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400 font-medium">Transiciones de Despacho</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-300 mt-2 font-mono">
                {auditStats.order_transitions}
              </div>
              <p className="text-[11px] text-purple-500/80 mt-1">Trazabilidad de valijas y empaque</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0F233E] border border-slate-800 p-4 rounded-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Buscar por sello, funcionario, justificación o resumen de cambio..."
                className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              {auditSearch && (
                <button
                  onClick={() => setAuditSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'Todos', value: 'ALL' },
                { label: 'Revalorización', value: 'PRICE_REVALUATION' },
                { label: 'Ajuste Bóveda', value: 'STOCK_ADJUSTMENT' },
                { label: 'Despacho', value: 'ORDER_STATUS_CHANGED' },
                { label: 'Accesos', value: 'LOGIN' },
              ].map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setAuditActionFilter(pill.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    auditActionFilter === pill.value
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-[#163359] text-slate-300 hover:bg-[#102542] hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="bg-[#0D2039] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-[#0B1A2D]/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Registros Oficiales ({filteredAuditLogs.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Orden cronológico descendente
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-400 inline-block mr-2" />
                Cargando bitácora de auditoría...
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                No se encontraron eventos que coincidan con los criterios de búsqueda.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredAuditLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const dateObj = new Date(log.created_at);
                  const formattedDate = dateObj.toLocaleDateString('es-BO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('es-BO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <div key={log.id} className="p-4 hover:bg-[#102542]/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getActionBadge(log.action)}</div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white font-mono">
                                {log.model_name || log.model_type || 'Operación General'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                [ID #{log.id}]
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1 font-sans leading-relaxed">
                              {log.change_summary}
                            </p>
                            {log.rationale && (
                              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 max-w-2xl">
                                <Info className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                <span>
                                  <strong>Justificación:</strong> {log.rationale}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Metadata badge */}
                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end text-xs font-semibold text-slate-300">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{log.user_name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#102542] text-amber-300 border border-slate-700">
                                {log.user_role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 justify-end text-[10px] text-slate-500 font-mono mt-0.5">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formattedDate} • {formattedTime}
                              </span>
                              {log.ip_address && (
                                <span className="text-slate-600">IP: {log.ip_address}</span>
                              )}
                            </div>
                          </div>

                          {(log.old_values || log.new_values) && (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Ver valores anteriores y nuevos"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Diffs */}
                      {isExpanded && (log.old_values || log.new_values) && (
                        <div className="mt-3 p-3 rounded-xl bg-[#091627] border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-rose-400">
                              Valores Anteriores:
                            </span>
                            <pre className="mt-1 p-2 bg-[#0D2039] rounded text-slate-400 overflow-x-auto text-[11px]">
                              {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-emerald-400">
                              Nuevos Valores Aplicados:
                            </span>
                            <pre className="mt-1 p-2 bg-[#0D2039] rounded text-slate-200 overflow-x-auto text-[11px]">
                              {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HISTORIAL DE REVALORIZACIONES & PLUSVALÍA EN BÓVEDA */}
      {/* ========================================================================= */}
      {activeTab === 'REVALUATIONS' && (
        <div className="space-y-6">
          {/* 3 Executive Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#142E52] to-[#0D2039] border-2 border-emerald-500/40 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  Plusvalía Acumulada en Bóveda
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono">
                +Bs. {revalStats.total_vault_gain.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Ganancia de capital neta generada sobre los lotes conservados en custodia
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#142E52] to-[#0D2039] border border-amber-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  Revalorizaciones Oficiales
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white mt-3 font-mono">
                {revalStats.total_revaluations}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Actas formales de actualización de cotización registradas
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#142E52] to-[#0D2039] border border-cyan-500/30 p-6 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">
                  Variación Media de Cotización
                </span>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-cyan-300 mt-3 font-mono">
                +{revalStats.avg_percentage_change}%
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Apreciación promedio por pieza histórica según índices internacionales
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F233E] border border-slate-800 p-4 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-white">
                Registro de Actas de Revalorización Filatélica
              </h3>
              <p className="text-xs text-slate-400">
                Historial completo con impacto patrimonial unitario y colectivo
              </p>
            </div>

            <button
              onClick={() => setShowRevalModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ejecutar Nueva Revalorización</span>
            </button>
          </div>

          {/* Revaluations Table */}
          <div className="bg-[#0D2039] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0B1A2D] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="p-4">Pieza Filatélica</th>
                    <th className="p-4">Cotización Anterior</th>
                    <th className="p-4">Nueva Cotización</th>
                    <th className="p-4 text-center">Variación %</th>
                    <th className="p-4 text-right">Plusvalía en Bóveda</th>
                    <th className="p-4">Justificación & Motivo</th>
                    <th className="p-4">Perito / Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {revaluations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No hay revalorizaciones registradas todavía.
                      </td>
                    </tr>
                  ) : (
                    revaluations.map((r) => {
                      const isPositive = r.percentage_change >= 0;
                      const dateObj = new Date(r.created_at);
                      const formattedDate = dateObj.toLocaleDateString('es-BO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });

                      return (
                        <tr key={r.id} className="hover:bg-[#102542]/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {r.product?.front_image ? (
                                <img
                                  src={r.product.front_image}
                                  alt={r.product.name}
                                  className="w-10 h-10 object-contain rounded bg-black/40 border border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-[#102542] flex items-center justify-center text-amber-400 font-serif font-bold text-xs shrink-0">
                                  BO
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block">
                                  {r.product?.name || `Pieza #${r.product_id}`}
                                </span>
                                <span className="text-[10px] text-amber-400/90 font-mono">
                                  {r.product?.catalog_code || 'CAT-FIL'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-slate-400">
                            Bs. {Number(r.previous_price).toFixed(2)}
                          </td>

                          <td className="p-4 font-mono font-bold text-white">
                            Bs. {Number(r.new_price).toFixed(2)}
                          </td>

                          <td className="p-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                                isPositive
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {isPositive ? `+${r.percentage_change}%` : `${r.percentage_change}%`}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <div className="font-mono font-bold text-emerald-400">
                              +Bs. {Number(r.vault_gain).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Lote: {r.stock_at_revaluation} ejemplares
                            </div>
                          </td>

                          <td className="p-4 max-w-xs">
                            <div className="text-slate-200 font-medium line-clamp-2">
                              {r.reason}
                            </div>
                            {r.notes && (
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 italic">
                                Nota: {r.notes}
                              </div>
                            )}
                          </td>

                          <td className="p-4 text-slate-400 text-xs">
                            <div className="font-medium text-slate-300">{r.user_name}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {formattedDate}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGISTROS DEL SERVIDOR (LARAVEL.LOG RAW CONSOLE) */}
      {/* ========================================================================= */}
      {activeTab === 'SYSTEM_LOGS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F233E] border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Consola de Trazabilidad Técnica (laravel.log)
                </h3>
                <p className="text-xs text-slate-400">
                  Volumen del archivo: {rawLogFileSize} • Monitoreo de excepciones PHP y queries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchRawLogs}
                className="p-2 rounded-lg bg-[#102542] hover:bg-[#2C63AC] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Actualizar registros"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearRawLogs}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Depurar Archivo</span>
              </button>
            </div>
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {['ALL', 'ERROR', 'WARNING', 'INFO', 'DEBUG'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRawFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-colors cursor-pointer ${
                  rawFilter === lvl
                    ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl === 'ALL' ? 'Todos los Niveles' : lvl}
              </button>
            ))}
          </div>

          {/* Terminal Box */}
          <div className="bg-[#0B1A2D] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#0D2039] px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-400 ml-2">
                  storage/logs/laravel.log • {filteredRawLogs.length} eventos mostrados
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                UTF-8 Log Console
              </span>
            </div>

            <div className="p-4 max-h-[580px] overflow-y-auto font-mono text-[11px] space-y-1.5 leading-relaxed">
              {loading ? (
                <div className="py-12 text-center text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400 inline-block mr-2" />
                  Leyendo registros de depuración...
                </div>
              ) : filteredRawLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  No hay eventos registrados bajo el nivel seleccionado.
                </div>
              ) : (
                filteredRawLogs.map((item, idx) => {
                  const isError = item.level === 'ERROR';
                  const isWarn = item.level === 'WARNING';
                  const isDebug = item.level === 'DEBUG';

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg transition-colors ${
                        isError
                          ? 'bg-rose-950/20 text-rose-300 border-l-2 border-rose-500'
                          : isWarn
                          ? 'bg-amber-950/20 text-amber-300 border-l-2 border-amber-500'
                          : isDebug
                          ? 'bg-purple-950/20 text-purple-300 border-l-2 border-purple-500'
                          : 'bg-slate-900/40 text-slate-300 border-l-2 border-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase mr-2 ${
                          isError
                            ? 'bg-rose-500/30 text-rose-200'
                            : isWarn
                            ? 'bg-amber-500/30 text-amber-200'
                            : isDebug
                            ? 'bg-purple-500/30 text-purple-200'
                            : 'bg-blue-500/30 text-blue-200'
                        }`}
                      >
                        {item.level}
                      </span>
                      <span className="break-all">{item.raw}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EJECUTAR REVALORIZACIÓN OFICIAL DE COTIZACIÓN */}
      {/* ========================================================================= */}
      {showRevalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0E223C] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#163359] to-[#0D2039] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white font-serif tracking-wide">
                    Ejecutar Revalorización Oficial de Cotización
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ajuste patrimonial conforme a catálogos numismáticos y peritaje
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowRevalModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleExecuteRevaluation} className="p-6 space-y-5">
              {/* Product Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Seleccionar Pieza Filatélica a Revalorizar:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : '';
                    setSelectedProductId(id);
                    const prod = catalogProducts.find((p) => p.id === id);
                    if (prod) {
                      setNewPriceInput(String(prod.price));
                    }
                  }}
                  required
                  className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="">-- Seleccionar pieza del catálogo oficial --</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.catalog_code}] {p.name} — Cotización Actual: Bs. {Number(p.price).toFixed(2)} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Impact Preview */}
              {selectedProduct && (
                <div className="bg-[#091627] border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Impacto Patrimonial Proyectado en Bóveda
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Stock en custodia: {selectedProduct.stock} unidades
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#0F233E] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Cotización Anterior</span>
                      <span className="text-sm font-bold text-slate-300 font-mono">
                        Bs. {Number(selectedProduct.price).toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-[#0F233E] p-2.5 rounded-lg border border-emerald-900/40">
                      <span className="text-[10px] text-emerald-400 block">Nueva Cotización</span>
                      <span className="text-sm font-bold text-emerald-300 font-mono">
                        {revalPreview ? `Bs. ${revalPreview.newPrice.toFixed(2)}` : '--'}
                      </span>
                    </div>

                    <div className="bg-[#0F233E] p-2.5 rounded-lg border border-cyan-900/40">
                      <span className="text-[10px] text-cyan-400 block">Variación %</span>
                      <span className="text-sm font-bold text-cyan-300 font-mono">
                        {revalPreview
                          ? `${revalPreview.pct >= 0 ? '+' : ''}${revalPreview.pct.toFixed(2)}%`
                          : '--'}
                      </span>
                    </div>
                  </div>

                  {revalPreview && (
                    <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg text-xs">
                      <span className="text-emerald-300 font-medium">
                        Plusvalía total generada para los activos del Estado:
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400 font-mono">
                        +Bs. {revalPreview.vaultGain.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* New Price Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Nueva Cotización Oficial (Bs.):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPriceInput}
                    onChange={(e) => setNewPriceInput(e.target.value)}
                    placeholder="Ej. 185.00"
                    required
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Motivo Oficial:
                  </label>
                  <select
                    value={revalReason}
                    onChange={(e) => setRevalReason(e.target.value)}
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Actualización según Catálogo Internacional Scott / Yvert 2026">
                      Catálogo Internacional Scott / Yvert 2026
                    </option>
                    <option value="Apreciación por Rareza y Escasez en Mercado Numismático">
                      Apreciación por Rareza y Escasez
                    </option>
                    <option value="Dictamen Físico de Peritaje y Estado de Conservación MNH">
                      Dictamen Físico de Conservación MNH
                    </option>
                    <option value="Revalorización Conmemorativa Bicentenario de Bolivia">
                      Revalorización Bicentenario de Bolivia
                    </option>
                    <option value="OTRO">Otro / Justificación Personalizada...</option>
                  </select>
                </div>
              </div>

              {revalReason === 'OTRO' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Especifique el Motivo Oficial:
                  </label>
                  <input
                    type="text"
                    value={revalCustomReason}
                    onChange={(e) => setRevalCustomReason(e.target.value)}
                    placeholder="Describa el motivo o resolución administrativa..."
                    required
                    className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Notas de Peritaje & Observaciones (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={revalNotes}
                  onChange={(e) => setRevalNotes(e.target.value)}
                  placeholder="Detalles sobre dentado, filigrana, procedencia o número de acta ministerial..."
                  className="w-full bg-[#0B1A2D] border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRevalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReval}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReval ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Registrando Acta...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Firmar & Revalorizar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

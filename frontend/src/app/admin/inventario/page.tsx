'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  PlusCircle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Package,
  Layers,
  History,
  QrCode,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface ProductItem {
  id: number;
  catalog_code: string;
  name: string;
  price: number;
  stock: number;
  year: number;
  condition: string;
  category?: { name: string };
  emission?: { name: string };
}

interface MovementItem {
  id: number;
  type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  department: string;
  created_at: string;
  product?: { name: string; catalog_code: string };
  user?: { name: string };
}

export default function AdminInventarioPage() {
  const { currentUser, openLoginModal } = useStore();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [movements, setMovements] = useState<MovementItem[]>([]);
  const [stats, setStats] = useState({
    total_units: 0,
    low_stock_count: 0,
    total_valuation: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENTS'>('STOCK');
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Adjust Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    product_id: 0,
    product_name: '',
    type: 'IN',
    quantity: 1,
    reason: '',
  });
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/inventory`, {
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

      if (!res.ok) throw new Error('Error al cargar inventario de bóveda');

      const data = await res.json();
      setProducts(data.products || []);
      setMovements(data.movements || []);
      setStats(data.stats || { total_units: 0, low_stock_count: 0, total_valuation: 0 });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openAdjust = (product: ProductItem) => {
    setAdjustForm({
      product_id: product.id,
      product_name: `${product.catalog_code} - ${product.name}`,
      type: 'IN',
      quantity: 1,
      reason: 'Recepción oficial de pliego postal',
    });
    setShowAdjustModal(true);
  };

  const handleExecuteAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjusting(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('filatelia_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/inventory/adjust`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          product_id: adjustForm.product_id,
          type: adjustForm.type,
          quantity: adjustForm.quantity,
          reason: adjustForm.reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al procesar el ajuste de stock');

      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowAdjustModal(false);
      fetchInventory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de ajuste');
    } finally {
      setAdjusting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Código Catálogo,Pieza Filatélica,Categoría,Año,Condición,Stock en Bóveda,Precio Unitario BOB,Valoración Total BOB'];
    const rows = products.map((p) => {
      const cat = p.category?.name || 'General';
      const val = (p.price * p.stock).toFixed(2);
      return `"${p.catalog_code}","${p.name.replace(/"/g, '""')}","${cat}","${p.year}","${p.condition}",${p.stock},${p.price.toFixed(2)},${val}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Arqueo_Fisico_Boveda_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      (p.catalog_code || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#102542]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Bóveda & Logística: Control de Inventario y Arqueo
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Custodia física de piezas filatélicas, kardex de ingresos y egresos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Actualizar existencias"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Exportar Arqueo CSV</span>
          </button>
          <Link
            href="/admin/fichas-almacen"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>Fichas & Rótulos QR</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unidades en Bóveda
            </span>
            <Package className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats.total_units.toLocaleString('es-BO')}{' '}
            <span className="text-xs font-normal text-slate-400">piezas</span>
          </div>
        </div>

        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stock Crítico (≤ 2 un.)
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 mt-2">
            {stats.low_stock_count}{' '}
            <span className="text-xs font-normal text-slate-400">ejemplares</span>
          </div>
        </div>

        <div className="bg-[#102542] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tasación Total en Bóveda
            </span>
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-amber-200/90 mt-2">
            Bs. {stats.total_valuation.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'STOCK'
              ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Estado de Existencias ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MOVEMENTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'MOVEMENTS'
              ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Kardex de Movimientos ({movements.length})</span>
        </button>
      </div>

      {/* Tab 1: Existencias */}
      {activeTab === 'STOCK' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código de catálogo o nombre de la pieza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#102542] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="bg-[#102542] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0D2039] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Cód. Catálogo</th>
                    <th className="py-3.5 px-4">Pieza Filatélica</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4 text-center">Stock Actual</th>
                    <th className="py-3.5 px-4 text-right">Precio BOB</th>
                    <th className="py-3.5 px-4 text-right">Valoración</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-4 h-4 animate-spin inline-block text-amber-400 mr-2" />
                        Consultando existencias de bóveda...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No se encontraron piezas en el inventario.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isLow = p.stock <= 2;
                      const subtotal = p.price * p.stock;

                      return (
                        <tr key={p.id} className="hover:bg-[#102542]/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-amber-300">
                              {p.catalog_code}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div>{p.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Año {p.year} • Condición: {p.condition}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-300">
                            {p.category?.name || 'General'}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                isLow
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}
                            >
                              {p.stock} un.
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                            Bs. {Number(p.price).toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4 text-right font-serif font-bold text-amber-200/90">
                            Bs. {subtotal.toFixed(2)}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/admin/fichas-almacen?search=${encodeURIComponent(p.catalog_code)}`}
                                className="p-1.5 rounded-lg bg-[#102542] hover:bg-amber-400 hover:text-[#102542] border border-slate-700 text-slate-300 transition-colors inline-flex items-center"
                                title="Generar Ficha / Rótulo con QR"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => openAdjust(p)}
                                className="px-3 py-1.5 rounded-lg bg-[#102542] hover:bg-amber-400 hover:text-[#102542] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                              >
                                Ajustar
                              </button>
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

      {/* Tab 2: Movimientos */}
      {activeTab === 'MOVEMENTS' && (
        <div className="bg-[#102542] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D2039] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Fecha / Hora</th>
                  <th className="py-3.5 px-4">Pieza Filatélica</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4 text-center">Variación</th>
                  <th className="py-3.5 px-4 text-center">Balance Stock</th>
                  <th className="py-3.5 px-4">Motivo Oficial</th>
                  <th className="py-3.5 px-4">Funcionario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Cargando registros de auditoría...
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No se han registrado movimientos de inventario aún.
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => {
                    const isIngreso = m.type === 'IN';
                    const isEgreso = m.type === 'OUT';

                    return (
                      <tr key={m.id} className="hover:bg-[#102542]/30 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(m.created_at).toLocaleString('es-BO')}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div>{m.product?.name || 'Pieza desconocida'}</div>
                          <div className="text-[10px] text-amber-300 font-mono">
                            {m.product?.catalog_code}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                              isIngreso
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : isEgreso
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}
                          >
                            {isIngreso ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : isEgreso ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            <span>{m.type === 'IN' ? 'Ingreso' : m.type === 'OUT' ? 'Egreso' : 'Ajuste'}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-white">
                          {isIngreso ? `+${m.quantity}` : isEgreso ? `-${m.quantity}` : `${m.quantity}`}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                          {m.previous_stock} → <span className="text-amber-300 font-bold">{m.new_stock}</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                          {m.reason}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {m.user?.name || 'Sistema'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ajustar Stock */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#102542] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-amber-200/90">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Ajuste de Existencias en Bóveda
                </h3>
                <p className="text-[11px] text-slate-400">
                  {adjustForm.product_name}
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tipo de Operación
                </label>
                <select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="IN">Ingreso (Adquisición / Reingreso a Bóveda)</option>
                  <option value="OUT">Egreso (Baja / Merma por Conservación)</option>
                  <option value="ADJUST">Fijar Stock Absoluto (Resultado de Arqueo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Cantidad a Ajustar
                </label>
                <input
                  type="number"
                  min={adjustForm.type === 'ADJUST' ? 0 : 1}
                  required
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Motivo Oficial del Movimiento
                </label>
                <textarea
                  required
                  rows={3}
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="Especifique acta de recepción, donación o ajuste físico..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#102542] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
                >
                  {adjusting ? 'Aplicando...' : 'Confirmar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

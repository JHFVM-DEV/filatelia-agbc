'use client';
import { API_BASE_URL } from '@/config/api';
import { useAdminList } from '@/hooks/useAdminList';
import { readAdminResponse } from '@/lib/admin-api';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Plus,
  Stamp,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState('ALL');
  const { items: products, setItems: setProducts, loading, error, setError, refresh: fetchProducts } = useAdminList<any>('/api/admin/products', 'products', { rarity: rarityFilter, search: search.trim() });
  const { items: categories, error: categoryError } = useAdminList<{ id: number; name: string }>('/api/categories', 'data');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStockId, setUpdatingStockId] = useState<number | null>(null);
  const stockUpdatePending = useRef(false);

  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    catalog_code: '',
    category_id: '',
    price: '',
    stock: '',
    year: '2025',
    condition: 'MINT_NH',
    rarity: 'RARE',
    certified: true,
    face_value: '10.00 BOB',
    perforation: '13.5 x 13.5',
    front_image: '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png',
    description: '',
  });

  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('search') || '');
  }, []);

  const handleStockDelta = async (productId: number, currentStock: number, delta: number) => {
    if (stockUpdatePending.current) return;
    stockUpdatePending.current = true;
    setUpdatingStockId(productId);
    setError(null);
    const newStock = Math.max(0, currentStock + delta);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) await readAdminResponse(res);
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación.');
    } finally {
      stockUpdatePending.current = false;
      setUpdatingStockId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editingProduct.name,
          price: editingProduct.price,
          stock: editingProduct.stock,
          condition: editingProduct.condition,
          rarity: editingProduct.rarity,
          certified: editingProduct.certified,
          description: editingProduct.description,
        }),
      });

      if (!res.ok) await readAdminResponse(res);
      if (res.ok) {
        const json = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...json.product } : p))
        );
        setEditingProduct(null);
        await fetchProducts();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
          year: parseInt(formData.year) || 2025,
        }),
      });

      if (!res.ok) await readAdminResponse(res);
      if (res.ok) {
        const json = await res.json();
        setProducts((prev) => [json.product, ...prev]);
        setIsCreateModalOpen(false);
        await fetchProducts();
        setFormData({
          name: '',
          catalog_code: '',
          category_id: '',
          price: '',
          stock: '',
          year: '2025',
          condition: 'MINT_NH',
          rarity: 'RARE',
          certified: true,
          face_value: '10.00 BOB',
          perforation: '13.5 x 13.5',
          front_image: '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png',
          description: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la operación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'MUSEUM_PIECE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-amber-200/90 border border-white/10">
            Pieza de Museo
          </span>
        );
      case 'VERY_RARE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300/90 border border-white/10">
            Muy Rara (Gala)
          </span>
        );
      case 'RARE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300/90 border border-white/10">
            Rara
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.04] text-slate-300 border border-white/10">
            {rarity}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {(error || categoryError) && (
        <div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/40 p-4 text-sm text-red-200">
          {error || categoryError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-wide flex items-center gap-2">
            <span>Catálogo & Acervo Filatélico</span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-white/[0.06] text-amber-200/90 border border-white/10">
              {products.length} ejemplares
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de inventario físico, precios oficiales, rareza y certificados notariales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#102542] hover:bg-[#102542] border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refrescar</span>
          </button>

          <Link
            href="/admin/fichas-almacen"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B4785] hover:bg-[#102542] border border-slate-700 text-amber-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Fichas & Rótulos QR</span>
          </Link>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ingresar Nueva Pieza</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#102542]/90 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchProducts();
          }}
          className="w-full md:w-96 relative"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, código Scott/Yvert o año..."
            aria-label="Buscar piezas por título, código o año"
            className="w-full pl-10 pr-4 py-2 bg-[#1B4785]/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'MUSEUM_PIECE', 'VERY_RARE', 'RARE', 'SCARCE'].map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                rarityFilter === r
                  ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                  : 'bg-[#1B4785] text-slate-300 hover:text-white hover:bg-[#102542] border border-slate-700/60'
              }`}
            >
              {r === 'ALL'
                ? 'Todas las Rarezas'
                : r === 'MUSEUM_PIECE'
                ? 'Museo'
                : r === 'VERY_RARE'
                ? 'Muy Raras'
                : r === 'RARE'
                ? 'Raras'
                : 'Escasas'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#102542]/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs">Indexando ejemplares de bóveda...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Stamp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron piezas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-[#1B4785] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Ejemplar Filatélico</th>
                  <th className="py-3.5 px-4">Código / Año</th>
                  <th className="py-3.5 px-4">Rareza</th>
                  <th className="py-3.5 px-4 text-center">Stock Físico</th>
                  <th className="py-3.5 px-4">Precio Oficial</th>
                  <th className="py-3.5 px-4 text-center">Certificado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#102542]/30 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-slate-900 border border-white/10 overflow-hidden relative shrink-0">
                          <Image
                            src={product.front_image || '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png'}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-white text-xs truncate">
                            {product.name}
                          </div>
                          <div className="text-[10px] text-amber-200/90 font-mono">
                            {product.condition || 'MINT_NH'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Catalog Code & Year */}
                    <td className="py-3 px-4 font-mono">
                      <div className="text-white font-semibold">{product.catalog_code}</div>
                      <div className="text-[10px] text-slate-400">{product.year} — {product.country || 'Bolivia'}</div>
                    </td>

                    {/* Rarity Badge */}
                    <td className="py-3 px-4">{getRarityBadge(product.rarity)}</td>

                    {/* Fast Stock Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-[#1B4785] px-2 py-1 rounded-xl border border-slate-700">
                        <button
                          onClick={() => handleStockDelta(product.id, product.stock, -1)}
                          disabled={product.stock <= 0 || updatingStockId !== null}
                          className="w-5 h-5 rounded bg-[#102542] text-amber-300 hover:text-white font-bold flex items-center justify-center cursor-pointer disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className={`font-mono font-bold min-w-[24px] text-center ${
                          product.stock === 0 ? 'text-rose-400' : product.stock <= 2 ? 'text-amber-200/90' : 'text-white'
                        }`}>
                          {product.stock}
                        </span>
                        <button
                          onClick={() => handleStockDelta(product.id, product.stock, 1)}
                          disabled={updatingStockId !== null}
                          className="w-5 h-5 rounded bg-[#102542] text-amber-300 hover:text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-serif font-bold text-amber-200/90 text-sm">
                      Bs. {Number(product.price).toFixed(2)}
                    </td>

                    {/* Certified */}
                    <td className="py-3 px-4 text-center">
                      {product.certified ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <span className="text-[10px] text-slate-500">Estándar</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/fichas-almacen?search=${encodeURIComponent(product.catalog_code)}`}
                          className="p-1.5 rounded-lg bg-[#1B4785] hover:bg-white/10 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-colors inline-flex items-center"
                          title="Imprimir Ficha con QR para Almacén"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1.5 rounded-lg bg-[#1B4785] hover:bg-[#102542] text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                          title="Editar parámetros del sello"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-[#102542] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-serif">
                Editar Ejemplar: {editingProduct.catalog_code}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nombre Oficial del Sello
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Precio de Tasación (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Existencias en Bóveda
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Condición Numismática
                  </label>
                  <select
                    value={editingProduct.condition}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, condition: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="MINT_NH">MINT NH (Goma Intacta)</option>
                    <option value="MINT_H">MINT H (Con Charnela)</option>
                    <option value="USED">Usado / Matasellado</option>
                    <option value="FDC">Sobre Primer Día (FDC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Grado de Rareza
                  </label>
                  <select
                    value={editingProduct.rarity}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, rarity: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="MUSEUM_PIECE">Pieza de Museo</option>
                    <option value="VERY_RARE">Muy Rara (Gala)</option>
                    <option value="RARE">Rara</option>
                    <option value="SCARCE">Escasa</option>
                    <option value="COMMON">Común</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-[#1B4785] text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProduct}
            className="bg-[#102542] border border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-serif">
                Ingreso de Nueva Obra a Bóveda
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nombre de la Emisión o Sello
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bicentenario de Bolivia — Bloque Gala"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="product-category" className="block text-[11px] font-semibold text-slate-300 mb-1">Categoría</label>
                <select
                  id="product-category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                {(error || categoryError) && <p role="alert" className="mt-2 text-sm text-red-300">{error || categoryError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Código de Catálogo (Scott/Yvert)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: SCOTT-BO-2026-X1"
                    value={formData.catalog_code}
                    onChange={(e) => setFormData({ ...formData, catalog_code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Año de Timbrado
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Precio Oficial (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Unidades en Bóveda
                  </label>
                  <input
                    type="number"
                    placeholder="20"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Grado de Rareza
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white"
                  >
                    <option value="MUSEUM_PIECE">Pieza de Museo</option>
                    <option value="VERY_RARE">Muy Rara (Gala)</option>
                    <option value="RARE">Rara</option>
                    <option value="SCARCE">Escasa</option>
                    <option value="COMMON">Común</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Dentado / Perforación
                  </label>
                  <input
                    type="text"
                    placeholder="13.5 x 13.5 mm"
                    value={formData.perforation}
                    onChange={(e) => setFormData({ ...formData, perforation: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1B4785] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1B4785] text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold cursor-pointer transition-colors"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar en Bóveda'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

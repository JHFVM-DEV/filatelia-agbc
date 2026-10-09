'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Package,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  products_count: number;
}

export default function AdminCategoriasPage() {
  const { currentUser, openLoginModal } = useStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 1,
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
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

      if (!res.ok) throw new Error('Error al cargar categorías');

      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      sort_order: categories.length + 1,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sort_order: cat.sort_order || 1,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('filatelia_token');
      const url = editingCategory
        ? `${API_BASE_URL}/api/admin/categories/${editingCategory.id}`
        : `${API_BASE_URL}/api/admin/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar categoría');

      setSuccessMessage(data.message || 'Categoría guardada exitosamente');
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Está seguro de eliminar la categoría "${name}"?`)) return;
    try {
      const token = localStorage.getItem('filatelia_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');

      setSuccessMessage(data.message || 'Categoría eliminada');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchCategories();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#102542]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Gestión Filatélica: Categorías de Colección
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Clasificación temática (Historia, Flora & Fauna, Soberanía, Bicentenario)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar categoría temática..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#102542] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-[#102542] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D2039] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Orden</th>
                <th className="py-3.5 px-4">Nombre de la Categoría</th>
                <th className="py-3.5 px-4">Identificador Slug</th>
                <th className="py-3.5 px-4">Descripción Temática</th>
                <th className="py-3.5 px-4 text-center">Piezas Asociadas</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline-block text-amber-400 mr-2" />
                    Cargando categorías de colección...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No se encontraron categorías.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#102542]/30 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                      {cat.sort_order}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {cat.slug}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">
                      {cat.description || 'Sin descripción detallada.'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-amber-200/90 font-medium text-[11px]">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>{cat.products_count} piezas</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-rose-100 transition-colors"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#102542] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {editingCategory ? 'Modificar Categoría' : 'Nueva Categoría Temática'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Agrupador temático para el catálogo de piezas postales
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Bicentenario de Bolivia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Identificador Slug (opcional)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="bicentenario-de-bolivia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción Temática
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción histórica o reseña de la categoría..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#102542] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold text-xs uppercase tracking-wider shadow-md transition-colors"
                >
                  {saving ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

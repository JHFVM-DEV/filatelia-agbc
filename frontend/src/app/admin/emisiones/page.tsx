'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Calendar,
  Package,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface EmissionItem {
  id: number;
  name: string;
  slug: string;
  year: number;
  issue_date: string | null;
  official_decree: string | null;
  description: string | null;
  products_count: number;
}

export default function AdminEmisionesPage() {
  const { currentUser, openLoginModal } = useStore();
  const [emissions, setEmissions] = useState<EmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingEmission, setEditingEmission] = useState<EmissionItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    year: new Date().getFullYear(),
    issue_date: '',
    official_decree: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchEmissions = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/emissions`, {
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

      if (!res.ok) throw new Error('Error al cargar emisiones conmemorativas');

      const data = await res.json();
      setEmissions(data.emissions || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmissions();
  }, []);

  const handleOpenCreate = () => {
    setEditingEmission(null);
    setFormData({
      name: '',
      slug: '',
      year: new Date().getFullYear(),
      issue_date: '',
      official_decree: '',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (em: EmissionItem) => {
    setEditingEmission(em);
    setFormData({
      name: em.name,
      slug: em.slug,
      year: em.year,
      issue_date: em.issue_date || '',
      official_decree: em.official_decree || '',
      description: em.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('filatelia_token');
      const url = editingEmission
        ? `${API_BASE_URL}/api/admin/emissions/${editingEmission.id}`
        : `${API_BASE_URL}/api/admin/emissions`;
      const method = editingEmission ? 'PUT' : 'POST';

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
      if (!res.ok) throw new Error(data.message || 'Error al procesar emisión');

      setSuccessMessage(data.message || 'Emisión conmemorativa guardada con éxito');
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowModal(false);
      fetchEmissions();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Está seguro de retirar la emisión "${name}"?`)) return;
    try {
      const token = localStorage.getItem('filatelia_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/emissions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');

      setSuccessMessage(data.message || 'Emisión retirada');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchEmissions();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al retirar');
    }
  };

  const filteredEmissions = emissions.filter(
    (e) =>
      e.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      (e.official_decree && e.official_decree.toLowerCase().includes(search.trim().toLowerCase())) ||
      e.year.toString().includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#102542]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Gestión Filatélica: Emisiones Conmemorativas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Registro de emisiones oficiales, decretos supremos y fechas de puesta en circulación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEmissions}
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
            <span>Nueva Emisión</span>
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
          placeholder="Buscar por nombre, año o decreto ministerial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#102542] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Emissions Table */}
      <div className="bg-[#102542] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D2039] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Año</th>
                <th className="py-3.5 px-4">Emisión Conmemorativa</th>
                <th className="py-3.5 px-4">Decreto / Resolución</th>
                <th className="py-3.5 px-4">Puesta en Circulación</th>
                <th className="py-3.5 px-4 text-center">Piezas Registradas</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin inline-block text-amber-400 mr-2" />
                    Cargando emisiones oficiales...
                  </td>
                </tr>
              ) : filteredEmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No se encontraron emisiones conmemorativas.
                  </td>
                </tr>
              ) : (
                filteredEmissions.map((em) => (
                  <tr key={em.id} className="hover:bg-[#102542]/30 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-300">
                      {em.year}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div>
                          <div>{em.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{em.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {em.official_decree ? (
                        <div className="flex items-center gap-1.5 text-amber-300/90 font-mono text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{em.official_decree}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No especificado</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{em.issue_date || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-amber-200/90 font-medium text-[11px]">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>{em.products_count} piezas</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(em)}
                          className="p-1.5 rounded-lg bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Editar emisión"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(em.id, em.name)}
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 hover:text-rose-100 transition-colors"
                          title="Eliminar emisión"
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {editingEmission ? 'Modificar Emisión Conmemorativa' : 'Nueva Emisión Conmemorativa'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Emisión oficial del Estado Plurinacional de Bolivia
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre de la Emisión
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Bicentenario de la Independencia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Año de Emisión
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2025 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Puesta en Circulación
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Decreto Supremo / Resolución Ministerial
                </label>
                <input
                  type="text"
                  value={formData.official_decree}
                  onChange={(e) => setFormData({ ...formData, official_decree: e.target.value })}
                  placeholder="Ej. D.S. N° 4512 / R.M. 089-2025"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Reseña Histórica / Descripción
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fundamento histórico de la emisión conmemorativa..."
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
                  {saving ? 'Guardando...' : editingEmission ? 'Guardar Cambios' : 'Registrar Emisión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

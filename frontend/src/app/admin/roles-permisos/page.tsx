'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminRolesPermisosPage() {
  const { currentUser, openLoginModal } = useStore();
  const [modules, setModules] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [savingModule, setSavingModule] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMatrix = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/roles-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        setErrorMessage('Credenciales expiradas. Por favor reautentíquese.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Error al cargar la matriz de permisos');

      const data = await res.json();
      setModules(data.modules || []);
      setMatrix(data.matrix || {});
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = async (module: string, role: string) => {
    if (role === 'SUPER_ADMIN') return; // Super Admin always has full access
    if (savingModule) return; // Prevent concurrent saves

    const previousState = matrix[module]?.[role] ?? false;
    const newState = !previousState;

    const newMatrix = {
      ...matrix,
      [module]: {
        ...matrix[module],
        [role]: newState,
      },
    };

    // Optimistic UI update
    setMatrix(newMatrix);
    setSavingModule(module);
    setErrorMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) throw new Error('Sesión no encontrada. Por favor inicie sesión.');

      const res = await fetch(`${API_BASE_URL}/api/admin/roles-permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ matrix: newMatrix }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar permiso');

      if (data.matrix) {
        setMatrix(data.matrix);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('permissionsUpdated'));
      }

      setSuccessMessage(`Permiso «${module}» para Almacén ${newState ? 'autorizado' : 'revocado'} y guardado.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      // Revert optimistic update
      setMatrix(matrix);
      setErrorMessage(err.message || 'No se pudo guardar el cambio');
    } finally {
      setSavingModule(null);
    }
  };

  const roles = ['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN'];

  return (
    <div className="space-y-6">
      {/* Formal Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white font-serif tracking-wide">
            Permisos y Control de Acceso
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asignación de privilegios y facultades operativas por rol institucional
          </p>
        </div>

        <button
          onClick={fetchMatrix}
          disabled={loading || savingModule !== null}
          className="self-start sm:self-auto p-2 rounded-xl bg-[#001A38] hover:bg-[#002B5B] border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Actualizar tabla"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
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
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-[#001A38] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00142B] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-4 px-6 w-1/2">Módulo del Sistema</th>
                <th className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Super Administrador</span>
                  </div>
                  <span className="text-[10px] text-slate-500 normal-case font-normal">
                    (Dirección General)
                  </span>
                </th>
                <th className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Encargado de Bóveda y Almacén</span>
                  </div>
                  <span className="text-[10px] text-slate-500 normal-case font-normal">
                    (Operaciones y Logística)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Cargando matriz de permisos...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                modules.map((module) => {
                  const superAllowed = matrix[module]?.['SUPER_ADMIN'] ?? true;
                  const almacenAllowed = matrix[module]?.['ADMIN_PRODUCTOS_ALMACEN'] ?? false;

                  return (
                    <tr key={module} className="hover:bg-[#002B5B]/30 transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400/70" />
                          <span>{module}</span>
                        </div>
                      </td>

                      {/* Super Admin - Locked Check */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-amber-200/90 text-xs font-medium cursor-not-allowed">
                          <Lock className="w-3 h-3 text-amber-200/80" />
                          <span>Habilitado</span>
                        </div>
                      </td>

                      {/* Almacen - Toggleable with Real-Time Auto-Save */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          disabled={savingModule !== null}
                          onClick={() => handleToggle(module, 'ADMIN_PRODUCTOS_ALMACEN')}
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                            almacenAllowed
                              ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300 shadow-sm'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300'
                          } ${savingModule === module ? 'opacity-80 cursor-wait ring-2 ring-amber-400/50' : ''}`}
                        >
                          {savingModule === module ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
                          ) : (
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                almacenAllowed ? 'bg-emerald-400' : 'bg-rose-400'
                              }`}
                            />
                          )}
                          <span>
                            {savingModule === module
                              ? 'Guardando...'
                              : almacenAllowed
                              ? 'Autorizado'
                              : 'Denegado'}
                          </span>
                        </button>
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
  );
}

'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Trash2,
  Edit2,
  RefreshCw,
  Mail,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
  created_at: string;
  orders_count: number;
}

export default function AdminUsersPage() {
  const { currentUser, openLoginModal } = useStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN_PRODUCTOS_ALMACEN',
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) {
        setErrorMessage('Sesión no encontrada. Por favor inicie sesión nuevamente.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (res.status === 401) {
        setErrorMessage('Credenciales expiradas. Haga clic en Identificarse para reconectar.');
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error('Error al consultar directorio de usuarios');

      const data = await res.json();
      setUsers(data.users || []);
      setAvailableRoles(data.available_roles || ['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'CLIENTE']);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ADMIN_PRODUCTOS_ALMACEN',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.roles[0] || 'CLIENTE',
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('filatelia_token');
      const url = editingUser
        ? `${API_BASE_URL}/api/admin/users/${editingUser.id}`
        : `${API_BASE_URL}/api/admin/users`;
      const method = editingUser ? 'PUT' : 'POST';

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      if (formData.password) payload.password = formData.password;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al procesar usuario');

      setSuccessMessage(data.message || 'Operación realizada con éxito');
      setTimeout(() => setSuccessMessage(null), 4000);
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`¿Está seguro de retirar al usuario "${name}" del sistema?`)) return;
    try {
      const token = localStorage.getItem('filatelia_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'No se pudo eliminar el usuario');
      setSuccessMessage(data.message || 'Usuario retirado');
      setTimeout(() => setSuccessMessage(null), 4000);
      fetchUsers();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      u.email.toLowerCase().includes(search.trim().toLowerCase());
    const matchesRole =
      roleFilter === 'ALL' || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#102542]/90 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-200/90">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-serif tracking-wide">
              Administración y Seguridad: Directorio de Usuarios
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestión de cuentas institucionales, curadores, custodios y coleccionistas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
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
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Funcionario / Usuario</span>
          </button>
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

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo electrónico o credencial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#102542] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#102542] border border-slate-700/80 text-xs text-white focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">Todos los Roles Institucionales</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (Dirección General)</option>
            <option value="ADMIN_PRODUCTOS_ALMACEN">ADMIN_PRODUCTOS_ALMACEN (Bóveda)</option>
            <option value="CLIENTE">CLIENTE (Coleccionista)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#102542] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0D2039] text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Funcionario / Usuario</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Fecha Registro</th>
                <th className="py-3.5 px-4 text-center">Órdenes</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Cargando directorio de usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleName = user.roles[0] || 'CLIENTE';
                  const isSuper = roleName === 'SUPER_ADMIN';
                  const isStaff = roleName === 'ADMIN_PRODUCTOS_ALMACEN';

                  return (
                    <tr key={user.id} className="hover:bg-[#102542]/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSuper
                              ? 'bg-white/[0.08] border border-white/10 text-amber-200/90'
                              : isStaff
                              ? 'bg-white/[0.08] border border-white/10 text-sky-200/90'
                              : 'bg-white/[0.04] border border-white/10 text-slate-300'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{user.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide uppercase border ${
                          isSuper
                            ? 'bg-white/[0.06] text-amber-200/90 border-white/10'
                            : isStaff
                            ? 'bg-white/[0.06] text-sky-200/90 border-white/10'
                            : 'bg-white/[0.04] text-slate-300 border-white/10'
                        }`}>
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span>{roleName}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{user.created_at}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#102542] text-slate-300 font-medium">
                          <ShoppingBag className="w-3 h-3 text-slate-400" />
                          <span>{user.orders_count}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg bg-[#102542] hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Editar usuario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={user.id === currentUser?.id}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              user.id === currentUser?.id
                                ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                                : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/60 text-rose-300 hover:text-rose-100 cursor-pointer'
                            }`}
                            title={user.id === currentUser?.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {editingUser ? 'Modificar Usuario / Rol' : 'Registrar Nuevo Usuario'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Defina credenciales y nivel de acceso institucional
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Lic. Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="funcionario@filatelia.bo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial'}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Dejar en blanco para mantener' : 'Mínimo 6 caracteres'}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Rol Institucional Asignado
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D2039] border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Acceso Total a Bóveda y Configuración)</option>
                  <option value="ADMIN_PRODUCTOS_ALMACEN">ADMIN_PRODUCTOS_ALMACEN (Gestión de Stock y Despacho)</option>
                  <option value="CLIENTE">CLIENTE (Coleccionista Postal)</option>
                </select>
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
                  {saving ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

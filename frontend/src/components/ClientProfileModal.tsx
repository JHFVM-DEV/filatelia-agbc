'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Lock,
  KeyRound,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Package,
  Award,
  Edit3,
  FileText,
  BadgeCheck,
  AlertCircle,
  Truck,
  Copy,
  Check,
  Search,
  ArrowRight,
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useStore } from '@/context/StoreContext';

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { setCurrentUser, isEmailVerified, openEmailVerificationModal, openTracking } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'edit'>('profile');
  const [profileData, setProfileData] = useState<any>(null);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [copiedProfileCode, setCopiedProfileCode] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  const handleCopyProfileTracking = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedProfileCode(code);
    setTimeout(() => setCopiedProfileCode(null), 2500);
  };

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setStatusMessage(null);
    setActiveTab('profile');

    if (currentUser?.name) {
      setEditName(currentUser.name);
    }

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
        if (!token) {
          setIsLoadingProfile(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setProfileData(data.user);
            setEditName(data.user.name);
            if (Array.isArray(data.orders)) {
              setOrdersCount(data.orders.length);
              setOrdersList(data.orders);
            }
          }
        }
      } catch (err) {
        // Fallback to currentUser from props
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      setStatusMessage({ type: 'error', text: 'El nombre completo es obligatorio.' });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setStatusMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'La confirmación de la contraseña no coincide.' });
        return;
      }
      if (!currentPassword) {
        setStatusMessage({ type: 'error', text: 'Debe ingresar su contraseña actual para confirmar el cambio.' });
        return;
      }
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;

      const bodyData: any = {
        name: editName.trim(),
      };

      if (newPassword) {
        bodyData.current_password = currentPassword;
        bodyData.password = newPassword;
        bodyData.password_confirmation = confirmPassword;
      }

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.message || 'No fue posible actualizar los datos.' });
        setIsSaving(false);
        return;
      }

      // Actualizar en el estado local y en localStorage
      const updatedUser = {
        ...currentUser,
        name: data.user.name,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('filatelia_user', JSON.stringify(updatedUser));
      }

      setCurrentUser(updatedUser);
      setProfileData((prev: any) => ({ ...prev, name: data.user.name }));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setStatusMessage({ type: 'success', text: 'Los datos de su cuenta se actualizaron exitosamente.' });
      setTimeout(() => {
        setActiveTab('profile');
      }, 1000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error al comunicarse con el servidor.' });
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profileData?.name || currentUser?.name || 'Cliente';
  const displayEmail = profileData?.email || currentUser?.email || '—';
  const displayRole = profileData?.primary_role || currentUser?.primary_role || 'CLIENTE';
  const displayId = profileData?.id || currentUser?.id || '—';
  const displayDate = profileData?.created_at || 'Registrado';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102542]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E2DDD5] overflow-hidden">
        
        {/* Cabecera Formal Institucional Amarillo Postal */}
        <div className="bg-[#FECC36] px-6 py-4 text-[#102542] flex items-center justify-between border-b-2 border-[#E5B728]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#102542] flex items-center justify-center text-[#FECC36] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide text-[#102542] leading-tight">
                Datos de la Cuenta
              </h3>
              <p className="text-[11px] text-[#102542]/85 tracking-wider uppercase font-extrabold">
                Correos de Bolivia — Expediente Filatélico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#102542] hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control de Pestañas */}
        <div className="bg-[#FAF8F0] px-6 pt-4 pb-2 border-b border-[#E2DDD5]">
          <div className="grid grid-cols-2 p-1 bg-[#EBE7DF] rounded-xl border border-[#DDD7CD]">
            <button
              type="button"
              onClick={() => {
                setStatusMessage(null);
                setActiveTab('profile');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#102542] text-[#FECC36] shadow-sm'
                  : 'text-[#475569] hover:text-[#102542]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Expediente de la Cuenta</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusMessage(null);
                setActiveTab('edit');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-[#102542] text-[#FECC36] shadow-sm'
                  : 'text-[#475569] hover:text-[#102542]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modificar Datos</span>
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 sm:p-7 space-y-4 bg-[#FAF8F0]/40 max-h-[75vh] overflow-y-auto">
          
          {/* Alertas de Éxito / Error */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : null}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* PESTAÑA 1: EXPEDIENTE / FICHA DEL CLIENTE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              
              {/* Tarjeta de Credencial Oficial */}
              <div className="bg-white rounded-2xl border border-[#E2DDD5] p-5 shadow-sm space-y-4">
                
                <div className="flex items-start justify-between border-b border-[#F1EFEB] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#102542] text-[#FECC36] flex items-center justify-center font-bold text-lg border border-[#102542] overflow-hidden relative">
                      {profileData?.avatar || currentUser?.avatar ? (
                        <img
                          src={profileData?.avatar || currentUser?.avatar}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="font-bold text-lg select-none">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#102542] text-base leading-tight">
                        {displayName}
                      </h4>
                      <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{displayEmail}</span>
                      </p>
                    </div>
                  </div>

                  {isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" />
                      <span>Correo Verificado</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openEmailVerificationModal('general');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-800 transition cursor-pointer"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>No Verificado — Confirmar</span>
                    </button>
                  )}
                </div>

                {/* Campos de Detalle */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF8F0] rounded-xl border border-[#E2DDD5]/70">
                    <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Rol Asignado
                    </span>
                    <span className="font-bold text-[#102542]">
                      {displayRole === 'CLIENTE' ? 'CLIENTE (Coleccionista)' : displayRole}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF8F0] rounded-xl border border-[#E2DDD5]/70">
                    <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      ID de Expediente
                    </span>
                    <span className="font-bold text-[#102542] font-mono">
                      #{String(displayId).padStart(5, '0')}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF8F0] rounded-xl border border-[#E2DDD5]/70">
                    <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Fecha de Afiliación
                    </span>
                    <span className="font-bold text-[#102542] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {displayDate}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FAF8F0] rounded-xl border border-[#E2DDD5]/70">
                    <span className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                      Adquisiciones
                    </span>
                    <span className="font-bold text-[#102542] flex items-center gap-1">
                      <Package className="w-3 h-3 text-slate-400" />
                      {ordersCount} {ordersCount === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Garantía de Custodia Postal */}
              <div className="p-4 rounded-2xl bg-[#102542]/[0.03] border border-[#102542]/10 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#102542]">
                  <Award className="w-4 h-4 text-[#8A6800]" />
                  <span>Protocolo de Custodia Notarial</span>
                </div>
                <p className="text-[#5A554E] leading-relaxed text-[11px]">
                  Su cuenta está autorizada para la adquisición de piezas postales bajo protocolo de conservación pericial y embalaje en papel glassine neutro de <strong>Correos de Bolivia</strong>.
                </p>
              </div>

              {/* Sección de Guías de Envío y Despachos Activos */}
              <div className="bg-white rounded-2xl border border-[#E2DDD5] p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F1EFEB]">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#102542]" />
                    <h5 className="font-bold text-xs text-[#102542] uppercase tracking-wider">
                      Guías de Envío & Trazabilidad Postal
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {ordersList.length} {ordersList.length === 1 ? 'envío' : 'envíos'}
                  </span>
                </div>

                {ordersList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-[#FAF8F0] rounded-xl border border-[#E2DDD5]/70 space-y-1">
                    <Package className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <p className="font-semibold text-[#102542]">No registra guías postales activas</p>
                    <p className="text-[11px] text-slate-400">
                      Al realizar una orden en la tienda filatélica, su código de valija postal oficial de Correos de Bolivia aparecerá aquí para su seguimiento inmediato.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ordersList.slice(0, 3).map((order: any, idx: number) => {
                      const trk = order.tracking_code || 'En proceso';
                      return (
                        <div
                          key={order.id || idx}
                          className="p-3 bg-[#FAF8F0] rounded-xl border border-[#E2DDD5]/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Guía Postal:</span>
                              <strong className="font-mono text-xs font-black text-[#102542]">
                                {trk}
                              </strong>
                              {order.tracking_code && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyProfileTracking(order.tracking_code)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                                    copiedProfileCode === order.tracking_code
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#FECC36] hover:bg-[#FFD95E] text-[#102542] border border-amber-400'
                                  }`}
                                  title="Copiar guía de envío"
                                >
                                  {copiedProfileCode === order.tracking_code ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>¡Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Folio: <strong className="font-mono">{order.order_number}</strong> • Destino: {order.city || order.department || 'Bolivia'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'SHIPPED' || order.status === 'IN_TRANSIT'
                                  ? 'bg-[#FECC36] text-[#102542] border border-amber-400'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {order.status === 'DELIVERED'
                                ? 'Entregado'
                                : order.status === 'SHIPPED' || order.status === 'IN_TRANSIT'
                                ? 'En Tránsito'
                                : 'En Bóveda'}
                            </span>

                            {order.tracking_code && (
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  openTracking(order.tracking_code);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FECC36] hover:bg-[#FFD95E] text-[#102542] text-[11px] font-black transition cursor-pointer shadow-xs border border-amber-400"
                              >
                                <Search className="w-3 h-3 text-[#102542]" />
                                <span>Rastrear</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {ordersList.length > 3 && (
                      <p className="text-[10px] text-slate-400 text-right">
                        Mostrando 3 de {ordersList.length} guías. Para ver el historial completo, ingrese a Mi Bóveda & Portafolio.
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* PESTAÑA 2: MODIFICAR DATOS */}
          {activeTab === 'edit' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-[#102542] mb-1">
                  Nombre Completo y Apellidos
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#102542] focus:outline-none focus:border-[#102542] focus:ring-2 focus:ring-[#102542]/10 shadow-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102542] mb-1">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={displayEmail}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-slate-100 text-slate-500 cursor-not-allowed shadow-sm"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  El correo electrónico institucional no puede ser modificado directamente.
                </span>
              </div>

              {/* Sección Opcional: Cambio de Contraseña */}
              <div className="pt-2 border-t border-[#E2DDD5]/70 space-y-3">
                <span className="block text-xs font-bold text-[#102542]">
                  Cambiar Contraseña <span className="font-normal text-slate-500">(opcional)</span>
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Ingrese su contraseña actual para confirmar"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#102542] focus:outline-none focus:border-[#102542] focus:ring-2 focus:ring-[#102542]/10 shadow-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#102542] transition p-1 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#102542] focus:outline-none focus:border-[#102542] focus:ring-2 focus:ring-[#102542]/10 shadow-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#102542] transition p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repita la nueva clave"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#102542] focus:outline-none focus:border-[#102542] focus:ring-2 focus:ring-[#102542]/10 shadow-sm transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#102542] transition p-1 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatusMessage(null);
                    setActiveTab('profile');
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#CBD5E1] text-[#475569] hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 gold-button py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

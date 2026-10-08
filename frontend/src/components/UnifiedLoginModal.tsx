'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Eye,
  EyeOff,
  ArrowLeft,
  UserPlus,
  User,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { GoogleSignInButton } from './GoogleSignInButton';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  initialView?: 'login' | 'register' | 'forgot' | 'reset';
}

const normalizeView = (v: unknown): 'login' | 'register' | 'forgot' | 'reset' => {
  if (v === 'register' || v === 'forgot' || v === 'reset') return v;
  return 'login';
};

export const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialView = 'login',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { openEmailVerificationModal } = useStore();

  // Navigation view: 'login' | 'register' | 'forgot' | 'reset'
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset'>(() => normalizeView(initialView));

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State (Rol CLIENTE)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Password Reset State
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [staffRedirectUrl, setStaffRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setView(normalizeView(initialView));
      setErrorMessage('');
      setSuccessInfo(null);
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  const handleClose = () => {
    setView('login');
    setErrorMessage('');
    setSuccessInfo(null);
    setStaffRedirectUrl(null);
    setResetCode('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    onClose();
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      setErrorMessage('Por favor ingrese su correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/unified-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Credenciales no válidas. Verifique sus datos.');
        setIsLoading(false);
        return;
      }

      const userToStore = {
        ...data.user,
        roles: data.user.roles || (data.is_staff ? ['SUPER_ADMIN'] : ['CLIENTE']),
        primary_role: data.user.primary_role || (data.is_staff ? 'SUPER_ADMIN' : 'CLIENTE'),
      };

      // 1. Guardar la sesión en localStorage y en el StoreContext
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('filatelia_user', JSON.stringify(userToStore));
          if (data.token) {
            localStorage.setItem('filatelia_token', data.token);
          }
        } catch {}
      }
      onLoginSuccess(userToStore);

      // 2. Notificación y redirección automática para roles autorizados
      if (data.is_staff) {
        setSuccessInfo(`¡Bienvenido(a), ${data.user.name}! Credenciales autorizadas. Redirigiendo a Bóveda Administrativa...`);
        setTimeout(() => {
          handleClose();
          if (pathname.startsWith('/admin')) {
            window.location.reload();
          } else {
            router.push('/admin');
          }
        }, 700);
      } else {
        // Rol de Cliente / Coleccionista
        setSuccessInfo(`¡Bienvenido(a), ${data.user.name}! Sesión iniciada con éxito.`);
        setTimeout(() => {
          handleClose();
        }, 900);
      }
    } catch (err) {
      setErrorMessage('No se pudo establecer conexión con el servidor de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (userToStore: any) => {
    onLoginSuccess(userToStore);

    const isStaff = userToStore.roles?.some((r: string) =>
      ['SUPER_ADMIN', 'ADMIN_PRODUCTOS_ALMACEN', 'ALMACEN'].includes(r)
    );

    if (isStaff) {
      setSuccessInfo(`¡Bienvenido(a), ${userToStore.name}! Acceso administrativo autorizado. Redirigiendo a Bóveda Administrativa...`);
      setTimeout(() => {
        handleClose();
        if (pathname.startsWith('/admin')) {
          window.location.reload();
        } else {
          router.push('/admin');
        }
      }, 700);
    } else {
      setSuccessInfo(`¡Bienvenido(a), ${userToStore.name}! Sesión iniciada con éxito mediante Google.`);
      setTimeout(() => {
        handleClose();
      }, 800);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName || !trimmedEmail || !regPassword) {
      setErrorMessage('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMessage('La contraseña debe contener al menos 8 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('La confirmación de la contraseña no coincide.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Debe aceptar las políticas de servicio y custodia patrimonial de Correos de Bolivia.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: regPassword,
          password_confirmation: regConfirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'No fue posible registrar la cuenta. Verifique los datos ingresados.');
        setIsLoading(false);
        return;
      }

      const userToStore = {
        ...data.user,
        roles: ['CLIENTE'],
        primary_role: 'CLIENTE',
        email_verified_at: null,
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('filatelia_user', JSON.stringify(userToStore));
          if (data.token) {
            localStorage.setItem('filatelia_token', data.token);
          }
        } catch {}
      }

      onLoginSuccess(userToStore);
      setSuccessInfo(`¡Registro exitoso! Bienvenido(a), ${data.user.name}. Le enviamos un código a su correo para confirmar su cuenta.`);

      setTimeout(() => {
        handleClose();
        openEmailVerificationModal('general');
      }, 1000);
    } catch (err) {
      setErrorMessage('Error al comunicarse con el servidor de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = recoveryEmail.trim();

    if (!targetEmail) {
      setErrorMessage('Por favor ingrese su correo electrónico registrado.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'No fue posible generar el código de recuperación.');
        setIsLoading(false);
        return;
      }

      setResetCode('');
      setSuccessInfo(`Código enviado a ${targetEmail}. Ingréselo a continuación:`);
      setView('reset');
    } catch (err) {
      setErrorMessage('Error al comunicarse con el servidor. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode.trim()) {
      setErrorMessage('Por favor ingrese el código de verificación.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('La confirmación de la contraseña no coincide.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessInfo(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          code: resetCode.trim(),
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Error al restablecer la contraseña.');
        setIsLoading(false);
        return;
      }

      // Éxito: volver a login con email precargado
      setEmail(recoveryEmail.trim());
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessInfo('¡Su contraseña ha sido restablecida exitosamente! Ya puede iniciar sesión con sus nuevas credenciales.');
      setView('login');
    } catch (err) {
      setErrorMessage('Error al comunicarse con el servidor. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const activeView = normalizeView(view);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#001A38]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E2DDD5] overflow-hidden">
        
        {/* Header Formal Institucional Amarillo Postal */}
        <div className="bg-[#FFCC00] px-6 py-4 text-[#002B5B] flex items-center justify-between border-b-2 border-[#E5B500]">
          <div className="flex items-center gap-2.5">
            {activeView !== 'login' && activeView !== 'register' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setView(activeView === 'reset' ? 'forgot' : 'login');
                }}
                className="p-1 -ml-1 text-[#002B5B] hover:bg-black/10 rounded-lg transition-colors cursor-pointer mr-0.5"
                title="Volver"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="p-2 rounded-lg bg-[#002B5B] text-[#FFD100] shadow-xs">
              {activeView === 'login' && <Lock className="w-4 h-4" />}
              {activeView === 'register' && <UserPlus className="w-4 h-4" />}
              {activeView === 'forgot' && <KeyRound className="w-4 h-4" />}
              {activeView === 'reset' && <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide text-[#002B5B] leading-tight">
                {activeView === 'login' && 'Inicio de Sesión'}
                {activeView === 'register' && 'Registrarse'}
                {activeView === 'forgot' && 'Restablecer Contraseña'}
                {activeView === 'reset' && 'Nueva Contraseña'}
              </h3>
              <p className="text-[11px] text-[#002B5B]/85 tracking-wider uppercase font-extrabold">
                Correos de Bolivia
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1.5 text-[#002B5B] hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4 bg-[#FAF8F0]/50">
          
          {/* Segmented Control entre Iniciar Sesión y Registrarse */}
          {(activeView === 'login' || activeView === 'register') && (
            <div className="grid grid-cols-2 p-1 bg-[#EBE7DF] rounded-xl mb-2 border border-[#DDD7CD]">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setSuccessInfo(null);
                  setView('login');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeView === 'login'
                    ? 'bg-[#002B5B] text-[#FFD100] shadow-sm'
                    : 'text-[#475569] hover:text-[#002B5B]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setSuccessInfo(null);
                  setView('register');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeView === 'register'
                    ? 'bg-[#002B5B] text-[#FFD100] shadow-sm'
                    : 'text-[#475569] hover:text-[#002B5B]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrarse</span>
              </button>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successInfo}</span>
              </div>
              {staffRedirectUrl && (
                <a
                  href={staffRedirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#002B5B] hover:bg-[#0A3B73] text-[#F4C400] font-bold text-xs shadow-sm transition"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Abrir Panel Filament en nueva pestaña</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* VISTA 1: INICIO DE SESIÓN */}
          {activeView === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#002B5B]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryEmail(email);
                      setErrorMessage('');
                      setSuccessInfo(null);
                      setView('forgot');
                    }}
                    className="text-[11px] text-[#C99A00] hover:underline font-medium cursor-pointer"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={showPassword ? 'Ingrese su contraseña' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002B5B] transition p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#E2DDD5] text-[#002B5B] focus:ring-0 cursor-pointer"
                  />
                  <span>Recordar sesión</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gold-button py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <span>Ingresar</span>
                )}
              </button>

              {/* Separador Google */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2DDD5]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-2.5 text-slate-500 font-semibold">
                    O continuar con
                  </span>
                </div>
              </div>

              {/* Botón Oficial Google Identity */}
              <GoogleSignInButton
                text="continue_with"
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMessage(err)}
                disabled={isLoading}
              />

              <div className="text-center pt-3 border-t border-[#E2DDD5]/70">
                <p className="text-xs text-slate-600">
                  ¿Aún no tiene una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessInfo(null);
                      setView('register');
                    }}
                    className="text-xs font-bold text-[#002B5B] hover:text-[#0A3B73] hover:underline cursor-pointer"
                  >
                    Registrarse
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VISTA 2: REGISTRARSE (REGISTER) */}
          {activeView === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <p className="text-xs text-[#5A554E] leading-relaxed">
                Complete el formulario oficial para habilitar su cuenta y realizar pedidos con custodia garantizada.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Nombre y Apellidos
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej. Carlos Mendoza Flores"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Contraseña <span className="text-[10px] text-slate-500 font-normal">(mínimo 8 caracteres)</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002B5B] transition p-1 cursor-pointer"
                    title={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002B5B] transition p-1 cursor-pointer"
                    title={showRegConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={-1}
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-[#5A554E] cursor-pointer leading-tight">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#E2DDD5] text-[#002B5B] focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Acepto las condiciones del servicio y las normas de custodia patrimonial de <strong>Correos de Bolivia</strong>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gold-button py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-3 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>Registrarse</span>
                  </>
                )}
              </button>

              {/* Separador Google Registro */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2DDD5]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-2.5 text-slate-500 font-semibold">
                    O registrarse con
                  </span>
                </div>
              </div>

              {/* Botón Oficial Google Registro */}
              <GoogleSignInButton
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMessage(err)}
                disabled={isLoading}
              />

              <div className="text-center pt-2.5 border-t border-[#E2DDD5]/70">
                <p className="text-xs text-slate-600">
                  ¿Ya dispone de una cuenta registrada?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setSuccessInfo(null);
                      setView('login');
                    }}
                    className="text-xs font-bold text-[#002B5B] hover:text-[#0A3B73] hover:underline cursor-pointer"
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VISTA 3: SOLICITUD DE RESTABLECIMIENTO (FORGOT) */}
          {activeView === 'forgot' && (
            <form onSubmit={handleRequestResetCode} className="space-y-4">
              <p className="text-xs text-[#5A554E] leading-relaxed">
                Ingrese el correo electrónico registrado en su cuenta para recibir un código seguro de verificación de 6 dígitos.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1.5">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="correo@ejemplo.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gold-button py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando código...</span>
                  </>
                ) : (
                  <span>Enviar Código de Recuperación</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setView('login');
                  }}
                  className="text-xs text-slate-500 hover:text-[#002B5B] font-medium transition cursor-pointer"
                >
                  ← Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          )}

          {/* VISTA 4: INTRODUCIR CÓDIGO Y NUEVA CONTRASEÑA (RESET) */}
          {activeView === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-[#002B5B] flex items-start gap-2.5 shadow-sm">
                <Mail className="w-4 h-4 text-[#002B5B] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  Hemos enviado un código de seguridad de 6 dígitos a <strong className="font-semibold text-[#002B5B]">{recoveryEmail}</strong>. Ingréselo a continuación desde su bandeja de entrada.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Código de Verificación (6 dígitos)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono tracking-widest font-bold rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Nueva Contraseña (mínimo 8 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002B5B] transition p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#002B5B] mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002B5B] transition p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full gold-button py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando contraseña...</span>
                  </>
                ) : (
                  <span>Guardar Nueva Contraseña</span>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setView('forgot');
                  }}
                  className="text-slate-500 hover:text-[#002B5B] font-medium transition cursor-pointer"
                >
                  ← Solicitar otro código
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setView('login');
                  }}
                  className="text-slate-500 hover:text-[#002B5B] font-medium transition cursor-pointer"
                >
                  Volver al Login
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

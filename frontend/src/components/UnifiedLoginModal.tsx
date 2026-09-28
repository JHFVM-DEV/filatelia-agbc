'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, Lock, Mail, KeyRound, ArrowRight, Loader2, CheckCircle2, Shield, ShieldCheck, ExternalLink } from 'lucide-react';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [staffRedirectUrl, setStaffRedirectUrl] = useState<string | null>(null);

  if (!isOpen) return null;

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

      // 1. Guardar SIEMPRE la sesión en localStorage y en el StoreContext para la tienda web
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('filatelia_user', JSON.stringify(userToStore));
          if (data.token) {
            localStorage.setItem('filatelia_token', data.token);
          }
        } catch {}
      }
      onLoginSuccess(userToStore);

      // 2. Notificación y redirección automática para roles especiales
      if (data.is_staff) {
        setSuccessInfo(`¡Bienvenido(a), ${data.user.name}! Credenciales autorizadas. Redirigiendo a Bóveda Administrativa...`);
        setTimeout(() => {
          onClose();
          setSuccessInfo(null);
          setStaffRedirectUrl(null);
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
          onClose();
          setSuccessInfo(null);
        }, 1000);
      }
    } catch (err) {
      setErrorMessage('No se pudo establecer conexión con el servidor de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#001A38]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E2DDD5] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#002B5B] px-6 py-5 text-white flex items-center justify-between border-b border-[#0A3B73]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/[0.08] border border-white/10 text-amber-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">Acceso de Coleccionista</h3>
              <p className="text-[11px] text-amber-200/80">Bóveda Postal & Custodia Filatélica</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 bg-[#FAF8F0]/50">
          
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
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="coleccionista@filatelia.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#002B5B]">
                  Contraseña de Seguridad
                </label>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Por favor contacte a filatelia@correosbolivia.gob.bo para restablecer sus credenciales oficiales.'); }}
                  className="text-[11px] text-[#C99A00] hover:underline font-medium"
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 text-[#002B5B] shadow-sm transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E2DDD5] text-[#002B5B] focus:ring-0"
                />
                <span>Recordar sesión</span>
              </label>

              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#002B5B]" />
                Conexión Segura SSL
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-button py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a Mi Bóveda</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-3 border-t border-[#E2DDD5] text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Plataforma protegida bajo protocolo de seguridad de la Agencia Boliviana de Correos. Sus datos de coleccionista y órdenes están debidamente cifrados.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};


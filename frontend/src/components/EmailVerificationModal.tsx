'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  MailCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

export interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  reason?: 'wishlist' | 'checkout' | 'general' | null;
  onVerificationSuccess: (updatedUser: any) => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  reason = 'general',
  onVerificationSuccess,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Reiniciar estado al abrir modal
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setErrorMessage('');
      setSuccessMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Manejar temporizador de reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Manejar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const userEmail = currentUser?.email || '';

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setErrorMessage('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) {
      setErrorMessage('Por favor ingrese el código completo de 6 dígitos.');
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: userEmail,
          code: trimmedCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Código incorrecto o expirado. Intente nuevamente.');
        setIsLoading(false);
        return;
      }

      const verifiedUser = {
        ...(currentUser || {}),
        ...(data.user || {}),
        email_verified_at: data.user?.email_verified_at || new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('filatelia_user', JSON.stringify(verifiedUser));
        } catch {}
      }

      setSuccessMessage('¡Correo electrónico confirmado exitosamente!');
      
      setTimeout(() => {
        onVerificationSuccess(verifiedUser);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMessage('Error de conexión con el servidor. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage('');
    setSuccessMessage(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'No fue posible reenviar el código en este momento.');
      } else {
        setSuccessMessage('Se ha enviado un nuevo código de 6 dígitos a su correo.');
        setResendCooldown(60); // 60 segundos de espera
      }
    } catch (err) {
      setErrorMessage('Error de red al intentar reenviar el código.');
    } finally {
      setIsResending(false);
    }
  };

  const getReasonTitle = () => {
    switch (reason) {
      case 'checkout':
        return 'Confirmación Requerida para Finalizar Compra';
      case 'wishlist':
        return 'Confirmación Requerida para Favoritos';
      default:
        return 'Confirmación de Correo Electrónico';
    }
  };

  const getReasonDescription = () => {
    switch (reason) {
      case 'checkout':
        return 'Por normativas de custodia patrimonial y despacho postal seguro, debe verificar su correo para emitir certificados oficiales y procesar su orden.';
      case 'wishlist':
        return 'Para guardar piezas en su lista de favoritos y sincronizar su bóveda personal, confirme la titularidad de su correo institucional.';
      default:
        return 'Para habilitar todas las funciones del sistema —adquisición de piezas, favoritos y custodia notariada— ingrese el código enviado a su bandeja de entrada.';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-verification-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DCD8D0] overflow-hidden">
        
        {/* Cabecera Formal Amarillo Postal de Correos de Bolivia */}
        <div className="bg-[#FFCC00] px-6 py-4 border-b-2 border-[#E5B500] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#002B5B] flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#FFD100]" />
            </div>
            <div>
              <h2 id="email-verification-title" className="text-sm font-black text-[#002B5B] tracking-wide">
                Correos de Bolivia
              </h2>
              <span className="text-[10px] text-[#002B5B]/80 uppercase tracking-widest block font-bold">
                Seguridad & Validación Postal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#002B5B]/70 hover:text-[#002B5B] hover:bg-[#002B5B]/10 rounded-lg transition"
            aria-label="Cerrar modal"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 sm:p-7 bg-[#FAF8F0]/30">
          
          {/* Título contextual y descripción */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-[#002B5B]/5 border border-[#002B5B]/15 text-[#002B5B] mb-3">
              <MailCheck className="w-7 h-7 text-[#002B5B]" />
            </div>
            <h3 className="text-base font-bold text-[#002B5B]">
              {getReasonTitle()}
            </h3>
            <p className="mt-1.5 text-xs text-[#5A554E] leading-relaxed">
              {getReasonDescription()}
            </p>

            {userEmail && (
              <div className="mt-3.5 inline-block px-3.5 py-1.5 rounded-lg bg-[#FAF8F0] border border-[#E2DDD5] text-xs font-semibold text-[#002B5B]">
                Destinatario: <span className="underline">{userEmail}</span>
              </div>
            )}
          </div>

          {/* Alertas */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulario con Input de 6 Dígitos */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="verify-code-input" className="block text-center text-xs font-bold text-[#002B5B] uppercase tracking-wider mb-2">
                Código de 6 Dígitos
              </label>
              
              <div className="relative">
                <input
                  id="verify-code-input"
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  disabled={isLoading}
                  className="w-full text-center tracking-[0.6em] font-mono text-2xl sm:text-3xl font-bold py-3.5 px-4 bg-white border-2 border-[#DCD8D0] rounded-xl text-[#002B5B] placeholder-slate-300 focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/15 transition shadow-sm"
                />
              </div>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                Revise su bandeja de entrada (o carpeta de spam). Vigencia de 15 minutos.
              </p>
            </div>

            {/* Botón Principal de Verificación */}
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Validando Código Postal...</span>
                </>
              ) : (
                <>
                  <span>Confirmar y Habilitar Cuenta</span>
                  <ArrowRight className="w-4 h-4 text-[#F4C400]" />
                </>
              )}
            </button>
          </form>

          {/* Opciones de Reenvío y Ayuda */}
          <div className="mt-5 pt-4 border-t border-[#E2DDD5] text-center space-y-2">
            <p className="text-xs text-slate-600">
              ¿No recibió el código de confirmación?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isResending || isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002B5B] hover:text-[#0A3B73] disabled:text-slate-400 hover:underline transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0
                ? `Reenviar en ${resendCooldown}s`
                : 'Reenviar código de verificación'}
            </button>
          </div>

        </div>

        {/* Pie de Página Institucional */}
        <div className="bg-[#FAF8F0] px-6 py-2.5 border-t border-[#E2DDD5] flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Transmisión Cifrada
          </span>
          <span className="font-semibold text-[#002B5B]">
            Correos de Bolivia
          </span>
        </div>

      </div>
    </div>
  );
};

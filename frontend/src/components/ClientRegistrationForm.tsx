'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  FileCheck2,
  Award,
  ArrowRight,
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { useStore } from '@/context/StoreContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const ClientRegistrationForm: React.FC = () => {
  const router = useRouter();
  const { setCurrentUser, openLoginModal, openEmailVerificationModal } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleGoogleSuccess = (userToStore: any) => {
    setCurrentUser(userToStore);
    setSuccessInfo(`¡Bienvenido(a), ${userToStore.name}! Sesión iniciada con éxito mediante Google.`);
    setTimeout(() => {
      router.push('/');
    }, 900);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      setErrorMessage('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('La confirmación de la contraseña no coincide.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Debe aceptar los términos de servicio y custodia patrimonial de Correos de Bolivia.');
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
          password: password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'No fue posible registrar la cuenta. Verifique los datos.');
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

      setCurrentUser(userToStore);
      setSuccessInfo(`¡Bienvenido(a), ${data.user.name}! Su cuenta ha sido creada. Le enviamos un código de confirmación a su correo para habilitar todas las funciones.`);

      setTimeout(() => {
        router.push('/catalogo');
        openEmailVerificationModal('general');
      }, 1300);
    } catch (err) {
      setErrorMessage('Error al comunicarse con el servidor de autenticación. Verifique su conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F0] flex items-center justify-center">
      <div className="w-full max-w-xl">
        
        {/* Encabezado Institucional */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#002B5B] flex items-center justify-center border-2 border-[#D5CFBF] shadow-sm">
              <ShieldCheck className="w-8 h-8 text-[#F4C400]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#002B5B] tracking-tight">
            Registro Oficial
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#5A554E] max-w-md mx-auto">
            Plataforma Filatélica Oficial de <strong>Correos de Bolivia</strong>. Adquiera piezas postales de colección bajo custodia y certificación notariada.
          </p>
        </div>

        {/* Tarjeta del Formulario (Estilo Formal y Sobrio, sin colores neón) */}
        <div className="bg-white rounded-2xl border border-[#E2DDD5] shadow-lg overflow-hidden">
          
          {/* Barra Superior con Identidad Institucional */}
          <div className="bg-[#002B5B] px-6 py-3.5 border-b border-[#0A3B73] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#F4C400]" />
              <span className="text-xs font-bold text-white tracking-wider uppercase">
                Formulario de Afiliación Filatélica
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-medium">
              Correos de Bolivia
            </span>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* Mensajes de Éxito / Error */}
            {successInfo && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <p>{successInfo}</p>
                  <p className="font-normal text-emerald-700 mt-0.5">Redirigiendo al catálogo oficial de piezas...</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Campo: Nombre Completo */}
              <div>
                <label className="block text-xs font-bold text-[#002B5B] mb-1.5">
                  Nombre Completo y Apellidos <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej. Carlos Mendoza Flores"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#002B5B] placeholder:text-slate-400 focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 shadow-sm transition"
                  />
                </div>
              </div>

              {/* Campo: Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-[#002B5B] mb-1.5">
                  Correo Electrónico <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#002B5B] placeholder:text-slate-400 focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 shadow-sm transition"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#64748B]">
                  Se utilizará para notificaciones de despacho y certificados de autenticidad.
                </p>
              </div>

              {/* Campos Contraseña y Confirmación en Cuadrícula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#002B5B] mb-1.5">
                    Contraseña <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#002B5B] placeholder:text-slate-400 focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 shadow-sm transition"
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

                <div>
                  <label className="block text-xs font-bold text-[#002B5B] mb-1.5">
                    Confirmar Contraseña <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repita su contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#E2DDD5] bg-white text-[#002B5B] placeholder:text-slate-400 focus:outline-none focus:border-[#002B5B] focus:ring-2 focus:ring-[#002B5B]/10 shadow-sm transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002B5B] transition p-1 cursor-pointer"
                      title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Términos y Condiciones */}
              <div className="pt-2">
                <label className="flex items-start gap-3 text-xs text-[#475569] cursor-pointer leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#CBD5E1] text-[#002B5B] focus:ring-0 cursor-pointer"
                  />
                  <span>
                    Acepto los términos de servicio, las normas de conservación de piezas filatélicas y el protocolo de custodia oficial de <strong>Correos de Bolivia</strong>.
                  </span>
                </label>
              </div>

              {/* Botón de Envío */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gold-button py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Registrarse</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Separador Google */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2DDD5]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                  <span className="bg-white px-2.5 text-slate-500 font-semibold">
                    O registrarse con
                  </span>
                </div>
              </div>

              {/* Botón Oficial Google */}
              <GoogleSignInButton
                text="signup_with"
                onSuccess={handleGoogleSuccess}
                onError={(err) => setErrorMessage(err)}
                disabled={isLoading}
              />

            </form>

            {/* Acceso a Inicio de Sesión */}
            <div className="mt-6 pt-5 border-t border-[#E2DDD5] text-center">
              <p className="text-xs text-[#64748B]">
                ¿Ya dispone de una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={() => openLoginModal('login')}
                  className="font-bold text-[#002B5B] hover:text-[#0A3B73] hover:underline cursor-pointer"
                >
                  Iniciar sesión aquí
                </button>
              </p>
            </div>

          </div>

          {/* Pie de Garantías Notariales */}
          <div className="bg-[#FAF8F0] px-6 py-4 border-t border-[#E2DDD5] grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#64748B]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#002B5B] shrink-0" />
              <span>Autenticidad pericial y archivo seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#002B5B] shrink-0" />
              <span>Envíos oficiales de Correos de Bolivia</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

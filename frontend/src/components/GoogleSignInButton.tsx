'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '@/config/api';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess: (user: any) => void;
  onError: (message: string) => void;
  text?: 'continue_with' | 'signin_with' | 'signup_with';
  disabled?: boolean;
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '120094952293-i4hpu5jo3534ivcr0pbs9sgtgej2oi8d.apps.googleusercontent.com';

// Singleton para Google Identity Services (GIS): evita llamar initialize() múltiples veces
let isGoogleInitialized = false;
let activeGoogleCallback: ((response: { credential: string }) => void) | null = null;

function initGoogleGISOnce(clientId: string) {
  if (typeof window === 'undefined' || !window.google?.accounts?.id || isGoogleInitialized) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (res: { credential: string }) => {
      if (activeGoogleCallback) {
        activeGoogleCallback(res);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  isGoogleInitialized = true;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Procesar la credencial devuelta por Google GIS
  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response?.credential) {
        onError('No se recibió la credencial de autenticación de Google.');
        return;
      }

      setIsVerifying(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          onError(data.message || 'Error al validar su cuenta de Google.');
          setIsVerifying(false);
          return;
        }

        const userToStore = {
          ...data.user,
          roles: data.user.roles || (data.is_staff ? ['SUPER_ADMIN'] : ['CLIENTE']),
          primary_role: data.user.primary_role || (data.is_staff ? 'SUPER_ADMIN' : 'CLIENTE'),
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('filatelia_user', JSON.stringify(userToStore));
            if (data.token) {
              localStorage.setItem('filatelia_token', data.token);
            }
          } catch {}
        }

        onSuccess(userToStore);
      } catch (err) {
        onError('No se pudo establecer conexión con el servidor para validar Google.');
      } finally {
        setIsVerifying(false);
      }
    },
    [onError, onSuccess]
  );

  // Mantener la referencia al callback activo
  useEffect(() => {
    activeGoogleCallback = handleCredentialResponse;
  }, [handleCredentialResponse]);

  // Inyectar el script oficial de Google Identity Services si aún no existe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.accounts?.id) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => {
        onError('No se pudo cargar el servicio de Google. Verifique su conexión o bloqueador de anuncios.');
      };
      document.body.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsScriptLoaded(true));
    }
  }, [onError]);

  // Inicializar Google GIS una sola vez y renderizar el botón
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.google?.accounts?.id) {
      return;
    }

    // Inicializar Google una única vez
    initGoogleGISOnce(GOOGLE_CLIENT_ID);

    try {
      // Limpiar contenedor antes de renderizar
      containerRef.current.innerHTML = '';

      const containerWidth = Math.min(
        Math.max(containerRef.current.clientWidth || 320, 260),
        340
      );

      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: containerWidth,
        locale: 'es',
      });
    } catch (err) {
      console.error('Error al inicializar botón Google:', err);
    }
  }, [isScriptLoaded, text]);

  return (
    <div className="w-full max-w-[340px] mx-auto relative flex flex-col items-center justify-center my-1.5 min-h-[44px]">
      <div
        ref={containerRef}
        className={`w-full flex justify-center items-center overflow-hidden rounded-lg transition-opacity duration-150 ${
          isVerifying ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      />
      {isVerifying && (
        <div className="absolute inset-0 w-full rounded-xl border border-amber-300 bg-amber-50/95 backdrop-blur-xs flex items-center justify-center gap-2.5 px-3 py-2 text-xs font-bold text-[#002B5B] shadow-sm z-10 animate-in fade-in duration-150">
          <Loader2 className="w-4 h-4 animate-spin text-[#002B5B] shrink-0" />
          <span className="truncate">Verificando cuenta Google...</span>
        </div>
      )}
    </div>
  );
};

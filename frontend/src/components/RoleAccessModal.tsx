'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState } from 'react';
import { X, Shield, KeyRound, ExternalLink, Package, User, Crown, Check, Eye, EyeOff } from 'lucide-react';

interface RoleAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: string;
  onSelectRole: (role: string) => void;
}

export const RoleAccessModal: React.FC<RoleAccessModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onSelectRole,
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const togglePasswordVisibility = (roleId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  const roles = [
    {
      id: 'SUPER_ADMIN',
      name: 'Super Admin',
      icon: Crown,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Acceso irrestricto y auditoría ejecutiva. Dashboard global con recaudación en tiempo real, mapas departamentales, monitoreo Pulse, visor de logs y matriz de permisos.',
      credentials: {
        email: 'admin@filatelia.bo',
        pass: 'Admin12345!',
      },
      panelUrl: '/admin',
      isFilament: true,
    },
    {
      id: 'ADMIN_PRODUCTOS_ALMACEN',
      name: 'Encargado de Productos y Almacén',
      icon: Package,
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'Gestión y curaduría del catálogo filatélico oficial, custodia física de existencias en bóvedas departamentales, asignación de precintos y despacho postal.',
      credentials: {
        email: 'almacen@filatelia.bo',
        pass: 'Almacen12345!',
      },
      panelUrl: '/admin',
      isFilament: true,
    },
    {
      id: 'CLIENTE',
      name: 'Cliente (Coleccionista Numismático)',
      icon: User,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Navegación del catálogo de alta gama, visor con lupa de aumentos 10x, lista de deseos y adquisición con pasarela segura.',
      credentials: {
        email: 'coleccionista@filatelia.bo',
        pass: 'Cliente12345!',
      },
      panelUrl: '#',
      isFilament: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102542]/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E2DDD5] overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#102542] px-6 py-5 text-white flex items-center justify-between border-b border-[#2C63AC]">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Estructura de Roles y Control de Acceso</h3>
              <p className="text-[11px] text-slate-300">Demostración de los 3 perfiles oficiales del sistema</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Cards */}
        <div className="p-6 sm:p-8 space-y-4 bg-[#FAF8F0]/50 max-h-[70vh] overflow-y-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const isCurrent = activeRole === role.name;

            return (
              <div 
                key={role.id}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-sm ${
                  isCurrent ? 'border-[#102542] ring-2 ring-[#102542]/10' : 'border-[#E2DDD5] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#102542] text-amber-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#102542]">{role.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}>
                          {role.id}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A554E] mt-1 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Check className="w-3.5 h-3.5" /> Activo
                    </span>
                  )}
                </div>

                {/* Credentials & Access Buttons */}
                <div className="mt-4 pt-3 border-t border-[#E2DDD5] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px] bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span>{role.credentials.email}</span>
                    <span className="text-slate-400">/</span>
                    <span className={visiblePasswords[role.id] ? "text-[#102542] font-bold" : "text-slate-400"}>
                      {visiblePasswords[role.id] ? role.credentials.pass : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(role.id)}
                      className="text-slate-400 hover:text-[#102542] transition p-0.5 ml-0.5 cursor-pointer"
                      title={visiblePasswords[role.id] ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {visiblePasswords[role.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectRole(role.name);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-[#102542] transition"
                    >
                      Seleccionar en Vista
                    </button>

                    {role.isFilament && (
                      <a
                        href={role.panelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="gold-button px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <span>Abrir Filament</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-white p-4 border-t border-[#E2DDD5] text-center text-xs text-slate-500">
          Los 3 roles oficiales operan con control de acceso unificado y permisos asignados con <strong>Spatie Permissions</strong>.
        </div>

      </div>
    </div>
  );
};

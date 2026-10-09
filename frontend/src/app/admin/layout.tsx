'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Stamp,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Lock,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  Key,
  ClipboardList,
  Box,
  BarChart3,
  Cpu,
  FileText,
  Tag,
  Terminal,
  QrCode,
  Store,
} from 'lucide-react';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, openLoginModal } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [permissions, setPermissions] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('filatelia_user');
        if (u) {
          const parsed = JSON.parse(u);
          if (Array.isArray(parsed.permissions)) return parsed.permissions;
        }
      } catch {}
    }
    return [];
  });

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const fetchMyPermissions = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/admin/my-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.permissions)) {
          setPermissions(data.permissions);
        }
      }
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    fetchMyPermissions();

    const handlePermissionsUpdated = () => {
      fetchMyPermissions();
    };

    window.addEventListener('permissionsUpdated', handlePermissionsUpdated);
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionsUpdated);
    };
  }, []);

  // Staff roles authorized to access the Admin Suite
  const isStaff = () => {
    if (!currentUser) return false;

    // Normalizar lista de roles desde cualquier formato
    let userRoles: string[] = [];
    if (Array.isArray(currentUser.roles)) {
      userRoles = currentUser.roles.map((r: any) =>
        typeof r === 'string' ? r : r?.name || ''
      );
    } else if (typeof currentUser.roles === 'object' && currentUser.roles !== null) {
      userRoles = Object.values(currentUser.roles).map((r: any) =>
        typeof r === 'string' ? r : r?.name || ''
      );
    }

    if (currentUser.primary_role) {
      userRoles.push(currentUser.primary_role);
    }

    // Cuentas institucionales oficiales
    if (currentUser.email === 'admin@filatelia.bo') {
      userRoles.push('SUPER_ADMIN');
    } else if (currentUser.email === 'almacen@filatelia.bo') {
      userRoles.push('ADMIN_PRODUCTOS_ALMACEN');
    }

    return userRoles.some((roleName: string) =>
      [
        'SUPER_ADMIN',
        'ADMIN_PRODUCTOS_ALMACEN',
        'ALMACEN',
      ].includes(roleName)
    );
  };

  const isSuperAdmin = () => {
    if (!currentUser) return false;
    let roles: string[] = [];
    if (Array.isArray(currentUser.roles)) {
      roles = currentUser.roles.map((r: any) => (typeof r === 'string' ? r : r?.name || ''));
    } else if (typeof currentUser.roles === 'object' && currentUser.roles !== null) {
      roles = Object.values(currentUser.roles).map((r: any) => (typeof r === 'string' ? r : r?.name || ''));
    }
    if (currentUser.primary_role) roles.push(currentUser.primary_role);
    if (currentUser.email === 'admin@filatelia.bo') roles.push('SUPER_ADMIN');

    return roles.includes('SUPER_ADMIN');
  };

  const getRoleBadge = () => {
    if (!currentUser) return 'Funcionario';
    if (isSuperAdmin()) return 'Super Administrador';
    if (
      currentUser.email === 'almacen@filatelia.bo' ||
      currentUser.primary_role === 'ADMIN_PRODUCTOS_ALMACEN' ||
      (Array.isArray(currentUser.roles) && currentUser.roles.includes('ADMIN_PRODUCTOS_ALMACEN'))
    ) {
      return 'Encargado de Bóveda y Almacén';
    }
    return 'Funcionario Postal';
  };

  const hasAccess = (moduleName?: string): boolean => {
    if (!moduleName) return true;
    if (moduleName === 'APIs') return isSuperAdmin();
    if (isSuperAdmin()) return true; // Super Admin always has full bypass
    return permissions.includes(moduleName);
  };

  const allNavGroups = [
    {
      title: 'Administración y Seguridad',
      items: [
        {
          name: 'Users',
          href: '/admin/users',
          icon: Users,
          description: 'Gestión de funcionarios y cuentas',
          module: 'Usuarios',
        },
        {
          name: 'Permisos & Roles',
          href: '/admin/roles-permisos',
          icon: Key,
          description: 'Matriz de control de acceso institucional',
          module: 'Permisos',
        },
        {
          name: 'Gestión de APIs',
          href: '/admin/api-keys',
          icon: Terminal,
          description: 'Tokens de integración y especificaciones REST',
          module: 'APIs',
        },
        {
          name: 'Vitrina Correos Market',
          href: '/admin/vitrina-portal',
          icon: Store,
          description: 'Selección y orden de estampas en portal general',
          module: 'APIs',
        },
      ],
    },
    {
      title: 'Bóveda & Logística',
      items: [
        {
          name: 'Inventario & Bóveda',
          href: '/admin/inventario',
          icon: ClipboardList,
          description: 'Existencias y movimientos de bóveda',
          module: 'Inventario',
        },
        {
          name: 'Mesa de Despacho',
          href: '/admin/mesa-despacho',
          icon: Box,
          description: 'Empaque Glassine y operaciones',
          module: 'Despacho',
        },
        {
          name: 'Envíos y Valijas Postales',
          href: '/admin/despacho',
          icon: Truck,
          description: 'Guías y seguimiento logístico',
          module: 'Envíos',
        },
        {
          name: 'Fichas & Rótulos QR',
          href: '/admin/fichas-almacen',
          icon: QrCode,
          description: 'Etiquetas y fichas con QR para sobres y gavetas',
          module: 'Inventario',
        },
      ],
    },
    {
      title: 'Reportes & Auditoría',
      items: [
        {
          name: 'Reportes & Estadísticas',
          href: '/admin/reportes',
          icon: BarChart3,
          description: 'Recaudación y libros de venta',
          module: 'Reportes',
        },
        {
          name: 'Monitoreo Pulse',
          href: '/admin/pulse',
          icon: Cpu,
          description: 'Telemetría del servidor y base de datos',
          module: 'Monitoreo Pulse',
        },
        {
          name: 'Auditoría & Revalorización',
          href: '/admin/logs',
          icon: ShieldCheck,
          description: 'Bitácora de trazabilidad, plusvalía y logs',
          module: 'Visor de Logs',
        },
      ],
    },
    {
      title: 'Ventas & Coleccionistas',
      items: [
        {
          name: 'Pedidos y Órdenes Postales',
          href: '/admin/pedidos',
          icon: ShoppingBag,
          description: 'Órdenes, pagos y actas de custodia',
          module: 'Pedidos',
        },
      ],
    },
    {
      title: 'Gestión Filatélica',
      items: [
        {
          name: 'Piezas Filatélicas & Catálogo',
          href: '/admin/piezas',
          icon: Stamp,
          description: 'Sellos postales, series y pliegos',
          module: 'Productos',
        },
        {
          name: 'Categorías de Colección',
          href: '/admin/categorias',
          icon: Tag,
          description: 'Temáticas y clasificaciones',
          module: 'Categorías',
        },
        {
          name: 'Emisiones Conmemorativas',
          href: '/admin/emisiones',
          icon: Sparkles,
          description: 'Decretos y años de emisión',
          module: 'Emisiones',
        },
      ],
    },
  ];

  // Dynamic filtering based on Spatie permissions matrix
  const navGroups = allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasAccess(item.module)),
    }))
    .filter((group) => group.items.length > 0);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0D2039] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tracking-wider uppercase text-amber-300 font-medium">
            Iniciando Bóveda de Administración...
          </span>
        </div>
      </div>
    );
  }

  // Si el usuario no está autenticado o no cuenta con roles de staff
  if (!currentUser || !isStaff()) {
    return (
      <div className="min-h-screen bg-[#102542] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#102542]/90 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Acento dorado decorativo superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-200/30" />

          <div className="w-16 h-16 rounded-2xl bg-[#102542] border border-white/10 flex items-center justify-center mx-auto mb-5 text-amber-200/90 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-wide font-serif">
            Acceso Restringido a Bóveda
          </h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Esta sección administrativa es exclusiva para la Dirección Postal,
            Curaduría y Custodia de Bóveda Oficial del Estado Plurinacional de
            Bolivia.
          </p>

          <div className="space-y-3">
            {currentUser && (
              <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-slate-300 mb-2">
                Conectado como: <strong className="text-white">{currentUser.email}</strong>. Esta cuenta no cuenta con rol de personal para acceder a la Bóveda.
              </div>
            )}

            <button
              onClick={() => openLoginModal()}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Identificarse con Cuenta de Personal</span>
            </button>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-[#102542]/80 hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Volver a la Vitrina Pública</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Rutas dinámicas protegidas por la Matriz de Permisos
  const pathToModule: Record<string, string> = {
    '/admin/users': 'Usuarios',
    '/admin/roles-permisos': 'Permisos',
    '/admin/inventario': 'Inventario',
    '/admin/mesa-despacho': 'Despacho',
    '/admin/despacho': 'Envíos',
    '/admin/reportes': 'Reportes',
    '/admin/pulse': 'Monitoreo Pulse',
    '/admin/logs': 'Visor de Logs',
    '/admin/pedidos': 'Pedidos',
    '/admin/piezas': 'Productos',
    '/admin/categorias': 'Categorías',
    '/admin/emisiones': 'Emisiones',
  };

  let requiredModule: string | null = null;
  for (const [routePrefix, mod] of Object.entries(pathToModule)) {
    if (pathname === routePrefix || pathname.startsWith(routePrefix + '/')) {
      requiredModule = mod;
      break;
    }
  }

  if (requiredModule && !hasAccess(requiredModule)) {
    return (
      <div className="min-h-screen bg-[#102542] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#102542]/90 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />

          <div className="w-16 h-16 rounded-2xl bg-[#102542] border border-rose-500/40 flex items-center justify-center mx-auto mb-5 text-rose-400 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-wide font-serif">
            Módulo No Autorizado
          </h2>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            El acceso al módulo <strong className="text-amber-200">«{requiredModule}»</strong> no se encuentra habilitado para su rol actual (<strong className="text-blue-300">{getRoleBadge()}</strong>) en la <strong className="text-white">Matriz Institucional de Permisos</strong>.
          </p>

          <div className="space-y-3">
            <Link
              href="/admin/inventario"
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#102542] font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Ir a Bóveda & Operaciones</span>
            </Link>

            <Link
              href="/admin"
              className="w-full py-2.5 px-4 rounded-xl bg-[#102542]/80 hover:bg-[#2C63AC] border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Volver al Dashboard Operativo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030d1d] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-amber-400/30 selection:text-amber-200 print:bg-white print:text-black print:block print:min-h-0 print:p-0 print:m-0">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#102542] border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm border border-white/20">
            <Image
              src="/images/FILATELIA-1.png?v=3"
              alt="Logo Filatelia"
              width={32}
              height={32}
              className="h-full w-auto object-contain"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
              Bóveda Postal
            </h1>
            <span className="text-[10px] text-amber-200/90 font-medium">
              Suite Administrativa
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-[#102542] text-slate-300 hover:text-white border border-slate-700"
          aria-label="Abrir menú"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-[#102542]/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 print:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl bg-white border border-white/20 p-1 flex items-center justify-center shrink-0 shadow-md">
            <Image
              src="/images/FILATELIA-1.png?v=3"
              alt="Escudo Filatélico"
              width={40}
              height={40}
              className="h-full w-auto object-contain"
              unoptimized
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white tracking-wide uppercase font-serif truncate">
              Filatelia Oficial
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                Dirección & Bóveda
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Top-Level Dashboard */}
          <div>
            <Link
              href="/admin"
              onClick={() => setIsSidebarOpen(false)}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                pathname === '/admin'
                  ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#102542]/60 border border-transparent'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  pathname === '/admin'
                    ? 'bg-white/10 text-white'
                    : 'bg-[#102542] text-slate-400 group-hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`font-semibold tracking-wide truncate ${pathname === '/admin' ? 'text-white' : 'group-hover:text-white'}`}>
                  Dashboard Ejecutivo
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Resumen de recaudación y métricas
                </span>
              </div>
              {pathname === '/admin' && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
            </Link>
          </div>

          {/* 5 Operational Groups */}
          {navGroups.map((group) => {
            const isCollapsed = !!collapsedGroups[group.title];
            const hasActiveChild = group.items.some(
              (item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            );

            return (
              <div key={group.title} className="space-y-1">
                {/* Group Title Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold tracking-wide text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group/header"
                >
                  <span className={`truncate ${hasActiveChild ? 'text-slate-200 font-semibold' : ''}`}>
                    {group.title}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover/header:text-slate-300 transition-transform" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover/header:text-slate-300 rotate-180 transition-transform" />
                  )}
                </button>

                {/* Sub-items */}
                {!isCollapsed && (
                  <div className="space-y-1 pl-1">
                    {group.items.map((item) => {
                      const isActive =
                        item.href === '/admin'
                          ? pathname === '/admin'
                          : pathname.startsWith(item.href);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-[#102542] text-white border border-white/10 shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-[#102542]/60 border border-transparent'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`font-medium tracking-wide truncate flex-1 ${
                              isActive ? 'text-white font-semibold' : 'group-hover:text-white'
                            }`}
                          >
                            {item.name}
                          </span>
                          {isActive && (
                            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Link to Storefront */}
        <div className="p-3.5 border-t border-slate-800/80">
          <Link
            href="/"
            className="flex items-center justify-between p-3 rounded-xl bg-[#102542]/70 hover:bg-[#102542] border border-white/10 hover:border-white/20 text-xs transition-all duration-200 group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-200/90" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-white group-hover:text-amber-200/90 transition-colors">
                  Ir a la Vitrina Web
                </span>
                <span className="text-[10px] text-slate-400">
                  Vista pública de coleccionistas
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* User Card & Logout */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#0D1E36]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/10 text-amber-200/90 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">
                  {currentUser.name || 'Funcionario'}
                </span>
                <span className="text-[10px] font-medium text-slate-400 truncate">
                  {getRoleBadge()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              title="Cerrar sesión unificada"
              className="p-2 rounded-lg bg-[#102542] hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#030d1d] overflow-x-hidden print:bg-white print:p-0 print:m-0 print:w-full print:min-h-0 print:overflow-visible print:block">
        {/* Top Header */}
        <header className="hidden md:flex h-16 bg-[#102542]/70 backdrop-blur-md border-b border-slate-800/80 px-8 items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Bóveda Administrativa</span>
            <span>/</span>
            <span className="text-slate-200 font-semibold capitalize">
              {pathname === '/admin'
                ? 'Dashboard Ejecutivo'
                : pathname.replace('/admin/', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              <span>Ver Vitrina Pública</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-200/90" />
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:block">
          {children}
        </div>
      </main>
    </div>
  );
}

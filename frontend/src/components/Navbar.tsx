'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  Heart, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  ExternalLink, 
  ScrollText, 
  ChevronDown, 
  ChevronRight, 
  Award,
  TrendingUp,
  User,
  Truck
} from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenTracking?: (code?: string) => void;
  onOpenLoginModal: () => void;
  onOpenProfile?: () => void;
  currentUser: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenTracking,
  onOpenLoginModal,
  onOpenProfile,
  currentUser,
  onLogout,
}) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const isStaffUser = (user: any) => {
    if (!user) return false;
    if (user.is_staff) return true;
    if (
      user.primary_role === 'SUPER_ADMIN' ||
      user.primary_role === 'ADMIN_PRODUCTOS_ALMACEN' ||
      user.primary_role === 'ALMACEN'
    ) {
      return true;
    }
    if (Array.isArray(user.roles)) {
      return user.roles.some((r: any) => {
        const roleName = typeof r === 'string' ? r : r.name;
        return (
          roleName === 'SUPER_ADMIN' ||
          roleName === 'ADMIN_PRODUCTOS_ALMACEN' ||
          roleName === 'ALMACEN'
        );
      });
    }
    return false;
  };

  const getRoleLabel = (user: any) => {
    if (!user) return 'Coleccionista Oficial';
    const role =
      user.primary_role ||
      (Array.isArray(user.roles)
        ? typeof user.roles[0] === 'string'
          ? user.roles[0]
          : user.roles[0]?.name
        : '');
    if (role === 'SUPER_ADMIN') return 'Super Administrador';
    if (role === 'ADMIN_PRODUCTOS_ALMACEN' || role === 'ALMACEN') return 'Almacén y Productos';
    return 'Coleccionista Oficial';
  };

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Historia', href: '/historia' },
    { label: 'Guía', href: '/guia' },
    { label: 'Certificación', href: '/certificacion' },
    { label: 'Preguntas', href: '/faqs' },
  ];

  const isStaff = isStaffUser(currentUser);
  const roleLabel = getRoleLabel(currentUser);

  return (
    <header className="sticky top-0 z-40 bg-[#102542]/95 backdrop-blur-md text-white border-b border-[#102542] shadow-lg">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logos */}
          <div className="flex items-center space-x-3 shrink-0 mr-2 lg:mr-6">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo Filatelia */}
              <div className="relative w-12 h-14 flex items-center justify-center shrink-0">
                <Image
                  src="/images/FILATELIA-1.png?v=2"
                  alt="Logo Filatelia Oficial"
                  width={48}
                  height={48}
                  style={{ width: 'auto', height: 'auto' }}
                  className="max-h-12 object-contain hover:scale-105 transition-transform duration-200"
                  priority
                  unoptimized
                />
              </div>

              {/* Logo Corporativo Institucional */}
              <div className="border-l border-slate-700/80 pl-3 shrink-0">
                <div className="text-[10px] tracking-widest text-[#FECC36] uppercase font-bold mt-0.5 flex items-center gap-1">
                  <span>Filatelia Bolivia</span>
                </div>
                <div className="text-[9px] text-slate-300 font-medium uppercase tracking-wider">
                  Correos de Bolivia
                </div>
              </div>
            </Link>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8 text-sm font-medium shrink-0">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-1 border-b-2 whitespace-nowrap text-xs lg:text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-[#FECC36] border-[#FECC36] font-black'
                      : 'text-slate-200 border-transparent hover:text-[#FECC36] hover:border-[#FECC36]/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Dock */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Authenticated State: Clean Dock + VIP Dropdown */}
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* 1. Quick Access: Bóveda de Adquisiciones (Solo Bóveda afuera) */}
                <button
                  onClick={onOpenCart}
                  className="group flex items-center h-10 px-2.5 sm:px-3 hover:pr-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-white transition-all duration-300 ease-out shadow-sm overflow-hidden shrink-0 cursor-pointer"
                  title="Bóveda de Adquisiciones"
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <ShoppingBag className="w-4.5 h-4.5 text-[#FECC36] transition-transform duration-300 group-hover:scale-110" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#FECC36] text-[#102542] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="max-w-0 opacity-0 group-hover:max-w-[110px] group-hover:opacity-100 group-hover:ml-2.5 transition-all duration-300 ease-out text-xs font-semibold text-[#FECC36] overflow-hidden whitespace-nowrap">
                    Bóveda {cartCount > 0 ? `(${cartCount})` : ''}
                  </span>
                </button>

                {/* Separador vertical */}
                <div className="h-6 w-px bg-slate-700 shrink-0 hidden sm:block" />

                {/* 3. Luxury VIP Account Dropdown Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`flex items-center h-10 gap-2.5 px-3 rounded-xl border transition-all duration-200 shadow-sm shrink-0 cursor-pointer ${
                      isMenuOpen
                        ? 'bg-[#122B4D] text-white border-amber-300/40'
                        : 'bg-white/[0.08] hover:bg-white/[0.12] text-white border-white/10 hover:border-white/20'
                    }`}
                    title="Menú de Custodia y Cuenta Oficial"
                    aria-expanded={isMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-white/[0.1] text-amber-200 border border-white/15 flex items-center justify-center font-bold text-xs shadow-inner shrink-0 overflow-hidden relative">
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover rounded-full z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <span className="font-bold text-xs select-none">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                      </span>
                    </div>
                    <div className="flex flex-col text-left leading-tight hidden sm:flex">
                      <span className="text-xs font-bold text-white truncate max-w-[110px]">
                        {currentUser.name ? currentUser.name.split(' ')[0] : 'Usuario'}
                      </span>
                      <span className="text-[10px] text-amber-200/80 font-medium whitespace-nowrap">
                        {roleLabel}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isMenuOpen ? 'rotate-180 text-amber-200' : ''
                      }`}
                    />
                  </button>

                  {/* Floating Luxury Dropdown Card */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-88 rounded-2xl bg-[#0E213B] border border-white/10 shadow-2xl shadow-black/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                      {/* Card Header with Sovereign Texture & Credentials */}
                      <div className="relative p-4 sm:p-5 bg-gradient-to-b from-[#183D70] to-[#0E213B] border-b border-white/10">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-amber-200/90 font-medium mb-2">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5" />
                            Custodia Filatélica Oficial
                          </span>
                          <span className="bg-white/[0.08] px-2 py-0.5 rounded-full border border-white/10 text-amber-200/90 font-mono text-[10px]">
                            Bolivia
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-white/[0.1] text-amber-200 flex items-center justify-center font-bold text-lg shadow-md shrink-0 border border-white/15 overflow-hidden relative">
                            {currentUser.avatar ? (
                              <img
                                src={currentUser.avatar}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <span className="font-bold text-lg select-none">
                              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">
                              {currentUser.name || 'Coleccionista'}
                            </span>
                            <span className="text-xs text-slate-300 truncate">
                              {currentUser.email || 'coleccionista@filatelia.bo'}
                            </span>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="text-[10px] font-medium text-amber-200/80">
                                {roleLabel}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Actions List */}
                      <div className="p-2.5 space-y-1.5 text-xs">
                        {/* 1. Acceso a la Suite Administrativa Nativa (solo si isStaff) */}
                        {isStaff && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#102542] border border-white/10 flex items-center justify-center shrink-0 text-amber-300/90 group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex flex-col text-left">
                                <span className="font-semibold text-amber-200/90 group-hover:text-white flex items-center gap-1.5">
                                  Bóveda & Dirección Postal
                                </span>
                                <span className="text-[11px] text-slate-300">
                                  Dashboard ejecutivo, pedidos & catálogo
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </Link>
                        )}

                        {/* 1.5. Datos de la Cuenta (Expediente del Cliente) */}
                        {onOpenProfile && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onOpenProfile();
                            }}
                            className="w-full group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#102542] border border-slate-700/60 flex items-center justify-center shrink-0 text-amber-300/80 group-hover:text-amber-200 transition-colors">
                                <User className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                                  Datos de la Cuenta
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Expediente personal y seguridad
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </button>
                        )}

                        {/* 2. Mi Bóveda & Portafolio de Inversión */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenOrders();
                          }}
                          className="w-full group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#102542] border border-slate-700/60 flex items-center justify-center shrink-0 text-amber-300/80 group-hover:text-amber-200 transition-colors">
                              <TrendingUp className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                                Mi Bóveda & Portafolio
                                <span className="bg-white/[0.08] text-amber-200/90 text-[9px] font-medium px-1.5 py-0.5 rounded border border-white/10">
                                  VIP
                                </span>
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Valor patrimonial, estadísticas y actas
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>

                        {/* 2.5. Rastreo y Seguimiento Postal */}
                        {onOpenTracking && (
                          <button
                            onClick={() => {
                              setIsMenuOpen(false);
                              onOpenTracking();
                            }}
                            className="w-full group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#102542] border border-slate-700/60 flex items-center justify-center shrink-0 text-amber-300/80 group-hover:text-amber-200 transition-colors">
                                <Truck className="w-4.5 h-4.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                                  Rastreo de Envíos
                                  <span className="bg-[#FECC36]/20 text-[#FECC36] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#FECC36]/30">
                                    Guías
                                  </span>
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  Seguimiento de valijas y guías de envío
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                          </button>
                        )}

                        {/* 3. Lista de Deseos */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenWishlist();
                          }}
                          className="w-full group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#102542] border border-slate-700/60 flex items-center justify-center shrink-0 text-rose-400 group-hover:scale-105 transition-transform">
                              <Heart className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                                Lista de Deseos
                                {wishlistCount > 0 && (
                                  <span className="bg-white/[0.1] text-amber-200 text-[10px] font-medium px-1.5 py-0.2 rounded-full border border-white/10">
                                    {wishlistCount}
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Piezas marcadas para seguimiento
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>

                        {/* 4. Bóveda de Adquisiciones (Carrito) */}
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onOpenCart();
                          }}
                          className="w-full group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-200 cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#102542] border border-slate-700/60 flex items-center justify-center shrink-0 text-amber-300/80 group-hover:scale-105 transition-transform">
                              <ShoppingBag className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200 group-hover:text-white flex items-center gap-1.5">
                                Bóveda de Compras
                                {cartCount > 0 && (
                                  <span className="bg-white/[0.1] text-amber-200 text-[10px] font-medium px-1.5 py-0.2 rounded-full border border-white/10">
                                    {cartCount}
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Revisar orden y peritaje de piezas
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-200 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </button>
                      </div>

                      {/* Dropdown Footer: Logout */}
                      <div className="p-2.5 bg-[#0D1E36] border-t border-slate-800">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all duration-200 text-xs font-semibold cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Cerrar Sesión Segura</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => onOpenLoginModal()}
                className="flex items-center h-10 gap-2 px-3.5 sm:px-4 rounded-xl gold-button text-xs font-bold transition shadow-md whitespace-nowrap shrink-0 cursor-pointer"
                title="Iniciar Sesión"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-[#FECC36] via-[#FECC36] to-[#E5B728] w-full" />
    </header>
  );
};


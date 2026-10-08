'use client';
import { API_BASE_URL } from '@/config/api';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  X, 
  ScrollText, 
  Award, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  Sparkles,
  DollarSign,
  Coins,
  Truck,
  Copy,
  Check,
  MapPin,
  Search,
  ExternalLink
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface CollectorOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onViewCertificate: (order: any) => void;
}

export const CollectorOrdersModal: React.FC<CollectorOrdersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onViewCertificate,
}) => {
  const { openTracking } = useStore();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'orders' | 'tracking'>('portfolio');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [customTrackCode, setCustomTrackCode] = useState('');

  const handleCopyTracking = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchOrders = async () => {
      setIsLoading(true);

      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
        
        if (token) {
          const res = await fetch(`${API_BASE_URL}/api/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.orders)) {
              setOrders(data.orders);
              setIsLoading(false);
              return;
            }
          }
        }

        // Fallback a órdenes guardadas localmente en el navegador
        const localSaved = localStorage.getItem('filatelia_saved_orders');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            setIsLoading(false);
            return;
          }
        }

        setOrders([]);
      } catch {
        // Fallback a localStorage si la API falla
        const localSaved = localStorage.getItem('filatelia_saved_orders');
        if (localSaved) {
          try {
            setOrders(JSON.parse(localSaved));
          } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isOpen, currentUser]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Cálculos del Portafolio de Inversión
  const portfolioStats = useMemo(() => {
    const totalBOB = orders.reduce((sum, ord) => sum + Number(ord.total_amount || 0), 0);
    const totalUSD = totalBOB / 6.96; // Paridad oficial de referencia
    
    let totalPieces = 0;
    const categoryCount: { [key: string]: number } = {
      'Sellos y Series': 0,
      'Hojitas Bloque': 0,
      'Sobres Primer Día (FDC)': 0,
      'Material de Conservación': 0,
    };

    orders.forEach((ord) => {
      const items = ord.items || [];
      items.forEach((item: any) => {
        const qty = Number(item.quantity || 1);
        totalPieces += qty;

        const nameLower = (item.product_name || item.name || '').toLowerCase();
        if (nameLower.includes('bloque') || nameLower.includes('pliego')) {
          categoryCount['Hojitas Bloque'] += qty;
        } else if (nameLower.includes('fdc') || nameLower.includes('sobre')) {
          categoryCount['Sobres Primer Día (FDC)'] += qty;
        } else if (nameLower.includes('clasificador') || nameLower.includes('lupa') || nameLower.includes('accesorio')) {
          categoryCount['Material de Conservación'] += qty;
        } else {
          categoryCount['Sellos y Series'] += qty;
        }
      });
    });

    return {
      totalBOB,
      totalUSD,
      totalPieces,
      categoryCount,
    };
  }, [orders]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VAULT_VERIFIED':
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            En Custodia de Bóveda
          </span>
        );
      case 'GLASSINE_PACKED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Package className="w-3 h-3 text-amber-700" />
            Empacado en Glassine
          </span>
        );
      case 'SHIPPED':
      case 'IN_TRANSIT':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            En Tránsito Postal
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Custodia Privada Entregada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {status || 'Registrado'}
          </span>
        );
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#001A38]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in print:hidden"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E2DDD5] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Luxury Header */}
        <div className="bg-gradient-to-r from-[#001A38] via-[#002B5B] to-[#001A38] px-6 py-5 text-white flex items-center justify-between border-b border-[#0A3B73]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-[#C99A00] text-[#002B5B] shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-wide">
                  Mi Bóveda: Portafolio & Actas
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.1] text-amber-200 border border-white/10">
                  VIP
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Valor patrimonial, métricas de apreciación y certificaciones oficiales
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collector Profile Bar & Navigation Tabs */}
        <div className="bg-[#FAF8F0] px-6 py-3 border-b border-[#E2DDD5] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Titular:</span>
            <strong className="text-[#002B5B] font-bold">{currentUser?.name || 'Coleccionista Oficial'}</strong>
            <span className="text-slate-400 font-mono hidden sm:inline">({currentUser?.email || 'boveda@filatelia.bo'})</span>
          </div>

          {/* Clean Segmented Tabs */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#E2DDD5] shadow-xs text-xs font-bold">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'portfolio'
                  ? 'bg-[#002B5B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#002B5B]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Portafolio de Inversión</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#002B5B] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#002B5B]'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Adquisiciones ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'tracking'
                  ? 'bg-[#002B5B] text-[#FFD100] shadow-sm'
                  : 'text-slate-600 hover:text-[#002B5B]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Guías & Rastreo</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF8F0]/40">
          {isLoading ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#002B5B]" />
              <p className="text-xs font-semibold">Consultando libros matrices de custodia y cotización...</p>
            </div>
          ) : activeTab === 'portfolio' ? (
            /* TAB 1: PORTAFOLIO DE INVERSIÓN */
            <div className="space-y-6">
              
              {/* 4 KPIs de Inversión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Valor en BOB */}
                <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Valor Total Acervo</span>
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#002B5B]">
                      {portfolioStats.totalBOB.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-bold text-slate-500 ml-1">BOB</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                      ≈ ${portfolioStats.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>

                {/* KPI 2: Piezas Custodiadas */}
                <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Piezas Custodiadas</span>
                    <Layers className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#002B5B]">
                      {portfolioStats.totalPieces}
                      <span className="text-xs font-normal text-slate-500 ml-1">ejemplares</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      En {orders.length} {orders.length === 1 ? 'orden oficial' : 'órdenes oficiales'}
                    </span>
                  </div>
                </div>

                {/* KPI 3: Conservación MNH */}
                <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Pureza MNH</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-700">
                      100%
                      <span className="text-xs font-bold text-slate-500 ml-1">Gema</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Goma original intacta
                    </span>
                  </div>
                </div>

                {/* KPI 4: Apreciación Histórica */}
                <div className="bg-white p-5 rounded-2xl border border-[#E2DDD5] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">Apreciación Anual</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-amber-600">
                      +8.5%
                      <span className="text-xs font-bold text-slate-500 ml-1">est.</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Catálogos Scott / Yvert
                    </span>
                  </div>
                </div>

              </div>

              {/* Detalle de Composición del Acervo */}
              <div className="bg-white rounded-2xl border border-[#E2DDD5] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#002B5B]">
                      Composición Temática del Patrimonio Custodiado
                    </h4>
                    <p className="text-xs text-slate-500">
                      Distribución de su acervo por categorías filatélicas oficiales
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Bóveda Activa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                  {Object.entries(portfolioStats.categoryCount).map(([category, count]) => (
                    <div key={category} className="p-3.5 rounded-xl bg-[#FAF8F0] border border-[#E2DDD5]/70 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {category}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <strong className="text-lg font-black text-[#002B5B]">
                          {count}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {portfolioStats.totalPieces > 0 ? `${Math.round((count / portfolioStats.totalPieces) * 100)}%` : '0%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Garantía Soberana de Resguardo */}
              <div className="bg-gradient-to-r from-[#002B5B] to-[#001A38] text-white p-6 rounded-2xl border border-white/10 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 text-amber-200/90 font-medium text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-300/80" />
                    <span>Fe Pública y Registro Ministerial</span>
                  </div>
                  <h5 className="font-extrabold text-base text-white">
                    Custodia Notarial y Resguardo Climático
                  </h5>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Todas las piezas que integran su portafolio cuentan con folio individual criptográfico verificado por Correos de Bolivia bajo estándares UPU.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="gold-button px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow shrink-0 cursor-pointer"
                >
                  <span>Ver Actas Notariales</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                </button>
              </div>

              {/* Si no tiene compras aún */}
              {orders.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-[#E2DDD5] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-[#002B5B]">
                    Inicie la Construcción de su Bóveda Filatélica
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Al adquirir sus primeros ejemplares oficiales o piezas del Bicentenario, su portafolio se valorizará en tiempo real con actas notariales individuales.
                  </p>
                  <Link
                    href="/catalogo"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] text-amber-200 text-xs font-semibold transition shadow-sm"
                  >
                    <span>Explorar Catálogo de Inversión</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

            </div>
          ) : activeTab === 'orders' ? (
            /* TAB 2: HISTORIAL DE ADQUISICIONES & ACTAS NOTARIALES */
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#E2DDD5] p-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center mx-auto">
                    <ScrollText className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#002B5B]">No tiene adquisiciones registradas</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Cuando adquiera ejemplares a través de la plataforma oficial, sus comprobantes y actas notariales de autenticidad quedarán archivadas aquí permanentemente.
                  </p>
                  <Link
                    href="/catalogo"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B5B] text-amber-200 text-xs font-semibold transition shadow-sm mt-2"
                  >
                    <span>Ir al Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                orders.map((order: any, idx: number) => {
                  const orderDate = order.created_at 
                    ? new Date(order.created_at).toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Reciente';
                  const items = order.items || [];
                  const totalAmount = Number(order.total_amount || 0);

                  return (
                    <div 
                      key={order.id || idx}
                      className="bg-white rounded-2xl border border-[#E2DDD5] p-5 shadow-sm hover:border-[#002B5B]/40 transition space-y-4"
                    >
                      {/* Order Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2DDD5]">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Folio Oficial de Orden
                          </span>
                          <strong className="text-sm sm:text-base font-mono font-black text-[#002B5B]">
                            {order.order_number}
                          </strong>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Fecha de Registro</span>
                            <span className="text-xs font-medium text-slate-700">{orderDate}</span>
                          </div>
                          {getStatusBadge(order.status || 'VAULT_VERIFIED')}
                        </div>
                      </div>

                      {/* Guía Postal de Despacho Oficial — Amarillo Dominante */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-[#FFFBE6] via-amber-50 to-[#FFFDF5] border-2 border-[#FFD100] space-y-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#002B5B] text-[#FFD100] flex items-center justify-center font-bold shrink-0 shadow-xs border border-[#001A38]">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider block">
                                Guía Postal Oficial (Correos de Bolivia)
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono font-black text-[#002B5B] text-xs sm:text-sm tracking-wider">
                                  {order.tracking_code || 'En generación...'}
                                </span>
                                {order.tracking_code && (
                                  <button
                                    onClick={() => handleCopyTracking(order.tracking_code)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black transition cursor-pointer shadow-2xs ${
                                      copiedCode === order.tracking_code
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[#FFD100] hover:bg-[#FFE043] text-[#002B5B] border border-amber-400'
                                    }`}
                                    title="Copiar guía postal al portapapeles"
                                  >
                                    {copiedCode === order.tracking_code ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>¡Copiada!</span>
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
                            </div>
                          </div>

                          {/* Botón de Rastrear Envío */}
                          {order.tracking_code && (
                            <button
                              onClick={() => openTracking(order.tracking_code)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFD100] hover:bg-[#FFE043] text-[#002B5B] text-xs font-black transition shadow-xs cursor-pointer border border-amber-400"
                            >
                              <Search className="w-3.5 h-3.5 text-[#002B5B]" />
                              <span>Rastrear Envío en Vivo</span>
                            </button>
                          )}
                        </div>

                        {/* Mini Stepper de Progreso del Envío */}
                        <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-2 border-t border-[#002B5B]/10 text-center">
                          {/* 1. Bóveda */}
                          <div className="flex flex-col items-center">
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs">
                              ✓
                            </span>
                            <span className="text-[10px] font-bold text-[#002B5B]">En Bóveda</span>
                            <span className="text-[9px] text-slate-400 hidden sm:inline">Verificado</span>
                          </div>

                          {/* 2. Glassine */}
                          <div className="flex flex-col items-center">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs ${
                              ['GLASSINE_PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {['GLASSINE_PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) ? '✓' : '2'}
                            </span>
                            <span className="text-[10px] font-bold text-[#002B5B]">Empaque Glassine</span>
                            <span className="text-[9px] text-slate-400 hidden sm:inline">Libre de Ácido</span>
                          </div>

                          {/* 3. En Tránsito */}
                          <div className="flex flex-col items-center">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs ${
                              ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status)
                                ? 'bg-emerald-600 text-white'
                                : order.status === 'GLASSINE_PACKED'
                                ? 'bg-[#FFD100] text-[#002B5B] ring-2 ring-amber-300'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(order.status) ? '✓' : '3'}
                            </span>
                            <span className="text-[10px] font-bold text-[#002B5B]">En Tránsito</span>
                            <span className="text-[9px] text-slate-400 hidden sm:inline">Correos Bolivia</span>
                          </div>

                          {/* 4. Entregado */}
                          <div className="flex flex-col items-center">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shadow-xs ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {order.status === 'DELIVERED' ? '✓' : '4'}
                            </span>
                            <span className="text-[10px] font-bold text-[#002B5B]">Entregado</span>
                            <span className="text-[9px] text-slate-400 hidden sm:inline">Destino</span>
                          </div>
                        </div>

                        {/* Destino Info */}
                        {(order.city || order.department) && (
                          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#002B5B]" />
                              <span>Destino: <strong>{order.city || order.department}, Bolivia</strong></span>
                            </span>
                            {order.shipping_address && (
                              <span className="truncate max-w-[220px] text-slate-400 hidden sm:inline" title={order.shipping_address}>
                                {order.shipping_address}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Items in Order */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Piezas Filatélicas en Custodia:
                        </span>
                        <div className="space-y-1.5">
                          {items.map((item: any, itemIdx: number) => (
                            <div 
                              key={itemIdx}
                              className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-[#FAF8F0] border border-[#E2DDD5]/70"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="font-semibold text-[#002B5B]">
                                  {item.product_name || item.name || `Pieza Filatélica #${itemIdx + 1}`}
                                </span>
                              </div>
                              <span className="text-slate-600 font-mono font-bold">
                                {item.quantity} {item.quantity === 1 ? 'ejemplar' : 'ejemplares'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Footer & Actions */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2DDD5]/70">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor de Adquisición</span>
                          <strong className="text-sm sm:text-base font-black text-[#002B5B]">
                            {totalAmount.toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB
                          </strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewCertificate(order)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] text-amber-200 font-semibold text-xs shadow-sm transition cursor-pointer"
                            title="Ver e imprimir acta notarial de autenticidad"
                          >
                            <Award className="w-4 h-4 text-amber-300" />
                            <span>Ver Certificado Notarial</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* TAB 3: SEGUIMIENTO Y GUÍAS DE ENVÍO POSTAL */
            <div className="space-y-4">
              {/* Card de Búsqueda Rápida de Guía — Amarillo Dominante */}
              <div className="bg-gradient-to-r from-[#FFD100] via-[#FFCC00] to-[#F5BE00] rounded-2xl p-5 text-[#002B5B] shadow-sm space-y-3 border-2 border-amber-400">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#002B5B] text-[#FFD100] flex items-center justify-center font-bold shadow-md border-2 border-[#001A38]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-[#002B5B]">
                        Trazabilidad Oficial de Envíos — Correos de Bolivia
                      </h4>
                      <p className="text-xs text-[#002B5B]/85 font-medium">
                        Consulte los hitos notariales, despacho y recepción de sus piezas filatélicas
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#002B5B] text-[#FFD100] font-mono text-xs font-black border border-[#001A38]">
                    {orders.length} {orders.length === 1 ? 'guía registrada' : 'guías registradas'}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ingrese o pegue un número de guía (ej: TRK-... o BO-CORREOS-...)"
                      value={customTrackCode}
                      onChange={(e) => setCustomTrackCode(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border-2 border-[#002B5B]/20 text-[#002B5B] placeholder-slate-400 text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-[#002B5B]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (customTrackCode.trim()) {
                        openTracking(customTrackCode.trim());
                      }
                    }}
                    disabled={!customTrackCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] text-[#FFD100] font-black text-xs transition disabled:opacity-50 cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 border border-[#001A38]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Rastrear</span>
                  </button>
                </div>
              </div>

              {/* Lista de Guías de los Pedidos del Cliente */}
              {orders.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#E2DDD5] p-8">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                    <Truck className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#002B5B]">No tiene guías de envío registradas</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Al adquirir piezas filatélicas en la tienda oficial, se le asignará una guía de valija postal única para el seguimiento paso a paso de su entrega.
                  </p>
                  <Link
                    href="/catalogo"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#002B5B] text-amber-200 text-xs font-semibold transition shadow-sm mt-2"
                  >
                    <span>Explorar Catálogo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: any, idx: number) => {
                    const tracking = order.tracking_code || 'En proceso';
                    const orderDate = order.created_at 
                      ? new Date(order.created_at).toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Reciente';

                    return (
                      <div
                        key={order.id || idx}
                        className="bg-white rounded-2xl border border-[#E2DDD5] p-5 shadow-sm hover:border-[#002B5B]/30 transition space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1EFEB]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#002B5B] flex items-center justify-center border border-amber-200 shrink-0 font-bold">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Nº Guía:
                                </span>
                                <strong className="font-mono text-sm font-black text-[#002B5B]">
                                  {tracking}
                                </strong>
                                {order.tracking_code && (
                                  <button
                                    onClick={() => handleCopyTracking(order.tracking_code)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                      copiedCode === order.tracking_code
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-[#002B5B]'
                                    }`}
                                    title="Copiar guía"
                                  >
                                    {copiedCode === order.tracking_code ? (
                                      <Check className="w-3 h-3 text-white" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>{copiedCode === order.tracking_code ? 'Copiada' : 'Copiar'}</span>
                                  </button>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block">
                                Orden: <strong className="font-mono text-[#002B5B]">{order.order_number}</strong> • Fecha: {orderDate}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status || 'VAULT_VERIFIED')}
                            {order.tracking_code && (
                              <button
                                onClick={() => openTracking(order.tracking_code)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FFD100] hover:bg-[#FFE043] text-[#002B5B] text-xs font-black transition cursor-pointer shadow-xs border border-amber-400"
                              >
                                <Search className="w-3.5 h-3.5 text-[#002B5B]" />
                                <span>Ver Itinerario</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Itinerario y Destino */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-[#FAF8F0] border border-[#E2DDD5]/70 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Origen Postal</span>
                              <span className="font-semibold text-[#002B5B]">Mesa Central — La Paz, Bolivia</span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-[#FAF8F0] border border-[#E2DDD5]/70 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destino Final</span>
                              <span className="font-semibold text-[#002B5B]">
                                {order.city || order.department || 'Bolivia'} {order.shipping_address ? `(${order.shipping_address})` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

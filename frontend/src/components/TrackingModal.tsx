'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface TrackingEvent {
  step: number;
  title: string;
  description: string;
  location: string;
  date: string;
  completed: boolean;
  current: boolean;
}

interface TrackingData {
  tracking_code: string;
  order_number: string;
  status: string;
  status_label: string;
  carrier: string;
  origin: string;
  destination_city: string;
  destination_department: string;
  shipping_address: string;
  customer_name: string;
  total_amount?: string;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  items_count: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unit_price?: string;
    subtotal?: string;
  }>;
  events: TrackingEvent[];
}

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string | null;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  initialCode,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setCopied(false);
      return;
    }

    if (initialCode && initialCode.trim()) {
      const cleanCode = initialCode.trim();
      setSearchInput(cleanCode);
      fetchTracking(cleanCode);
    } else if (searchInput.trim()) {
      fetchTracking(searchInput.trim());
    }
  }, [isOpen, initialCode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchTracking = async (codeToQuery: string) => {
    if (!codeToQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setActiveCode(codeToQuery.trim());

    try {
      const res = await fetch(`${API_BASE_URL}/api/tracking/${encodeURIComponent(codeToQuery.trim())}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success && data.tracking) {
        setTrackingData(data.tracking);
      } else {
        setTrackingData(null);
        setErrorMessage(data.message || 'No se encontró ningún paquete asociado a esta guía postal.');
      }
    } catch (err) {
      setTrackingData(null);
      setErrorMessage('Error al conectar con la central de seguimiento postal. Por favor intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchTracking(searchInput.trim());
    }
  };

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#FFFDF5] rounded-3xl border-2 border-[#FECC36] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Oficial Correos de Bolivia — Amarillo Dominante */}
        <div className="relative bg-[#FECC36] text-[#102542] p-5 sm:p-6 border-b-4 border-[#102542] shadow-sm shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full bg-[#102542]/10 hover:bg-[#102542]/20 text-[#102542] transition cursor-pointer"
            aria-label="Cerrar ventana de seguimiento"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#102542] text-[#FECC36] flex items-center justify-center shadow-lg border-2 border-[#102542] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#102542]/10 border border-[#102542]/20 text-[#102542] font-extrabold text-[10px] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#102542]" />
                <span>Correos de Bolivia — Servicio Filatélico Oficial</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102542] tracking-tight leading-tight">
                Rastreo y Seguimiento Postal
              </h2>
            </div>
          </div>

          {/* Formulario de Búsqueda de Guía con estilo de alto contraste */}
          <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ingrese Nº de Guía Postal (ej: BO-CORREOS-LPZ-001 o TRK-...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-[#102542]/20 text-[#102542] placeholder-slate-400 text-xs sm:text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-[#102542] focus:ring-2 focus:ring-[#102542]/20 shadow-inner transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] text-[#FECC36] font-black text-xs sm:text-sm transition flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer shadow-md border border-[#102542]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FECC36]" />
              ) : (
                <Search className="w-4 h-4 text-[#FECC36]" />
              )}
              <span className="hidden sm:inline">Rastrear</span>
            </button>
          </form>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-[#FFFDF7]">
          {/* Loading State */}
          {isLoading && (
            <div className="py-16 text-center space-y-3 bg-[#FFFBE6] rounded-2xl border-2 border-[#FECC36] p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#FECC36] text-[#102542] flex items-center justify-center mx-auto shadow-md">
                <Loader2 className="w-6 h-6 animate-spin text-[#102542]" />
              </div>
              <h3 className="font-black text-sm text-[#102542]">Consultando bitácora de valijas postales...</h3>
              <p className="text-xs text-amber-900/80">Sincronizando con los centros de distribución de Correos de Bolivia</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && errorMessage && (
            <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FECC36] text-[#102542] flex items-center justify-center mx-auto border-2 border-amber-300 shadow-xs">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm text-[#102542]">Guía Postal no localizada</h4>
              <p className="text-xs text-amber-900 max-w-md mx-auto leading-relaxed">
                {errorMessage}
              </p>
              <span className="inline-block text-[11px] font-bold text-amber-950 bg-[#FECC36]/40 px-3.5 py-1 rounded-full border border-amber-300">
                Verifique que el código coincida con el folio que figura en su portafolio o comprobante.
              </span>
            </div>
          )}

          {/* Success / Loaded Data */}
          {!isLoading && trackingData && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Tarjeta de Guía Postal y Estado General — Amarillo Dominante */}
              <div className="bg-[#FFFBE6] rounded-2xl border-2 border-[#FECC36] p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200/80">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-900 block mb-0.5">
                      Número Oficial de Guía de Envío
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg sm:text-2xl font-mono font-black text-[#102542] tracking-wider">
                        {trackingData.tracking_code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(trackingData.tracking_code)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                          copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#FECC36] hover:bg-[#FFD95E] text-[#102542] border border-amber-400'
                        }`}
                        title="Copiar guía al portapapeles"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Guía</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Badge de Estado Oficial */}
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                      Estado del Despacho
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs ${
                        trackingData.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : trackingData.status === 'SHIPPED' || trackingData.status === 'IN_TRANSIT'
                          ? 'bg-[#FECC36] text-[#102542] border-2 border-amber-400'
                          : trackingData.status === 'GLASSINE_PACKED'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      <span>{trackingData.status_label}</span>
                    </span>
                  </div>
                </div>

                {/* Itinerario Origen -> Destino */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FFF9D6]/80 border-2 border-[#FECC36]/60 space-y-1 shadow-xs">
                    <div className="flex items-center gap-1.5 font-black text-amber-900 uppercase text-[10px] tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-[#102542]" />
                      <span>Origen Filatélico</span>
                    </div>
                    <p className="font-black text-[#102542] text-sm">
                      {trackingData.origin}
                    </p>
                    <p className="text-[11px] text-amber-950 font-medium">
                      Transportista: {trackingData.carrier}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFF9D6]/80 border-2 border-[#FECC36]/60 space-y-1 shadow-xs">
                    <div className="flex items-center gap-1.5 font-black text-amber-900 uppercase text-[10px] tracking-wider">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Destino de Entrega</span>
                    </div>
                    <p className="font-black text-[#102542] text-sm">
                      {trackingData.destination_city || 'Bolivia'}, {trackingData.destination_department || ''}
                    </p>
                    <p className="text-[11px] text-amber-950 font-medium">
                      {trackingData.shipping_address || 'Dirección registrada del titular'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bitácora de Itinerario Postal (Timeline Stepper) */}
              <div className="bg-white rounded-2xl border-2 border-[#FECC36]/70 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 bg-[#FFFBE6] p-3 rounded-xl">
                  <h3 className="font-black text-sm text-[#102542] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Línea de Tiempo y Puntos de Control Postal</span>
                  </h3>
                  <span className="text-[11px] text-[#102542] font-mono font-bold bg-[#FECC36]/40 px-2.5 py-0.5 rounded-full border border-amber-300">
                    Orden {trackingData.order_number}
                  </span>
                </div>

                <div className="relative pl-6 sm:pl-8 space-y-7 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#FECC36]">
                  {trackingData.events.map((event, idx) => (
                    <div key={idx} className="relative group">
                      {/* Círculo indicador */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] transition-all duration-200 border-2 ${
                          event.completed
                            ? 'bg-emerald-600 border-emerald-300 text-white shadow-sm'
                            : event.current
                            ? 'bg-[#FECC36] border-2 border-[#102542] text-[#102542] ring-4 ring-amber-200 shadow-md scale-110'
                            : 'bg-[#FFFDF0] border-2 border-amber-200 text-amber-700'
                        }`}
                      >
                        {event.completed ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span>{event.step}</span>
                        )}
                      </div>

                      {/* Contenido del paso */}
                      <div
                        className={`p-3.5 rounded-xl border transition ${
                          event.current
                            ? 'bg-[#FFFBE6] border-2 border-[#FECC36] shadow-sm'
                            : event.completed
                            ? 'bg-white border-amber-200/80 shadow-2xs'
                            : 'bg-slate-50/50 border-slate-200/50 opacity-70'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4
                            className={`font-black text-xs sm:text-sm ${
                              event.current ? 'text-[#102542]' : event.completed ? 'text-[#102542]' : 'text-slate-500'
                            }`}
                          >
                            {event.title}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {event.date}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed mb-2">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900">
                          <MapPin className="w-3 h-3 text-[#102542]" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Piezas Filatélicas Protegidas en el Paquete */}
              <div className="bg-white rounded-2xl border-2 border-[#FECC36]/70 p-5 shadow-sm space-y-3">
                <div className="bg-[#FFFBE6] p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#102542] uppercase tracking-wider block">
                    Contenido Declarado en Valija Postal ({trackingData.items_count} {trackingData.items_count === 1 ? 'ejemplar' : 'ejemplares'}):
                  </span>
                  <span className="text-[10px] font-bold text-amber-900 uppercase">Valija Sellada</span>
                </div>
                <div className="divide-y divide-amber-100">
                  {trackingData.items.map((it, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-[#102542]">{it.name}</span>
                      </div>
                      <span className="font-mono font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {it.quantity} {it.quantity === 1 ? 'unidad' : 'unidades'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Empty initial state if opened without code */}
          {!isLoading && !errorMessage && !trackingData && (
            <div className="py-12 text-center space-y-3 bg-[#FFFBE6] rounded-2xl border-2 border-[#FECC36] p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#FECC36] text-[#102542] flex items-center justify-center mx-auto border-2 border-amber-300 shadow-md">
                <Package className="w-7 h-7 text-[#102542]" />
              </div>
              <h3 className="font-black text-base text-[#102542]">Ingrese un número de guía oficial</h3>
              <p className="text-xs text-amber-950 max-w-sm mx-auto leading-relaxed">
                Ingrese el código provisto en su correo de confirmación o en su Bóveda personal para consultar el itinerario en tiempo real.
              </p>
            </div>
          )}
        </div>

        {/* Footer — Amarillo Dominante */}
        <div className="p-4 bg-[#FFFBE6] border-t-2 border-[#FECC36] flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-[#102542] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Valija sellada bajo precinto de seguridad postal inviolable.</span>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#102542] hover:bg-[#2C63AC] text-[#FECC36] font-black border border-[#102542] shadow-md transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

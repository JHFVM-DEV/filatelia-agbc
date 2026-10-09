'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  ShoppingBag, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Move,
  RotateCcw,
  Expand,
  Shrink
} from 'lucide-react';
import { StampItem } from '@/data/stamps';

interface StampInspectorModalProps {
  stamp: StampItem | null;
  onClose: () => void;
  onAddToCart: (stamp: StampItem) => void;
}

export const StampInspectorModal: React.FC<StampInspectorModalProps> = ({
  stamp,
  onClose,
  onAddToCart,
}) => {
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [zoomLevel, setZoomLevel] = useState<number>(10); // 2.5x, 5x, 10x
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [isFullZoomMode, setIsFullZoomMode] = useState<boolean>(false); // Modo 100% libre en panel
  const [isFullscreenHD, setIsFullscreenHD] = useState<boolean>(false); // Pantalla Completa 100% HD
  const [fullscreenZoom, setFullscreenZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);

  const [mousePos, setMousePos] = useState<{ x: number; y: number; stampX: number; stampY: number }>({
    x: 0,
    y: 0,
    stampX: 50,
    stampY: 50,
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Cerrar con Escape y detector de pantalla completa nativa
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreenHD) {
          setIsFullscreenHD(false);
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        } else {
          onClose();
        }
      }
    };

    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreenHD, onClose]);

  if (!stamp) return null;

  const currentImage = viewSide === 'front' ? stamp.front_image : stamp.back_image;

  // Cálculo óptico preciso de la posición de la lupa sobre el sello real
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullZoomMode) return;
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;

    const sRect = stage.getBoundingClientRect();
    const iRect = img.getBoundingClientRect();

    // Posición del cursor en el escenario
    const xInStage = e.clientX - sRect.left;
    const yInStage = e.clientY - sRect.top;

    // Verificar si el cursor está sobre la silueta del sello
    const isOverStamp =
      e.clientX >= iRect.left &&
      e.clientX <= iRect.right &&
      e.clientY >= iRect.top &&
      e.clientY <= iRect.bottom;

    setIsZooming(isOverStamp);

    if (isOverStamp && iRect.width > 0 && iRect.height > 0) {
      // Coordenadas relativas exactas al área del sello (0% a 100%)
      const stampX = Math.max(0, Math.min(100, ((e.clientX - iRect.left) / iRect.width) * 100));
      const stampY = Math.max(0, Math.min(100, ((e.clientY - iRect.top) / iRect.height) * 100));

      setMousePos({
        x: xInStage,
        y: yInStage,
        stampX,
        stampY,
      });
    }
  };

  // Controles de Pantalla Completa HD
  const handleWheelFullscreen = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    setFullscreenZoom((prev) => Math.min(4, Math.max(0.5, Number((prev + delta).toFixed(2)))));
  };

  const handleMouseDownFullscreen = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMoveFullscreen = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUpFullscreen = () => {
    setIsDragging(false);
  };

  const handleDoubleClickFullscreen = () => {
    if (fullscreenZoom > 1.2) {
      setFullscreenZoom(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setFullscreenZoom(2);
    }
  };

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const resetFullscreenView = () => {
    setFullscreenZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102542]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#FAF8F0] rounded-3xl shadow-2xl border-2 border-[#E5DFC8] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#102542] px-6 py-4 text-white flex items-center justify-between border-b border-[#2C63AC]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 text-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium tracking-widest text-amber-200 uppercase">
                  Laboratorio de Autenticidad & Peritaje Óptico 10x
                </span>
                <span className="bg-white/10 text-slate-200 text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                  {stamp.category_name}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {stamp.name}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-full transition cursor-pointer"
            title="Cerrar ventana de inspección (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 custom-scrollbar">
          
          {/* Left Visual Inspection Column (Spacious & Adaptive) */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-4">
            
            {/* Controles de Vista y Aumento */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-white p-2 rounded-2xl border border-[#E2DDD5] shadow-xs text-xs">
              
              {/* Switch Anverso / Reverso */}
              <div className="flex items-center gap-1 bg-[#FAF8F0] p-1 rounded-xl border border-[#E2DDD5]">
                <button
                  onClick={() => setViewSide('front')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    viewSide === 'front'
                      ? 'bg-[#102542] text-white shadow-xs'
                      : 'text-[#5A554E] hover:text-[#102542]'
                  }`}
                >
                  <span>Anverso</span>
                </button>
                <button
                  onClick={() => setViewSide('back')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                    viewSide === 'back'
                      ? 'bg-[#102542] text-white shadow-xs'
                      : 'text-[#5A554E] hover:text-[#102542]'
                  }`}
                >
                  <span>Reverso (Goma)</span>
                </button>
              </div>

              {/* Selector de Nivel de Aumento de Laboratorio */}
              <div className="flex items-center gap-1 bg-[#FAF8F0] p-1 rounded-xl border border-[#E2DDD5]">
                <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5">Lupa:</span>
                {[
                  { level: 2.5, label: '2.5x' },
                  { level: 5, label: '5x' },
                  { level: 10, label: '10x Triplete' },
                ].map((z) => (
                  <button
                    key={z.level}
                    onClick={() => {
                      setZoomLevel(z.level);
                      setIsFullZoomMode(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      zoomLevel === z.level && !isFullZoomMode
                        ? 'bg-[#102542] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#102542]'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}

                {/* Botón Pantalla Completa 100% HD */}
                <button
                  onClick={() => {
                    setIsFullscreenHD(true);
                    setFullscreenZoom(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-[#102542] text-white hover:bg-[#2C63AC] shadow-xs active:scale-95"
                  title="Abrir imagen en pantalla completa (100% HD)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>100% HD</span>
                </button>
              </div>

            </div>

            {/* Escenario de Inspección Filatélica (Adaptive Passepartout) */}
            <div 
              ref={stageRef}
              className={`relative w-full h-[360px] sm:h-[440px] md:h-[480px] bg-gradient-to-b from-[#FAF8F0] to-[#F3EDE0] rounded-3xl border-2 border-[#E5DFC8] shadow-inner p-4 sm:p-6 flex items-center justify-center overflow-hidden select-none ${
                isFullZoomMode ? 'overflow-auto cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
              }`}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsZooming(false)}
            >
              {/* Marca de agua / Fondo de seguridad */}
              <div className="absolute inset-0 bg-guilloche opacity-10 pointer-events-none" />

              {/* Botón flotante para pantalla completa rápida */}
              <button
                onClick={() => {
                  setIsFullscreenHD(true);
                  setFullscreenZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-[#102542]/85 hover:bg-[#102542] text-white border border-white/15 backdrop-blur-md transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-semibold active:scale-95"
                title="Ampliar a pantalla completa (100% HD)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Pantalla Completa</span>
              </button>

              {/* Contenedor Passepartout Blanco que encuadra el sello */}
              <div className={`relative flex items-center justify-center p-3 sm:p-4 bg-white rounded-xl shadow-lg border border-[#E5DFC8] transition-all duration-300 ${
                isFullZoomMode ? 'scale-150 sm:scale-175 transition-transform' : 'max-w-full max-h-full'
              }`}>
                {/* Sello renderizado en su proporción exacta (sin recorte ni estiramiento) */}
                <img 
                  ref={imgRef}
                  src={currentImage}
                  alt={stamp.name}
                  className="max-w-full max-h-[300px] sm:max-h-[380px] md:max-h-[420px] w-auto h-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
                  style={{
                    imageRendering: 'auto',
                  }}
                />
              </div>

              {/* Lente de Aumento Virtual 10x Triplete Acromático */}
              {isZooming && !isFullZoomMode && (
                <div 
                  className="absolute pointer-events-none w-44 h-44 rounded-full border-2 border-slate-700/60 shadow-[0_10px_35px_rgba(0,0,0,0.45)] bg-[#FAF8F0] overflow-hidden ring-4 ring-[#102542]/30 hidden sm:block z-30"
                  style={{
                    left: `${mousePos.x}px`,
                    top: `${mousePos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    backgroundImage: `url(${currentImage})`,
                    backgroundPosition: `${mousePos.stampX}% ${mousePos.stampY}%`,
                    backgroundSize: `${zoomLevel * 100}%`,
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Retícula de Medición Óptica Grabada en la Lente */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                    <div className="w-full h-[1px] bg-red-600" />
                    <div className="h-full w-[1px] bg-red-600 absolute" />
                    <div className="w-14 h-14 rounded-full border border-red-600 absolute" />
                  </div>

                  {/* Indicador de Aumento en la Esquina Superior */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#102542]/90 text-[10px] font-mono text-amber-200 font-bold">
                    {zoomLevel}x
                  </div>
                </div>
              )}

              {/* Tooltip de Guía Inferior */}
              <div className="absolute bottom-3 left-3 bg-[#102542]/90 text-[11px] text-slate-200 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 shadow-md">
                <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Desplace el cursor sobre el sello para peritaje con lupa {zoomLevel}x o pulse <strong>100% HD</strong> para pantalla completa
                </span>
              </div>
            </div>

            {/* Certificación y Protocolo de Bóveda */}
            <div className="w-full bg-white p-3.5 rounded-2xl border border-[#E2DDD5] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Autenticidad Verificada: {stamp.condition_label}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
                <span>Custodia Oficial: <strong>Bóveda N° 08-LPZ</strong></span>
              </div>
            </div>

          </div>

          {/* Right Technical Dossier Column */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                  {stamp.catalog_code}
                </span>
                <span className="text-xs text-[#5A554E]">Año: <strong>{stamp.year}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-semibold text-[#102542]">{stamp.country}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#102542] leading-snug">
                {stamp.name}
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-[#5A554E] leading-relaxed">
                {stamp.description}
              </p>

              {/* Ficha Técnica Tabular Exhaustiva */}
              <div className="mt-4 bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden text-xs shadow-xs">
                <div className="bg-[#FAF8F0] px-4 py-2 font-bold text-[#102542] border-b border-[#E2DDD5] uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>Ficha Técnica Filatélica</span>
                  <span className="text-amber-800 font-semibold">Resolución Oficial</span>
                </div>
                <div className="divide-y divide-[#E2DDD5]">
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Valor Facial Original</span>
                    <strong className="text-[#102542] font-mono">{stamp.face_value}</strong>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Dentado / Perforación</span>
                    <strong className="text-[#102542]">{stamp.perforation}</strong>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Técnica de Impresión</span>
                    <strong className="text-[#102542] text-right">{stamp.printing_technique}</strong>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Tipo de Papel</span>
                    <strong className="text-[#102542] text-right">{stamp.paper_type}</strong>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Estado de Goma</span>
                    <strong className="text-emerald-700">{stamp.gum_condition}</strong>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Dimensiones de Plancha</span>
                    <strong className="text-[#102542]">{stamp.dimensions}</strong>
                  </div>
                  <div className="px-4 py-2 flex justify-between items-center">
                    <span className="text-slate-500">Existencia en Custodia</span>
                    <strong className="text-amber-800">{stamp.stock} pieza(s) disponible(s)</strong>
                  </div>
                </div>
              </div>

              {/* Contexto Histórico Oficial */}
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#8A6800]" />
                  Reseña Histórica & Documental
                </h4>
                <p className="text-xs text-amber-900/90 leading-relaxed italic">
                  "{stamp.historical_context}"
                </p>
              </div>
            </div>

            {/* Price and CTA in Modal */}
            <div className="pt-4 border-t border-[#E2DDD5] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Cotización Actual</span>
                <div className="text-2xl font-black text-[#102542]">
                  {stamp.price.toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-xs font-semibold text-slate-600">BOB</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(stamp);
                  onClose();
                }}
                className="gold-button px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adquirir para Colección</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* VISTA EN PANTALLA COMPLETA 100% HD DE ALTA DEFINICIÓN                   */}
      {/* ========================================================================= */}
      {isFullscreenHD && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col select-none animate-in fade-in duration-200"
          onWheel={handleWheelFullscreen}
        >
          {/* Header Superior en Pantalla Completa */}
          <div className="bg-[#0E223C]/90 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 z-20 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-amber-200 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200/90 bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full">
                    100% HD • Resolución de Bóveda
                  </span>
                  <span className="text-slate-400 text-xs font-mono hidden sm:inline">
                    {stamp.catalog_code} • {stamp.year}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                  {stamp.name}
                </h3>
              </div>
            </div>

            {/* Selector Anverso / Reverso en Pantalla Completa */}
            <div className="flex items-center gap-1 bg-[#0B1A2D] p-1 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setViewSide('front')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewSide === 'front'
                    ? 'bg-[#102542] text-white border border-white/10 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Anverso
              </button>
              <button
                onClick={() => setViewSide('back')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewSide === 'back'
                    ? 'bg-[#102542] text-white border border-white/10 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reverso (Goma)
              </button>
            </div>

            {/* Controles de Zoom y Salir */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Controles de Zoom */}
              <div className="hidden md:flex items-center gap-1 bg-[#0B1A2D] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setFullscreenZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Reducir zoom (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={resetFullscreenView}
                  className="px-2.5 py-1 rounded-lg text-slate-200 font-mono font-bold hover:bg-white/10 transition cursor-pointer min-w-[58px] text-center"
                  title="Clic para restablecer al 100%"
                >
                  {Math.round(fullscreenZoom * 100)}%
                </button>
                <button
                  onClick={() => setFullscreenZoom((prev) => Math.min(4, Number((prev + 0.25).toFixed(2))))}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Aumentar zoom (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={resetFullscreenView}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-white/10 transition cursor-pointer"
                  title="Restablecer posición y zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botón Pantalla Completa de Monitor */}
              <button
                onClick={toggleNativeFullscreen}
                className="p-2 rounded-xl bg-[#0B1A2D] hover:bg-[#102542] text-slate-300 hover:text-white border border-white/10 transition cursor-pointer hidden sm:flex items-center justify-center"
                title={isNativeFullscreen ? "Salir de pantalla completa del monitor" : "Pantalla completa de monitor"}
              >
                {isNativeFullscreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </button>

              {/* Cerrar / Salir Pantalla Completa */}
              <button
                onClick={() => {
                  setIsFullscreenHD(false);
                  if (document.fullscreenElement) {
                    document.exitFullscreen?.().catch(() => {});
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition cursor-pointer"
                title="Salir de pantalla completa (Esc)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar (Esc)</span>
              </button>
            </div>
          </div>

          {/* Viewport Interactivo Pantalla Completa */}
          <div 
            className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDownFullscreen}
            onMouseMove={handleMouseMoveFullscreen}
            onMouseUp={handleMouseUpFullscreen}
            onMouseLeave={handleMouseUpFullscreen}
            onDoubleClick={handleDoubleClickFullscreen}
          >
            {/* Guilloche sutil en el fondo de pantalla completa */}
            <div className="absolute inset-0 bg-guilloche opacity-5 pointer-events-none" />

            {/* Imagen centrada y transformable */}
            <div 
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${fullscreenZoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                willChange: 'transform',
              }}
              className="relative flex items-center justify-center pointer-events-none p-6"
            >
              <img 
                src={currentImage}
                alt={stamp.name}
                className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] rounded-xl border border-white/15 bg-white/5 p-3"
                style={{ imageRendering: 'auto' }}
                draggable={false}
              />
            </div>
          </div>

          {/* Footer Inferior con Ayuda y Accesos Rápidos */}
          <div className="bg-[#0E223C]/90 border-t border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs text-slate-400 z-20">
            <div className="flex items-center gap-2 text-[11px]">
              <Move className="w-3.5 h-3.5 text-amber-300" />
              <span>Arrastre con el ratón para mover la pieza • Rueda o doble clic para ampliar</span>
            </div>

            {/* Presets rápidos de zoom */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              {[0.75, 1, 1.5, 2, 3].map((factor) => (
                <button
                  key={factor}
                  onClick={() => {
                    setFullscreenZoom(factor);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    fullscreenZoom === factor
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {Math.round(factor * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

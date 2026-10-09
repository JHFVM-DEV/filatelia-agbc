'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Shield, ZoomIn, CheckCircle2, ShoppingBag, ArrowRight, Sparkles, Clock, Layers } from 'lucide-react';
import { StampItem } from '@/data/stamps';

interface HeroProps {
  stamps: StampItem[];
  onInspect: (stamp: StampItem) => void;
  onAddToCart: (stamp: StampItem) => void;
}

export const Hero: React.FC<HeroProps> = ({
  stamps,
  onInspect,
  onAddToCart,
}) => {
  const [carouselMode, setCarouselMode] = useState<'collections' | 'recent'>('collections');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrar ítems del carrusel: 1 por colección o los últimos 5 agregados
  const carouselItems = useMemo(() => {
    if (!stamps || stamps.length === 0) return [];

    if (carouselMode === 'recent') {
      // Últimos 5 agregados (invertidos para mostrar el más reciente primero)
      return [...stamps].reverse().slice(0, 5);
    }

    // Modo 'collections': Un ejemplo representativo de cada colección/categoría
    const categoriesOrder = [
      'sellos-y-series',
      'fauna-y-flora',
      'dipticos-y-tripticos',
      'hojitas-bloque',
      'sobres-primer-dia',
      'accesorios-filatelicos'
    ];

    const selected: StampItem[] = [];
    const usedCats = new Set<string>();

    for (const cat of categoriesOrder) {
      const match = stamps.find((s) => s.category === cat && s.is_featured) || 
                    stamps.find((s) => s.category === cat);
      if (match && !usedCats.has(match.category)) {
        selected.push(match);
        usedCats.add(match.category);
      }
    }

    // Si aún quedan categorías no contempladas, añadir 1 de cada una
    stamps.forEach((s) => {
      if (!usedCats.has(s.category)) {
        selected.push(s);
        usedCats.add(s.category);
      }
    });

    return selected.slice(0, 6);
  }, [stamps, carouselMode]);

  // Reiniciar índice si cambia el modo
  useEffect(() => {
    setCurrentIndex(0);
  }, [carouselMode]);

  // Transición automática continua cada 5.5 segundos
  useEffect(() => {
    if (carouselItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((curr) => (curr + 1) % carouselItems.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  if (carouselItems.length === 0) return null;

  const currentStamp = carouselItems[currentIndex] || carouselItems[0];

  return (
    <section className="relative bg-[#FECC36] text-[#102542] overflow-hidden py-12 lg:py-18 border-b-2 border-[#E5B728] select-none">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Section Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Focused Stamp Information */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#102542] text-[#FECC36] text-xs font-bold tracking-wide shadow-sm">
                <Award className="w-3.5 h-3.5 text-[#FECC36] shrink-0" />
                <span>Patrimonio Postal & Custodia Filatélica Oficial</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/90 border border-[#102542]/20 text-[#102542] text-xs font-bold shadow-xs">
                {currentStamp.category_name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-[#102542] text-white font-mono text-[11px] font-bold tracking-wider shadow-xs">
                {currentStamp.catalog_code}
              </span>
              <span className="text-[#102542] font-semibold px-1">
                Emisión: <strong className="text-[#102542] font-black">{currentStamp.year}</strong>
              </span>
              <span className="text-[#102542]/40">•</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[11px] font-bold shadow-xs">
                {currentStamp.condition_label}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-[#102542] drop-shadow-xs transition-all duration-300">
              {currentStamp.name}
            </h1>

            <p className="text-[#102542]/90 text-sm sm:text-base leading-relaxed max-w-xl font-medium line-clamp-3">
              {currentStamp.description}
            </p>

            {/* Value Highlights */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#102542]">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl text-[#102542] font-semibold border border-[#102542]/15 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#102542] shrink-0" />
                <span className="whitespace-nowrap">
                  Dentado: <strong className="font-bold text-black">{currentStamp.perforation ? currentStamp.perforation.replace(/milímetros|milimetros/gi, 'mm').trim() : '13.5 x 13.5 mm'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl text-[#102542] font-semibold border border-[#102542]/15 shadow-sm">
                <Shield className="w-4 h-4 text-[#102542] shrink-0" />
                <span className="whitespace-nowrap font-bold text-[#102542]">
                  {currentStamp.rarity_label ? currentStamp.rarity_label.split('/')[0] : 'Pieza de Colección'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl text-[#102542] font-semibold border border-[#102542]/15 shadow-sm">
                <Award className="w-4 h-4 text-[#102542] shrink-0" />
                <span className="whitespace-nowrap font-bold">Certificado Oficial ABC</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
              <button
                onClick={() => onAddToCart(currentStamp)}
                className="px-5 sm:px-6 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 bg-[#102542] hover:bg-[#122B4D] text-[#FECC36] shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#FECC36]" />
                <span>Adquirir ({currentStamp.price.toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB)</span>
              </button>

              <button
                onClick={() => onInspect(currentStamp)}
                className="px-4 sm:px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#102542] bg-white hover:bg-slate-50 border border-[#102542]/25 transition flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <ZoomIn className="w-4 h-4 text-[#102542]" />
                <span>Laboratorio 10x</span>
              </button>

              <Link
                href="/catalogo"
                className="px-4 sm:px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#102542] bg-white/60 hover:bg-white border border-[#102542]/20 transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-4 h-4 text-[#102542]" />
              </Link>
            </div>

          </div>

          {/* Right Column: VISIBLE SLIDING CAROUSEL TRACK */}
          <div className="lg:col-span-6 relative py-4 flex flex-col items-center">
            
            {/* Selector de Modo de Carrusel: 1 por Colección vs Últimos 5 */}
            <div className="flex items-center gap-2 mb-4 bg-white/70 p-1.5 rounded-2xl border border-[#102542]/15 shadow-md text-xs z-10 backdrop-blur-md">
              <button
                onClick={() => setCarouselMode('collections')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  carouselMode === 'collections'
                    ? 'bg-[#102542] text-[#FECC36] shadow-sm'
                    : 'text-[#102542] hover:bg-white/80'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1 por Colección</span>
              </button>

              <button
                onClick={() => setCarouselMode('recent')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  carouselMode === 'recent'
                    ? 'bg-[#102542] text-[#FECC36] shadow-sm'
                    : 'text-[#102542] hover:bg-white/80'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Últimos 5 Agregados</span>
              </button>
            </div>

            {/* Sliding Track Viewport */}
            <div className="w-full overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {carouselItems.map((stamp, idx) => {
                  const isSelected = idx === currentIndex;

                  return (
                    <div 
                      key={`${stamp.id}-${idx}`}
                      className="w-full shrink-0 flex justify-center px-3"
                    >
                      <div 
                        onClick={() => handleSelectSlide(idx)}
                        className={`relative w-full max-w-md bg-[#FAF8F0] p-6 sm:p-7 rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer ${
                          isSelected 
                            ? 'border-[#102542] ring-4 ring-white/10 scale-100 shadow-2xl'
                            : 'border-[#E2DDD5] opacity-60 hover:opacity-90 scale-95'
                        } text-[#102542]`}
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between mb-3 text-xs">
                          <div className="bg-[#102542]/10 text-slate-700 text-[10px] font-mono font-medium px-2.5 py-1 rounded-full">
                            {carouselMode === 'collections' ? stamp.category_name : `Novedad #${idx + 1}`}
                          </div>
                          <div className="bg-amber-500/15 text-amber-900 text-[10px] font-medium px-3 py-1 rounded-full flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-700" />
                            <span>{stamp.rarity_label ? stamp.rarity_label.split('/')[0] : 'Oficial'}</span>
                          </div>
                        </div>

                        {/* Passepartout Stamp Frame Adaptable para horizontal y vertical */}
                        <div className="bg-white p-4 rounded-2xl border border-[#E5DFC8] shadow-inner flex flex-col items-center">
                          <div className="relative w-full max-w-[280px] h-56 rounded-lg overflow-hidden bg-slate-50 border-4 border-white shadow-md flex items-center justify-center">
                            <Image 
                              src={stamp.front_image}
                              alt={stamp.name}
                              fill
                              sizes="(max-width: 768px) 85vw, 280px"
                              className="object-contain p-2 hover:scale-105 transition duration-500"
                              priority={idx === 0}
                            />
                          </div>

                          <div className="text-center mt-4 w-full">
                            <span className="text-[11px] font-bold tracking-widest text-[#8A6800] uppercase">
                              {stamp.catalog_code}
                            </span>
                            <h3 className="font-bold text-base text-[#102542] line-clamp-1 mt-0.5">
                              {stamp.name}
                            </h3>
                            <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-1">
                              <span>Emisión: <strong>{stamp.year}</strong></span>
                              <span>•</span>
                              <span className="text-slate-700 font-medium bg-slate-200/70 px-2.5 py-0.5 rounded-full text-[11px]">
                                {stamp.condition === 'MINT_NH' ? 'MINT NH (Goma Intacta)' : stamp.condition}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#E5DFC8]">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Cotización de Bóveda</div>
                            <div className="text-2xl font-black text-[#102542]">
                              {stamp.price.toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-600">BOB</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspect(stamp);
                            }}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#102542] bg-amber-100 hover:bg-amber-200 border border-amber-300 transition flex items-center gap-1.5 shadow-sm hover:scale-105 cursor-pointer"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>Examinar</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dots / Navigation Tickers Below Carousel */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {carouselItems.map((stamp, idx) => (
                <button
                  key={`dot-${stamp.id}-${idx}`}
                  onClick={() => handleSelectSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-8 bg-[#102542] shadow-sm'
                      : 'w-2.5 bg-[#102542]/30 hover:bg-[#102542]/60'
                  }`}
                  title={carouselMode === 'collections' ? stamp.category_name : `Pieza ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

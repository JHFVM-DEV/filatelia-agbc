'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Award, BookOpen, Clock, Layers, ZoomIn } from 'lucide-react';
import type { StampItem } from '@/data/stamps';

interface HeroProps {
  stamps: StampItem[];
  onInspect: (stamp: StampItem) => void;
  onAddToCart: (stamp: StampItem) => void;
}

type Selection = 'collections' | 'recent';
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#102542]';

export function Hero({ stamps, onInspect }: HeroProps) {
  const [selection, setSelection] = useState<Selection>('collections');
  const [index, setIndex] = useState(0);
  const pieces = useMemo(() => {
    if (selection === 'recent') {
      return [...stamps].reverse().slice(0, 5);
    }
    const categories = ['sellos-y-series', 'fauna-y-flora', 'dipticos-y-tripticos', 'hojitas-bloque', 'sobres-primer-dia', 'accesorios-filatelicos'];
    return [...new Set([...categories, ...stamps.map((stamp) => stamp.category)])].flatMap((category) => {
      const piece = stamps.find((stamp) => stamp.category === category && stamp.is_featured)
        ?? stamps.find((stamp) => stamp.category === category);
      return piece ? [piece] : [];
    }).slice(0, 6);
  }, [stamps, selection]);

  useEffect(() => {
    if (pieces.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % pieces.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [pieces.length, selection]);

  if (!pieces.length) return null;
  const currentIndex = index % pieces.length;
  const stamp = pieces[currentIndex];
  const conditions: Record<string, string> = {
    MINT_NH: 'Nuevo sin charnela · MNH', MINT_LH: 'Nuevo con charnela · MH',
    USED: 'Usado / matasellado', FDC: 'Sobre de primer día · FDC',
  };
  const details = [
    ['Emisión', `${stamp.country || 'Bolivia'} · ${stamp.year}`],
    ['Estado de conservación', conditions[stamp.condition] || stamp.condition_label || 'Consultar ficha'],
    ['Dentado', stamp.perforation || 'Consultar ficha'],
    ['Valor facial', stamp.face_value || 'Consultar ficha'],
  ];
  const carouselItems = pieces;
  const carouselMode = selection;
  const setCarouselMode = (mode: Selection) => { setSelection(mode); setIndex(0); };
  const handleSelectSlide = (position: number) => setIndex(position);

  return (
    <section aria-labelledby="collector-hero-title" aria-roledescription="carrusel" className="border-b border-[#102542]/15 bg-[#FECC36] text-[#102542]">
      <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-10 lg:pt-6 lg:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs">
              <span className="h-px w-8 bg-[#102542]" aria-hidden="true" />Catálogo oficial
            </p>
            <h1 id="collector-hero-title" className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl xl:text-[3.5rem]">
              La historia de Bolivia,<br /><span className="font-serif font-normal italic">en tu colección.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#102542]/85 sm:text-lg">
              Descubre emisiones, explora sus detalles y encuentra la próxima pieza para tu álbum filatélico.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogo" className={`inline-flex items-center justify-center gap-3 rounded-xl bg-[#102542] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#18395f] ${focus}`}>
                <BookOpen className="h-4 w-4" /> Explorar catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => onInspect(stamp)} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#102542]/30 px-5 py-3.5 text-sm font-bold transition-colors hover:bg-white/35 ${focus}`}>
                <ZoomIn className="h-4 w-4" /> Examinar sello
              </button>
            </div>
            <div className="mt-9 border-t border-[#102542]/20 pt-6 sm:mt-12">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em]">La pieza en detalle</p>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-5 text-sm">
                {details.map(([label, value]) => <div key={label}><dt className="mb-1 text-xs text-[#102542]/70">{label}</dt><dd className="font-semibold">{value}</dd></div>)}
              </dl>
              <button type="button" onClick={() => onInspect(stamp)} aria-haspopup="dialog" className={`mt-5 inline-flex items-center gap-2 text-left text-sm font-bold underline decoration-[#102542]/35 underline-offset-4 hover:decoration-[#102542] ${focus}`}>
                Consultar ficha de esta pieza <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: VISIBLE SLIDING CAROUSEL TRACK */}
          <div className="min-w-0 relative py-4 flex flex-col items-center">

            {/* Selector de Modo de Carrusel: 1 por Colección vs Últimos 5 */}
            <div className="flex items-center gap-2 mb-4 bg-white/70 p-1.5 rounded-2xl border border-[#102542]/15 shadow-md text-xs z-10 backdrop-blur-md">
              <button
                onClick={() => setCarouselMode('collections')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${carouselMode === 'collections'
                  ? 'bg-[#102542] text-[#FECC36] shadow-sm'
                  : 'text-[#102542] hover:bg-white/80'
                  }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1 por Colección</span>
              </button>

              <button
                onClick={() => setCarouselMode('recent')}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${carouselMode === 'recent'
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
                        className={`relative w-full max-w-md bg-[#FAF8F0] p-6 sm:p-7 rounded-3xl shadow-2xl border-2 transition-all duration-500 cursor-pointer ${isSelected
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
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === idx
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
}

'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Search, SlidersHorizontal, ZoomIn, ShoppingBag, Heart, Check, Sparkles, Filter } from 'lucide-react';
import { StampItem, CATEGORIES_LIST } from '@/data/stamps';

interface CatalogSectionProps {
  stamps: StampItem[];
  onInspect: (stamp: StampItem) => void;
  onAddToCart: (stamp: StampItem) => void;
  onToggleWishlist: (stampId: number) => void;
  wishlist: number[];
  initialCategory?: string;
}

interface CatalogCardProps {
  stamp: StampItem;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: (stampId: number) => void;
  onInspect: (stamp: StampItem) => void;
  onAddToCart: (stamp: StampItem) => void;
}

const CatalogCard: React.FC<CatalogCardProps> = ({
  stamp,
  index,
  isWishlisted,
  onToggleWishlist,
  onInspect,
  onAddToCart,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '120px 0px 60px 0px',
      }
    );

    observer.observe(el);

    // Fallback de seguridad: garantiza que la pieza sea visible incluso si el scroll/viewport se demora
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Desfase escalonado elegante según la columna en la cuadrícula
  const staggerDelay = `${(index % 3) * 85}ms`;

  return (
    <div 
      ref={cardRef}
      style={{
        transitionDelay: isVisible ? staggerDelay : '0ms',
      }}
      className={`catalog-scroll-card museum-card bg-white rounded-2xl border border-[#E2DDD5] flex flex-col justify-between overflow-hidden group ${
        isVisible ? 'is-visible' : ''
      }`}
    >
      {/* Vista previa superior con Passepartout */}
      <div className="relative p-6 bg-[#FAF8F0] border-b border-[#E2DDD5] flex items-center justify-center min-h-[260px]">
        
        {/* Badge Condición */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#102542] text-white shadow-sm">
            {stamp.condition === 'MINT_NH' ? 'MINT NH' : stamp.condition}
          </span>
          {stamp.rarity === 'MUSEUM_PIECE' && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#102542]/5 text-[#102542] border border-[#102542]/15">
              PIEZA DE MUSEO
            </span>
          )}
          {stamp.rarity === 'VERY_RARE' && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
              EDICIÓN DE GALA
            </span>
          )}
        </div>

        {/* Botón de Lista de Deseos */}
        <button
          onClick={() => onToggleWishlist(stamp.id)}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
            isWishlisted 
              ? 'bg-rose-50 text-rose-600 border-rose-200' 
              : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-600 border-slate-200 hover:bg-white'
          }`}
          title={isWishlisted ? 'Quitar de lista de deseos' : 'Guardar en lista de deseos'}
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? 'fill-rose-600 scale-110' : ''}`} />
        </button>

        {/* Montura Passepartout del sello */}
        <div className="relative w-44 h-48 bg-white p-3 rounded shadow-md border border-[#E5DFC8] flex items-center justify-center group-hover:scale-[1.025] group-hover:border-[#8A6800]/40 group-hover:shadow-lg transition-all duration-500 ease-out">
          <div className="relative w-full h-full">
            <Image 
              src={stamp.front_image}
              alt={stamp.name}
              fill
              sizes="(max-width: 640px) 75vw, (max-width: 1024px) 35vw, 220px"
              priority={index < 4}
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* Botón Examinar Pieza al pasar el cursor */}
        <button
          onClick={() => onInspect(stamp)}
          className="absolute bottom-3 bg-[#102542]/95 hover:bg-[#102542] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 shadow-md backdrop-blur-sm"
        >
          <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
          <span>Examinar Pieza</span>
        </button>
      </div>

      {/* Detalles técnicos y filatélicos */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#5A554E] font-medium mb-1">
            <span className="text-[#8A6800] font-bold tracking-wider">{stamp.catalog_code}</span>
            <span>Año: <strong>{stamp.year}</strong></span>
          </div>

          <h3 className="font-bold text-base text-[#102542] group-hover:text-[#2C63AC] transition line-clamp-2">
            {stamp.name}
          </h3>

          <p className="mt-2 text-xs text-[#5A554E] line-clamp-2 leading-relaxed">
            {stamp.description}
          </p>

          {/* Badges Técnicos y Disponibilidad */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-slate-600">
            <span className="bg-[#FAF8F0] px-2 py-0.5 rounded border border-[#E2DDD5]">
              Dentado: {stamp.perforation}
            </span>
            <span className="bg-[#FAF8F0] px-2 py-0.5 rounded border border-[#E2DDD5]">
              Técnica: {stamp.printing_technique.split(' ')[0]}
            </span>
            <span className={`px-2 py-0.5 rounded border font-semibold ${
              stamp.stock === 1
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : stamp.stock <= 5
                  ? 'bg-amber-50/60 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}>
              {stamp.stock === 1 
                ? 'Único ejemplar en bóveda' 
                : stamp.stock <= 5 
                  ? `Solo ${stamp.stock} piezas en custodia` 
                  : `${stamp.stock} ejemplares en bóveda`}
            </span>
          </div>
        </div>

        {/* Cotización y Acción de Carrito */}
        <div className="mt-6 pt-4 border-t border-[#E2DDD5] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#5A554E] font-medium">Cotización</div>
            <div className="text-xl font-extrabold text-[#102542]">
              {stamp.price.toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-500">BOB</span>
            </div>
          </div>

          <button
            onClick={() => onAddToCart(stamp)}
            className="gold-button px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
            title="Agregar a la orden de colección"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Adquirir</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  stamps,
  onInspect,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  initialCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHeaderVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filteredStamps = useMemo(() => {
    return stamps.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Condition filter
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false;
      }
      // Rarity filter
      if (selectedRarity !== 'all' && item.rarity !== selectedRarity) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCode = item.catalog_code.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesDesc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'year_desc') return b.year - a.year;
      if (sortBy === 'year_asc') return a.year - b.year;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [stamps, selectedCategory, searchQuery, selectedCondition, selectedRarity, sortBy]);

  return (
    <section id="catalogo" className="py-16 bg-[#FAF8F0] min-h-[800px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header con revelado por scroll */}
        <div 
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-10 transition-all duration-700 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-xs font-bold tracking-widest text-[#8A6800] uppercase inline-block mb-1">
            Galería Postal Soberana
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102542]">
            Catálogo Oficial de Piezas Filatélicas
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5A554E]">
            Examine las características técnicas de cada ejemplar, su estado de goma original y procedencia institucional.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar mb-8">
          {CATEGORIES_LIST.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-[#FECC36] text-[#102542] font-black border-[#E5B728] shadow-sm'
                    : 'bg-white text-[#5A554E] hover:text-[#102542] hover:bg-[#FAF5E6] hover:border-slate-300 border-[#E2DDD5] font-medium'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2DDD5] shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por sello, serie o código Scott..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-[#E2DDD5] focus:outline-none focus:border-[#102542] text-[#102542] bg-[#FAF8F0]/50 placeholder:text-slate-400"
            />
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Condition Filter */}
            <div className="flex items-center gap-1 text-xs text-[#5A554E]">
              <Filter className="w-3.5 h-3.5 text-[#102542]" />
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-lg border border-[#E2DDD5] bg-[#FAF8F0]/50 text-[#102542] focus:outline-none focus:border-[#102542]"
              >
                <option value="all">Todas las Condiciones</option>
                <option value="MINT_NH">MINT NH (Goma Intacta)</option>
                <option value="MINT_LH">MINT LH (Charnela)</option>
                <option value="FDC">FDC (Sobre Primer Día)</option>
                <option value="USED">Usado / Matasellado</option>
              </select>
            </div>

            {/* Rarity Filter */}
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-[#E2DDD5] bg-[#FAF8F0]/50 text-[#102542] focus:outline-none focus:border-[#102542]"
            >
              <option value="all">Todas las Rarezas</option>
              <option value="MUSEUM_PIECE">Pieza de Museo</option>
              <option value="VERY_RARE">Muy Rara</option>
              <option value="RARE">Rara</option>
              <option value="SCARCE">Escasa</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-[#E2DDD5] bg-[#FAF8F0]/50 text-[#102542] focus:outline-none focus:border-[#102542] font-medium"
            >
              <option value="featured">Destacados de Bóveda</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="year_asc">Año: Más Antiguos Primero</option>
              <option value="year_desc">Año: Más Recientes Primero</option>
            </select>

          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6 text-xs text-[#5A554E]">
          <span>Mostrando <strong>{filteredStamps.length}</strong> piezas de colección disponibles</span>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => { setSelectedCategory('all'); setSelectedCondition('all'); setSelectedRarity('all'); setSearchQuery(''); }}
              className="text-[#102542] underline hover:text-[#8A6800]"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Stamps Grid */}
        {filteredStamps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2DDD5] p-12 text-center max-w-md mx-auto">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#102542]">No se encontraron piezas con estos criterios</h4>
            <p className="text-xs text-[#5A554E] mt-1">Pruebe ajustando el término de búsqueda o cambiando la condición seleccionada.</p>
          </div>
        ) : (
          <div 
            key={`${selectedCategory}-${selectedCondition}-${selectedRarity}-${sortBy}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredStamps.map((stamp, index) => (
              <CatalogCard
                key={stamp.id}
                stamp={stamp}
                index={index}
                isWishlisted={wishlist.includes(stamp.id)}
                onToggleWishlist={onToggleWishlist}
                onInspect={onInspect}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};


'use client';
import { API_BASE_URL, normalizeImageUrl } from '@/config/api';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Award, Lock, Sparkles, ChevronRight, PackageCheck } from 'lucide-react';
import { CatalogSection } from '@/components/CatalogSection';
import { INITIAL_STAMPS, StampItem } from '@/data/stamps';
import { useStore } from '@/context/StoreContext';

// Carga diferida del modal de inspección óptica 10x
const StampInspectorModal = dynamic(
  () => import('@/components/StampInspectorModal').then((m) => m.StampInspectorModal),
  { ssr: false }
);

function CatalogContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('categoria') || undefined;

  const [stamps, setStamps] = useState<StampItem[]>(INITIAL_STAMPS);
  const [inspectingStamp, setInspectingStamp] = useState<StampItem | null>(null);

  const { addToCart, toggleWishlist, wishlist } = useStore();

  // Sincronizar catálogo con API de Laravel si está disponible
  useEffect(() => {
    const fetchBackendProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            const mapped: StampItem[] = json.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              catalog_code: p.catalog_code || 'CAT-BO',
              category: p.category?.slug || 'sellos-y-series',
              category_name: p.category?.name || 'Sellos Oficiales',
              price: parseFloat(p.price),
              face_value: p.face_value || '10.00 BOB',
              year: p.year,
              country: p.country,
              condition: p.condition,
              condition_label:
                p.condition === 'MINT_NH'
                  ? 'MINT (Goma Intacta NH)'
                  : p.condition === 'MINT_LH'
                    ? 'MINT (Charnela LH)'
                    : p.condition === 'USED'
                      ? 'Usado / Matasellado'
                      : p.condition === 'FDC'
                        ? 'Sobre Primer Día (FDC)'
                        : p.condition || 'Conservación Oficial',
              rarity: p.rarity,
              rarity_label:
                p.rarity === 'MUSEUM_PIECE'
                  ? 'Pieza de Museo'
                  : p.rarity === 'VERY_RARE'
                    ? 'Muy Rara (Gala)'
                    : p.rarity === 'RARE'
                      ? 'Rara de Colección'
                      : p.rarity === 'SCARCE'
                        ? 'Escasa en Bóveda'
                        : 'Emisión Conmemorativa',
              certified: p.certified,
              stock: p.stock,
              perforation: p.perforation ? p.perforation.replace(/milímetros|milimetros/gi, 'mm').trim() : '13.5 x 13.5 mm',
              printing_technique: p.printing_technique || 'Calcografía Oficial',
              paper_type: p.paper_type || 'Papel verjurado',
              gum_condition: p.gum_condition || 'Goma original intacta',
              dimensions: p.dimensions || '28 x 35 mm',
              front_image: normalizeImageUrl(p.front_image),
              back_image: normalizeImageUrl(p.back_image),
              is_featured: p.is_featured,
              description: p.description || '',
              historical_context: p.historical_context || '',
            }));
            setStamps(mapped);
          }
        }
      } catch {
        // Fallback a INITIAL_STAMPS si la API no responde
      }
    };

    fetchBackendProducts();
  }, []);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Institutional Catalog Header Banner - Amarillo Postal Dominante */}
      <section className="bg-[#FECC36] text-[#102542] pt-10 pb-12 border-b-2 border-[#E5B728] relative overflow-hidden shadow-sm">
        {/* Subtle Pattern */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[#102542]/80 mb-4 font-bold">
            <Link href="/" className="hover:text-black transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#102542]/60" />
            <span className="text-[#102542] font-extrabold">Catálogo y Emisiones</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#102542] text-[#FECC36] text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#FECC36]" />
                <span>Acervo Numismático & Postal Oficial</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102542] tracking-tight">
                Catálogo de Sellos y Emisiones
              </h1>
              <p className="text-sm sm:text-base text-[#102542]/85 leading-relaxed font-medium">
                Explore nuestra colección de sellos conmemorativos, primeras emisiones de 1866, hojitas bloque de gala y material de conservación con peritaje científico y certificado notarial de autenticidad.
              </p>
            </div>

            {/* Quick Guarantees Pill */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-xs">
              <div className="flex items-center gap-2 bg-[#102542] px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#FECC36]" />
                <span>Goma Original MNH Auditada</span>
              </div>
              <div className="flex items-center gap-2 bg-[#102542] px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-sm">
                <Award className="w-4 h-4 text-[#FECC36]" />
                <span>Certificado Notarial Foliado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog with Filters & Museum Cards */}
      <CatalogSection
        stamps={stamps}
        onInspect={(stamp) => setInspectingStamp(stamp)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        wishlist={wishlist}
        initialCategory={urlCategory}
      />

      {/* Trust & Dispatch Assurance Bar */}
      <section className="bg-[#102542] text-white py-10 border-t-4 border-[#FECC36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-3 bg-[#102542]/60 p-4 rounded-xl border border-slate-700">
              <PackageCheck className="w-6 h-6 text-[#FECC36] shrink-0" />
              <div>
                <strong className="block text-white font-bold">Valija Postal Asegurada</strong>
                <span>Despacho oficial con código de rastreo en todo el país.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#102542]/60 p-4 rounded-xl border border-slate-700">
              <ShieldCheck className="w-6 h-6 text-[#FECC36] shrink-0" />
              <div>
                <strong className="block text-white font-bold">Autenticidad Notarial</strong>
                <span>Certificado físico sellado en seco para piezas de colección.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#102542]/60 p-4 rounded-xl border border-slate-700">
              <Lock className="w-6 h-6 text-[#FECC36] shrink-0" />
              <div>
                <strong className="block text-white font-bold">Protección Glassine</strong>
                <span>Empaque neutro libre de ácido para resguardar la goma.</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#102542]/60 p-4 rounded-xl border border-slate-700">
              <Award className="w-6 h-6 text-[#FECC36] shrink-0" />
              <div>
                <strong className="block text-white font-bold">Garantía UPU</strong>
                <span>Piezas homologadas bajo normas postales internacionales.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stamp Inspector Modal with 10x Magnifier */}
      <StampInspectorModal
        stamp={inspectingStamp}
        onClose={() => setInspectingStamp(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F0] flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3 text-[#102542]">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold tracking-wider uppercase">Cargando Bóveda Filatélica...</span>
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

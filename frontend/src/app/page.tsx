'use client';
import { API_BASE_URL, normalizeImageUrl } from '@/config/api';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  Award, 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Compass, 
  ShoppingBag, 
  Landmark, 
  ScrollText, 
  Microscope, 
  Shield, 
  ChevronRight
} from 'lucide-react';
import { Hero } from '@/components/Hero';
import { CollectorClub } from '@/components/CollectorClub';
import { INITIAL_STAMPS, StampItem } from '@/data/stamps';
import { useStore } from '@/context/StoreContext';

// Carga perezosa del modal de lupa e inspección 10x
const StampInspectorModal = dynamic(
  () => import('@/components/StampInspectorModal').then((m) => m.StampInspectorModal),
  { ssr: false }
);

export default function Home() {
  const [stamps, setStamps] = useState<StampItem[]>(INITIAL_STAMPS);
  const [inspectingStamp, setInspectingStamp] = useState<StampItem | null>(null);
  const [activeAnatomy, setActiveAnatomy] = useState<number>(0);

  const { addToCart } = useStore();

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
        // Fallback a INITIAL_STAMPS
      }
    };

    fetchBackendProducts();
  }, []);

  // Anatomía educativa del sello postal (Módulo formativo Correos España)
  const anatomyPoints = [
    {
      title: 'El Dentado y Perforación',
      badge: 'Odontometría Oficial',
      description: 'Línea de orificios troquelados que permite la separación limpia de cada ejemplar sin rasgar la viñeta. Se mide con odontómetro expresando la cantidad de dientes por cada 20 milímetros (ej: 13.5 x 13.5 mm). Un dentado completo sin roturas eleva sustancialmente la cotización de la pieza.',
      tip: 'Los sellos clásicos de 1866 eran "imperforados" y se cortaban a tijera en las estafetas postales.',
    },
    {
      title: 'Papel de Seguridad y Filigrana',
      badge: 'Garantía Anti-Falsificación',
      description: 'Soporte físico elaborado en algodón o pulpa libre de ácido. Muchos ejemplares históricos incorporan filigranas (marcas de agua transparentes como soles radiantes, escudos o monogramas) visibles únicamente al trasluz o con bencina química especializada.',
      tip: 'Nuestras piezas de bóveda se conservan sobre papel verjurado químicamente inerte.',
    },
    {
      title: 'Goma Original y Estado MNH',
      badge: 'Grado Máximo de Conservación',
      description: 'La capa adhesiva vegetal arábiga aplicada en el reverso durante la impresión. El estado MNH (Mint Never Hinged) certifica que la goma está 100% virgen, sin marcas de fijasellos ni charnelas procedentes de álbumes decimonónicos.',
      tip: 'La goma original intacta es el indicador supremo de valor patrimonial en la filatelia moderna.',
    },
    {
      title: 'Matasellos Conmemorativo',
      badge: 'Cancelación Histórica',
      description: 'La estampación de tinta postal que anula el sello certificando su recorrido o conmemoración. En los Sobres de Primer Día (FDC), el matasellos se diseña con una ilustración alusiva exclusiva y se aplica únicamente en la fecha inaugural de la emisión.',
      tip: 'Un matasellos nítido y centrado convierte una carta ordinaria en un documento de valor museístico.',
    },
    {
      title: 'Viñeta, Valor Facial y Pie de Imprenta',
      badge: 'Arte Calcográfico',
      description: 'La obra artística central grabada en talla dulce o huecograbado. Incluye la denominación monetaria (centavos, reales o bolivianos) y en los bordes inferiores el pie de imprenta con el nombre del grabador y la imprenta ministerial emisora.',
      tip: 'Muchos sellos bolivianos fueron impresos en la American Bank Note Co. de Nueva York y la Casa de Moneda.',
    },
  ];

  // Grandes Colecciones y Series Temáticas (Navegación al Catálogo)
  const featuredCollections = [
    {
      id: 'bicentenario',
      title: 'Emisión Bicentenario (1825–2025)',
      subtitle: '200 Años de Soberanía e Historia Patria',
      description: 'Homenaje de gala conmemorativo al Bicentenario de la República de Bolivia. Pliegos de lujo con dorados al fuego, filigrana de seguridad y hojitas bloque numeradas.',
      image: '/images/stamps/sello-bicentenario-batalla-de-la-tablada-2017.png',
      tag: 'Magna Emisión',
      categorySlug: 'hojitas-bloque',
      badgeColor: 'bg-white/[0.08] text-amber-200 border-white/10',
    },
    {
      id: 'clasicos',
      title: 'Los Cóndores y Primeros Sellos',
      subtitle: 'El Origen de la Filatelia Boliviana',
      description: 'La histórica tradición postal oficial soberana. Grabados al aguafuerte sobre planchas de cobre, piezas cumbres de museos internacionales.',
      image: '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png',
      tag: 'Piezas de Museo',
      categorySlug: 'sellos-y-series',
      badgeColor: 'bg-white/[0.08] text-blue-200 border-white/10',
    },
    {
      id: 'biodiversidad',
      title: 'Flora, Fauna & Riqueza Andino-Amazónica',
      subtitle: 'Patrimonio Natural y Especies Protegidas',
      description: 'Series dedicadas a la biodiversidad del Madidi, los bosques secos de la Chiquitania, el jucumari, la paraba barba azul y orquídeas endémicas del territorio nacional.',
      image: '/images/stamps/sello-colibri-cometa-sappho-sparganurus-potosi-2007.png',
      tag: 'Temática Natural',
      categorySlug: 'fauna-y-flora',
      badgeColor: 'bg-white/[0.08] text-emerald-200 border-white/10',
    },
    {
      id: 'fdc',
      title: 'Dípticos, Trípticos & Arte Sacro',
      subtitle: 'Documentos Postales y Arte Virreinal',
      description: 'Ediciones polícromas de alta resolución que rescatan el acervo pictórico colonial virreinal y conmemoraciones nacionales.',
      image: '/images/stamps/sello-navidad-arte-sacro-triptico-2007.png',
      tag: 'Arte Sacro',
      categorySlug: 'dipticos-y-tripticos',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    },
    {
      id: 'soberania',
      title: 'Soberanía Postal & Telecomunicaciones',
      subtitle: 'Patrimonio Institucional del Estado',
      description: 'Emisiones que certifican la soberanía postal, hitos de desarrollo nacional, tratados y telecomunicaciones bolivianas.',
      image: '/images/stamps/sello-att-soberania-postal-y-telecomunicaciones-2015.png',
      tag: 'Patrimonio Soberano',
      categorySlug: 'sellos-y-series',
      badgeColor: 'bg-amber-400/15 text-amber-200 border-amber-300/40',
    },
    {
      id: 'hojitas',
      title: 'Recursos Naturales & Aguas del Silala',
      subtitle: 'Ediciones Especiales de Bóveda',
      description: 'Series y pliegos dedicados a la protección de los recursos naturales soberanos y manantiales altoandinos.',
      image: '/images/stamps/sello-manantiales-del-silala-potosi-18bs-2016.png',
      tag: 'Pliegos de Gala',
      categorySlug: 'sellos-y-series',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO SHOWCASE CON CARRUSEL DESLIZANTE DE BÓVEDA                      */}
      {/* ========================================================================= */}
      <Hero
        stamps={stamps}
        onInspect={(stamp) => setInspectingStamp(stamp)}
        onAddToCart={addToCart}
      />

      {/* ========================================================================= */}
      {/* 2. ¿QUÉ ES LA FILATELIA? (EL UNIVERSO DEL COLECCIONISMO POSTAL)          */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FFFDF0] text-[#102542] border-b border-[#E2DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FECC36] text-[#102542] text-xs font-black tracking-wide mb-3 shadow-sm border border-[#E5B728]">
              <Sparkles className="w-3.5 h-3.5 text-[#102542]" />
              <span>Cultura & Patrimonio Soberano</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102542] tracking-tight">
              ¿Qué es la Filatelia y por qué coleccionar?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              La filatelia es el arte, la ciencia y la pasión por estudiar y conservar los sellos postales y documentos de correo. En cada pieza confluyen la historia de un país, su soberanía geopolítica, sus próceres y las obras de grandes maestros del grabado.
            </p>
          </div>

          {/* 4 Pilares Culturales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1 */}
            <div className="bg-white p-7 rounded-3xl border-2 border-[#FFE58C] hover:border-[#FECC36] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#FECC36] text-[#102542] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#102542] mb-2">
                Memoria Histórica Viva
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Cada emisión postal es un testimonio oficial emitido por decreto de Estado que inmortaliza batallas, efemérides patrias, personajes ilustres y la evolución territorial de Bolivia.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white p-7 rounded-3xl border-2 border-[#FFE58C] hover:border-[#FECC36] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#FECC36] text-[#102542] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <ScrollText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#102542] mb-2">
                Artes Gráficas y Grabado
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Obras maestras en miniatura creadas en planchas de acero mediante talla dulce, litografía y tintas metalizadas que reflejan el nivel artístico de la Casa de la Moneda y Casas de Moneda del mundo.
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white p-7 rounded-3xl border-2 border-[#FFE58C] hover:border-[#FECC36] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#FECC36] text-[#102542] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#102542] mb-2">
                Soberanía & Diplomacia
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                El sello postal es el embajador que recorre el planeta bajo los convenios de la Unión Postal Universal (UPU), afianzando el derecho y la presencia internacional del Estado boliviano.
              </p>
            </div>

            {/* Pilar 4 */}
            <div className="bg-white p-7 rounded-3xl border-2 border-[#FFE58C] hover:border-[#FECC36] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-[#FECC36] text-[#102542] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-[#102542] mb-2">
                Patrimonio & Inversión
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Los ejemplares con conservación MNH, series escasas y pliegos limitados son bienes coleccionables tangibles con valor de mercado documentado y revalorización constante en subastas.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ANATOMÍA DE UN SELLO POSTAL (MÓDULO EDUCATIVO VISUAL)                 */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FFFDF2] text-[#102542] border-t-4 border-[#FECC36] border-b-2 border-[#E5B728] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102542] text-[#FECC36] text-xs font-bold tracking-wide mb-3 shadow-md">
              <Microscope className="w-4 h-4 text-[#FECC36]" />
              <span>Análisis Pericial & Educación Postal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102542] tracking-tight">
              Anatomía de un Sello Postal
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#102542]/85 max-w-2xl mx-auto font-medium leading-relaxed">
              Conozca cada detalle que compone una pieza filatélica y cómo los expertos periciales determinan su autenticidad y grado de conservación internacional.
            </p>
          </div>

          {/* Interactive Anatomy Browser */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/95 rounded-3xl p-6 sm:p-10 border-2 border-[#E5B728] shadow-2xl backdrop-blur-sm">
            
            {/* Lista Interactiva de Componentes */}
            <div className="lg:col-span-5 space-y-2.5">
              {anatomyPoints.map((item, idx) => {
                const isSelected = activeAnatomy === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveAnatomy(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer flex items-center justify-between border-2 ${
                      isSelected
                        ? 'bg-[#FECC36] border-[#E5B728] text-[#102542] shadow-md font-bold'
                        : 'bg-[#FAF8F0] hover:bg-[#FFF9DE] border-[#E2DDD5] text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                        isSelected ? 'bg-[#102542] text-[#FECC36]' : 'bg-white text-slate-500 border border-slate-200'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-black text-sm block text-[#102542]">{item.title}</span>
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-[#102542]/80' : 'text-[#8A6800]'}`}>
                          {item.badge}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-[#102542]' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Detalle del Componente Seleccionado */}
            <div className="lg:col-span-7 bg-[#FFFDF5] p-7 sm:p-9 rounded-2xl border-2 border-[#FFE58C] shadow-sm space-y-5 text-[#102542]">
              <div className="flex items-center justify-between border-b border-[#E5DFC8] pb-3">
                <span className="text-xs font-mono font-black text-[#8A6800] uppercase tracking-wider">
                  {anatomyPoints[activeAnatomy].badge}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Elemento {activeAnatomy + 1} de {anatomyPoints.length}
                </span>
              </div>

              <h3 className="text-2xl font-black text-[#102542]">
                {anatomyPoints[activeAnatomy].title}
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {anatomyPoints[activeAnatomy].description}
              </p>

              <div className="p-4 rounded-xl bg-white border border-[#FFE58C] text-xs text-[#102542] flex items-start gap-2.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#8A6800] shrink-0 mt-0.5" />
                <span><strong className="text-[#102542] font-bold">Regla de Bóveda:</strong> {anatomyPoints[activeAnatomy].tip}</span>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/guia"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-[#FECC36] bg-[#102542] hover:bg-[#2C63AC] transition flex items-center gap-1.5 shadow-md"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ver Guía de Grados UPU</span>
                </Link>

                <Link
                  href="/catalogo"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#102542] hover:bg-[#FAF8F0] bg-white border border-[#E2DDD5] transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Ver Ejemplares en Catálogo</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8A6800]" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. GRANDES SERIES Y COLECCIONES TEMÁTICAS (CATÁLOGO EN PERSPECTIVA)      */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FAF8F0] text-[#102542] border-b border-[#E2DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="text-xs font-bold tracking-widest text-[#8A6800] uppercase inline-block mb-1">
                Catálogo por Colecciones
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102542] tracking-tight">
                Series y Emisiones Emblemáticas
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600">
                Explore las principales temáticas filatélicas conservadas en nuestras bóvedas. Cada sección cuenta con ejemplares certificados para adquisición inmediata.
              </p>
            </div>

            <Link
              href="/catalogo"
              className="gold-button px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shrink-0 self-start md:self-end"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid de 6 Colecciones Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.map((col) => (
              <div 
                key={col.id}
                className="bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Vista Previa Fotográfica */}
                  <div className="relative h-48 bg-[#102542] overflow-hidden">
                    <Image
                      src={col.image}
                      alt={col.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102542] via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${col.badgeColor}`}>
                        {col.tag}
                      </span>
                    </div>
                  </div>

                  {/* Textos y Contexto */}
                  <div className="p-6">
                    <span className="text-[11px] font-semibold text-[#8A6800] block mb-1">
                      {col.subtitle}
                    </span>
                    <h3 className="font-extrabold text-lg text-[#102542] group-hover:text-[#2C63AC] transition leading-snug">
                      {col.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {col.description}
                    </p>
                  </div>
                </div>

                {/* Footer de la tarjeta con enlace a la pestaña de catálogo */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-[#E2DDD5] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Disponibilidad Oficial
                    </span>
                    <Link
                      href={`/catalogo?categoria=${col.categorySlug}`}
                      className="text-xs font-extrabold text-[#102542] hover:text-[#8A6800] flex items-center gap-1 transition"
                    >
                      <span>Explorar Serie</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CÓMO INICIAR TU COLECCIÓN (PASO A PASO DIDÁCTICO)                     */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FAF8F0] text-[#102542] border-b border-[#E2DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-[#8A6800] uppercase inline-block mb-1">
              Guía para Nuevos y Experimentados Coleccionistas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102542] tracking-tight">
              ¿Cómo Iniciar tu Colección Filatélica?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Coleccionar sellos es accesible para todas las edades. Siga estos tres pasos fundamentales recomendados por la curaduría oficial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Paso 1 */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2DDD5] shadow-md relative">
              <div className="text-4xl font-black text-[#FECC36]/40 absolute top-4 right-6">
                01
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#8A6800] flex items-center justify-center mb-5 font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102542] mb-2">
                1. Define tu Temática
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Elija el enfoque que más le apasione: historia de Bolivia, personajes ilustres, fauna de la Amazonía, sellos conmemorativos del Bicentenario o primeras emisiones clásicas de 1866.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2DDD5] shadow-md relative">
              <div className="text-4xl font-black text-[#FECC36]/40 absolute top-4 right-6">
                02
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#102542] flex items-center justify-center mb-5 font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102542] mb-2">
                2. Equípate con lo Básico
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Utilice siempre pinzas de punta plana (nunca los dedos directamente sobre la goma) y un álbum clasificador hawid con camisas libres de ácido para evitar el óxido filatélico.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-white p-8 rounded-2xl border border-[#E2DDD5] shadow-md relative">
              <div className="text-4xl font-black text-[#FECC36]/40 absolute top-4 right-6">
                03
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#102542] mb-2">
                3. Adquiere Piezas Oficiales
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Incorpore ejemplares con procedencia documentada y peritaje de goma MNH garantizado desde nuestro catálogo oficial con entrega en valija postal protegida.
              </p>
            </div>

          </div>

          <div className="text-center mt-12">
            <Link
              href="/guia"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#102542] hover:bg-[#2C63AC] text-white text-xs sm:text-sm font-bold shadow-md transition"
            >
              <BookOpen className="w-4 h-4 text-[#FECC36]" />
              <span>Ver Guía Completa de Clasificación y Conservación</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GARANTÍA POSTAL Y SERVICIOS OFICIALES DE BÓVEDA                      */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#FECC36] text-[#102542] border-t-4 border-[#E5B728] border-b-2 border-[#E5B728] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102542] text-[#FECC36] text-xs font-bold tracking-wide shadow-md">
                <Shield className="w-3.5 h-3.5 text-[#FECC36]" />
                <span>Rigor Notarial y Pericial Oficial</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102542] tracking-tight">
                Garantía y Fe Pública de la Agencia Postal
              </h2>

              <p className="text-sm sm:text-base text-[#102542]/85 leading-relaxed font-medium">
                Toda pieza adquirida a través de la plataforma oficial goza de la garantía soberana del Estado boliviano. Nuestro equipo pericial audita cada ejemplar mediante microscopía y espectrometría UV.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-[#102542] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102542] text-sm font-black block">Certificado Notarial Foliado con QR</strong>
                    <span className="text-xs text-[#102542]/80 font-medium">Cada orden de bóveda incluye su acta física sellada en seco con código criptográfico de serie.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-[#102542] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102542] text-sm font-black block">Protección Glassine Libre de Ácido</strong>
                    <span className="text-xs text-[#102542]/80 font-medium">Embalaje individual con polímeros y fibras libres de lignina para salvaguardar la goma centenaria.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white/80 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-[#102542] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102542] text-sm font-black block">Custodia Climatizada Controlada</strong>
                    <span className="text-xs text-[#102542]/80 font-medium">Bóvedas con 50% de humedad relativa y 20°C constantes para impedir hongos u óxido filatélico.</span>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/certificacion"
                  className="inline-flex items-center gap-2 text-xs font-black bg-[#102542] hover:bg-[#2C63AC] text-[#FECC36] px-6 py-3 rounded-xl shadow-lg transition hover:scale-105 active:scale-95"
                >
                  <span>Conocer más sobre el protocolo de peritaje y certificación notarial</span>
                  <ArrowRight className="w-4 h-4 text-[#FECC36]" />
                </Link>
              </div>
            </div>

            {/* Certificado de Muestra */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-sm bg-white text-[#102542] p-8 rounded-3xl border-3 border-[#102542] shadow-2xl relative rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="text-center pb-4 border-b border-[#E2DDD5]">
                  <span className="text-[10px] uppercase tracking-widest text-[#8A6800] font-black block">
                    Correos de Bolivia
                  </span>
                  <h4 className="text-base font-black text-[#102542] mt-1">
                    ACTA DE CERTIFICACIÓN NOTARIAL
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Bóveda Central • Protocolo UPU</span>
                </div>

                <div className="py-4 space-y-2 text-xs font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>FÓLIO NOTARIAL:</span>
                    <strong className="text-[#102542]">BO-CERT-2026-994</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ESTADO GOMA:</span>
                    <strong className="text-emerald-700 font-bold">MINT NH / GEM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>AUDITORÍA UV:</span>
                    <strong className="text-[#102542]">CONFORME 100%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PROCEDENCIA:</span>
                    <strong className="text-[#102542]">Bóveda Soberana</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2DDD5] text-center">
                  <span className="inline-block px-4 py-1.5 bg-[#102542] text-amber-200 text-[10px] font-semibold rounded-lg uppercase tracking-wider">
                    Sello Notarial en Seco Aprobado
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CLUB DE COLECCIONISTAS (PRIORIDAD DE EMISIONES)                       */}
      {/* ========================================================================= */}
      <CollectorClub />

      {/* ========================================================================= */}
      {/* 8. MODAL DE INSPECCIÓN ÓPTICA 10x                                        */}
      {/* ========================================================================= */}
      <StampInspectorModal
        stamp={inspectingStamp}
        onClose={() => setInspectingStamp(null)}
        onAddToCart={addToCart}
      />

    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Landmark, Calendar, Sparkles, BookOpen, Award, ArrowRight, ShieldCheck } from 'lucide-react';

interface TimelineEvent {
  year: string;
  period: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  description: string;
  technicalDetails: {
    printing: string;
    rarity: string;
    denomination: string;
    significance: string;
  };
  quote: string;
  quoteAuthor: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: '1866',
    period: 'Época Clásica Republicana',
    shortLabel: 'Época Clásica',
    title: 'Primera Emisión Oficial: "Los Cóndores de Bolivia"',
    subtitle: 'Nacimiento de la Filatelia Nacional bajo la Presidencia de Mariano Melgarejo',
    description:
      'Mediante decreto supremo se autorizó la primera emisión postal boliviana, grabada artesanalmente en cobre en La Paz. El motivo central representaba un cóndor andino con las alas desplegadas sobre un óvalo, pieza fundacional de supremo valor numismático.',
    technicalDetails: {
      printing: 'Grabado artesanal en planchas de cobre (Taller de La Paz)',
      rarity: 'Extremadamente Raro (Pieza de Museo)',
      denomination: '5 Céntimos Verde / 10 Céntimos Marrón',
      significance: 'Primer sello postal en la historia de la República de Bolivia',
    },
    quote: 'El Cóndor de 1866 representa el hito cero de nuestra soberanía postal y uno de los sellos más venerados de Sudamérica.',
    quoteAuthor: 'Archivo Histórico de la Agencia Boliviana de Correos',
  },
  {
    year: '1894',
    period: 'Período Grabado de Alta Precisión',
    shortLabel: 'Calcografía',
    title: 'Serie Escudo de Armas — American Bank Note Co.',
    subtitle: 'Calcografía de Filigrana y Papel de Seguridad en Nueva York',
    description:
      'Para combatir falsificaciones y elevar el prestigio del servicio exterior, Bolivia encomendó a la afamada American Bank Note Company la impresión en fino acero de la serie del Escudo Nacional con orlas ornamentales victorianas.',
    technicalDetails: {
      printing: 'Talla dulce en planchas de acero (Calcografía)',
      rarity: 'Muy Raro en estado MINT NH',
      denomination: '1c, 2c, 5c, 10c, 20c, 50c y 100c',
      significance: 'Estableció el estándar de seguridad filatélica boliviana para el siglo XX',
    },
    quote: 'La nitidez de los grabados de 1894 sigue asombrando a los peritos por la profundidad microscópica de sus trazos.',
    quoteAuthor: 'Curaduría de la Bóveda Postal',
  },
  {
    year: '1930',
    period: 'Pioneros de la Aviación',
    shortLabel: 'Correo Aéreo',
    title: 'Nacimiento del Correo Aéreo y Lloyd Aéreo Boliviano (LAB)',
    subtitle: 'Sobrecargas Históricas que Conectaron los Andes con la Amazonía',
    description:
      'Con la llegada de la aviación comercial, Bolivia emitió sellos especiales con sobrecargas oficiales para costear los primeros vuelos transcordilleranos, uniendo La Paz, Cochabamba, Santa Cruz y los confines del Beni.',
    technicalDetails: {
      printing: 'Tipografía con sobrecarga roja y azul "CORREO AÉREO"',
      rarity: 'Altamente cotizado por coleccionistas de aerofilatelia mundial',
      denomination: 'Sobrecargas de 5c a 5 Bolivianos',
      significance: 'Inauguración formal de las rutas de aerofilatelia en el corazón de América del Sur',
    },
    quote: 'Volando a más de 4.000 metros sobre el Illimani, las valijas postales del LAB cambiaron la geopolítica del transporte boliviano.',
    quoteAuthor: 'Gaceta Postal Oficial de 1930',
  },
  {
    year: '1968',
    period: 'Identidad y Patrimonio Natural',
    shortLabel: 'Flora y Fauna',
    title: 'Serie Monumental: Flora, Fauna y Folclore de Bolivia',
    subtitle: 'El Renacimiento Gráfico de la Biodiversidad y las Danzas Ancestrales',
    description:
      'Una de las emisiones más premiadas en exposiciones internacionales. Presentó por primera vez en policromía realista la orquídea de los Yungas, la vicuña andina y la máscara de la Diablada de Oruro.',
    technicalDetails: {
      printing: 'Offset multicolor de alta fidelidad sobre papel engomado tropicalizado',
      rarity: 'Escaso en pliegos completos con márgenes de imprenta',
      denomination: 'Serie completa de 12 valores',
      significance: 'Declarada de Interés Cultural y Embajadora Gráfica de Bolivia ante la UPU',
    },
    quote: 'Esta serie llevó la riqueza etnográfica y biológica de nuestro país a más de 140 administraciones postales del mundo.',
    quoteAuthor: 'Sociedad Filatélica de La Paz',
  },
  {
    year: '2025',
    period: 'Magna Emisión Histórica',
    shortLabel: 'Bicentenario',
    title: 'Bicentenario de la República de Bolivia (1825 – 2025)',
    subtitle: 'Doscientos Años de Soberanía, Historia y Hermandad Postal',
    description:
      'Emisión conmemorativa de lujo con tintas metalizadas en oro de 24 quilates, microtextos criptográficos de seguridad y papel verjurado especial. Una joya para custodiar en bóveda que celebra dos siglos de vida independiente.',
    technicalDetails: {
      printing: 'Calcografía combinada con estampado en oro de 24K y barniz UV sectorizado',
      rarity: 'Emisión limitada de 5.000 ejemplares certificados',
      denomination: 'Edición Numismática Especial Bicentenario',
      significance: 'Hito cumbre del patrimonio filatélico de la nación',
    },
    quote: 'El Bicentenario no solo honra a nuestros fundadores, sino que consagra el valor de la filatelia como archivo vivo de la patria.',
    quoteAuthor: 'Agencia Boliviana de Correos (2025)',
  },
];

export const HistoricalTimeline: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentEvent = TIMELINE_EVENTS[activeIdx];

  return (
    <section id="historia" className="py-20 bg-[#001A38] text-white border-y border-[#0A3B73] relative overflow-hidden">
      {/* Background Decorative Guilloche Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#F4C400_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#002B5B] rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] text-amber-200 text-xs font-medium tracking-wide mb-3">
            <Landmark className="w-4 h-4 text-amber-300/80" />
            <span>Memoria Postal & Archivo Nacional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Hitos de la Filatelia Boliviana
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Desde los primeros <strong className="text-amber-200/90 font-semibold">Cóndores de 1866</strong> grabados en cobre hasta la <strong className="text-amber-200/90 font-semibold">Magna Emisión del Bicentenario</strong>. Descubra la evolución gráfica y soberana de nuestra patria.
          </p>
        </div>

        {/* Timeline Navigation Bar - Diseño Formal Curatorial */}
        <div className="flex items-center justify-center mb-12">
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-[#001428] border border-[#0A3B73]/70 shadow-xl gap-1 sm:gap-2">
            {TIMELINE_EVENTS.map((event, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={event.year}
                  onClick={() => setActiveIdx(idx)}
                  className={`relative flex flex-col items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-center min-w-[105px] sm:min-w-[130px] ${
                    isActive
                      ? 'bg-[#002B5B] text-white border border-white/20 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <span
                    className={`text-base sm:text-lg font-bold font-mono tracking-wider transition-colors ${
                      isActive ? 'text-amber-200' : 'text-slate-300'
                    }`}
                  >
                    {event.year}
                  </span>
                  <span
                    className={`text-[11px] font-medium tracking-normal mt-0.5 whitespace-nowrap transition-colors ${
                      isActive ? 'text-amber-200/90 font-medium' : 'text-slate-400'
                    }`}
                  >
                    {event.shortLabel}
                  </span>

                  {/* Sutil indicador inferior formal */}
                  {isActive && (
                    <span className="absolute bottom-1 w-6 h-0.5 rounded-full bg-amber-300/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Event Showcase Card */}
        <div className="bg-[#002B5B]/90 backdrop-blur-md rounded-3xl border border-[#0A3B73] p-6 sm:p-10 shadow-2xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-white/[0.08] text-amber-200 font-medium font-mono text-sm tracking-widest border border-white/10 shadow-sm">
                  AÑO {currentEvent.year}
                </span>
                <span className="text-xs text-amber-200/80 font-medium tracking-wide uppercase">
                  {currentEvent.period}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  {currentEvent.title}
                </h3>
                <p className="text-sm font-medium text-amber-200/90 mt-1">
                  {currentEvent.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {currentEvent.description}
              </p>

              {/* Curatorial Quote */}
              <div className="border-l-2 border-amber-400/40 pl-4 py-1 italic bg-white/[0.03] rounded-r-xl">
                <p className="text-xs text-slate-300">
                  &ldquo;{currentEvent.quote}&rdquo;
                </p>
                <p className="text-[11px] text-amber-200/90 font-medium mt-1 not-italic">
                  — {currentEvent.quoteAuthor}
                </p>
              </div>
            </div>

            {/* Right Technical Specification Column */}
            <div className="lg:col-span-5 bg-[#001A38] rounded-2xl border border-[#0A3B73] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-700/80">
                <Award className="w-5 h-5 text-amber-300/80" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ficha Técnica de Bóveda
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="block text-slate-400 text-[11px]">Técnica de Impresión:</span>
                  <strong className="text-slate-100 font-medium">{currentEvent.technicalDetails.printing}</strong>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">Grado de Rareza:</span>
                  <span className="inline-block px-3 py-1 rounded-lg bg-white/[0.06] text-amber-200/90 font-medium text-[11px] mt-0.5 border border-white/10">
                    {currentEvent.technicalDetails.rarity}
                  </span>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">Valores Faciales / Denominaciones:</span>
                  <strong className="text-slate-100 font-medium">{currentEvent.technicalDetails.denomination}</strong>
                </div>

                <div>
                  <span className="block text-slate-400 text-[11px]">Trascendencia Institucional:</span>
                  <strong className="text-slate-200 font-medium">{currentEvent.technicalDetails.significance}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Catalogación UPU Verificada
                </span>
                <span className="font-mono text-amber-200/90 font-semibold">
                  REG. OFICIAL #{activeIdx + 1}/5
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

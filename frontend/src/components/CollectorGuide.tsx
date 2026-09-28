'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, CheckCircle2, Shield, Eye, Droplet, Thermometer, Layers, Compass, HelpCircle } from 'lucide-react';

interface GradeInfo {
  code: string;
  name: string;
  badgeColor: string;
  summary: string;
  details: string[];
  recommendation: string;
}

const GRADES: GradeInfo[] = [
  {
    code: 'MINT NH',
    name: 'Goma Original Intacta (Never Hinged)',
    badgeColor: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
    summary: 'El estado de máxima pureza y cotización. El reverso conserva la goma original de imprenta sin rastro alguno de fijasellos ni manipulación.',
    details: [
      'Goma original 100% íntegra y homogénea.',
      'Sin huella de charnela (fijasello).',
      'Dentado perfecto sin dobleces ni pérdidas.',
      'Pieza codiciada por coleccionistas de alta inversión.',
    ],
    recommendation: 'Almacenar siempre en estuches hawid neutros o papel glassine libre de ácido.',
  },
  {
    code: 'MINT LH',
    name: 'Con Leve Huella de Charnela (Lightly Hinged)',
    badgeColor: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
    summary: 'Sello nuevo con goma original que presenta una marca tenue superficial de fijasello proveniente de álbumes clásicos de época.',
    details: [
      'Conserva entre 85% y 95% de la goma original.',
      'Leve sombra o residuo limpio de fijasello antiguo.',
      'Excelente relación entre valor histórico y precio.',
      'Común en emisiones bolivianas de finales del siglo XIX.',
    ],
    recommendation: 'Excelente opción para coleccionistas que buscan piezas raras a un valor equilibrado.',
  },
  {
    code: 'USED / MATAS',
    name: 'Usado con Matasellos Nítido de Época',
    badgeColor: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
    summary: 'Ejemplar que circuló legítimamente por el servicio postal. Se valora que la cancelación postal sea legible, permitiendo identificar la ciudad y fecha.',
    details: [
      'Matasellos redondo o fechador legible (ej: La Paz, Potosí, Oruro).',
      'Sin desgarros ni adelgazamientos en el papel.',
      'Testigo documental de la correspondencia histórica.',
      'Permite estudiar rutas postales coloniales y republicanas.',
    ],
    recommendation: 'Ideal para coleccionismo temático, postal e historia de comunicaciones.',
  },
  {
    code: 'FDC',
    name: 'Sobre de Primer Día (First Day Cover)',
    badgeColor: 'bg-purple-500/15 border-purple-500/40 text-purple-300',
    summary: 'Sobre ilustrado conmemorativo que lleva los sellos de la emisión cancelados exactamente en la fecha oficial de su puesta en circulación.',
    details: [
      'Matasellos especial de primer día de emisión.',
      'Ilustración temática en el sobre (caché).',
      'Generalmente incluye folleto descriptivo ministerial.',
      'Edición numerada y con tirajes limitados.',
    ],
    recommendation: 'Muy buscado para colecciones de historia temática y exposiciones numismáticas.',
  },
];

export const CollectorGuide: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>('MINT NH');
  const activeGrade = GRADES.find((g) => g.code === selectedGrade) || GRADES[0];

  return (
    <section id="guia" className="py-20 bg-[#FAF8F0] text-[#002B5B] border-b border-[#E2DDD5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#002B5B]/5 border border-[#002B5B]/10 text-[#002B5B] text-xs font-medium tracking-wide mb-3">
            <BookOpen className="w-4 h-4 text-amber-600/80" />
            <span>Academia & Normas Internacionales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002B5B] tracking-tight">
            Guía del Coleccionista & Criterios de Calidad
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            En la filatelia de alta gama, cada detalle define el valor de una pieza. Conozca los estándares universales de conservación, anatomía y custodia dictados por la <strong className="text-[#002B5B]">Unión Postal Universal (UPU)</strong>.
          </p>
        </div>

        {/* 1. Interactive Grading System */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E2DDD5] shadow-xl mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E2DDD5]">
            <div>
              <span className="text-xs font-bold text-[#C99A00] uppercase tracking-widest block mb-1">
                Escala Universal de Conservación
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#002B5B]">
                ¿Cómo se clasifican los estados de conservación?
              </h3>
            </div>
            
            {/* Grade Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button
                  key={g.code}
                  onClick={() => setSelectedGrade(g.code)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedGrade === g.code
                      ? 'bg-[#002B5B] text-white shadow-md'
                      : 'bg-[#FAF8F0] text-slate-600 hover:bg-slate-100 hover:text-[#002B5B] border border-[#E2DDD5]'
                  }`}
                >
                  {g.code}
                </button>
              ))}
            </div>
          </div>

          {/* Active Grade Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black font-mono px-3 py-1 bg-[#002B5B] text-amber-200 rounded-lg">
                  {activeGrade.code}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#002B5B]">
                  {activeGrade.name}
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeGrade.summary}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-[#002B5B] uppercase tracking-wider block">
                  Rasgos Periciales Auditados:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeGrade.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-[#FAF8F0] p-2.5 rounded-xl border border-[#E2DDD5]/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#001A38] text-white p-6 rounded-2xl border border-[#0A3B73] space-y-4">
              <div className="flex items-center gap-2 text-amber-200/90 font-medium">
                <Shield className="w-5 h-5 text-amber-300/80" />
                <h5 className="font-semibold text-xs uppercase tracking-wider">
                  Recomendación de Curaduría
                </h5>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeGrade.recommendation}
              </p>

              <div className="p-3 bg-[#002B5B] rounded-xl border border-white/10 text-[11px] text-slate-200">
                💡 Todas las piezas catalogadas en nuestra bóveda como <strong>MINT NH</strong> son sometidas a espectrometría UV para certificar la ausencia de re-engomado o manipulaciones térmicas.
              </div>
            </div>
          </div>
        </div>

        {/* 2. Philatelic Anatomy & Conservation Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Dentado y Perforación */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-[#C99A00] mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#002B5B] mb-2">
              Dentado y Odontómetro
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El dentado (ej: 13.5 x 13.5) indica la cantidad de perforaciones por cada 2 centímetros de margen. Un sello con sus dientes completos y regulares cotiza hasta un 40% más que uno con dientes recortados.
            </p>
          </div>

          {/* Card 2: Marcas de Agua y Filigranas */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[#0A3B73] mb-4">
              <Eye className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#002B5B] mb-2">
              Filigranas y Papel de Seguridad
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Marcas transparentes introducidas durante la fabricación del papel (como el Sol radiante o letras entrelazadas). Se visualizan sumergiendo el ejemplar en líquido especial o con luz rasante.
            </p>
          </div>

          {/* Card 3: Parámetros de Clima y Bóveda */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2DDD5] shadow-md hover:shadow-lg transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
              <Thermometer className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#002B5B] mb-2">
              Microclima de Custodia
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              La goma vegetal arábiga exige 45% a 55% de humedad relativa y temperatura entre 18°C y 22°C. El exceso de humedad provoca hongos (óxido filatélico) y la sequedad extrema cuartea el papel.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

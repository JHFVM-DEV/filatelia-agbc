'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Autenticidad & Peritaje',
    question: '¿Cómo garantizan que un sello catalogado como MINT NH conserve su goma virgen original?',
    answer:
      'Cada ejemplar es examinado por peritos filatélicos bajo lámparas ultravioleta UV-A (365nm) y UV-C (254nm), descartando cualquier residuo químico de lavado o re-engomado moderno. Además, se audita la profundidad del diente y la tensión de las fibras con microscopía digital 40x antes de certificarlo.',
  },
  {
    category: 'Pagos & Liquidación',
    question: '¿Cuáles son las modalidades oficiales de pago disponibles?',
    answer:
      'Aceptamos transferencias mediante código QR interoperable de la banca boliviana (Banco Unión, BCP, Banco Mercantil, etc.), tarjetas de crédito/débito internacionales (Visa / Mastercard) y retiro con pago presencial en las ventanillas de la Bóveda Central de Correos en La Paz.',
  },
  {
    category: 'Seguridad & Entrega',
    question: '¿Cómo protegen los sellos contra dobleces, presiones o la humedad del transporte?',
    answer:
      'Todas las piezas se introducen en camisas de papel glassine neutro (pH 7.0-7.5) libres de ácido, emparedadas entre dos placas rígidas de polipropileno indeformable y selladas al vacío con precinto holográfico inviolable de Correos de Bolivia.',
  },
  {
    category: 'Tasaciones & Servicios',
    question: '¿Puedo solicitar la tasación o peritaje de mi propia colección filatélica heredada?',
    answer:
      'Sí. Correos de Bolivia y su equipo de curadores ofrecen servicios de catalogación, autenticación y tasación notarial de colecciones particulares. Puede coordinar una cita con el curador a través del correo oficial filatelia@correosbolivia.gob.bo.',
  },
  {
    category: 'Garantía & Devoluciones',
    question: '¿Qué garantía tengo si el ejemplar recibido no satisface mis expectativas de coleccionista?',
    answer:
      'Ofrecemos una Garantía de Bóveda de 15 días calendario a partir de la recepción. Si el estado de la goma o el dentado no coincide con la ficha técnica provista, el coleccionista puede solicitar el reemplazo por otra pieza del mismo rango o el reintegro total de su dinero.',
  },
  {
    category: 'Documentación Oficial',
    question: '¿Las compras incluyen certificado físico de procedencia?',
    answer:
      'Todas las órdenes superiores a 200 BOB o catalogadas como "Pieza de Museo" / "Muy Raro" incluyen un Certificado Notarial de Autenticidad foliado y con sello en relieve en seco de Correos de Bolivia.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faqs" className="relative overflow-hidden">
      {/* Header Banner - Amarillo Postal Dominante de Correos de Bolivia */}
      <div className="bg-gradient-to-r from-[#FFE875] via-[#FFD100] to-[#F5B800] text-[#002B5B] py-14 border-b-2 border-[#E5B500] relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-guilloche opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#002B5B] text-[#FFD100] text-xs font-bold tracking-wide mb-3 shadow-sm">
            <HelpCircle className="w-4 h-4 text-[#FFD100]" />
            <span>Respuestas Claras & Transparencia Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#002B5B] tracking-tight">
            Preguntas Frecuentes de Coleccionistas
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#002B5B]/85 max-w-2xl mx-auto font-medium leading-relaxed">
            Todo lo que necesita saber sobre el peritaje de goma, modalidades de liquidación y los protocolos de custodia de la bóveda postal.
          </p>
        </div>
      </div>

      <div className="py-16 bg-[#FAF8F0] border-b border-[#E2DDD5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Accordion List */}
          <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-[#FFCC00] shadow-lg ring-2 ring-[#FFCC00]/20' : 'border-[#E2DDD5] hover:border-[#FFE875]'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-black font-mono shrink-0 mt-0.5 px-2 py-0.5 rounded-md ${
                      isOpen ? 'bg-[#FFCC00] text-[#002B5B]' : 'bg-slate-100 text-slate-600'
                    }`}>
                      0{idx + 1}.
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-[#C99A00] uppercase tracking-wider block mb-0.5">
                        {faq.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#002B5B]">
                        {faq.question}
                      </h3>
                    </div>
                  </div>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-[#FFCC00] text-[#002B5B] rotate-180 shadow-xs' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-[#FAF8F0]/40 animate-in fade-in duration-200">
                    <p className="pl-6 border-l-3 border-[#FFCC00]">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-12 bg-white rounded-2xl p-6 border-2 border-[#FFE875] text-center flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left">
            <h4 className="font-bold text-sm text-[#002B5B] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#FFCC00]" />
              ¿Tiene una consulta sobre un sello en particular?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Nuestro equipo curatorial atiende consultas técnicas y tasaciones especializadas.
            </p>
          </div>
          <a
            href="mailto:filatelia@correosbolivia.gob.bo"
            className="px-5 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#0A3B73] text-[#FFD100] text-xs font-black transition whitespace-nowrap shadow-md hover:scale-105"
          >
            Contactar a Curaduría
          </a>
        </div>
      </div>
    </div>
  </section>
  );
};

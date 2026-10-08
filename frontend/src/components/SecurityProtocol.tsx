'use client';

import React from 'react';
import { ShieldCheck, FileCheck2, Box, Stamp, Lock } from 'lucide-react';

export const SecurityProtocol: React.FC = () => {
  const steps = [
    {
      icon: Lock,
      number: '01',
      title: 'Custodia & Verificación en Bóveda',
      description: 'Cada ejemplar es examinado bajo luz UV y cuentahilos de precisión por curadores postales antes de autorizar su salida.',
    },
    {
      icon: FileCheck2,
      number: '02',
      title: 'Envoltura Glassine Libre de Ácido',
      description: 'El sello se introduce en una camisa de papel cristal apergaminado neutro (pH 7.0-7.5) que previene adherencias de goma.',
    },
    {
      icon: Box,
      number: '03',
      title: 'Soporte Rígido Indeformable',
      description: 'Emparedado entre láminas de polipropileno y cartón estructural indeformable que resiste presiones e impactos de tránsito.',
    },
    {
      icon: Stamp,
      number: '04',
      title: 'Precinto Postal de Seguridad',
      description: 'Caja sellada al vacío con precinto holográfico numerado inviolable y guía de despacho de valor declarado asegurado.',
    },
  ];

  return (
    <section id="seguridad" className="py-16 bg-[#002B5B] text-white border-t-4 border-[#FFCC00] border-b border-[#001A38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFCC00] text-[#002B5B] text-xs font-bold tracking-wide mb-3 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#002B5B]" />
            <span>Garantía de Museo y Preservación Numismática</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Protocolo de Bóveda y Embalaje Filatélico
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Tratamos cada pieza con el rigor que merece una obra de arte. Conozca cómo blindamos su colección desde nuestras gavetas hasta sus manos.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="bg-[#001A38]/70 rounded-2xl p-6 border border-[#0A3B73] hover:border-[#FFCC00] transition-colors duration-300 relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#FFD100]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-[#FFCC00]/50 group-hover:text-[#FFCC00] transition">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Certification Banner */}
        <div className="mt-12 bg-white/[0.04] backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-semibold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300/80" />
              Certificado de Autenticidad de Correos de Bolivia
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Todas las órdenes de alto valor incluyen acta de procedencia sellada en seco por el Curador en Jefe.
            </p>
          </div>
          <div className="px-4 py-2 bg-white/[0.06] rounded-xl border border-white/10 text-xs font-medium text-amber-200/90 whitespace-nowrap">
            Norma Postal UPU 2026
          </div>
        </div>

      </div>
    </section>
  );
};

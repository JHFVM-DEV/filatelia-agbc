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
    <section id="seguridad" className="py-20 bg-gradient-to-b from-[#FFFDF0] via-[#FFF9DB] to-[#FFF0B3] text-[#102542] border-t-4 border-[#FECC36] border-b-2 border-[#E5B728] relative overflow-hidden">
      {/* Guilloche Texture de seguridad */}
      <div className="absolute inset-0 bg-guilloche opacity-5 pointer-events-none mix-blend-multiply" />
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#FECC36]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102542] text-[#FECC36] text-xs font-bold tracking-wide mb-3 shadow-md">
            <ShieldCheck className="w-4 h-4 text-[#FECC36]" />
            <span>Garantía de Museo y Preservación Numismática</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#102542] tracking-tight">
            Protocolo de Bóveda y Embalaje Filatélico
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#102542]/85 max-w-2xl mx-auto font-medium leading-relaxed">
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
                className="bg-white rounded-3xl p-7 border-2 border-[#FFE58C] hover:border-[#FECC36] shadow-md hover:shadow-2xl transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FECC36] text-[#102542] flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-[#E5B728] group-hover:text-[#102542] transition-colors font-mono">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#102542] mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#F0EAD6] flex items-center gap-1.5 text-[11px] font-bold text-[#8A6800]">
                  <span>Fase {step.number} Certificada</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Certification Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#FECC36] via-[#FFD95E] to-[#E5B728] rounded-2xl p-6 sm:p-8 border-2 border-[#E5B728] shadow-xl text-[#102542] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1">
            <h4 className="font-black text-base text-[#102542] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#102542]" />
              <span>Certificado de Autenticidad de Correos de Bolivia</span>
            </h4>
            <p className="text-xs text-[#102542]/85 font-medium max-w-2xl leading-relaxed">
              Todas las órdenes de alto valor incluyen acta de procedencia sellada en seco por el Curador en Jefe con número correlativo ministerial.
            </p>
          </div>
          <div className="px-5 py-2.5 bg-[#102542] rounded-xl text-xs font-bold text-[#FECC36] whitespace-nowrap shadow-md">
            Norma Postal UPU 2026
          </div>
        </div>

      </div>
    </section>
  );
};

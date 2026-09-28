'use client';

import React from 'react';
import { ShieldCheck, Award, FileBadge2, Microscope, Scale, CheckCircle, Lock } from 'lucide-react';

export const VaultTrustSection: React.FC = () => {
  const guarantees = [
    {
      icon: Microscope,
      title: 'Microscopía Óptica 40x',
      description: 'Análisis microscópico del dentado, trama del papel verjurado e impresiones en talla dulce para descartar fotocopias o reimpresiones fraudulentas.',
    },
    {
      icon: Scale,
      title: 'Espectrometría UV Multibanda',
      description: 'Detección de fluorescencias bajo luz ultravioleta de onda corta (254nm) y larga (365nm) para corroborar ausencia de retoques o lavado químico de matasellos.',
    },
    {
      icon: FileBadge2,
      title: 'Certificado Notarial Foliado',
      description: 'Cada pieza de alto valor histórico se entrega con certificado físico individual, sellado en seco y firmado por el Curador en Jefe de la Agencia Postal.',
    },
    {
      icon: Lock,
      title: 'Custodia Climática Blindada',
      description: 'Almacenamiento en bóvedas con control continuo de temperatura (20°C ± 1°C) y humedad relativa (50% ± 3%) para asegurar la vitalidad de la goma centenaria.',
    },
  ];

  return (
    <section id="certificacion" className="py-20 bg-[#001A38] text-white border-b border-[#0A3B73] relative overflow-hidden">
      {/* Background Subtle Lines */}
      <div className="absolute inset-0 bg-vault-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] text-amber-200 text-xs font-medium tracking-wide mb-3">
            <Award className="w-4 h-4 text-amber-300/80" />
            <span>Rigor Pericial & Garantía de Procedencia</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Peritaje Científico y Certificación Notarial
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Adquirir una pieza en la <strong className="text-amber-200 font-semibold">Filatelia Oficial de Bolivia</strong> es una inversión segura. Cada ejemplar pasa por un protocolo estricto de autenticación científica antes de salir de nuestras bóvedas.
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-[#002B5B]/80 backdrop-blur-sm p-6 rounded-2xl border border-[#0A3B73] hover:border-amber-400/50 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-amber-300/80 mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Protocolo Aprobado</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notarized Physical Certificate Preview Banner */}
        <div className="bg-gradient-to-br from-[#002B5B] to-[#00152e] rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-amber-200 text-xs font-medium tracking-wide uppercase">
                Documento Oficial de Bóveda
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Certificado Físico Individual de Autenticidad
              </h3>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
                Toda adquisición superior a 200 BOB o clasificada como <strong className="text-amber-200 font-semibold">Pieza de Museo</strong> incluye un Certificado de Bóveda impreso en papel de seguridad con filigrana, numeración correlativa ministerial y relieve en seco de la Agencia Boliviana de Correos.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Sello Notarial en Seco
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Código Criptográfico de Serie
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Firma Pericial del Curador
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-xs bg-[#FAF8F0] text-[#002B5B] p-6 rounded-2xl border border-[#E2DDD5] shadow-2xl relative rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="text-center pb-3 border-b border-[#E2DDD5]">
                  <span className="text-[9px] uppercase tracking-widest text-[#C99A00] font-black block">
                    Agencia Boliviana de Correos
                  </span>
                  <h4 className="text-sm font-extrabold text-[#002B5B] mt-0.5">
                    ACTA DE PERITAJE POSTAL
                  </h4>
                </div>
                
                <div className="py-3 space-y-1.5 text-[10px] font-mono text-slate-600">
                  <div className="flex justify-between">
                    <span>FÓLIO:</span>
                    <strong className="text-[#002B5B]">BO-CERT-2026-994</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CLASIFICACIÓN:</span>
                    <strong className="text-emerald-700 font-bold">MINT NH / GEM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ESTUDIO UV:</span>
                    <strong className="text-[#002B5B]">CONFORME 100%</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2DDD5] text-center">
                  <span className="inline-block px-3 py-1 bg-[#002B5B] text-amber-200 text-[9px] font-medium rounded-md">
                    SELLO EN SECO VÁLIDO
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

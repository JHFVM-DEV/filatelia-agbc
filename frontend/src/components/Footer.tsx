'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Mail, Phone, MapPin, Award, CheckCircle2, FileText, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#102542] text-white border-t-4 border-[#FECC36] relative">
      <div className="h-2 bg-gradient-to-r from-[#FECC36] via-[#FECC36] to-[#E5B728] w-full absolute top-0 left-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-14 flex items-center justify-center">
                <Image 
                  src="/images/FILATELIA-1.png" 
                  alt="Logo Filatelia Oficial" 
                  width={44} 
                  height={44} 
                  style={{ width: 'auto', height: 'auto' }}
                  className="max-h-12 object-contain"
                />
              </div>

              <div>
                <Image 
                  src="/images/cropped-LOGOcen.png" 
                  alt="Correos de Bolivia" 
                  width={140} 
                  height={34} 
                  className="h-8 w-auto object-contain brightness-0 invert opacity-95"
                />
                <span className="block text-[10px] tracking-widest text-[#FECC36] uppercase font-bold mt-1">
                  Sección Oficial de Filatelia & Bóveda Soberana
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              Custodia, catalogación y expedición de patrimonio postal soberano del Estado Plurinacional de Bolivia. Proveemos a coleccionistas e instituciones ejemplares MINT certificados bajo normas internacionales de conservación filatélica.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-3.5 py-1 rounded-full bg-white/[0.06] text-[#FECC36] text-[11px] font-bold flex items-center gap-1.5 shadow-sm border border-[#FECC36]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FECC36]" /> Estado Miembro UPU (Unión Postal Universal)
              </span>
              <span className="px-3.5 py-1 rounded-full bg-white/[0.06] text-slate-200 text-[11px] font-medium flex items-center gap-1.5 shadow-sm border border-white/10">
                <Lock className="w-3 h-3 text-[#FECC36]" /> Custodia en Bóveda Climatizada
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FECC36] uppercase tracking-wider">
              Colecciones Oficiales
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/catalogo" className="hover:text-[#FECC36] transition-colors duration-200">Todo el Catálogo</Link></li>
              <li><Link href="/catalogo?categoria=sellos-y-series" className="hover:text-[#FECC36] transition-colors duration-200">Sellos y Series</Link></li>
              <li><Link href="/catalogo?categoria=fauna-y-flora" className="hover:text-[#FECC36] transition-colors duration-200">Flora y Fauna</Link></li>
              <li><Link href="/catalogo?categoria=dipticos-y-tripticos" className="hover:text-[#FECC36] transition-colors duration-200">Dípticos y Trípticos</Link></li>
            </ul>
          </div>

          {/* Conservación */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FECC36] uppercase tracking-wider">
              Garantía y Bóveda
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/certificacion" className="hover:text-[#FECC36] transition-colors duration-200">Protocolo Glassine Libre de Ácido</Link></li>
              <li><Link href="/guia" className="hover:text-[#FECC36] transition-colors duration-200">Peritaje de Goma Original NH</Link></li>
              <li><Link href="/certificacion" className="hover:text-[#FECC36] transition-colors duration-200">Certificados de Autenticidad ABC</Link></li>
              <li><Link href="/faqs" className="hover:text-[#FECC36] transition-colors duration-200">Envíos Blindados y Asegurados</Link></li>
              <li><Link href="/faqs" className="hover:text-[#FECC36] transition-colors duration-200">Políticas de Custodia y Devolución</Link></li>
            </ul>
          </div>

          {/* Contacto Oficial */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FECC36] uppercase tracking-wider">
              Atención a Coleccionistas
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FECC36] shrink-0 mt-0.5" />
                <span className="leading-snug">Palacio Central de Correos, Av. Mariscal Santa Cruz esq. Calle Oruro, La Paz - Bolivia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FECC36] shrink-0" />
                <span>+591 2 2152424 • Bóveda Int. 104</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FECC36] shrink-0" />
                <span>filatelia@correosbolivia.gob.bo</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-400">
                Horario de Bóveda: Lun a Vie, 08:30 - 16:30
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#2C63AC] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>© 2026 Correos de Bolivia — Todos los derechos reservados. Filatelia Soberana & Numismática Postal.</p>
          <div className="flex items-center space-x-5">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Términos del Servicio Filatélico: Todas las piezas están sujetas a peritaje y disponibilidad en bóveda.'); }} className="hover:text-white transition-colors">
              Términos del Servicio
            </a>
            <span className="text-slate-600">•</span>
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Política de Privacidad: La información de los coleccionistas se resguarda bajo estricta confidencialidad.'); }} className="hover:text-white transition-colors">
              Privacidad y Custodia
            </a>
            <span className="text-slate-600">•</span>
            <span className="text-[#FECC36] font-black">
              Bóveda Segura SSL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};


'use client';

import React, { useState } from 'react';
import { Mail, Sparkles, CheckCircle2, Shield, Bell, Send, ArrowRight } from 'lucide-react';

export const CollectorClub: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [interestArea, setInterestArea] = useState('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <section id="club" className="py-20 bg-gradient-to-b from-[#001A38] to-[#002B5B] text-white relative overflow-hidden">
      {/* Decorative Gold Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-[#00152e]/90 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Information */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] text-amber-200 text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300/80" />
                <span>Círculo Exclusivo de Bóveda</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Acceso Prioritario a Nuevas Emisiones y Pliegos Conmemorativos
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Suscríbase al boletín oficial de la Agencia Boliviana de Correos para recibir avisos de primer día de emisión (FDC), liberación de ejemplares conmemorativos del <strong className="text-amber-200 font-semibold">Bicentenario</strong> y piezas históricas de bóveda antes de su publicación general.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300/80 shrink-0" />
                  <span>Avisos de FDC de Primer Día</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300/80 shrink-0" />
                  <span>Pliegos Limitados y Bloques</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300/80 shrink-0" />
                  <span>Catálogo Anual en PDF Oficial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-300/80 shrink-0" />
                  <span>Sin Spam ni Comunicaciones Comerciales</span>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-5 bg-[#002B5B] p-6 sm:p-8 rounded-2xl border border-[#0A3B73] shadow-xl">
              {isSubmitted ? (
                <div className="text-center py-6 space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    ¡Suscripción Confirmada!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hemos registrado su correo <strong className="text-[#F4C400]">{email}</strong> en el registro de coleccionistas prioritarios. Recibirá nuestra próxima circular ministerial.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="text-xs text-amber-300 underline hover:text-white pt-2 font-medium"
                  >
                    Registrar otro correo
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Correo Electrónico de Coleccionista
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@coleccionista.bo"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-[#001A38] focus:outline-none focus:border-amber-400 text-white shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                      Interés Filatélico Principal
                    </label>
                    <select
                      value={interestArea}
                      onChange={(e) => setInterestArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-700 bg-[#001A38] text-slate-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="ALL">Todas las Emisiones y Clásicos</option>
                      <option value="BICENTENARIO">Emisiones del Bicentenario 2025</option>
                      <option value="CLASSIC">Clásicos 1866 y Siglo XIX</option>
                      <option value="AERO">Aerofilatelia y LAB</option>
                      <option value="THEMATIC">Flora, Fauna y Folclore</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full gold-button py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Unirme al Círculo de Bóveda</span>
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Protegido bajo la Ley de Privacidad y el Archivo Central de la Agencia Boliviana de Correos.
                    </p>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

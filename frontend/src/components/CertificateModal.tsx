'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Handle ESC key to close modal & backdrop lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const orderNumber = order?.order_number || order?.orderNumber || 'BO-FIL-2026-OFICIAL';
  const customerName = order?.customer_name || order?.name || 'Coleccionista Registrado';
  const orderDate = order?.created_at 
    ? new Date(order.created_at).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  const items = order?.items || [];
  const certificateFolio = `CERT-${orderNumber.replace(/[^A-Z0-9]/gi, '')}`;

  // Generate high-resolution dynamic verification QR Code
  useEffect(() => {
    if (order) {
      const verificationUrl = `https://filatelia.correosbolivia.gob.bo/certificacion?folio=${encodeURIComponent(certificateFolio)}&orden=${encodeURIComponent(orderNumber)}`;
      QRCode.toDataURL(verificationUrl, {
        width: 240,
        margin: 1,
        color: {
          dark: '#102542',
          light: '#FFFFFF',
        },
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('Error generating QR', err));
    }
  }, [order, certificateFolio, orderNumber]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      {/* Complete Paper & PDF Print Engine Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: letter portrait;
              margin: 6mm 6mm 6mm 6mm !important;
            }
            
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Hide everything from website layout: navbars, footers, main page, headers, aside */
            nav, 
            footer, 
            main, 
            header, 
            aside, 
            .print-hidden, 
            .print\\:hidden,
            [data-print-hidden="true"] {
              display: none !important;
            }

            /* Reset modal outer backdrop */
            .certificate-backdrop {
              position: static !important;
              display: block !important;
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
              overflow: visible !important;
              width: 100% !important;
              height: auto !important;
              min-height: auto !important;
              backdrop-filter: none !important;
              z-index: auto !important;
            }

            /* Reset modal inner wrapper */
            .certificate-card-wrapper {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              background: transparent !important;
              overflow: visible !important;
            }

            .certificate-body-container {
              padding: 0 !important;
              margin: 0 !important;
              background: transparent !important;
              overflow: visible !important;
            }

            /* Printable Certificate Box */
            #official-certificate-document {
              display: block !important;
              position: relative !important;
              left: auto !important;
              top: auto !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 6mm 8mm !important;
              border: 3px double #8A6800 !important;
              border-radius: 8px !important;
              background-color: #FAF8F0 !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `,
        }}
      />

      {/* Backdrop Container - items-start ensures top controls are NEVER pushed offscreen */}
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="certificate-backdrop fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-start p-3 sm:p-6 py-4 sm:py-8 animate-in fade-in"
      >
        <div className="certificate-card-wrapper relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
          
          {/* Sticky Top Control Bar (Hidden when printing) */}
          <div className="sticky top-0 z-30 bg-[#102542]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 text-white flex items-center justify-between border-b border-amber-500/30 shadow-lg print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm tracking-wide text-white leading-tight">
                  Acta Oficial de Peritaje & Certificado Notarial
                </h3>
                <span className="text-[10px] text-amber-400 font-mono block">
                  Folio: {certificateFolio}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#8A6800] to-[#FECC36] hover:from-[#755800] hover:to-[#D9AB24] text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title="Imprimir o descargar en formato PDF oficial"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Imprimir / Guardar PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition cursor-pointer text-xs font-bold border border-slate-700"
                title="Cerrar ventana (o presione ESC)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar [ESC]</span>
              </button>
            </div>
          </div>

          {/* Certificate Body Container */}
          <div className="certificate-body-container p-4 sm:p-8 md:p-10 bg-[#FAF8F0] relative overflow-hidden">
            
            {/* The Printable Notarial Certificate Document */}
            <div 
              id="official-certificate-document"
              className="border-4 border-double border-[#8A6800]/50 rounded-2xl p-6 sm:p-10 relative bg-white shadow-md"
            >
              
              {/* Background Watermark Emblem */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                <ShieldCheck className="w-[30rem] h-[30rem] text-[#102542]" />
              </div>

              {/* Document Header */}
              <div className="text-center pb-6 border-b border-[#E2DDD5]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#102542]/5 border border-[#102542]/10 text-[#102542] text-[11px] font-medium tracking-widest uppercase mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#102542]/70" />
                  <span>Estado Plurinacional de Bolivia</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#102542] uppercase font-serif">
                  Correos de Bolivia
                </h2>
                <p className="text-xs font-semibold tracking-wider text-[#8A6800] uppercase mt-0.5">
                  Dirección Nacional de Filatelia & Custodia de Bóveda
                </p>
                <div className="w-24 h-0.5 bg-[#8A6800] mx-auto mt-3" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-widest uppercase mt-3">
                  Acta Oficial de Peritaje & Certificado de Autenticidad
                </h3>
              </div>

              {/* Folio & Registration Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#E2DDD5] text-xs">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Folio de Seguridad</span>
                  <strong className="text-[#102542] font-mono font-bold text-xs">{certificateFolio}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">N° de Orden</span>
                  <strong className="text-[#102542] font-mono font-bold text-xs">{orderNumber}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Fecha de Emisión</span>
                  <span className="text-slate-800 font-medium text-xs">{orderDate}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Titular Registrado</span>
                  <span className="text-slate-800 font-bold text-xs truncate block" title={customerName}>
                    {customerName}
                  </span>
                </div>
              </div>

              {/* Legal Certification Statement */}
              <div className="py-5 text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  La <strong>Comisión Curatorial y de Preservación Filatélica</strong> certifica formalmente que los ejemplares amparados bajo la orden <strong>{orderNumber}</strong> han sido peritados individualmente mediante examen óptico de microscopía y espectrometría UV.
                </p>
                <p>
                  Se dictamina su <strong>estricta autenticidad, integridad de goma original y legítima procedencia institucional</strong>, cumpliendo con los cánones de preservación y catalogación de la Unión Postal Universal (UPU).
                </p>
              </div>

              {/* Certified Items Table */}
              {items.length > 0 && (
                <div className="py-3">
                  <table className="w-full text-left text-xs border border-[#E2DDD5] rounded-xl overflow-hidden">
                    <thead className="bg-[#FAF8F0] text-[#102542] font-bold text-[11px] uppercase tracking-wider border-b border-[#E2DDD5]">
                      <tr>
                        <th className="py-2.5 px-3 sm:px-4">Pieza Filatélica Certificada</th>
                        <th className="py-2.5 px-3 text-center">Cant.</th>
                        <th className="py-2.5 px-3 sm:px-4 text-right">Dictamen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DDD5]">
                      {items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-amber-50/40">
                          <td className="py-2.5 px-3 sm:px-4">
                            <strong className="text-[#102542]">
                              {item.product_name || item.name || `Pieza Filatélica #${idx + 1}`}
                            </strong>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                            {item.quantity || 1}
                          </td>
                          <td className="py-2.5 px-3 sm:px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Genuino MINT
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures, Seals and Verification QR */}
              <div className="pt-6 mt-4 border-t border-[#E2DDD5] grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center">
                
                {/* Signature 1 */}
                <div className="flex flex-col items-center">
                  <div className="border-b-2 border-slate-400 w-36 mb-1.5" />
                  <span className="block text-[11px] font-bold text-[#102542]">Lic. Mario Argandoña</span>
                  <span className="block text-[10px] text-slate-500">Curador en Jefe de Bóveda</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">Matrícula FIL-BOL-0084</span>
                </div>

                {/* Security Seal Emblem */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#8A6800] p-1 flex items-center justify-center shadow-inner">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400/20 to-amber-500/10 flex flex-col items-center justify-center text-[8px] font-black text-[#102542] uppercase leading-tight border border-[#8A6800]/30">
                      <span>Sello</span>
                      <span className="text-[#8A6800] font-black">Oficial</span>
                      <span>UPU</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono mt-1">Cifrado Criptográfico</span>
                </div>

                {/* Signature 2 */}
                <div className="flex flex-col items-center">
                  <div className="border-b-2 border-slate-400 w-36 mb-1.5" />
                  <span className="block text-[11px] font-bold text-[#102542]">Dr. Fernando Velasco</span>
                  <span className="block text-[10px] text-slate-500">Perito Notarial Colegiado</span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5">Registro Notarial #142</span>
                </div>

              </div>

              {/* QR Code and Cryptographic Verification Footer */}
              <div className="mt-8 pt-4 border-t border-[#E2DDD5]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {qrDataUrl ? (
                    <img 
                      src={qrDataUrl} 
                      alt="Código QR de Verificación" 
                      className="w-16 h-16 rounded-lg border border-[#8A6800]/40 p-0.5 bg-white shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-[#8A6800]/40 flex items-center justify-center bg-white">
                      <QrCode className="w-8 h-8 text-[#102542]" />
                    </div>
                  )}
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#102542] block">
                      Verificación Notarial en Línea
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Escanee este código QR para comprobar la autenticidad en el registro público oficial.
                    </span>
                    <span className="text-[9px] text-amber-700 font-mono mt-0.5 block">
                      filatelia.correosbolivia.gob.bo/certificacion
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono shrink-0">
                  <span className="block text-slate-500 font-bold uppercase text-[9px]">Sello Hash SHA-256</span>
                  <span>{certificateFolio}-{(orderNumber || '').replace(/[^0-9]/g, '')}-OK</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </>
  );
};

import { Metadata } from 'next';
import { CollectorGuide } from '@/components/CollectorGuide';

export const metadata: Metadata = {
  title: 'Guía del Coleccionista & Calidades MINT — Filatelia Bolivia',
  description: 'Aprenda sobre estados de conservación filatélica (MINT NH, LH, FDC), uso del odontómetro, filigranas al trasluz y normas de preservación UPU.',
};

export default function GuiaPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <CollectorGuide />
    </div>
  );
}

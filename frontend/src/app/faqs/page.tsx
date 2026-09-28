import { Metadata } from 'next';
import { FAQSection } from '@/components/FAQSection';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — Filatelia Bolivia',
  description: 'Respuestas a dudas frecuentes sobre autenticidad de goma, modalidades de pago (QR bancario, tarjetas), embalaje blindado, tasación de colecciones y garantías.',
};

export default function FAQsPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <FAQSection />
    </div>
  );
}

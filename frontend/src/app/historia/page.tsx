import { Metadata } from 'next';
import { HistoricalTimeline } from '@/components/HistoricalTimeline';

export const metadata: Metadata = {
  title: 'Hitos Históricos — Filatelia Bolivia (1866 - 2025)',
  description: 'Cronología oficial de la filatelia boliviana: desde los primeros Cóndores de 1866 hasta la Magna Emisión del Bicentenario de la República.',
};

export default function HistoriaPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <HistoricalTimeline />
    </div>
  );
}

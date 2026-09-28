import { Metadata } from 'next';
import { VaultTrustSection } from '@/components/VaultTrustSection';
import { SecurityProtocol } from '@/components/SecurityProtocol';

export const metadata: Metadata = {
  title: 'Certificación Notarial & Protocolo de Bóveda — Filatelia Bolivia',
  description: 'Garantías de autenticidad pericial: espectrometría UV, microscopía 40x, certificado físico foliado con sello en seco y protocolo de embalaje en papel glassine neutro.',
};

export default function CertificacionPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <VaultTrustSection />
      <SecurityProtocol />
    </div>
  );
}

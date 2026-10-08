import { Metadata } from 'next';
import { ClientRegistrationForm } from '@/components/ClientRegistrationForm';

export const metadata: Metadata = {
  title: 'Registro — Filatelia Bolivia | Correos de Bolivia',
  description: 'Cree su cuenta oficial en Filatelia Bolivia. Acceda a estampillas históricas, certificados notariados y custodia postal de Correos de Bolivia.',
};

export default function RegistroPage() {
  return (
    <main className="animate-in fade-in duration-300">
      <ClientRegistrationForm />
    </main>
  );
}

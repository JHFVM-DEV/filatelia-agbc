import { redirect } from 'next/navigation';

export default async function ProductCatalogLink({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/catalogo?pieza=${encodeURIComponent(slug)}`);
}

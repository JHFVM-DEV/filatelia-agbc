import { redirect } from 'next/navigation';
import { catalogPieceUrl } from '@/lib/catalog-product';

export default async function ProductCatalogLink({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ action?: string | string[] }> }) {
  const { slug } = await params;
  const { action } = await searchParams;
  redirect(catalogPieceUrl(slug, action));
}

import { normalizeImageUrl } from '@/config/api';
import type { StampItem } from '@/data/stamps';

export interface CatalogProduct {
  id: number; name: string; slug: string; price: string | number;
  catalog_code?: string; category?: { slug: string; name: string };
  face_value?: string; year: number; country?: string; condition?: string; rarity?: string;
  certified?: boolean; stock?: number; perforation?: string; printing_technique?: string;
  paper_type?: string; gum_condition?: string; dimensions?: string; front_image?: string;
  back_image?: string; is_featured?: boolean; is_active?: boolean; description?: string; historical_context?: string;
}

export function mapCatalogProduct(product: CatalogProduct): StampItem {
  const condition = product.condition || '';
  const rarity = product.rarity || '';
  const conditions: Record<string, string> = { MINT_NH: 'Nuevo sin charnela · MNH', MINT_LH: 'Nuevo con charnela · MH', USED: 'Usado / matasellado', FDC: 'Sobre de primer día · FDC' };
  const rarities: Record<string, string> = { MUSEUM_PIECE: 'Pieza de museo', VERY_RARE: 'Muy rara', RARE: 'Rara', SCARCE: 'Escasa', COMMON: 'Común' };
  return {
    id: product.id, name: product.name, slug: product.slug, catalog_code: product.catalog_code || '',
    category: product.category?.slug || 'sellos-y-series', category_name: product.category?.name || 'Sellos oficiales',
    price: Number(product.price), face_value: product.face_value || '', year: product.year, country: product.country || 'Bolivia',
    condition, condition_label: conditions[condition] || condition || 'Consultar ficha', rarity, rarity_label: rarities[rarity] || rarity,
    is_active: product.is_active !== false,
    certified: Boolean(product.certified), stock: Number(product.stock ?? 0), perforation: product.perforation || '',
    printing_technique: product.printing_technique || '', paper_type: product.paper_type || '', gum_condition: product.gum_condition || '',
    dimensions: product.dimensions || '', front_image: normalizeImageUrl(product.front_image),
    back_image: normalizeImageUrl(product.back_image || product.front_image), is_featured: Boolean(product.is_featured),
    description: product.description || '', historical_context: product.historical_context || '',
  };
}

export function catalogPieceUrl(slug: string, action?: string | string[]): string {
  const query = new URLSearchParams({ pieza: slug });
  if (action === 'buy') query.set('action', 'buy');
  return '/catalogo?' + query.toString();
}

import type { StampItem } from '@/data/stamps';

export function canPurchase(stamp: Pick<StampItem, 'stock' | 'is_active'>): boolean {
  return stamp.is_active !== false && stamp.stock > 0;
}

export function PurchaseBanner({ stamp }: { stamp: Pick<StampItem, 'stock' | 'is_active'> }) {
  if (canPurchase(stamp)) return null;
  return <div className={`w-full rounded-lg px-3 py-2 text-center text-xs font-bold ${stamp.stock <= 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>
    {stamp.stock <= 0 ? 'AGOTADO' : 'COMPRA DESHABILITADA'}
  </div>;
}

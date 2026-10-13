import type { StampItem } from '@/data/stamps';

export function canPurchase(stamp: Pick<StampItem, 'stock' | 'is_active'>): boolean {
  return stamp.is_active !== false && stamp.stock > 0;
}

export function PurchaseBanner({ stamp }: { stamp: Pick<StampItem, 'stock' | 'is_active'> }) {
  if (stamp.stock > 0) return null;
  return <div className="w-full rounded-lg bg-red-100 px-3 py-2 text-center text-xs font-bold text-red-800">
    AGOTADO
  </div>;
}

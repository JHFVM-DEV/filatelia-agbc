'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { StampItem } from '@/data/stamps';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: number[];
  allStamps: StampItem[];
  onMoveToCart: (stamp: StampItem) => void;
  onMoveAllToCart: (stamps: StampItem[]) => void;
  onRemoveFromWishlist: (stampId: number) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  allStamps,
  onMoveToCart,
  onMoveAllToCart,
  onRemoveFromWishlist,
}) => {
  if (!isOpen) return null;

  const items = allStamps.filter((stamp) => wishlistIds.includes(stamp.id));
  const totalEstimatedValue = items.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E2DDD5]">
          
          {/* Header */}
          <div className="bg-[#102542] px-6 py-5 text-white flex items-center justify-between border-b border-[#2C63AC]">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-amber-300 fill-amber-300/20" />
              <h3 className="font-bold text-base tracking-wide">
                Piezas en Seguimiento ({items.length})
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
              title="Cerrar cajón"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F0]/40">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 border border-slate-200 text-slate-400">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#102542]">No tiene piezas en seguimiento</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Explore el catálogo y marque los ejemplares de su interés con el ícono de custodia para monitorear su disponibilidad.
                </p>
              </div>
            ) : (
              items.map((stamp) => (
                <div 
                  key={stamp.id}
                  className="bg-white p-4 rounded-xl border border-[#E2DDD5] shadow-sm flex gap-3.5 items-center group hover:border-[#102542]/30 transition"
                >
                  <div className="relative w-16 h-20 bg-[#FAF8F0] p-1.5 rounded border border-[#E5DFC8] shrink-0">
                    <Image 
                      src={stamp.front_image}
                      alt={stamp.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#8A6800] uppercase tracking-wider block">
                      {stamp.catalog_code}
                    </span>
                    <h4 className="font-bold text-xs text-[#102542] truncate mt-0.5" title={stamp.name}>
                      {stamp.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-[#102542]">
                        {stamp.price.toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                        {stamp.condition}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        onClick={() => onMoveToCart(stamp)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102542] hover:bg-[#2C63AC] text-amber-200 hover:text-white text-[11px] font-semibold shadow-sm transition"
                        title="Trasladar a la Bóveda de compras"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                        <span>Trasladar a Bóveda</span>
                      </button>
                      <button
                        onClick={() => onRemoveFromWishlist(stamp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                        title="Quitar de seguimiento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E2DDD5] space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Valoración Total en Seguimiento:</span>
                <span className="font-bold text-[#102542] text-sm">
                  {totalEstimatedValue.toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB
                </span>
              </div>

              <button
                onClick={() => onMoveAllToCart(items)}
                className="w-full gold-button py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <span>Trasladar Todas a la Bóveda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

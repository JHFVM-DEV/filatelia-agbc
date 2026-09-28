'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { StampItem } from '@/data/stamps';

export interface CartItem {
  stamp: StampItem;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (stampId: number, delta: number) => void;
  onRemoveItem: (stampId: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.stamp.price * item.quantity, 0);

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
          <div className="bg-[#002B5B] px-6 py-5 text-white flex items-center justify-between border-b border-[#0A3B73]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-base tracking-wide">
                Bóveda de Colección ({items.length})
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8F0]/40">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-[#002B5B]">Su bóveda de compra está vacía</h4>
                <p className="text-xs text-slate-500 mt-1">Explore el catálogo para añadir piezas oficiales o accesorios de preservación.</p>
              </div>
            ) : (
              items.map(({ stamp, quantity }) => (
                <div 
                  key={stamp.id}
                  className="bg-white p-4 rounded-xl border border-[#E2DDD5] shadow-sm flex gap-3.5 items-center"
                >
                  <div className="relative w-16 h-20 bg-[#FAF8F0] p-1.5 rounded border border-[#E5DFC8] shrink-0">
                    <Image 
                      src={stamp.front_image}
                      alt={stamp.name}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#C99A00] uppercase tracking-wider block">
                      {stamp.catalog_code}
                    </span>
                    <h4 className="font-bold text-xs text-[#002B5B] truncate mt-0.5">
                      {stamp.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {stamp.price.toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB c/u
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E2DDD5] rounded-lg bg-[#FAF8F0] text-xs font-semibold text-[#002B5B]">
                        <button
                          onClick={() => onUpdateQuantity(stamp.id, -1)}
                          className="px-2 py-0.5 hover:bg-slate-200 transition rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(stamp.id, 1)}
                          className="px-2 py-0.5 hover:bg-slate-200 transition rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(stamp.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Eliminar de la bóveda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal and Checkout CTA */}
          {items.length > 0 && (
            <div className="bg-white p-6 border-t border-[#E2DDD5] space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Filatélico:</span>
                  <span className="font-semibold text-[#002B5B]">
                    {totalAmount.toLocaleString('es-BO', { minimumFractionDigits: 2 })} BOB
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Embalaje Rígido Glassine:
                  </span>
                  <span className="font-bold">Cortesía Oficial</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E2DDD5] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#002B5B]">Total a Liquidar:</span>
                <span className="text-2xl font-black text-[#002B5B]">
                  {totalAmount.toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-500">BOB</span>
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full gold-button py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceder a Checkout de Bóveda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

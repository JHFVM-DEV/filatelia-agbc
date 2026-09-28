'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { StoreProvider, useStore } from '@/context/StoreContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { INITIAL_STAMPS } from '@/data/stamps';

const CartDrawer = dynamic(
  () => import('@/components/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
);
const WishlistDrawer = dynamic(
  () => import('@/components/WishlistDrawer').then((m) => m.WishlistDrawer),
  { ssr: false }
);
const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((m) => m.CheckoutModal),
  { ssr: false }
);
const CollectorOrdersModal = dynamic(
  () => import('@/components/CollectorOrdersModal').then((m) => m.CollectorOrdersModal),
  { ssr: false }
);
const CertificateModal = dynamic(
  () => import('@/components/CertificateModal').then((m) => m.CertificateModal),
  { ssr: false }
);
const UnifiedLoginModal = dynamic(
  () => import('@/components/UnifiedLoginModal').then((m) => m.UnifiedLoginModal),
  { ssr: false }
);

const ShellContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    cart,
    wishlist,
    currentUser,
    isCartOpen,
    isWishlistOpen,
    isCheckoutOpen,
    isOrdersOpen,
    selectedCertificateOrder,
    isLoginModalOpen,
    openCart,
    closeCart,
    openWishlist,
    closeWishlist,
    openCheckout,
    closeCheckout,
    openOrders,
    closeOrders,
    openCertificate,
    closeCertificate,
    openLoginModal,
    closeLoginModal,
    updateQuantity,
    removeItem,
    toggleWishlist,
    moveToCart,
    moveAllWishlistToCart,
    clearCart,
    setCurrentUser,
    logout,
  } = useStore();

  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isAdmin
          ? 'bg-[#030d1d] selection:bg-[#F4C400] selection:text-[#001A38]'
          : 'bg-[#FAF8F0] selection:bg-[#F4C400] selection:text-[#002B5B]'
      }`}
    >
      {/* Persistent Navbar across public routes only */}
      {!isAdmin && (
        <Navbar
          cartCount={totalCartCount}
          wishlistCount={wishlist.length}
          onOpenCart={openCart}
          onOpenWishlist={openWishlist}
          onOpenOrders={openOrders}
          onOpenLoginModal={openLoginModal}
          currentUser={currentUser}
          onLogout={logout}
        />
      )}

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Persistent Footer on public routes only */}
      {!isAdmin && <Footer />}

      {/* Global Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={closeCart}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onProceedToCheckout={openCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={closeWishlist}
        wishlistIds={wishlist}
        allStamps={INITIAL_STAMPS}
        onMoveToCart={moveToCart}
        onMoveAllToCart={moveAllWishlistToCart}
        onRemoveFromWishlist={toggleWishlist}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        items={cart}
        onOrderSuccess={clearCart}
        currentUser={currentUser}
        onViewCertificate={openCertificate}
      />

      <CollectorOrdersModal
        isOpen={isOrdersOpen}
        onClose={closeOrders}
        currentUser={currentUser}
        onViewCertificate={openCertificate}
      />

      <CertificateModal
        isOpen={!!selectedCertificateOrder}
        onClose={closeCertificate}
        order={selectedCertificateOrder}
      />

      <UnifiedLoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={setCurrentUser}
      />
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreProvider>
      <ShellContent>{children}</ShellContent>
    </StoreProvider>
  );
};

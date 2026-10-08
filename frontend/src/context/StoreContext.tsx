'use client';
import { API_BASE_URL } from '@/config/api';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StampItem } from '@/data/stamps';
import type { CartItem } from '@/components/CartDrawer';

interface StoreContextType {
  cart: CartItem[];
  wishlist: number[];
  currentUser: any;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isLoginModalOpen: boolean;
  isWishlistOpen: boolean;
  isOrdersOpen: boolean;
  selectedCertificateOrder: any | null;
  addToCart: (stamp: StampItem) => void;
  updateQuantity: (stampId: number, delta: number) => void;
  removeItem: (stampId: number) => void;
  toggleWishlist: (stampId: number) => void;
  moveToCart: (stamp: StampItem) => void;
  moveAllWishlistToCart: (stamps: StampItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openLoginModal: (view?: 'login' | 'register' | 'forgot' | 'reset') => void;
  openRegisterModal: () => void;
  closeLoginModal: () => void;
  loginModalInitialView: 'login' | 'register' | 'forgot' | 'reset';
  openWishlist: () => void;
  closeWishlist: () => void;
  openOrders: () => void;
  closeOrders: () => void;
  openCertificate: (order: any) => void;
  closeCertificate: () => void;
  isProfileOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  isTrackingOpen: boolean;
  trackingInitialCode: string | null;
  openTracking: (code?: string | null) => void;
  closeTracking: () => void;
  isEmailVerificationOpen: boolean;
  emailVerificationReason: 'wishlist' | 'checkout' | 'general' | null;
  pendingWishlistStampId: number | null;
  openEmailVerificationModal: (reason?: 'wishlist' | 'checkout' | 'general', pendingStampId?: number | null) => void;
  closeEmailVerificationModal: () => void;
  handleEmailVerificationSuccess: (verifiedUser: any) => void;
  isEmailVerified: boolean;
  setCurrentUser: (user: any) => void;
  logout: () => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalInitialView, setLoginModalInitialView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingInitialCode, setTrackingInitialCode] = useState<string | null>(null);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
  const [emailVerificationReason, setEmailVerificationReason] = useState<'wishlist' | 'checkout' | 'general' | null>('general');
  const [pendingWishlistStampId, setPendingWishlistStampId] = useState<number | null>(null);
  const [selectedCertificateOrder, setSelectedCertificateOrder] = useState<any | null>(null);

  const openTracking = (code?: string | null) => {
    setTrackingInitialCode(code || null);
    setIsTrackingOpen(true);
  };

  const closeTracking = () => {
    setIsTrackingOpen(false);
    setTrackingInitialCode(null);
  };

  const [isLoaded, setIsLoaded] = useState(false);

  const purgeSession = () => {
    setCurrentUser(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('filatelia_user');
        localStorage.removeItem('filatelia_token');
      }
    } catch {}
  };

  // Cargar sesión y sincronizar con Backend
  useEffect(() => {
    // 1. Detectar si venimos de un cierre de sesión SSO desde Filament
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('sso_logout') === '1') {
        purgeSession();
        urlParams.delete('sso_logout');
        const newQuery = urlParams.toString() ? `?${urlParams.toString()}` : '';
        window.history.replaceState({}, '', `${window.location.pathname}${newQuery}`);

        try {
          const savedCart = localStorage.getItem('filatelia_cart');
          if (savedCart) setCart(JSON.parse(savedCart));
          const savedWishlist = localStorage.getItem('filatelia_wishlist');
          if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
        } catch {}
        setIsLoaded(true);
        return;
      }
    }

    // 2. Cargar sesión local y carritos guardados
    let hasToken = false;
    try {
      const savedUser = localStorage.getItem('filatelia_user');
      const savedToken = localStorage.getItem('filatelia_token');

      if (savedUser && savedToken) {
        hasToken = true;
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && typeof parsed === 'object') {
            if (parsed.email === 'admin@filatelia.bo') {
              parsed.roles = parsed.roles && parsed.roles.length > 0 ? parsed.roles : ['SUPER_ADMIN'];
              parsed.primary_role = parsed.primary_role || 'SUPER_ADMIN';
            } else if (parsed.email === 'almacen@filatelia.bo') {
              parsed.roles = parsed.roles && parsed.roles.length > 0 ? parsed.roles : ['ADMIN_PRODUCTOS_ALMACEN'];
              parsed.primary_role = parsed.primary_role || 'ADMIN_PRODUCTOS_ALMACEN';
            }
            setCurrentUser(parsed);
          }
        } catch {}
      }

      const savedCart = localStorage.getItem('filatelia_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem('filatelia_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch {} finally {
      setIsLoaded(true);
    }

    // 3. Verificación asíncrona de sesión con el Backend (una sola vez al montar)
    if (hasToken) {
      const verifySessionWithBackend = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
        if (!token) return;

        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/verify-session`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });

          if (res.status === 401) {
            // Token explícitamente revocado en el backend
            purgeSession();
          } else if (res.ok) {
            const data = await res.json();
            if (data.valid && data.user) {
              const updated = {
                ...data.user,
                roles: data.user.roles || (data.user.email === 'admin@filatelia.bo' ? ['SUPER_ADMIN'] : ['CLIENTE']),
                primary_role: data.user.primary_role || (data.user.email === 'admin@filatelia.bo' ? 'SUPER_ADMIN' : 'CLIENTE'),
                permissions: data.user.permissions || [],
              };
              setCurrentUser(updated);
              try {
                localStorage.setItem('filatelia_user', JSON.stringify(updated));
              } catch {}
            }
          }
        } catch {
          // Si hay corte de red momentáneo, NO cerramos sesión
        }
      };

      verifySessionWithBackend();
    }
  }, []);

  // Persistir carrito
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('filatelia_cart', JSON.stringify(cart));
    } catch {}
  }, [cart, isLoaded]);

  // Persistir wishlist
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('filatelia_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, isLoaded]);

  // Persistir sesión de usuario (solo cuando cambie después de cargar)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (currentUser) {
        localStorage.setItem('filatelia_user', JSON.stringify(currentUser));
      }
    } catch {}
  }, [currentUser, isLoaded]);

  const addToCart = (stamp: StampItem) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.stamp.id === stamp.id);
      if (existing) {
        return prev.map((item) =>
          item.stamp.id === stamp.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { stamp, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (stampId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.stamp.id === stampId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (stampId: number) => {
    setCart((prev) => prev.filter((item) => item.stamp.id !== stampId));
  };

  const isEmailVerified = Boolean(
    currentUser && (
      currentUser.email === 'admin@filatelia.bo' ||
      currentUser.email === 'almacen@filatelia.bo' ||
      currentUser.roles?.includes('SUPER_ADMIN') ||
      currentUser.roles?.includes('ADMIN_PRODUCTOS_ALMACEN') ||
      currentUser.email_verified_at
    )
  );

  const openEmailVerificationModal = (
    reason: 'wishlist' | 'checkout' | 'general' = 'general',
    pendingStampId: number | null = null
  ) => {
    setEmailVerificationReason(reason);
    setPendingWishlistStampId(pendingStampId);
    setIsEmailVerificationOpen(true);
  };

  const closeEmailVerificationModal = () => {
    setIsEmailVerificationOpen(false);
    setPendingWishlistStampId(null);
  };

  const handleEmailVerificationSuccess = (verifiedUser: any) => {
    setCurrentUser(verifiedUser);
    try {
      localStorage.setItem('filatelia_user', JSON.stringify(verifiedUser));
    } catch {}

    const lastReason = emailVerificationReason;
    const lastPendingId = pendingWishlistStampId;

    if (lastReason === 'checkout') {
      setIsCheckoutOpen(true);
    } else if (lastReason === 'wishlist' && lastPendingId !== null) {
      setWishlist((prev) => (prev.includes(lastPendingId) ? prev : [...prev, lastPendingId]));
    }
  };

  const toggleWishlist = (stampId: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!isEmailVerified) {
      openEmailVerificationModal('wishlist', stampId);
      return;
    }
    setWishlist((prev) =>
      prev.includes(stampId) ? prev.filter((id) => id !== stampId) : [...prev, stampId]
    );
  };

  const moveToCart = (stamp: StampItem) => {
    addToCart(stamp);
    setWishlist((prev) => prev.filter((id) => id !== stamp.id));
  };

  const moveAllWishlistToCart = (stampsToMove: StampItem[]) => {
    stampsToMove.forEach((stamp) => {
      addToCart(stamp);
    });
    setWishlist([]);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const logout = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('filatelia_token') : null;
    purgeSession();

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
    } catch {}
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCheckout = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!isEmailVerified) {
      openEmailVerificationModal('checkout');
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        currentUser,
        isCartOpen,
        isCheckoutOpen,
        isLoginModalOpen,
        isWishlistOpen,
        isOrdersOpen,
        selectedCertificateOrder,
        isEmailVerificationOpen,
        emailVerificationReason,
        pendingWishlistStampId,
        openEmailVerificationModal,
        closeEmailVerificationModal,
        handleEmailVerificationSuccess,
        isEmailVerified,
        addToCart,
        updateQuantity,
        removeItem,
        toggleWishlist,
        moveToCart,
        moveAllWishlistToCart,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        openCheckout,
        closeCheckout: () => setIsCheckoutOpen(false),
        openLoginModal: (view?: any) => {
          const safeView: 'login' | 'register' | 'forgot' | 'reset' =
            typeof view === 'string' && ['login', 'register', 'forgot', 'reset'].includes(view)
              ? (view as 'login' | 'register' | 'forgot' | 'reset')
              : 'login';
          setLoginModalInitialView(safeView);
          setIsLoginModalOpen(true);
        },
        openRegisterModal: () => {
          setLoginModalInitialView('register');
          setIsLoginModalOpen(true);
        },
        closeLoginModal: () => setIsLoginModalOpen(false),
        loginModalInitialView,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false),
        openOrders: () => setIsOrdersOpen(true),
        closeOrders: () => setIsOrdersOpen(false),
        isProfileOpen,
        openProfileModal: () => setIsProfileOpen(true),
        closeProfileModal: () => setIsProfileOpen(false),
        isTrackingOpen,
        trackingInitialCode,
        openTracking,
        closeTracking,
        openCertificate: (order: any) => setSelectedCertificateOrder(order),
        closeCertificate: () => setSelectedCertificateOrder(null),
        setCurrentUser,
        logout,
        clearCart,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe utilizarse dentro de un StoreProvider');
  }
  return context;
};

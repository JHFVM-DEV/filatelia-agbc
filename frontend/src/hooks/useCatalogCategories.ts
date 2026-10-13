'use client';

import { useEffect, useState } from 'react';

export interface CatalogCategory {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  sort_order: number;
  products_count: number;
}

export function useCatalogCategories() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let controller: AbortController | undefined;
    const refresh = async () => {
      if (document.visibilityState === 'hidden') return;
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      try {
        const response = await fetch('/api/categories', { cache: 'no-store', signal });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          throw new Error('No se pudieron cargar las categorías.');
        }
        if (disposed || signal.aborted) return;
        setCategories(result.data);
        setLoaded(true);
        setError(null);
      } catch {
        if (!disposed && !signal.aborted) {
          setError('No se pudieron actualizar las categorías. Volveremos a intentarlo.');
        }
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 30000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  return { categories, loaded, error };
}

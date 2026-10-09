'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/config/api';
import { readAdminResponse } from '@/lib/admin-api';

/** Debounces searches and prevents an older request from replacing newer results. */
export function useAdminList<T>(endpoint: string, key: string, params: Record<string, string> = {}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${query ? `?${query}` : ''}`;

  const refresh = useCallback(async () => {
    controller.current?.abort();
    const currentController = new AbortController();
    controller.current = currentController;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('filatelia_token');
      const response = await fetch(url, {
        signal: currentController.signal,
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await readAdminResponse(response);
      if (!Array.isArray(data[key])) throw new Error('El servidor no devolvió la lista solicitada.');
      if (id === requestId.current) setItems(data[key]);
    } catch (cause) {
      if (currentController.signal.aborted || id !== requestId.current) return;
      setError(cause instanceof Error ? cause.message : 'No se pudo conectar con el servidor.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [url, key]);

  const cancel = useCallback(() => {
    controller.current?.abort();
    requestId.current++;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, query.includes('search=') ? 300 : 0);
    return () => {
      clearTimeout(timer);
      cancel();
    };
  }, [refresh, query, cancel]);

  return { items, setItems, loading, error, setError, refresh };
}

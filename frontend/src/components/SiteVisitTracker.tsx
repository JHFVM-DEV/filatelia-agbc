'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackSiteEvent } from '@/lib/site-analytics';

export function SiteVisitTracker() {
  const path = usePathname();
  const params = useSearchParams();
  const piece = params.get('pieza') || '';
  const category = params.get('categoria') || '';
  const previous = useRef('');
  useEffect(() => {
    const key = `${path}|${piece}|${category}`;
    if (previous.current === key) return;
    previous.current = key;
    trackSiteEvent('page_view');
  }, [path, piece, category]);
  return null;
}

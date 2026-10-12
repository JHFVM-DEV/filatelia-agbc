import { API_BASE_URL } from '@/config/api';

type EventType = 'page_view' | 'category_view' | 'product_view' | 'add_to_cart' | 'checkout_started';
interface Session { visitor: string; session: string; last: number; referrer?: string }
let memory: Session | null = null;

function session(): Session | null {
  if (typeof window === 'undefined' || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl || !crypto.randomUUID) return null;
  const now = Date.now();
  let saved = memory;
  try { const raw = localStorage.getItem('filatelia_analytics'); if (raw) saved = JSON.parse(raw) as Session; } catch { /* Use memory when storage is unavailable. */ }
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (saved && (!uuid.test(saved.visitor) || !uuid.test(saved.session) || !Number.isFinite(saved.last))) saved = null;
  if (!saved?.visitor || !saved.session || now - saved.last > 30 * 60 * 1000) {
    let referrer: string | undefined;
    try { const url = new URL(document.referrer); if (url.hostname !== location.hostname) referrer = url.hostname; } catch { /* Direct visit. */ }
    saved = { visitor: saved?.visitor || crypto.randomUUID(), session: crypto.randomUUID(), last: now, referrer };
  }
  saved.last = now; memory = saved;
  try { localStorage.setItem('filatelia_analytics', JSON.stringify(saved)); } catch { /* Memory remains available. */ }
  return saved;
}

export function getAnalyticsSessionId(): string | undefined { return session()?.session; }

export function trackSiteEvent(type: EventType, details: { product_slug?: string; category_slug?: string } = {}): void {
  if (typeof window === 'undefined' || /^\/(admin|api|auth)(\/|$)/.test(location.pathname)) return;
  const current = session();
  if (!current) return;
  const payload = { event_id: crypto.randomUUID(), visitor_id: current.visitor, session_id: current.session,
    event_type: type, path: location.pathname, ...details, referrer_host: current.referrer,
    device: innerWidth < 640 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop', language: navigator.language.slice(0, 30) };
  void fetch(`${API_BASE_URL}/api/analytics/events`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => undefined);
}

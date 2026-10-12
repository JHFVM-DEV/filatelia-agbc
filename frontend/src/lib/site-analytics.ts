type EventType = 'page_view' | 'category_view' | 'product_view' | 'add_to_cart' | 'checkout_started';
type Details = { product_slug?: string; category_slug?: string };
declare global {
  interface Window {
    FilateliaActivity?: { emit: (type: EventType, details?: Details) => void; getSessionId: () => string | undefined; getStatus: () => string };
    filateliaActivityQueue?: { type: EventType; details: Details }[];
  }
}
export function getAnalyticsSessionId(): string | undefined { return typeof window === 'undefined' ? undefined : window.FilateliaActivity?.getSessionId(); }
export function analyticsTrackingAllowed(): boolean {
  return typeof window !== 'undefined' && navigator.doNotTrack !== '1' && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
}
export function getAnalyticsStatus(): string { return typeof window === 'undefined' ? 'loading' : window.FilateliaActivity?.getStatus() ?? 'loading'; }
export function trackSiteEvent(type: EventType, details: Details = {}): void {
  if (typeof window === 'undefined' || /^\/(admin|api|auth)(\/|$)/.test(location.pathname)) return;
  if (window.FilateliaActivity) window.FilateliaActivity.emit(type, details);
  else (window.filateliaActivityQueue ??= []).push({ type, details });
}

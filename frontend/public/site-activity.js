(function () {
  'use strict';
  if (window.FilateliaActivity) return;
  var memory = null, navigation = '', status = 'ready';
  var pending = window.filateliaActivityQueue || [];
  function privatePage() { return /^\/(admin|api|auth)(\/|$)/.test(location.pathname); }
  function persistent() { return navigator.doNotTrack !== '1' && !navigator.globalPrivacyControl; }
  function uuid() {
    try { if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID(); } catch {}
    var bytes = new Uint8Array(16);
    try {
      if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
      else for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    } catch { for (var j = 0; j < 16; j++) bytes[j] = Math.floor(Math.random() * 256); }
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.from(bytes, function (byte) { return byte.toString(16).padStart(2, '0'); }).join('');
    return hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-' + hex.slice(12, 16) + '-' + hex.slice(16, 20) + '-' + hex.slice(20);
  }
  function session() {
    if (!persistent()) return null;
    var saved = memory, now = Date.now();
    try { var raw = localStorage.getItem('filatelia_analytics'); if (raw) saved = JSON.parse(raw); } catch {}
    var valid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (saved && (!valid.test(saved.visitor) || !valid.test(saved.session) || !Number.isFinite(saved.last))) saved = null;
    if (!saved || now - saved.last > 1800000) {
      var referrer;
      try { var url = new URL(document.referrer); if (url.hostname !== location.hostname) referrer = url.hostname; } catch {}
      saved = { visitor: saved ? saved.visitor : uuid(), session: uuid(), last: now, referrer: referrer };
    }
    saved.last = now; memory = saved;
    try { localStorage.setItem('filatelia_analytics', JSON.stringify(saved)); } catch {}
    return saved;
  }
  function emit(type, details) {
    if (privatePage()) return;
    var current = session();
    var payload = Object.assign({ event_id: uuid(), event_type: type, path: location.pathname,
      device: innerWidth < 640 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop' }, details || {});
    if (current) { payload.visitor_id = current.visitor; payload.session_id = current.session; payload.referrer_host = current.referrer; payload.language = (navigator.language || '').slice(0, 30); }
    function send(attempt) {
      status = 'sending';
      fetch('/api/site-events', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload), keepalive: true })
        .then(function (response) {
          if ((response.status >= 500 || response.status === 429) && attempt < 2) { setTimeout(function () { send(attempt + 1); }, 500 * (attempt + 1)); return; }
          status = response.ok && response.status === 204 ? (response.headers.get('X-Analytics-Status') || 'unconfirmed') : 'error-' + response.status;
        }).catch(function () {
          if (attempt < 2) { setTimeout(function () { send(attempt + 1); }, 500 * (attempt + 1)); return; }
          status = 'network-error';
        });
    }
    send(0);
  }
  function visit() {
    var params = new URLSearchParams(location.search), category = params.get('categoria'), piece = params.get('pieza');
    var key = location.pathname + '|' + (category || '') + '|' + (piece || '');
    if (key === navigation) return;
    navigation = key;
    if (privatePage()) return;
    emit('page_view');
    if (location.pathname === '/catalogo' && category && category !== 'all') emit('category_view', { category_slug: category });
    if (location.pathname === '/catalogo' && piece) emit('product_view', { product_slug: piece });
  }
  document.addEventListener('click', function (event) {
    if (privatePage() || !(event.target instanceof Element)) return;
    var product = event.target.closest('[data-site-product]'), category = event.target.closest('[data-site-category]');
    if (product) emit('product_view', { product_slug: product.getAttribute('data-site-product') });
    else if (category && category.getAttribute('data-site-category') !== 'all') emit('category_view', { category_slug: category.getAttribute('data-site-category') });
  }, true);
  ['pushState', 'replaceState'].forEach(function (name) {
    var original = history[name];
    history[name] = function () { var result = original.apply(this, arguments); queueMicrotask(visit); return result; };
  });
  window.addEventListener('popstate', visit);
  window.addEventListener('pageshow', visit);
  window.FilateliaActivity = { emit: emit, getSessionId: function () { var current = session(); return current ? current.session : undefined; }, getStatus: function () { return status; } };
  window.filateliaActivityQueue = [];
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', visit, { once: true });
  else visit();
  pending.forEach(function (event) { emit(event.type, event.details); });
}());

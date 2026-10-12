const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const vm = require('node:vm');

function setup() {
  const values = new Map(); const requests = [];
  const listeners = new Map();
  global.window = { crypto: global.crypto, addEventListener: (name, callback) => listeners.set(name, callback) }; global.location = { pathname: '/catalogo', hostname: 'filatelia.test', search: '?email=private@test' };
  global.document = { referrer: 'https://correos.test/vitrina?private=secret', readyState: 'loading', documentElement: { setAttribute() { throw new Error('Tracking must not mutate the hydrated HTML root.'); } }, addEventListener: (name, callback) => listeners.set(name, callback) }; global.innerWidth = 390;
  Object.defineProperty(global, 'navigator', { configurable: true, value: { doNotTrack: '0', language: 'es-BO' } });
  global.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  global.fetch = (url, options) => { assert.equal(url, '/api/site-events'); requests.push(JSON.parse(options.body)); return Promise.resolve({ ok: true, status: 204, headers: { get: () => 'recorded' } }); };
  class Element {
    constructor(attributes) { this.attributes = attributes; }
    closest(selector) { return Object.hasOwn(this.attributes, selector.slice(1,-1)) ? this : null; }
    getAttribute(name) { return this.attributes[name] ?? null; }
  }
  const context = vm.createContext({ window, document, navigator, location, innerWidth, localStorage, Element,
    Uint8Array, URL, URLSearchParams, Date, Math, Number, Array, queueMicrotask, history: { pushState() {}, replaceState() {} },
    fetch: (...args) => global.fetch(...args), setTimeout: (...args) => global.setTimeout(...args) });
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../public/site-activity.js'), 'utf8'), context);
  const filename = path.resolve(__dirname, '../src/lib/site-analytics.ts'); const mod = new Module(filename);
  mod.require = () => ({ API_BASE_URL: '' });
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
  return { ...mod.exports, values, requests, visit: () => listeners.get('DOMContentLoaded')(), click: attributes => listeners.get('click')({ target: new Element(attributes) }) };
}

test('tracking preserves one session and sends paths and referrer hosts without private queries', () => {
  const tracker = setup(); tracker.trackSiteEvent('page_view'); tracker.trackSiteEvent('product_view', { product_slug: 'paujil' });
  assert.equal(tracker.requests.length, 2);
  assert.equal(tracker.requests[0].session_id, tracker.requests[1].session_id);
  assert.notEqual(tracker.requests[0].event_id, tracker.requests[1].event_id);
  assert.equal(tracker.requests[0].referrer_host, 'correos.test');
  assert.equal(tracker.requests[0].path, '/catalogo'); assert.equal(tracker.requests[0].device, 'mobile');
  assert.equal(JSON.stringify(tracker.requests).includes('private'), false);
  assert.equal(tracker.getAnalyticsSessionId(), tracker.requests[0].session_id);
});

test('after inactivity a new session retains the anonymous browser identity', () => {
  const tracker = setup(); tracker.trackSiteEvent('page_view');
  const stored = JSON.parse(tracker.values.get('filatelia_analytics')); stored.last -= 31 * 60 * 1000;
  tracker.values.set('filatelia_analytics', JSON.stringify(stored)); tracker.trackSiteEvent('page_view');
  assert.notEqual(tracker.requests[0].session_id, tracker.requests[1].session_id);
  assert.equal(tracker.requests[0].visitor_id, tracker.requests[1].visitor_id);
});

test('private pages are excluded and privacy preferences produce anonymous counts only', () => {
  const tracker = setup(); global.location.pathname = '/admin/piezas'; tracker.trackSiteEvent('page_view');
  global.location.pathname = '/'; global.navigator.doNotTrack = '1'; tracker.trackSiteEvent('page_view');
  assert.equal(tracker.getAnalyticsSessionId(), undefined);
  global.navigator.doNotTrack = '0'; global.navigator.globalPrivacyControl = true; tracker.trackSiteEvent('page_view');
  assert.equal(tracker.requests.length, 2);
  for (const event of tracker.requests) { assert.equal(event.visitor_id, undefined); assert.equal(event.session_id, undefined); assert.equal(event.referrer_host, undefined); }
});

test('unavailable storage and network do not interrupt the storefront', async () => {
  const tracker = setup(); global.localStorage = { getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Denied'); } };
  global.fetch = () => Promise.reject(new Error('Offline'));
  assert.doesNotThrow(() => tracker.trackSiteEvent('page_view'));
  assert.ok(tracker.getAnalyticsSessionId()); await new Promise(resolve => setTimeout(resolve, 1600));
});

test('HTTP LAN browsers without randomUUID still record valid category and product events', () => {
  const original = Object.getOwnPropertyDescriptor(global, 'crypto');
  const webcrypto = require('node:crypto').webcrypto;
  Object.defineProperty(global, 'crypto', { configurable: true, value: { getRandomValues: webcrypto.getRandomValues.bind(webcrypto) } });
  try {
    const tracker = setup(); tracker.trackSiteEvent('category_view', { category_slug: 'sellos-y-series' });
    tracker.trackSiteEvent('product_view', { product_slug: 'paujil' });
    assert.equal(tracker.requests.length, 2);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    for (const event of tracker.requests) for (const key of ['event_id', 'visitor_id', 'session_id']) assert.match(event[key], uuid);
    assert.equal(tracker.requests[0].category_slug, 'sellos-y-series');
    assert.equal(tracker.requests[1].product_slug, 'paujil');
    assert.equal(tracker.requests[0].session_id, tracker.requests[1].session_id);
  } finally { Object.defineProperty(global, 'crypto', original); }
});

test('temporary server failures retry the same event identifier without double counting', async () => {
  const tracker = setup(); const requests = []; const originalTimer = global.setTimeout;
  global.setTimeout = callback => { callback(); return 0; };
  global.fetch = (_url, options) => {
    requests.push(JSON.parse(options.body));
    return Promise.resolve({ ok: requests.length > 1, status: requests.length > 1 ? 204 : 503, headers: { get: () => 'recorded' } });
  };
  try {
    tracker.trackSiteEvent('category_view', { category_slug: 'sellos-y-series' });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(requests.length, 2); assert.equal(requests[0].event_id, requests[1].event_id);
  } finally { global.setTimeout = originalTimer; }
});

test('native category and piece clicks record without React hydration', () => {
  const tracker = setup();
  tracker.click({ 'data-site-category': 'sellos-y-series' }); tracker.click({ 'data-site-product': 'fab' });
  assert.deepEqual(tracker.requests.map(event => event.event_type), ['category_view', 'product_view']);
  assert.equal(tracker.requests[0].category_slug, 'sellos-y-series'); assert.equal(tracker.requests[1].product_slug, 'fab');
});

test('the initial category link records once across repeated lifecycle events', () => {
  const tracker = setup(); global.location.search = '?categoria=sellos-y-series'; tracker.visit(); tracker.visit();
  assert.deepEqual(tracker.requests.map(event => event.event_type), ['page_view', 'category_view']);
});

test('a response without storage confirmation is reported as unconfirmed', async () => {
  const tracker = setup(); global.fetch = () => Promise.resolve({ ok: true, status: 204, headers: { get: () => null } });
  tracker.trackSiteEvent('page_view'); await new Promise(resolve => setImmediate(resolve));
  assert.equal(tracker.getAnalyticsStatus(), 'unconfirmed');
});

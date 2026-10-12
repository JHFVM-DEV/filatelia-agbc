const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function setup() {
  const values = new Map(); const requests = [];
  global.window = {}; global.location = { pathname: '/catalogo', hostname: 'filatelia.test', search: '?email=private@test' };
  global.document = { referrer: 'https://correos.test/vitrina?private=secret' }; global.innerWidth = 390;
  Object.defineProperty(global, 'navigator', { configurable: true, value: { doNotTrack: '0', language: 'es-BO' } });
  global.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  global.fetch = (_url, options) => { requests.push(JSON.parse(options.body)); return Promise.resolve({ ok: true }); };
  const filename = path.resolve(__dirname, '../src/lib/site-analytics.ts'); const mod = new Module(filename);
  mod.require = () => ({ API_BASE_URL: '' });
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
  return { ...mod.exports, values, requests };
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

test('private pages and privacy preferences prevent tracking', () => {
  const tracker = setup(); global.location.pathname = '/admin/piezas'; tracker.trackSiteEvent('page_view');
  global.location.pathname = '/'; global.navigator.doNotTrack = '1'; tracker.trackSiteEvent('page_view');
  assert.equal(tracker.getAnalyticsSessionId(), undefined);
  global.navigator.doNotTrack = '0'; global.navigator.globalPrivacyControl = true; tracker.trackSiteEvent('page_view');
  assert.equal(tracker.requests.length, 0);
});

test('unavailable storage and network do not interrupt the storefront', async () => {
  const tracker = setup(); global.localStorage = { getItem() { throw new Error('Denied'); }, setItem() { throw new Error('Denied'); } };
  global.fetch = () => Promise.reject(new Error('Offline'));
  assert.doesNotThrow(() => tracker.trackSiteEvent('page_view'));
  assert.ok(tracker.getAnalyticsSessionId()); await new Promise(resolve => setImmediate(resolve));
});

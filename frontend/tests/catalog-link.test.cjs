const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, relative);
  const mod = new Module(filename);
  const originalRequire = mod.require.bind(mod);
  mod.require = name => Object.hasOwn(overrides, name) ? overrides[name] : originalRequire(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
  return mod.exports;
}
const api = load('../src/config/api.ts');
const { catalogPieceUrl, mapCatalogProduct } = load('../src/lib/catalog-product.ts', { '@/config/api': api });
const slug = 'campana-filatelica-feliz-sello-postal-2001';

test('the company showcase buy link keeps both the piece and purchase action', () => {
  const url = new URL(catalogPieceUrl(slug, 'buy'), 'https://filatelia.correos.gob.bo');
  assert.equal(url.pathname, '/catalogo');
  assert.equal(url.searchParams.get('pieza'), slug);
  assert.equal(url.searchParams.get('action'), 'buy');
});

test('technical sheet links and unsupported actions do not trigger a purchase', () => {
  for (const action of [undefined, 'delete', ['buy', 'delete']]) {
    const url = new URL(catalogPieceUrl(slug, action), 'https://filatelia.correos.gob.bo');
    assert.equal(url.searchParams.get('pieza'), slug);
    assert.equal(url.searchParams.has('action'), false);
  }
});

test('special characters in a slug cannot inject a purchase action', () => {
  const url = new URL(catalogPieceUrl('pieza&action=buy'), 'https://filatelia.correos.gob.bo');
  assert.equal(url.searchParams.get('pieza'), 'pieza&action=buy');
  assert.equal(url.searchParams.has('action'), false);
});

test('the linked product uses actual database ids, prices and availability instead of seed values', () => {
  const stamp = mapCatalogProduct({ id: 713, name: 'Estoy feliz', slug, year: 2001, price: '2.50', stock: 0,
    face_value: 'Bs 2.50', front_image: '/storage/product-images/actual.png' });
  assert.equal(stamp.id, 713);
  assert.equal(stamp.price, 2.5);
  assert.equal(stamp.stock, 0);
  assert.equal(stamp.front_image, '/storage/product-images/actual.png');
  assert.equal(stamp.perforation, '');
  assert.equal(stamp.printing_technique, '');
});

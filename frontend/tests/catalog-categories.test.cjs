const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function renderCategories(categories, initialCategory) {
  const filename = path.resolve(__dirname, '../src/components/CatalogSection.tsx');
  const mod = new Module(filename);
  mod.paths = module.paths;
  const originalRequire = mod.require.bind(mod);
  mod.require = name => {
    if (name === '@/hooks/useCatalogCategories') return { useCatalogCategories: () => ({ categories, loaded: true, error: null }) };
    if (name === './PurchaseBanner') return { PurchaseBanner: () => null, canPurchase: () => true };
    if (name === 'next/image') return { __esModule: true, default: () => null };
    return originalRequire(name);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
  return renderToStaticMarkup(React.createElement(mod.exports.CatalogSection, {
    stamps: [], wishlist: [], initialCategory,
    onInspect() {}, onAddToCart() {}, onToggleWishlist() {},
  }));
}

test('catalog filters render every API category, including a new empty category', () => {
  const html = renderCategories([
    { id: 8, slug: 'nueva-tematica', name: 'Nueva temática', products_count: 0 },
    { id: 2, slug: 'sobres-primer-dia', name: 'Sobres Primer Día', products_count: 0 },
  ], 'nueva-tematica');
  assert.match(html, /data-site-category="nueva-tematica" aria-pressed="true"/);
  assert.match(html, /Nueva temática/);
  assert.match(html, /Sobres Primer Día/);
  assert.ok(html.indexOf('Nueva temática') < html.indexOf('Sobres Primer Día'));
  assert.doesNotMatch(html, /data-site-category="fauna-y-flora"/);
});

test('a deleted selected category disappears and the catalog returns to all categories', () => {
  const html = renderCategories([], 'eliminada');
  assert.match(html, /data-site-category="all" aria-pressed="true"/);
  assert.doesNotMatch(html, /data-site-category="eliminada"/);
});

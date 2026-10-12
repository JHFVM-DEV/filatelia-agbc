const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');

function component(file, extra = {}) {
  const events = []; const effects = [];
  const filename = path.resolve(__dirname, '../src', file);
  const mod = new Module(filename);
  const mocks = {
    react: { ...React, useState: initial => [initial, () => {}], useRef: initial => ({ current: initial }), useMemo: callback => callback(), useEffect: callback => effects.push(callback) },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'lucide-react': require('lucide-react'),
    'next/image': () => null,
    '@/lib/site-analytics': { trackSiteEvent: (type, details) => events.push({ type, details }) },
    './PurchaseBanner': { PurchaseBanner: () => null, canPurchase: () => true },
    '@/data/stamps': { CATEGORIES_LIST: [{ id: 'all', name: 'Todo el Catálogo' }, { id: 'sellos-y-series', name: 'Sellos y Series' }] },
    ...extra,
  };
  mod.require = name => { if (Object.hasOwn(mocks, name)) return mocks[name]; throw new Error(`Unexpected import ${name}`); };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
  return { exports: mod.exports, events, effects };
}
function walk(node) {
  if (Array.isArray(node)) return node.flatMap(walk);
  if (!node || typeof node !== 'object') return [];
  return [node, ...walk(node.props?.children)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join('');
  if (typeof node === 'string') return node;
  return node && typeof node === 'object' ? text(node.props?.children) : '';
}

test('category filters expose their real category to the native click tracker', () => {
  const mod = component('components/CatalogSection.tsx');
  const tree = mod.exports.CatalogSection({ stamps: [], wishlist: [], initialCategory: 'sellos-y-series' });
  const button = walk(tree).find(node => node.type === 'button' && text(node.props.children) === 'Sellos y Series');
  assert.ok(button); assert.equal(button.props['data-site-category'], 'sellos-y-series');
});

test('the catalog inspect button exposes the database slug', () => {
  const mod = component('components/CatalogSection.tsx');
  const tree = mod.exports.CatalogSection({ stamps: [{ id: 1, slug: 'fab', price: 3.8, stock: 3, name: 'FAB', description: '', catalog_code: 'A', printing_technique: 'Offset' }], wishlist: [] });
  const card = walk(tree).find(node => typeof node.type === 'function' && node.type.name === 'CatalogCard');
  assert.ok(card);
  const button = walk(card.type(card.props)).find(node => node.type === 'button' && node.props['data-site-product']);
  assert.equal(button.props['data-site-product'], 'fab');
});

test('hero sheet buttons and manual collection selection expose tracking attributes', () => {
  const mod = component('components/Hero.tsx', { 'next/link': () => null });
  const tree = mod.exports.Hero({ stamps: [{ id: 1, slug: 'fab', price: 3.8, stock: 3, category: 'sellos-y-series' }], onInspect() {} });
  const nodes = walk(tree);
  assert.ok(nodes.filter(node => node.type === 'button' && node.props['data-site-product'] === 'fab').length >= 2, JSON.stringify(nodes.filter(node => node.type === 'button').map(node => node.props['data-site-product'])));
  assert.ok(nodes.some(node => node.type === 'button' && node.props['data-site-category'] === 'sellos-y-series'));
});

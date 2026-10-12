const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../src/lib/product-form.ts');
const mod = new Module(filename);
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, filename);
const { productFormData } = mod.exports;

test('multipart submission encodes Laravel booleans and preserves image files', () => {
  const front = new File(['image'], 'front.png', { type: 'image/png' });
  const form = productFormData({ name: 'Sello', certified: true, is_active: false, price: 3.8, stock: 0 }, { front, back: null });
  assert.equal(form.get('certified'), '1');
  assert.equal(form.get('is_active'), '0');
  assert.equal(form.get('stock'), '0');
  assert.equal(form.get('front_image_file').name, 'front.png');
  assert.equal(form.get('back_image_file'), null);
});

test('editing uses method override and does not erase an unchanged image', () => {
  const form = productFormData({ name: 'Actualizado' }, { front: null, back: null }, true);
  assert.equal(form.get('_method'), 'PUT');
  assert.equal(form.has('front_image'), false);
  assert.equal(form.has('front_image_file'), false);
});

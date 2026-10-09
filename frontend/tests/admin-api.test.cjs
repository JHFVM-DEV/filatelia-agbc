const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../src/lib/admin-api.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const mod = new Module(filename);
mod._compile(compiled, filename);
const { readAdminResponse } = mod.exports;

test('successful responses preserve the saved record', async () => {
  const data = { success: true, product: { id: 1, stock: 3 } };
  assert.deepEqual(await readAdminResponse(Response.json(data)), data);
});

test('validation errors reach the user instead of failing silently', async () => {
  const response = Response.json({ errors: { category_id: ['Selecciona una categoría.'], stock: ['Stock inválido.'] } }, { status: 422 });
  await assert.rejects(readAdminResponse(response), /Selecciona una categoría\. Stock inválido\./);
});

test('expired sessions and denied modules expose the server message', async () => {
  for (const status of [401, 403]) {
    await assert.rejects(readAdminResponse(Response.json({ message: 'Acceso denegado.' }, { status })), /Acceso denegado/);
  }
});

test('HTML server errors produce a readable error', async () => {
  await assert.rejects(readAdminResponse(new Response('<html>Error</html>', { status: 500 })), /500/);
});

test('invalid success responses do not look like completed operations', async () => {
  await assert.rejects(readAdminResponse(Response.json({ success: false, message: 'No se guardó.' })), /No se guardó/);
  await assert.rejects(readAdminResponse(new Response('')), /respuesta no válida/);
});

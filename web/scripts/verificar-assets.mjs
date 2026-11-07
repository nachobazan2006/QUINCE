import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = async ruta => JSON.parse((await fs.readFile(ruta, 'utf8')).replace(/^\uFEFF/, ''));
const manifiesto = await leer(path.join(web, '../docs/manifiesto-assets.json'));
const hash = datos => createHash('sha256').update(datos).digest('hex');
const origenHttp = process.argv[2];
let comprobadas = 0;
for (const recurso of manifiesto.recursos) {
  for (const variante of recurso.variantes) {
    const datos = await fs.readFile(path.join(web, 'public', variante.rutaPublica));
    const compilada = await fs.readFile(path.join(web, 'dist', variante.rutaPublica));
    assert.equal(hash(datos), variante.sha256);
    assert.equal(hash(compilada), variante.sha256);
    const meta = await sharp(datos).metadata();
    await sharp(datos).raw().toBuffer();
    assert.equal(meta.width, variante.ancho);
    assert.equal(meta.height, variante.alto);
    assert.equal(meta.format, 'webp');
    assert(meta.width <= recurso.original.ancho);
    assert(Math.abs(meta.height - meta.width * recurso.original.alto / recurso.original.ancho) <= 1);
    if (origenHttp) {
      const response = await fetch(new URL(variante.rutaPublica, origenHttp));
      assert.equal(response.status, 200);
      assert(response.headers.get('content-type').includes('image/webp'));
      assert.equal(hash(Buffer.from(await response.arrayBuffer())), variante.sha256);
    }
    comprobadas++;
  }
}
async function comprobarReferencias(valor) {
  if (!valor || typeof valor !== 'object') return;
  if (typeof valor.src === 'string') {
    assert(valor.src.startsWith('images/') && !valor.src.includes('..'));
    await fs.access(path.join(web, 'public', valor.src));
  }
  for (const hijo of Object.values(valor)) await comprobarReferencias(hijo);
}
for (const archivo of ['navigation', 'home', 'categories', 'products', 'about', 'footer']) {
  const original = await fs.readFile(path.join(web, `public/data/${archivo}.json`));
  const compilado = await fs.readFile(path.join(web, `dist/data/${archivo}.json`));
  assert.equal(hash(original), hash(compilado));
  await comprobarReferencias(JSON.parse(original));
  if (origenHttp) {
    const response = await fetch(new URL(`data/${archivo}.json`, origenHttp));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), JSON.parse(original));
  }
}
console.log(`OK: ${comprobadas} WebP decodificados, proporciones, hashes public/dist, seis JSON y referencias${origenHttp ? ' + HTTP' : ''}.`);

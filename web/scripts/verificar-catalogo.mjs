import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { obtenerProductosColeccion } from '../src/services/catalogo.js';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = async nombre => JSON.parse(await fs.readFile(path.join(web, `public/data/${nombre}.json`), 'utf8'));
const { products: productos } = await leer('products');
const { categories: categorias } = await leer('categories');
const inicio = await leer('home');
const ids = new Set();
const slugs = new Set();
const imagenes = new Set();
for (const producto of productos) {
  assert(!ids.has(producto.id), `ID repetido: ${producto.id}`);
  assert(!slugs.has(producto.slug), `Slug repetido: ${producto.slug}`);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(producto.slug));
  assert(producto.name && producto.categoryIds.length);
  assert(producto.categoryIds.every(id => categorias.some(categoria => categoria.id === id)));
  assert(producto.image?.alt && producto.image.width > 0 && producto.image.height > 0);
  assert(!imagenes.has(producto.image.src), `Foto reutilizada entre productos: ${producto.image.src}`);
  assert(Array.isArray(producto.gallery));
  ids.add(producto.id); slugs.add(producto.slug); imagenes.add(producto.image.src);
  for (const imagen of [producto.image, ...producto.gallery]) {
    assert(imagen.src.startsWith('images/') && !imagen.src.includes('..'));
    await fs.access(path.join(web, 'public', imagen.src));
  }
}
assert(inicio.featuredProductIds.every(id => ids.has(id)));
assert.equal(new Set(inicio.featuredProductIds).size, inicio.featuredProductIds.length);
const rugby = obtenerProductosColeccion(productos, categorias, 'rugby');
assert.equal(rugby.length, 8, 'La referencia Rugby tiene ocho prendas');
assert.equal(rugby[0].id, 'camiseta-rugby-oldies');
assert.equal(rugby.at(-1).id, 'medias-largas');
assert.equal(obtenerProductosColeccion(productos, categorias, 'futbol').length, 1);
assert.equal(obtenerProductosColeccion(productos, categorias, 'hockey-femenino').length, 2);
assert.equal(obtenerProductosColeccion(productos, categorias, 'urban').length, 1);
assert.equal(obtenerProductosColeccion(productos, categorias, 'training').length, 0);
assert.equal(obtenerProductosColeccion(productos, categorias, 'sports').length, 11);
// invertimos una copia para comprobar que el filtro no impone un orden propio
assert.equal(obtenerProductosColeccion([...productos].reverse(), categorias, 'rugby')[0].id, 'medias-largas');
console.log(`OK: ${productos.length} productos, IDs/slugs/fotos únicos, relaciones, destacados, orden y colecciones aisladas.`);

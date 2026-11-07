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
assert(rugby.length >= 8, 'Se conservan las ocho prendas iniciales de Rugby');
assert.equal(rugby[0].id, 'camiseta-rugby-oldies');
assert.equal(rugby[7].id, 'medias-largas');
assert(obtenerProductosColeccion(productos, categorias, 'futbol').length >= 1);
assert(obtenerProductosColeccion(productos, categorias, 'hockey-femenino').length >= 2);
assert(obtenerProductosColeccion(productos, categorias, 'urban').length >= 1);
assert(obtenerProductosColeccion(productos, categorias, 'training').length > 0);
assert.equal(obtenerProductosColeccion(productos, categorias, 'sports').length,
  productos.filter(p => p.categoryIds.some(id => categorias.some(c => c.id === id && c.parentId === 'sports'))).length);
const base = JSON.parse(await fs.readFile(path.resolve(web, '../docs/catalogo-importacion/respaldo-inicial/products.json'), 'utf8'));
for (const [indice, producto] of base.products.entries()) {
  const { gallery, ...antes } = producto;
  const { gallery: actual, ...despues } = productos[indice];
  assert.deepEqual(despues, antes, 'No deben cambiar datos ni orden de los productos originales');
  if (producto.id === 'camiseta-rugby-oldies') assert.deepEqual(productos[indice], producto);
}
const continuacion = JSON.parse(await fs.readFile(path.resolve(web, '../docs/catalogo-continuacion/respaldo-inicial/products.json'), 'utf8'));
assert.deepEqual(productos.slice(0, continuacion.products.length), continuacion.products,
  'Los 24 registros anteriores deben conservar todos sus datos, galerías y orden');
const clasificacionManual = JSON.parse(await fs.readFile(path.resolve(web, '../docs/catalogo-clasificacion-manual/respaldo-inicial/products.json'), 'utf8'));
assert.deepEqual(productos.slice(0, clasificacionManual.products.length), clasificacionManual.products,
  'Los 53 registros anteriores deben conservar todos sus datos, galerías y orden');
// invertimos una copia para comprobar que el filtro no impone un orden propio
assert.equal(obtenerProductosColeccion([...productos].reverse(), categorias, 'rugby')[0].id, rugby.at(-1).id);
console.log(`OK: ${productos.length} productos, IDs/slugs/fotos únicos, relaciones, destacados, orden y colecciones aisladas.`);

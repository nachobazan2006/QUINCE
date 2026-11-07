import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.resolve(web, '../docs');
const salida = path.join(docs, 'catalogo-clasificacion-manual');
const posicion = process.argv.indexOf('--origen');
assert(posicion >= 0 && process.argv[posicion + 1], 'Indicar --origen');
const origen = path.resolve(process.argv[posicion + 1]);
const leer = async ruta => JSON.parse(await fs.readFile(ruta, 'utf8'));
const inventario = await leer(path.join(docs, 'catalogo-importacion/inventario.json'));
const datos = await leer(path.join(web, 'public/data/products.json'));
const categorias = (await leer(path.join(web, 'public/data/categories.json'))).categories;
const manifiesto = await leer(path.join(docs, 'manifiesto-assets.json'));
const rutaPlan = path.join(salida, 'plan-importacion.json');
try { await fs.access(rutaPlan); throw Error('El plan manual ya existe; no se reemplaza su respaldo.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
assert.equal(datos.products.length, 53, 'Esta selección parte de los 53 productos existentes.');
const hash = b => createHash('sha256').update(b).digest('hex');
const slug = nombre => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// las categorías y la separación de REGLAN son indicaciones del usuario, no inferencias por escudo
const selecciones = [
  [4, 'institutions', [0, 1, 2]],
  [5, 'urban', [0, 1]],
  [8, 'rugby', [0, 2, 4]],
  [10, 'urban', [0, 1, 2]],
  [11, 'urban', [0, 1, 2]],
  [18, 'futbol', [0]],
  [28, 'training', [0, 3]],
  [29, 'rugby', [1], '-rugby'],
  [29, 'training', [0, 2], '-training'],
  [32, 'training', [0, 1]],
  [33, 'urban', [0, 1, 2]],
  [34, 'urban', [0, 1, 2]],
  [35, 'institutions', [0, 1, 2]],
  [37, 'institutions', [0, 1, 2]],
  [38, 'training', [0, 1, 2]],
  [45, 'training', [0, 1, 2]],
  [51, 'hockey-femenino', [0, 3, 2]],
  [53, 'training', [0, 1, 2]],
  [59, 'rugby', [3, 1, 2]],
  [69, 'training', [0, 4, 2]],
];
const ids = new Set(datos.products.map(p => p.id));
const slugs = new Set(datos.products.map(p => p.slug));
const hashesSeleccionados = new Set();
const aprobados = [];
for (const [indice, categoria, indices, sufijo = ''] of selecciones) {
  const grupo = inventario[indice];
  assert(categorias.some(c => c.id === categoria));
  const id = slug(grupo.nombre) + sufijo;
  assert(!ids.has(id) && !slugs.has(id), 'ID o slug ocupado: ' + id);
  ids.add(id); slugs.add(id);
  const imagenes = indices.map(i => grupo.imagenes[i]);
  for (const f of imagenes) {
    assert.equal(hash(await fs.readFile(path.join(origen, f.archivo))), f.sha256, f.archivo);
    assert(!hashesSeleccionados.has(f.sha256), 'Fotografía repetida entre fichas nuevas');
    hashesSeleccionados.add(f.sha256);
  }
  aprobados.push({ carpeta: grupo.carpeta, nombre: grupo.nombre, id, slug: id, categoria, existente: false,
    confianza: 'alta', motivo: 'Categoría indicada expresamente por el usuario; conjunto de tomas coherentes. Se conservan los nombres de origen.', imagenes });
}
// fijamos los archivos elegidos por su nombre real; el usuario pegó uno de ellos con la elipsis expandida
assert.deepEqual(aprobados.find(p => p.id === 'buzo-medio-cierre').imagenes.map(f => path.basename(f.archivo)), [
  'Create_a_highly_photorealistic_professional_2K_20260911162134.jpeg',
  'Garment_product_presentation_vis…_2K_20260911162141.jpeg',
  'Model_wearing_garment_back_view_2K_20260911162138.jpeg',
]);
assert.equal(aprobados.find(p => p.id === 'camiseta-futbol-box').imagenes[0].archivo.split('/').at(-1), 'Create_a_highly_photorealistic_professional_2K_20260911165100.jpeg');
assert.equal(aprobados.find(p => p.id === 'campera-canguro-c-corte-reglan-rugby').imagenes[0].archivo.split('/').at(-1), 'Create_a_highly_photorealistic_professional_2K_20260911174610.jpeg');

const webpPrevios = manifiesto.recursos.flatMap(r => r.variantes.map(v => ({ ruta: v.rutaPublica, sha256: v.sha256 })));
for (const f of webpPrevios) assert.equal(hash(await fs.readFile(path.join(web, 'public', f.ruta))), f.sha256);
const anterior = await leer(path.join(docs, 'catalogo-continuacion/plan-importacion.json'));
const nombresResueltos = new Set(aprobados.map(p => p.carpeta));
const pendientes = anterior.pendientes.filter(p => !nombresResueltos.has(p.carpeta)).map(p => ({ ...p }));
const duplicada = pendientes.find(p => p.nombre === 'REMRA C_CORTE RUNNING HOMBRE');
assert(duplicada);
duplicada.tipo = 'Duplicado resuelto; toma pendiente';
duplicada.motivo = 'Las tres tomas estampadas ya se cargaron desde REMERA CON CORTE RUNNING HOMBRE, por indicación del usuario, en Rugby. No crear otra ficha desde esta copia. La foto gris sigue sin identidad comercial confirmada.';
const notas = [
  'Buzo canguro se interpreta como BUZO CANGURO C_CORTE NEW LINE de la carpeta pendiente. BUZO CANGURO BASIC existente no se modifica.',
  'REGLAN queda en dos fichas con el mismo nombre de origen y slugs terminados en rugby/training. El usuario indicó archivos y categorías diferentes.',
  'CHUPIN BLACK, JOGGUER ESSENTIAL y PANTALON CLASICC GABARDINA se incorporan con sus nombres distintos y la categoría Training indicada por el usuario. No hay duplicación binaria con las fichas anteriores; la anterior sospecha visual no era una identidad confirmada.',
  'No se mezclan colores/diseños todavía dudosos: se cargan las tomas coherentes seleccionadas y las otras quedan detalladas en el reporte de pendientes.',
];
await fs.mkdir(path.join(salida, 'respaldo-inicial'), { recursive: true });
for (const [fuente, nombre] of [['public/data/products.json', 'products.json'], ['public/data/categories.json', 'categories.json'], ['../docs/manifiesto-assets.json', 'manifiesto-assets.json'], ['../docs/catalogo-pendiente-revision.md', 'catalogo-pendiente-revision.md']]) {
  await fs.copyFile(path.resolve(web, fuente), path.join(salida, 'respaldo-inicial', nombre), fs.constants.COPYFILE_EXCL);
}
const plan = { version: 1, productosBaseSha256: hash(await fs.readFile(path.join(web, 'public/data/products.json'))),
  aprobados, pendientes, notas, intactos: datos.products.map(p => p.id), webpPrevios };
await fs.writeFile(rutaPlan, JSON.stringify(plan, null, 2) + '\n', { flag: 'wx' });
console.log({ nuevos: aprobados.length, carpetasAsignadas: nombresResueltos.size, fotografias: hashesSeleccionados.size,
  anterioresIntactos: datos.products.length, webpPreservados: webpPrevios.length });

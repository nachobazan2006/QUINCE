import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const salida = path.resolve(web, '../docs/catalogo-continuacion');
const indiceOrigen = process.argv.indexOf('--origen');
assert(indiceOrigen >= 0 && process.argv[indiceOrigen + 1], 'Indicar --origen');
const origen = path.resolve(process.argv[indiceOrigen + 1]);
const hash = contenido => createHash('sha256').update(contenido).digest('hex');
const leer = async ruta => JSON.parse(await fs.readFile(ruta, 'utf8'));
const inventario = await leer(path.resolve(web, '../docs/catalogo-importacion/inventario.json'));
const productos = await leer(path.join(web, 'public/data/products.json'));
const categorias = (await leer(path.join(web, 'public/data/categories.json'))).categories;
const manifiesto = await leer(path.resolve(web, '../docs/manifiesto-assets.json'));
const rutaPlan = path.join(salida, 'plan-importacion.json');
try { await fs.access(rutaPlan); throw Error('El plan ya existe; reutilizarlo sin reemplazar el respaldo.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
assert.equal(productos.products.length, 24, 'Esta continuación parte de los 24 registros revisados.');

// los índices solo ayudan a escribir la selección; el plan conserva nombres, rutas y hashes
const seleccion = new Map();
for (const i of [1, 7, 9, 39, 40, 41, 44, 49, 50, 58, 61, 66, 68, 71, 72, 80]) seleccion.set(i, 'training');
for (const i of [2, 3, 6, 30, 31, 47, 52, 54, 57, 63, 64, 65]) seleccion.set(i, 'urban');
seleccion.set(14, 'hockey-femenino');
const motivos = new Map([
  [1, 'Bermuda deportiva New Line: corte y conjunto de tomas coherentes; colección general de entrenamiento.'],
  [7, 'Buzo deportivo de medio cierre, misma prenda en cuatro tomas; entrenamiento sin atribuir deporte al escudo.'],
  [9, 'Calza larga deportiva, misma prenda en sus tres tomas.'],
  [14, 'Nombre explícito Hockey Dama Cool y tres tomas rosa/azul concordantes. Se excluye el dorso azul/blanco ajeno.'],
  [30, 'Campera con capucha de uso exterior/cotidiano; se diferencia de la campera sin capucha por su construcción.'],
  [31, 'Campera negra sin capucha, tomas consistentes; abrigo de la colección urbana.'],
  [39, 'Chupín Fitness con cierre en tobillo; indumentaria de entrenamiento, sin crear una categoría Fitness.'],
  [40, 'Pantalón deportivo de mujer, tres tomas consistentes; colección general de entrenamiento.'],
  [41, 'Pantalón deportivo New Line con franjas laterales; tres tomas consistentes.'],
  [44, 'Jogging deportivo con franjas laterales; tres tomas de la misma prenda.'],
  [47, 'Mochila Trial, tres vistas concordantes; accesorio urbano como la mochila ya catalogada.'],
  [49, 'Musculosa deportiva de hombre, misma prenda en frente, dorso y detalle.'],
  [50, 'Musculosa deportiva sublimada de hombre; tres tomas con el mismo dibujo, sin deducir disciplina del escudo.'],
  [58, 'Remera Basic Dry Fit deportiva; cuatro tomas con diseño coincidente.'],
  [61, 'Remera Raglan Dry Fit deportiva; frente, dorso y detalle coincidentes, sin clasificar por club.'],
  [63, 'Remera de jersey de uso cotidiano, frente, dorso y detalle coherentes; colección urbana.'],
  [66, 'Remera deportiva sin mangas; cuatro tomas coherentes, colección general de entrenamiento.'],
  [68, 'Rompeviento deportivo Glasgow, tres tomas concordantes; abrigo para entrenamiento.'],
  [71, 'Short deportivo Wave de mujer; tres tomas concordantes, sin asignar deporte por el escudo.'],
  [72, 'Short Fitness con calza, cuatro tomas coherentes; prenda de entrenamiento.'],
  [80, 'Térmica de hombre, misma prenda en tres tomas; colección general de entrenamiento.'],
]);
const dudas = new Map([
  [4, ['Clasificación', 'Buzo con identificación de colegio. Confirmar si integra uniformes de Instituciones o la colección urbana.']],
  [5, ['Variantes', 'El frente se ve negro y el dorso azul marino; confirmar si es iluminación o distinta variante.']],
  [8, ['Variantes', 'Buzos azul y gris/negro; falta definir si son variantes del mismo modelo o prendas independientes.']],
  [10, ['Clasificación', 'Camisa Oxford: confirmar destino institucional o urbano; no basta el tipo de cuello.']],
  [11, ['Clasificación', 'Camisa Oxford: confirmar destino institucional o urbano.']],
  [12, ['Categoría inexistente', 'El nombre identifica Básquet; esa disciplina no existe entre las categorías autorizadas.']],
  [13, ['Categoría inexistente', 'El nombre identifica Básquet; no se publica como Training para forzar su ingreso.']],
  [18, ['Fotografías mezcladas', 'Camiseta negra/naranja junto a frente y dorso blancos; falta identificar el conjunto comercial correcto.']],
  [28, ['Variantes', 'Camperas con combinaciones distintas en mangas; falta regla de variantes.']],
  [29, ['Variantes', 'Campera negra y otra azul/negra; no se mezclan en una galería.']],
  [32, ['Clasificación y variantes', 'Chomba: destino institucional/deportivo/urbano no confirmado y tomas negras/azuladas.']],
  [33, ['Clasificación', 'Chomba con personalización: confirmar colección comercial institucional o urbana.']],
  [34, ['Clasificación', 'Chomba personalizada: no se deduce deporte a partir del escudo; confirmar destino comercial.']],
  [35, ['Clasificación', 'Chomba personalizada: confirmar destino institucional o urbano.']],
  [36, ['Clasificación', 'Chomba personalizada: el escudo no confirma la categoría comercial.']],
  [37, ['Clasificación', 'Chomba de colegio: confirmar si debe ofrecerse en Instituciones como uniforme.']],
  [38, ['Posible producto repetido', 'Chupín gris muy similar a CHUPIN URBAN ya cargado; confirmar diferencia de modelo/corte.']],
  [45, ['Posible producto repetido', 'Jogger gris parecido a CHUPIN URBAN/CHUPIN BLACK; confirmar identidad antes de crear otra ficha.']],
  [51, ['Fotografías mezcladas', 'Musculosa negra y otra geométrica: falta confirmar identidad y variantes.']],
  [53, ['Posible producto repetido', 'Pantalón con cintura y cordón parecido a chupines existentes; confirmar que sea otro modelo.']],
  [55, ['Clasificación', 'Pantorrilleras deportivas sin disciplina comercial confirmada; no se asignan automáticamente a Rugby.']],
  [59, ['Duplicado y mezcla', 'Mismos cuatro archivos que REMRA C_CORTE RUNNING HOMBRE; además mezcla remera gris y estampada.']],
  [60, ['Duplicado y mezcla', 'Mismos cuatro archivos que REMERA C_CORTE RUNNING DRY-FIT HOMBRE; mezcla diseños gris y verde/negro.']],
  [62, ['Duplicado y mezcla', 'Duplica íntegramente REMERA C_CORTE DRY-FIT; resolver una sola agrupación comercial de ambos diseños.']],
  [67, ['Duplicado y mezcla', 'Duplica íntegramente REMERA CON CORTE RUNNING HOMBRE; resolver una sola agrupación de ambos diseños.']],
  [69, ['Variantes', 'Rompevientos naranja y verde: no hay regla de variantes confirmada.']],
  [70, ['Categoría inexistente', 'Short identificado como Básquet; no hay categoría existente para esa disciplina.']],
  [73, ['Variantes', 'Short verde/amarillo y short gris; confirmar agrupación y modelo antes de importar.']],
]);

const aprobados = [], pendientes = [], existentes = [];
const ids = new Set(productos.products.map(p => p.id));
const slugs = new Set(productos.products.map(p => p.slug));
const archivosReales = [];
async function recorrer(carpeta) {
  for (const entrada of await fs.readdir(carpeta, { withFileTypes: true })) {
    const ruta = path.join(carpeta, entrada.name);
    if (entrada.isDirectory()) await recorrer(ruta);
    else archivosReales.push(path.relative(origen, ruta).replaceAll('\\', '/'));
  }
}
await recorrer(origen);
assert.deepEqual(archivosReales.filter(f => /\.jpe?g$/i.test(f)).sort(), inventario.flatMap(g => g.imagenes.map(f => f.archivo)).sort());
assert.equal(inventario.length, 81);
for (const [indice, grupo] of inventario.entries()) {
  for (const foto of grupo.imagenes) assert.equal(hash(await fs.readFile(path.join(origen, foto.archivo))), foto.sha256, foto.archivo);
  const existente = productos.products.find(p => manifiesto.recursos.some(r => r.variantes.some(v => v.rutaPublica === p.image.src)
    && grupo.imagenes.some(f => f.sha256 === r.original.sha256)));
  if (existente) { existentes.push({ carpeta: grupo.carpeta, id: existente.id }); continue; }
  if (!seleccion.has(indice)) {
    assert(dudas.has(indice), 'Falta documentar una carpeta: ' + grupo.nombre);
    const [tipo, motivo] = dudas.get(indice);
    pendientes.push({ ...grupo, tipo, motivo, decision: 'Confirmar lo indicado; no se agregó al JSON público.' });
    continue;
  }
  const id = grupo.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  assert(!ids.has(id) && !slugs.has(id), 'Colisión de identificador');
  ids.add(id); slugs.add(id);
  const categoria = seleccion.get(indice);
  assert(categorias.some(c => c.id === categoria));
  let imagenes = grupo.imagenes;
  if (indice === 14) imagenes = [2, 3, 1].map(i => grupo.imagenes[i]);
  // elegimos un frente antes que un detalle o una espalda, sin tocar las fichas anteriores
  const frente = new Map([[1, 1], [3, 1], [39, 1], [44, 1], [71, 1]]).get(indice);
  if (frente !== undefined) imagenes = [imagenes[frente], ...imagenes.filter((_, i) => i !== frente)];
  aprobados.push({ carpeta: grupo.carpeta, nombre: grupo.nombre, id, slug: id, categoria, existente: false,
    confianza: 'alta', motivo: motivos.get(indice) || 'Prenda de uso cotidiano, modelo y conjunto de tomas coherentes; colección urbana.', imagenes });
}
assert.equal(existentes.length, 24);
assert.equal(aprobados.length + existentes.length + pendientes.length, 81);
assert.equal(new Set(aprobados.flatMap(p => p.imagenes.map(f => f.sha256))).size, aprobados.reduce((s, p) => s + p.imagenes.length, 0));
const webpPrevios = manifiesto.recursos.flatMap(r => r.variantes.map(v => ({ ruta: v.rutaPublica, sha256: v.sha256 })));
for (const v of webpPrevios) assert.equal(hash(await fs.readFile(path.join(web, 'public', v.ruta))), v.sha256);
await fs.mkdir(path.join(salida, 'respaldo-inicial'), { recursive: true });
for (const [archivo, destino] of [['public/data/products.json', 'products.json'], ['public/data/categories.json', 'categories.json'], ['../docs/manifiesto-assets.json', 'manifiesto-assets.json']]) {
  await fs.copyFile(path.resolve(web, archivo), path.join(salida, 'respaldo-inicial', destino), fs.constants.COPYFILE_EXCL);
}
const plan = { version: 1, productosBaseSha256: hash(await fs.readFile(path.join(web, 'public/data/products.json'))), aprobados,
  pendientes, existentes, intactos: productos.products.map(p => p.id), webpPrevios };
await fs.writeFile(rutaPlan, JSON.stringify(plan, null, 2) + '\n', { flag: 'wx' });
console.log({ carpetas: inventario.length, fotosVerificadas: inventario.reduce((s, g) => s + g.imagenes.length, 0),
  existentes: existentes.length, nuevos: aprobados.length, pendientes: pendientes.length, fotosNuevasSeleccionadas: aprobados.reduce((s, p) => s + p.imagenes.length, 0) });

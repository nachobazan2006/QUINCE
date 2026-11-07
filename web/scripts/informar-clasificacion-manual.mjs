import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.resolve(web, '../docs');
const salida = path.join(docs, 'catalogo-clasificacion-manual');
const leer = async ruta => JSON.parse(await fs.readFile(ruta, 'utf8'));
const plan = await leer(path.join(salida, 'plan-importacion.json'));
const aplicado = await leer(path.join(salida, 'resultado-aplicado.json'));
const repetido = await leer(path.join(salida, 'resultado-repeticion.json'));
const base = (await leer(path.join(salida, 'respaldo-inicial/products.json'))).products;
const productos = (await leer(path.join(web, 'public/data/products.json'))).products;
const categorias = (await leer(path.join(web, 'public/data/categories.json'))).categories;
const manifiesto = await leer(path.join(docs, 'manifiesto-assets.json'));
const inventario = await leer(path.join(docs, 'catalogo-importacion/inventario.json'));
const hash = b => createHash('sha256').update(b).digest('hex');
assert.equal(productos.length, aplicado.productosTotales, 'No reemplazar un informe actual con uno de una etapa anterior.');
assert.deepEqual(productos.slice(0, base.length), base);
assert.equal(repetido.webpGenerados, 0);
assert.equal(repetido.nuevos.length, 0);
for (const f of plan.webpPrevios) assert.equal(hash(await fs.readFile(path.join(web, 'public', f.ruta))), f.sha256);
const rutas = new Set(productos.flatMap(p => [p.image, ...p.gallery].map(f => f.src)));
const hashesUsados = new Set(manifiesto.recursos.filter(r => r.variantes.some(v => rutas.has(v.rutaPublica))).map(r => r.original.sha256));
const sinUsar = inventario.flatMap(g => g.imagenes.filter(f => !hashesUsados.has(f.sha256)).map(f => ({ carpeta: g.carpeta, ...f })));
const sinFicha = inventario.filter(g => g.imagenes.every(f => !hashesUsados.has(f.sha256)));
const parciales = inventario.filter(g => g.imagenes.some(f => hashesUsados.has(f.sha256)) && g.imagenes.some(f => !hashesUsados.has(f.sha256)));
const porCategoria = categorias.filter(c => c.id !== 'sports').map(c => ({ id: c.id, nombre: c.name,
  cantidad: productos.filter(p => p.categoryIds.includes(c.id)).length, nuevos: plan.aprobados.filter(p => p.categoria === c.id).length }));
const motivos = new Map([
  [5, 'Categoría Urbano resuelta. Se cargaron frente y dorso oscuro; el otro dorso azul marino queda fuera hasta confirmar si es iluminación o variante.'],
  [8, 'Categoría Rugby resuelta para los tres archivos indicados. Las dos tomas del buzo azul no fueron indicadas y siguen aparte.'],
  [14, 'La ficha COOL usa tres tomas rosa/azul. El dorso azul/blanco tiene otro diseño.'],
  [18, 'Se cargó en Fútbol solo el frente negro/naranja elegido. Las dos tomas blancas siguen sin asignación confirmada.'],
  [25, 'Ficha Body verde intacta; las tres fotos bordó siguen sin agrupación comercial confirmada.'],
  [28, 'Training confirmado. Se cargaron frente y dorso azul/gris coincidentes; las dos tomas con mangas celestes siguen pendientes de agrupación.'],
  [32, 'Training confirmado. Se cargaron el frente negro y la presentación negra; el dorso azulado queda pendiente de confirmar correspondencia.'],
  [51, 'Hockey femenino confirmado. Se cargaron tres fotos de la musculosa negra; la toma geométrica representa otro diseño.'],
  [56, 'La galería roja existente sigue intacta. Las dos tomas negras continúan sin confirmar.'],
  [59, 'Rugby confirmado. Se cargaron las tres tomas estampadas coincidentes; la foto gris queda fuera para no mezclar prendas.'],
  [67, 'Copia binaria de REMERA CON CORTE RUNNING HOMBRE: sus tres tomas estampadas ya se usan en la misma ficha de Rugby. No crear otra ficha. La foto gris duplicada sigue pendiente.'],
  [69, 'Training confirmado. Se cargaron las tres tomas naranjas; las tres verdes siguen pendientes de agrupación/variantes.'],
  [78, 'La ficha Shane mantiene la foto aprobada con escudo verde. La toma TRC no tiene identidad comercial confirmada.'],
]);
const resumen = { productosTotales: productos.length, productosNuevos: aplicado.nuevos.length, productosAnterioresIntactos: base.length,
  porCategoria, fotografiasNuevas: aplicado.fuentesNuevas, webpNuevos: aplicado.webpGenerados, webpAnterioresPreservados: plan.webpPrevios.length,
  bytesNuevos: aplicado.bytesAgregados, carpetasSinFotosPublicadas: sinFicha.length, carpetasConFotosExcluidas: parciales.length,
  archivosNoPublicados: sinUsar.length, contenidosUnicosNoPublicados: new Set(sinUsar.map(f => f.sha256)).size };
await fs.writeFile(path.join(salida, 'resumen-final.json'), JSON.stringify(resumen, null, 2) + '\n');
await fs.writeFile(path.join(salida, 'fotografias-no-publicadas.json'), JSON.stringify(sinUsar, null, 2) + '\n');

let pendientes = `# Catálogo pendiente de revisión — clasificación manual aplicada\n\nEstado actual: **${productos.length} productos cargados**, incluidos **${aplicado.nuevos.length} nuevos** con las categorías indicadas por el usuario. Los 53 anteriores se conservaron íntegramente.\n\nQuedan **${sinFicha.length} carpetas sin ninguna fotografía publicada** y **${parciales.length} carpetas con alguna toma todavía excluida**. Hay **${sinUsar.length} archivos sin usar**, equivalentes a **${resumen.contenidosUnicosNoPublicados} contenidos únicos**. Las carpetas no se cuentan automáticamente como productos.\n\n## Carpetas sin producto asociado\n\n| Carpeta | Fotos | Duda actual |\n| --- | ---: | --- |\n`;
for (const g of sinFicha) {
  const p = plan.pendientes.find(p => p.carpeta === g.carpeta);
  assert(p, g.nombre);
  pendientes += `| ${g.nombre} | ${g.imagenes.length} | ${p.motivo} No se recibió una nueva indicación para esta carpeta. |\n`;
}
pendientes += '\n## Carpetas con producto cargado y tomas excluidas\n\nLa categoría indicada ya se aplicó. Las tomas de diseños distintos no se mezclaron en la galería.\n\n| Carpeta | Fotos sin usar | Motivo |\n| --- | ---: | --- |\n';
for (const g of parciales) {
  const indice = inventario.indexOf(g);
  assert(motivos.has(indice), g.nombre);
  pendientes += `| ${g.nombre} | ${g.imagenes.filter(f => !hashesUsados.has(f.sha256)).length} | ${motivos.get(indice)} |\n`;
}
pendientes += '\n## Decisiones ya aplicadas\n\n';
for (const nota of plan.notas) pendientes += `- ${nota}\n`;
pendientes += '\nLa lista actual de archivos y hashes está en [fotografias-no-publicadas.json](catalogo-clasificacion-manual/fotografias-no-publicadas.json). Los inventarios de catalogo-importacion/ y catalogo-continuacion/ son históricos. En CATALOGO PENDIENTE se mantienen las copias de revisión con sus rutas originales y se actualiza su estado; algunas de esas fotos ahora ya están cargadas.\n';
await fs.writeFile(path.join(docs, 'catalogo-pendiente-revision.md'), pendientes);

let informe = '# Carga según clasificación manual del usuario\n\nSe agregaron **20 fichas**, pasando de **53 a 73**. Se respetaron las categorías indicadas y las selecciones explícitas de archivos. La carpeta CAMPERA CANGURO C_CORTE REGLAN origina dos fichas por la separación expresa entre Rugby y Training; ambas conservan el nombre original y tienen slugs distintos. Ninguna foto se repite entre ellas.\n\n## Categorías\n\n| Categoría | Nuevos | Total |\n| --- | ---: | ---: |\n';
for (const c of porCategoria) informe += `| ${c.nombre} | ${c.nuevos} | ${c.cantidad} |\n`;
informe += '\n## Productos incorporados\n\n| Carpeta | Categoría indicada | Fotos incluidas | Slug |\n| --- | --- | --- | --- |\n';
for (const p of plan.aprobados) informe += `| ${p.nombre} | ${categorias.find(c => c.id === p.categoria).name} | ${p.imagenes.map(f => path.basename(f.archivo)).join('<br>')} | ${p.slug} |\n`;
informe += '\n## Interpretaciones y exclusiones\n\n';
for (const nota of plan.notas) informe += `- ${nota}\n`;
informe += `\nSe incorporaron **52 fotografías originales** mediante **104 WebP nuevos**, con ${aplicado.bytesAgregados.toLocaleString('es-AR')} bytes añadidos (${(aplicado.bytesAgregados / 1024 / 1024).toFixed(2)} MiB). Se verificaron y conservaron los 361 WebP anteriores. El sitio ahora tiene 465 WebP de todos sus recursos. No se tocaron originales, categorías, componentes ni estilos. No se inventaron nombres comerciales, descripciones ni atributos. Los sufijos rugby/training solo distinguen los slugs de las dos fichas REGLAN.\n\nLa carpeta duplicada REMRA C_CORTE RUNNING HOMBRE no generó otra ficha; sus fotografías coincidentes se reconocen por SHA-256. Las imágenes de otro color/diseño permanecen detalladas en [catalogo-pendiente-revision.md](catalogo-pendiente-revision.md): **8 carpetas completas sin publicar y 13 con algunas tomas excluidas; 49 archivos sin usar en total**. Los tres modelos de pantalón expresamente clasificados se conservaron con sus nombres de origen y tienen imágenes binarias distintas de los registros anteriores.\n\n## Respaldo y repetición\n\nRespaldo previo de products.json, categories.json, manifiesto-assets.json y reporte de pendientes en catalogo-clasificacion-manual/respaldo-inicial/. Plan congelado con rutas, hashes y los 53 registros protegidos en plan-importacion.json. Se reutilizó importar-catalogo.mjs: una segunda ejecución agregó cero registros, cero WebP y cero bytes. Las fotos copiadas a CATALOGO PENDIENTE se mantienen donde el usuario las está revisando; LEEME.txt, MOTIVOS-PENDIENTES.md y ESTADO-ACTUAL.md indican el estado nuevo.\n\n## Validaciones ejecutadas\n\n- node scripts/verificar-catalogo.mjs: 73 registros, IDs/slugs/fotos principales únicos, categorías válidas, imágenes presentes y 53 registros anteriores idénticos al respaldo, en el mismo orden.\n- npm.cmd run build: correcto.\n- npm.cmd run assets:verify -- http://127.0.0.1:4173/: 465 WebP decodificados, proporciones, dimensiones, hashes en public/dist, seis JSON y entrega HTTP correctos.\n- comprobar-importacion.cjs con el plan manual: las 20 fichas a 375 y 1440 px, nombre y categoría correctos, imágenes cargadas, controles de galería anterior/siguiente y ausencia de controles en las dos fichas de foto única. Sin desborde horizontal ni errores JS.\n- comprobar-listados.cjs en desarrollo y preview: Rugby en ocho anchos (375/393/600/768/900/1024/1200/1440), todas las colecciones incluidas Instituciones, navegación, 73 fichas, destacados, 404 y errores de datos correctos. Prueba de edición de JSON restaurada byte a byte.\n- Capturas en catalogo-clasificacion-manual/capturas/. Inspección de Buzo Medio Cierre mobile y REGLAN Rugby desktop contra las tomas elegidas por el usuario.\n\n## Archivos relevantes\n\nweb/public/data/products.json; docs/manifiesto-assets.json; web/public/images/productos/catalogo-*.webp; scripts planificar-clasificacion-manual.mjs e informar-clasificacion-manual.mjs; validadores verificar-catalogo.mjs, comprobar-importacion.cjs y comprobar-listados.cjs. Se actualizó el contrato documental y se protegió el generador histórico de informes para que no reemplace pendientes actuales.\n\n## Aprendizaje\n\nLa categoría se relaciona con el producto mediante categoryIds en products.json; las páginas existentes filtran ese array y reutilizan tarjetas y galerías. En las dos camperas se usaron IDs/slugs distintos para que React Router llegue a la ficha correcta, conservando sus fotografías separadas. Para estudiar: products.json, planificar-clasificacion-manual.mjs e importar-catalogo.mjs. Ejercicio: localizá los dos registros REGLAN y compará sus categoryIds y gallery sin modificarlos todavía.\n`;
await fs.writeFile(path.join(docs, 'clasificacion-manual-catalogo.md'), informe);

const revision = path.resolve(web, '../CATALOGO PENDIENTE');
const rutaMotivos = path.join(revision, 'MOTIVOS-PENDIENTES.md');
const anterior = await fs.readFile(path.join(salida, 'respaldo-inicial/catalogo-pendiente-revision.md'), 'utf8');
const copiaActual = await fs.readFile(rutaMotivos, 'utf8');
assert(copiaActual === anterior || copiaActual === pendientes, 'La copia de motivos recibió cambios: no sobrescribirlos.');
await fs.writeFile(rutaMotivos, pendientes);
let estado = '# Estado actual de las carpetas de revisión\n\nEl catálogo tiene **73 productos**. Se cargaron **20 fichas nuevas** con tus indicaciones. Las fotos de esta carpeta siguen en sus ubicaciones para que puedas continuar la revisión; varias ya están publicadas. **No son 104 fotos todavía pendientes: quedan 49 archivos originales sin publicar.**\n\n## Clasificaciones aplicadas\n\n| Carpeta | Categoría | Fotos publicadas en esta carga |\n| --- | --- | ---: |\n';
for (const p of plan.aprobados) estado += `| ${p.nombre} | ${categorias.find(c => c.id === p.categoria).name} | ${p.imagenes.length} |\n`;
estado += '\nConsultá MOTIVOS-PENDIENTES.md para ver las ocho carpetas todavía sin producto y las trece con algunas tomas excluidas. La carpeta duplicada de Running ya comparte las fotos publicadas; no se creó otro producto por tener una segunda copia.\n';
await fs.writeFile(path.join(revision, 'ESTADO-ACTUAL.md'), estado);
await fs.writeFile(path.join(revision, 'LEEME.txt'), 'CATALOGO PENDIENTE - ESTADO ACTUAL\r\n\r\nSe conservan las 104 copias de fotos de la revision anterior en sus mismas ubicaciones.\r\nLuego de tus indicaciones se cargaron 20 fichas nuevas: ahora hay 73 productos en la web.\r\nSolo quedan 49 archivos originales sin publicar; algunas copias de esta carpeta ya estan cargadas.\r\n\r\nESTADO-ACTUAL.md: clasificaciones y carga realizada.\r\nMOTIVOS-PENDIENTES.md: dudas actuales y tomas excluidas.\r\nNo se movieron, eliminaron ni modificaron fotografias originales.\r\n');
console.log(resumen);

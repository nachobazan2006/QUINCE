import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const salida = path.resolve('../docs/catalogo-importacion');
const inventario = JSON.parse(await fs.readFile(path.join(salida, 'inventario.json')));
const productos = JSON.parse(await fs.readFile('public/data/products.json'));
const categorias = JSON.parse(await fs.readFile('public/data/categories.json')).categories;
const manifiesto = JSON.parse(await fs.readFile('../docs/manifiesto-assets.json'));
const sha = b => createHash('sha256').update(b).digest('hex');
const slug = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// estos índices corresponden a las hojas inspeccionadas; el plan fija rutas y hashes, no índices
const nuevos = new Map([[15,'hockey-femenino'],[19,'hockey-femenino'],[20,'hockey-femenino'],[21,'hockey-femenino'],[22,'hockey-femenino'],[24,'hockey-masculino'],[42,'urban'],[43,'urban'],[48,'urban'],[74,'futbol'],[75,'futbol'],[76,'hockey-masculino']]);
const primeros = new Map([[15,2],[19,3],[20,3],[21,3],[22,1]]);
const ambiguos = new Map([[14,'El primer dorso es azul/blanco y no coincide con los frentes rosa/azul.'],[18,'Frente estampado negro/naranja junto con camiseta blanca lisa.'],[25,'Principal verde; las otras tres fotos son de una camiseta bordó.'],[56,'Fotos 1/2 negras y 0/3/4 rojas: solo se incorporan las rojas a la ficha existente.'],[78,'Los dos shorts blancos tienen escudos distintos: TRC frente a escudo verde.'],[8,'Combina buzo azul con buzo gris/negro.'],[28,'Dos combinaciones de colores en la misma carpeta.'],[29,'Mezcla campera negra con otra azul/negra.'],[51,'Musculosas con dibujos diferentes en la misma carpeta.'],[59,'Carpeta duplicada y combinación de estampados distintos.'],[60,'Carpeta duplicada y combinación de estampados distintos.'],[62,'Duplica REMERA C_CORTE DRY-FIT y mezcla estampados.'],[67,'Duplica REMERA CON CORTE RUNNING HOMBRE y mezcla estampados.'],[73,'Short verde/amarillo junto con shorts grises.'],[69,'Rompevientos naranja y verde: falta regla de variantes.']]);
const aprobados = [], pendientes = [];
const ids = new Set(productos.products.map(p => p.id)), slugs = new Set(productos.products.map(p => p.slug));
for (const [indice, grupo] of inventario.entries()) {
  const existente = productos.products.find(p => manifiesto.recursos.some(r => r.variantes.some(v => v.rutaPublica === p.image?.src) && grupo.imagenes.some(f => f.sha256 === r.original.sha256)));
  let categoria = nuevos.get(indice) || existente?.categoryIds[0];
  let seleccion = grupo.imagenes;
  if (indice === 56) seleccion = [3,0,4].map(i => grupo.imagenes[i]);
  const motivo = ambiguos.get(indice);
  if (existente?.id === 'camiseta-rugby-oldies') continue;
  if (motivo && indice !== 56 || !existente && !nuevos.has(indice)) {
    const tipo = [59,60,62,67].includes(indice) ? 'Duplicados' : motivo ? 'Variantes o fotografías inconsistentes'
      : /BASQUET|RUNNING|FITNESS/.test(grupo.nombre) ? 'Incompatibles con categorías actuales' : 'Clasificación dudosa';
    pendientes.push({ ...grupo, productoPropuesto: existente?.name || grupo.nombre, categoriaPosible: categoria || null, tipo,
      motivo: motivo || 'El nombre no permite elegir inequívocamente una categoría existente. No se clasifica por escudo, modelo o semejanza.',
      decision: motivo ? 'Confirmar agrupación comercial y qué tomas pertenecen a cada prenda; no mezclar automáticamente.' : 'Confirmar categoría existente aplicable o definir fuera de esta importación el mapa comercial.', existente: existente?.id });
    continue;
  }
  const id = existente?.id || slug(grupo.nombre);
  if (!existente && (ids.has(id) || slugs.has(id))) { pendientes.push({ ...grupo, tipo:'Colisiones',motivo:'Colisión de ID/slug',decision:'Definir identificador único.' }); continue; }
  if (!existente) { ids.add(id); slugs.add(id); }
  assert(categorias.some(c => c.id === categoria));
  const orden = primeros.get(indice);
  if (orden !== undefined) seleccion = [grupo.imagenes[orden], ...grupo.imagenes.filter((_, i) => i !== orden)];
  aprobados.push({ carpeta:grupo.carpeta, nombre:existente?.name || grupo.nombre,id,slug:existente?.slug || id,categoria,
    existente:Boolean(existente),confianza:'alta',motivo:'Nombre explícito o registro previamente verificado; tomas inspeccionadas con diseño coherente.',imagenes:seleccion });
  if (indice === 56) pendientes.push({ ...grupo, productoPropuesto:existente.name,categoriaPosible:categoria,tipo:'Variantes o fotografías inconsistentes',motivo,decision:'Confirmar la identidad de las dos tomas negras; excluidas de la galería roja.',existente:existente.id });
}
const plan = { version:1, productosBaseSha256:sha(await fs.readFile('public/data/products.json')), aprobados,pendientes,
  intactos:['camiseta-rugby-oldies','camiseta-rugby-body','short-rugby-shane'],webpPrevios:manifiesto.recursos.flatMap(r=>r.variantes.map(v=>({ruta:v.rutaPublica,sha256:v.sha256}))) };
await fs.writeFile(path.join(salida,'plan-importacion.json'),JSON.stringify(plan,null,2)+'\n');
let reporte='# Catálogo pendiente de revisión\n\nLas carpetas y fotografías se inventariaron y se inspeccionaron en hojas de contacto. No se importan nuevos productos de estas carpetas; las fichas existentes se preservan.\n';
for(const tipo of [...new Set(pendientes.map(p=>p.tipo))]) {
  reporte+=`\n## ${tipo}\n\n| Carpeta / producto propuesto | Categoría posible | Fotografías | Duda y decisión necesaria |\n| --- | --- | --- | --- |\n`;
  for(const p of pendientes.filter(p=>p.tipo===tipo)) reporte+=`| ${p.carpeta} / ${p.productoPropuesto||p.nombre} | ${p.categoriaPosible||'Sin confirmar'} | ${p.imagenes.map(f=>path.basename(f.archivo)).join('<br>')} | ${p.motivo} ${p.decision} |\n`;
}
reporte+='\n## Recursos faltantes\n\nNo faltan archivos de las tomas aprobadas. Faltan decisiones de categoría y variantes para los casos anteriores. No se inventan descripciones, talles ni materiales. Las categorías Básquet, Running y Fitness no existen; no se asimilan a Training.\n';
await fs.writeFile('../docs/catalogo-pendiente-revision.md',reporte);
console.log({aprobados:aprobados.length,nuevos:aprobados.filter(p=>!p.existente).length,galerias:aprobados.filter(p=>p.existente).length,pendientes:pendientes.length});

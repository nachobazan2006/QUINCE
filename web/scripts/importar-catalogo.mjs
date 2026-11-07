import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const argumento=nombre=>{const i=process.argv.indexOf(nombre);if(i<0||!process.argv[i+1])throw Error(`Falta ${nombre}`);return path.resolve(process.argv[i+1]);};
const origen=argumento('--origen'),rutaPlan=argumento('--plan');
const plan=JSON.parse(await fs.readFile(rutaPlan)),rutaProductos=path.join(web,'public/data/products.json'),rutaManifest=path.resolve(web,'../docs/manifiesto-assets.json');
const originalProductos=await fs.readFile(rutaProductos),originalManifest=await fs.readFile(rutaManifest);
const datos=JSON.parse(originalProductos),manifest=JSON.parse(originalManifest),categorias=JSON.parse(await fs.readFile(path.join(web,'public/data/categories.json'))).categories;
const sha=b=>createHash('sha256').update(b).digest('hex');
const base=JSON.parse(await fs.readFile(path.join(path.dirname(rutaPlan),'respaldo-inicial/products.json')));
const fuentes=new Map(manifest.recursos.map(r=>[r.original.sha256,r]));
const trabajos=new Map(),nuevos=[];
// validamos todo antes de generar imágenes o modificar el catálogo público
for(const v of plan.webpPrevios)assert.equal(sha(await fs.readFile(path.join(web,'public',v.ruta))),v.sha256);
const ids=new Set(datos.products.map(p=>p.id)),slugs=new Set(datos.products.map(p=>p.slug));
for(const p of plan.aprobados){
  assert(p.confianza==='alta'&&categorias.some(c=>c.id===p.categoria));
  const existente=datos.products.find(x=>x.id===p.id),previo=base.products.find(x=>x.id===p.id);
  if(existente){assert.equal(existente.slug,p.slug);if(previo){const {gallery,...antes}=previo;const {gallery:g,...ahora}=existente;assert.deepEqual(ahora,antes);}else{assert.equal(existente.name,p.nombre);assert.deepEqual(existente.categoryIds,[p.categoria]);}}
  else {assert(!p.existente&&!ids.has(p.id)&&!slugs.has(p.slug));ids.add(p.id);slugs.add(p.slug);nuevos.push(p);}
  for(const f of p.imagenes){const absoluta=path.resolve(origen,f.archivo);assert(absoluta.startsWith(origen+path.sep));const b=await fs.readFile(absoluta);assert.equal(sha(b),f.sha256);
    if(fuentes.has(f.sha256)){for(const v of fuentes.get(f.sha256).variantes)assert.equal(sha(await fs.readFile(path.join(web,'public',v.rutaPublica))),v.sha256);}
    else {const nombre=`productos/catalogo-${f.sha256.slice(0,24)}`;for(const w of [480,960]){try{await fs.access(path.join(web,'public',`images/${nombre}-${w}.webp`));throw Error('Destino ocupado fuera del manifiesto');}catch(e){if(e.code!=='ENOENT')throw e;}}trabajos.set(f.sha256,{f,b,nombre});}
  }
}
let bytes=0,generadas=0;
const rutasNuevas=new Set();
for(const {nombre} of trabajos.values())for(const w of[480,960]){const ruta=`${nombre}-${w}`;assert(!rutasNuevas.has(ruta),'Colisión de rutas nuevas');rutasNuevas.add(ruta);}
for(const {f,b,nombre} of trabajos.values()){
  const meta=await sharp(b).metadata(),variantes=[];
  for(const w of [...new Set([480,960].map(x=>Math.min(x,meta.width)))]){const {data,info}=await sharp(b).resize({width:w,withoutEnlargement:true}).webp({quality:84,effort:6}).toBuffer({resolveWithObject:true});const rutaPublica=`images/${nombre}-${w}.webp`;await fs.writeFile(path.join(web,'public',rutaPublica),data,{flag:'wx'});variantes.push({rutaPublica,ancho:info.width,alto:info.height,formato:'webp',bytes:data.length,sha256:sha(data)});bytes+=data.length;generadas++;}
  const recurso={id:`catalogo-${f.sha256.slice(0,24)}`,rutaOriginal:`directorio-configurable::${f.archivo}`,tipo:'productos',seccion:'Catálogo incremental',estadoIdentificacion:'alto',clave:sha(JSON.stringify({sha256:f.sha256,anchos:[480,960],calidad:84,esfuerzo:6})),original:{ancho:meta.width,alto:meta.height,formato:meta.format,bytes:b.length,sha256:f.sha256},variantes,productoIds:plan.aprobados.filter(p=>p.imagenes.some(i=>i.sha256===f.sha256)).map(p=>p.id)};
  manifest.recursos.push(recurso);fuentes.set(f.sha256,recurso);
}
function imagen(f,nombre,indice){const r=fuentes.get(f.sha256),v=r.variantes.find(v=>v.ancho===960)||r.variantes.at(-1);return{src:v.rutaPublica,alt:`${nombre}, fotografía ${indice+1}`,width:v.ancho,height:v.alto,variants:r.variantes.map(v=>({src:v.rutaPublica,width:v.ancho}))};}
let ampliadas=0;
for(const p of plan.aprobados){let existente=datos.products.find(x=>x.id===p.id);
  if(!existente){const fotos=p.imagenes.map((f,i)=>imagen(f,p.nombre,i));existente={id:p.id,slug:p.slug,name:p.nombre,categoryIds:[p.categoria],image:fotos[0],gallery:fotos};datos.products.push(existente);}
  else {const primaria=manifest.recursos.find(r=>r.variantes.some(v=>v.rutaPublica===existente.image.src));const fotos=existente.gallery.length?[...existente.gallery]:[existente.image];const hashes=new Set(fotos.map(i=>manifest.recursos.find(r=>r.variantes.some(v=>v.rutaPublica===i.src))?.original.sha256));hashes.add(primaria.original.sha256);let adicion=0;for(const f of p.imagenes)if(!hashes.has(f.sha256)){fotos.push(imagen(f,p.nombre,fotos.length));hashes.add(f.sha256);adicion++;}if(adicion){existente.gallery=fotos;ampliadas++;}}
}
for(const [i,p]of base.products.entries()){assert.equal(datos.products[i].id,p.id);const{gallery,...a}=p,{gallery:g,...b}=datos.products[i];assert.deepEqual(a,b);if(plan.intactos.includes(p.id))assert.deepEqual(datos.products[i],p);}
assert.equal(new Set(datos.products.map(p=>p.id)).size,datos.products.length);assert.equal(new Set(datos.products.map(p=>p.slug)).size,datos.products.length);
for(const p of datos.products)for(const i of[p.image,...p.gallery]){assert(i&&i.alt);await fs.access(path.join(web,'public',i.src));}
manifest.contenedoresActuales ||= [];
if(process.argv.includes('--contenedores')){for(const archivo of (await fs.readdir(argumento('--contenedores'))).filter(n=>n.endsWith('.zip'))){const b=await fs.readFile(path.join(argumento('--contenedores'),archivo)),h=sha(b);if(!manifest.contenedoresActuales.some(c=>c.sha256===h))manifest.contenedoresActuales.push({archivo,sha256:h,observacion:'Contenedor actual; se conserva archivosOriginalesSha256 histórico. Asociación de entradas previas verificada en auditoría 13A.'});}}
const r=manifest.recursos;manifest.resumen={seleccionadas:r.length,variantes:r.reduce((s,r)=>s+r.variantes.length,0),bytesOriginales:r.reduce((s,r)=>s+r.original.bytes,0),bytesOptimizados:r.reduce((s,r)=>s+r.variantes.reduce((s,v)=>s+v.bytes,0),0)};manifest.resumen.reduccionPorcentaje=Number(((1-manifest.resumen.bytesOptimizados/manifest.resumen.bytesOriginales)*100).toFixed(2));
// no escribimos JSON idénticos en una repetición sin novedades
assert.equal(sha(await fs.readFile(rutaProductos)),sha(originalProductos));assert.equal(sha(await fs.readFile(rutaManifest)),sha(originalManifest));
if(JSON.stringify(datos)!==JSON.stringify(JSON.parse(originalProductos)))await fs.writeFile(rutaProductos,JSON.stringify(datos,null,2)+'\n');
if(JSON.stringify(manifest)!==JSON.stringify(JSON.parse(originalManifest)))await fs.writeFile(rutaManifest,JSON.stringify(manifest,null,2)+'\n');
const resultado={fuentesNuevas:trabajos.size,webpGenerados:generadas,bytesAgregados:bytes,nuevos:nuevos.map(p=>p.id),galeriasAmpliadas:ampliadas,productosTotales:datos.products.length,webpPreviosVerificados:plan.webpPrevios.length};
await fs.writeFile(path.join(path.dirname(rutaPlan),generadas||nuevos.length||ampliadas?'resultado-aplicado.json':'resultado-repeticion.json'),JSON.stringify(resultado,null,2)+'\n');console.log(resultado);

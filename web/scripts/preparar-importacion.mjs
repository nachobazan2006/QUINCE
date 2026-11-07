import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const origen = path.resolve(process.argv[2]);
const web = process.cwd();
const salida = path.resolve(web, '../docs/catalogo-importacion');
await fs.mkdir(salida, { recursive: true });
const respaldo = path.join(salida, 'respaldo-inicial');
await fs.mkdir(respaldo, { recursive: true });
for (const archivo of ['public/data/products.json', 'public/data/categories.json', '../docs/manifiesto-assets.json', 'scripts/seleccion-assets.json', 'scripts/optimizar-imagenes.mjs', 'scripts/extraer-originales.ps1']) {
  try { await fs.copyFile(archivo, path.join(respaldo, path.basename(archivo)), fs.constants.COPYFILE_EXCL); } catch (e) { if (e.code !== 'EEXIST') throw e; }
}
async function recorrer(carpeta) {
  const entradas = await fs.readdir(carpeta, { withFileTypes: true });
  const fotos = entradas.filter(e => /\.jpe?g$/i.test(e.name));
  if (fotos.length) {
    const imagenes = [];
    for (const foto of fotos) {
      const ruta = path.join(carpeta, foto.name), datos = await fs.readFile(ruta), meta = await sharp(datos).metadata();
      imagenes.push({ archivo: path.relative(origen, ruta).replaceAll('\\', '/'), sha256: createHash('sha256').update(datos).digest('hex'), ancho: meta.width, alto: meta.height, bytes: datos.length });
    }
    grupos.push({ carpeta: path.relative(origen, carpeta).replaceAll('\\', '/'), nombre: path.basename(carpeta), imagenes });
  }
  for (const e of entradas.filter(e => e.isDirectory())) await recorrer(path.join(carpeta, e.name));
}
const grupos = [];
await recorrer(origen);
await fs.writeFile(path.join(salida, 'inventario.json'), JSON.stringify(grupos, null, 2));
for (let inicio = 0; inicio < grupos.length; inicio += 6) {
  const capas = [];
  for (const [fila, grupo] of grupos.slice(inicio, inicio + 6).entries()) {
    const etiqueta = grupo.nombre.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
    capas.push({ input: Buffer.from(`<svg width="1300" height="30"><rect width="1300" height="30" fill="white"/><text x="8" y="21" font-size="16">${inicio + fila}: ${etiqueta}</text></svg>`), left: 0, top: fila * 250 });
    for (const [indice, foto] of grupo.imagenes.entries()) {
      const imagen = await sharp(path.join(origen, foto.archivo)).resize({ width: 150, height: 200, fit: 'inside' }).png().toBuffer();
      capas.push({ input: imagen, left: indice * 160, top: fila * 250 + 30 });
      capas.push({ input: Buffer.from(`<svg width="150" height="20"><text x="4" y="15" font-size="12">${indice}: ${foto.sha256.slice(0, 9)}</text></svg>`), left: indice * 160, top: fila * 250 + 230 });
    }
  }
  await sharp({ create: { width: 1300, height: 1500, channels: 3, background: '#eee' } }).composite(capas).toFile(path.join(salida, `hoja-${inicio}.png`));
}
console.log(JSON.stringify(grupos.map((g, i) => ({ i, nombre: g.nombre, fotos: g.imagenes.length })), null, 2));

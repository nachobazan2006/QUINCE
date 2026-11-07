import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raiz = path.resolve(web, '..');
const rutaManifiesto = path.join(raiz, 'docs/manifiesto-assets.json');
const leerJson = async (ruta) => JSON.parse((await fs.readFile(ruta, 'utf8')).replace(/^\uFEFF/, ''));
const seleccion = await leerJson(path.join(web, 'scripts/seleccion-assets.json'));
const calidad = 84;
const esfuerzo = 6;
const sha = (datos) => createHash('sha256').update(datos).digest('hex');
async function hashArchivo(ruta) {
  const hash = createHash('sha256');
  for await (const parte of createReadStream(ruta)) hash.update(parte);
  return hash.digest('hex');
}
const dentro = (base, ruta) => ruta.startsWith(`${base}${path.sep}`);
const nombres = new Set();
const ids = new Set();
for (const recurso of seleccion) {
  if (!/^[a-z0-9-]+$/.test(recurso.id) || ids.has(recurso.id)) throw Error('ID inválido/duplicado');
  if (!/^(portadas|categorias|productos|institucional)\/[a-z0-9-]+$/.test(recurso.nombre)
    || nombres.has(recurso.nombre)) throw Error('Nombre inválido/duplicado');
  if (path.basename(recurso.archivoZip) !== recurso.archivoZip) throw Error('ZIP fuera de raíz');
  if (recurso.estadoIdentificacion !== 'alto') throw Error('Selección no confirmada');
  if (!recurso.anchos.length || recurso.anchos.some(ancho => !Number.isInteger(ancho) || ancho < 1)) throw Error('Anchos inválidos');
  nombres.add(recurso.nombre); ids.add(recurso.id);
}
const archivos = [...new Set(seleccion.map(recurso => recurso.archivoZip))];
const hashesIniciales = {};
for (const archivo of archivos) hashesIniciales[archivo] = await hashArchivo(path.join(raiz, archivo));
let anterior;
try { anterior = await leerJson(rutaManifiesto); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const temporal = await fs.mkdtemp(path.join(os.tmpdir(), 'quince-originales-'));
let generadas = 0, reutilizadas = 0;
try {
  execFileSync('powershell.exe', ['-NoProfile', '-Command',
    'Invoke-Expression (Get-Content -Raw -Encoding UTF8 $env:QUINCE_EXTRACTOR)'], {
    env: { ...process.env, QUINCE_RAIZ: raiz, QUINCE_TEMP: temporal,
      QUINCE_SELECCION: path.join(web, 'scripts/seleccion-assets.json'),
      QUINCE_EXTRACTOR: path.join(web, 'scripts/extraer-originales.ps1') },
    stdio: 'inherit', windowsHide: true,
  });
  const recursos = [];
  for (const recurso of seleccion) {
    const original = await fs.readFile(path.join(temporal, `${recurso.id}.original`));
    const metadatos = await sharp(original).metadata();
    const clave = sha(JSON.stringify({ original: sha(original), anchos: recurso.anchos,
      calidad, esfuerzo, versiones: sharp.versions }));
    const previo = anterior?.recursos.find(item => item.id === recurso.id && item.clave === clave);
    const variantes = [];
    for (const ancho of [...new Set(recurso.anchos.map(valor => Math.min(valor, metadatos.width)))]) {
      const rutaPublica = `images/${recurso.nombre}-${ancho}.webp`;
      const destino = path.resolve(web, 'public', rutaPublica);
      if (!dentro(path.join(web, 'public/images'), destino)) throw Error('Destino inseguro');
      const variantePrevia = previo?.variantes.find(item => item.rutaPublica === rutaPublica);
      let existente;
      try { existente = await fs.readFile(destino); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (variantePrevia && existente && sha(existente) === variantePrevia.sha256) {
        variantes.push(variantePrevia); reutilizadas++; continue;
      }
      // No crop, rotation, filters or enlargement. Only proportional resizing and WebP encoding.
      const { data, info } = await sharp(original)
        .resize({ width: ancho, withoutEnlargement: true })
        .webp({ quality: calidad, effort: esfuerzo }).toBuffer({ resolveWithObject: true });
      await fs.mkdir(path.dirname(destino), { recursive: true });
      // Refuse to overwrite an unrelated file in public/.
      if (existente && !anterior?.recursos.some(item => item.variantes.some(v => v.rutaPublica === rutaPublica))) {
        throw Error(`Archivo ajeno al manifiesto: ${rutaPublica}`);
      }
      await fs.writeFile(destino, data);
      variantes.push({ rutaPublica, ancho: info.width, alto: info.height,
        formato: info.format, bytes: info.size, sha256: sha(data) });
      generadas++;
    }
    recursos.push({ id: recurso.id, rutaOriginal: `${recurso.archivoZip}::${recurso.rutaOriginal}`,
      tipo: recurso.nombre.split('/')[0], seccion: recurso.seccion,
      estadoIdentificacion: recurso.estadoIdentificacion, clave,
      original: { ancho: metadatos.width, alto: metadatos.height, formato: metadatos.format,
        bytes: original.length, sha256: sha(original) }, variantes });
  }
  for (const archivo of archivos) {
    if (await hashArchivo(path.join(raiz, archivo)) !== hashesIniciales[archivo]) throw Error('Cambió un ZIP original');
  }
  const bytesOriginales = recursos.reduce((total, r) => total + r.original.bytes, 0);
  const bytesOptimizados = recursos.reduce((total, r) => total + r.variantes.reduce((suma, v) => suma + v.bytes, 0), 0);
  const manifiesto = { version: 1, herramienta: { sharp: sharp.versions.sharp, calidad, esfuerzo },
    archivosOriginalesSha256: hashesIniciales,
    resumen: { seleccionadas: recursos.length, variantes: recursos.reduce((total, r) => total + r.variantes.length, 0),
      bytesOriginales, bytesOptimizados, reduccionPorcentaje: Number(((1 - bytesOptimizados / bytesOriginales) * 100).toFixed(2)) }, recursos };
  await fs.writeFile(rutaManifiesto, `${JSON.stringify(manifiesto, null, 2)}\n`);
  console.log(JSON.stringify({ ...manifiesto.resumen, generadas, reutilizadas }, null, 2));
} finally {
  // Remove only the unique temporary directory created by this execution.
  if (dentro(path.resolve(os.tmpdir()), path.resolve(temporal)) && path.basename(temporal).startsWith('quince-originales-')) {
    await fs.rm(temporal, { recursive: true, force: true });
  }
}

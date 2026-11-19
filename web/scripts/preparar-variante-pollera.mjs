import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const origen = process.argv[2];
if (!origen) throw new Error('Indicá la ruta del collage original.');

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const salida = path.join(web, 'public/images/productos');
const metadatos = await sharp(origen).metadata();
if (metadatos.width !== 1536 || metadatos.height !== 1024) {
  throw new Error(`El collage debe medir 1536 × 1024 px; mide ${metadatos.width} × ${metadatos.height} px.`);
}

const vistas = [
  { id: 'frente-levantada', x: 3 },
  { id: 'lateral', x: 516 },
  { id: 'frente', x: 1029 },
];

for (const vista of vistas) {
  for (const ancho of [480, 504]) {
    const destino = path.join(salida, `pollera-hockey-calza-blanca-${vista.id}-${ancho}.webp`);
    await sharp(origen)
      .extract({ left: vista.x, top: 3, width: 504, height: 1017 })
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 })
      .toFile(destino);
    console.log(path.basename(destino));
  }
}

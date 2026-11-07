import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const carpeta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/tipografia-conoce-quince');
const referencias = process.argv[2];
if (!referencias) throw Error('Indicá la carpeta temporal con Home.jpg y Home desktop.jpg.');
for (const [nombre, ancho, archivo, region] of [
  ['mobile', 393, 'Home.jpg', { left: 0, top: 760, width: 250, height: 80 }],
  ['desktop', 1440, 'Home desktop.jpg', { left: 500, top: 790, width: 440, height: 80 }],
]) {
  const foto = await sharp(path.join(referencias, archivo)).resize(ancho).png().toBuffer();
  const { data, info } = await sharp(foto).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let izquierda = info.width, derecha = 0, arriba = info.height, abajo = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const indice = (y * info.width + x) * info.channels;
      if (data[indice] < 40 && data[indice + 1] < 40 && data[indice + 2] < 40) {
        izquierda = Math.min(izquierda, x); derecha = Math.max(derecha, x);
        arriba = Math.min(arriba, y); abajo = Math.max(abajo, y);
      }
    }
  }
  const boton = await sharp(foto).extract({ left: region.left + izquierda, top: region.top + arriba,
    width: derecha - izquierda + 1, height: abajo - arriba + 1 }).png().toBuffer();
  await fs.writeFile(path.join(carpeta, `referencia-${nombre}.png`), boton);
  const capas = [];
  const opciones = [boton, path.join(carpeta, 'antes', `boton-${ancho}.png`), path.join(carpeta, 'despues', `boton-${ancho}.png`)];
  for (const [indice, opcion] of opciones.entries()) {
    const imagen = await sharp(opcion).resize({ width: (await sharp(opcion).metadata()).width * 3, kernel: 'lanczos3' }).png().toBuffer();
    capas.push({ input: imagen, left: 30, top: indice * 170 + 30 });
  }
  await sharp({ create: { width: 560, height: 510, channels: 3, background: '#e6e6e6' } }).composite(capas)
    .toFile(path.join(carpeta, `comparacion-${nombre}.png`));
  console.log(`${nombre}: referencia normalizada ${derecha - izquierda + 1} × ${abajo - arriba + 1}; filas referencia / Arial anterior / Poppins 400.`);
}

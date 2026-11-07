import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../docs/auditoria-final');
const referencias = process.argv[2];
const salida = path.join(raiz, 'comparaciones');
await fs.mkdir(salida, { recursive: true });
for (const fase of ['antes', 'despues']) {
  for (const ancho of [375, 1440]) {
    const nombres = (await fs.readdir(path.join(raiz, fase))).filter(nombre => nombre.endsWith(`-${ancho}.png`) && !nombre.startsWith('home-deporte'));
    for (let inicio = 0; inicio < nombres.length; inicio += 6) {
      const grupo = nombres.slice(inicio, inicio + 6);
      const capas = [];
      for (const [indice, nombre] of grupo.entries()) {
        const foto = await sharp(path.join(raiz, fase, nombre)).resize({ width: 300, height: 1100, fit: 'inside' }).png().toBuffer();
        const etiqueta = Buffer.from(`<svg width="300" height="30"><rect width="300" height="30" fill="white"/><text x="4" y="18" font-size="10">${nombre}</text></svg>`);
        capas.push({ input: foto, left: indice % 3 * 310, top: Math.floor(indice / 3) * 1140 + 30 },
          { input: etiqueta, left: indice % 3 * 310, top: Math.floor(indice / 3) * 1140 });
      }
      await sharp({ create: { width: 930, height: 2280, channels: 3, background: '#ddd' } }).composite(capas)
        .toFile(path.join(salida, `${fase}-${ancho}-hoja-${inicio / 6 + 1}.png`));
    }
  }
}
const pares = [
  ['home', 'mobile-Home.jpg', 'desktop-Home desktop.jpg'],
  ['deportes', 'mobile-Deportes.jpg', 'desktop-Home desktop-1.jpg'],
  ['deportes-rugby', 'mobile-Listado Rugby.jpg', 'desktop-Home desktop-2.jpg'],
  ['productos-camiseta-rugby-oldies', 'mobile-Detalle prenda.jpg', 'desktop-Camiseta Peak.jpg'],
  ['nosotros', 'mobile-Nosotros.jpg', null],
  ['menu', 'mobile-Menú.jpg', null],
];
for (const [nombre, mobile, desktop] of pares) {
  for (const ancho of nombre === 'menu' ? [375] : [375, 1440]) {
    const original = ancho === 375 ? mobile : desktop;
    const fuentes = [path.join(raiz, 'antes', `${nombre}-${ancho}.png`), path.join(raiz, 'despues', `${nombre}-${ancho}.png`)];
    if (original && referencias) fuentes.unshift(path.join(referencias, original));
    const fotos = await Promise.all(fuentes.map(async archivo => {
      const fuente = nombre === 'menu' ? await sharp(archivo).extract({ left: 0, top: 0, width: (await sharp(archivo).metadata()).width, height: Math.min(900, (await sharp(archivo).metadata()).height) }).toBuffer() : archivo;
      const foto = await sharp(fuente).resize(375).png().toBuffer();
      return { foto, alto: (await sharp(foto).metadata()).height };
    }));
    await sharp({ create: { width: fotos.length * 375, height: Math.max(...fotos.map(f => f.alto)), channels: 3, background: 'white' } })
      .composite(fotos.map((f, indice) => ({ input: f.foto, left: indice * 375, top: 0 })))
      .toFile(path.join(salida, `${nombre}-${ancho}.png`));
  }
}
console.log('Comparaciones generadas: referencia (cuando existe), antes y después; hojas por ruta y ancho.');

import sharp from 'sharp';
import fs from 'node:fs/promises';

// Se ejecuta desde web/. Copia PNG proporcional; no recorta ni modifica el original.
await fs.mkdir('public/images/logos', { recursive: true });
await sharp('../Logotipo Quince en blanco y negro.png')
  .resize({ width: 256, withoutEnlargement: true })
  .png()
  .toFile('public/images/logos/quince-provisional.png');

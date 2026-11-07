import { useState } from 'react';
import ImagenAdaptable from '../common/ImagenAdaptable.jsx';

export default function GaleriaProducto({ imagenes, nombre }) {
  const [indiceActivo, cambiarIndice] = useState(0);
  const [imagenFallida, cambiarImagenFallida] = useState(null);
  const variasImagenes = imagenes.length > 1;
  const imagen = imagenes[indiceActivo];
  function recorrerGaleria(paso) {
    cambiarIndice(indice => (indice + paso + imagenes.length) % imagenes.length);
  }
  function manejarTeclado(evento) {
    if (!variasImagenes || !['ArrowLeft', 'ArrowRight'].includes(evento.key)) return;
    evento.preventDefault();
    recorrerGaleria(evento.key === 'ArrowRight' ? 1 : -1);
  }
  return <section className={`galeria-producto ${variasImagenes ? 'galeria-multiple' : ''}`}
    aria-label={`Fotografías de ${nombre}`} onKeyDown={manejarTeclado}>
    {variasImagenes && <div className="miniaturas-producto" aria-label="Elegir fotografía">
      {imagenes.map((foto, indice) => <button key={foto.src} type="button"
        aria-label={`Ver imagen ${indice + 1}: ${foto.alt || nombre}`} aria-pressed={indice === indiceActivo}
        onClick={() => cambiarIndice(indice)}>
        <ImagenAdaptable imagen={foto} sizes="(min-width: 1024px) 11vw, 80px" />
      </button>)}
    </div>}
    <div className="foto-principal-producto">
      {!imagen || imagenFallida === imagen.src ? <p className="foto-detalle-pendiente" role="status">Fotografía no disponible.</p>
        : <div onError={() => cambiarImagenFallida(imagen.src)}>
          <ImagenAdaptable imagen={{ ...imagen, alt: imagen.alt || nombre }} prioritaria
            sizes="(min-width: 1680px) 592px, (min-width: 1024px) 37vw, (min-width: 600px) 568px, calc(100vw - 32px)" />
        </div>}
      {variasImagenes && <div className="controles-galeria">
        <button type="button" aria-label="Ver imagen anterior" onClick={() => recorrerGaleria(-1)}>‹</button>
        <button type="button" aria-label="Ver siguiente imagen" onClick={() => recorrerGaleria(1)}>›</button>
      </div>}
    </div>
    {variasImagenes && <p className="estado-galeria" role="status">Imagen {indiceActivo + 1} de {imagenes.length}</p>}
  </section>;
}

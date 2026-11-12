import { useEffect, useRef, useState } from 'react';
import ImagenAdaptable from '../common/ImagenAdaptable.jsx';

export default function GaleriaProducto({ imagenes, nombre }) {
  const [indiceActivo, cambiarIndice] = useState(0);
  const [imagenFallida, cambiarImagenFallida] = useState(null);
  const [zoomAbierto, cambiarZoomAbierto] = useState(false);
  const botonZoom = useRef(null);
  const botonCerrarZoom = useRef(null);
  const modalZoom = useRef(null);
  const variasImagenes = imagenes.length > 1;
  const imagen = imagenes[indiceActivo];
  function recorrerGaleria(paso) {
    cambiarIndice(indice => (indice + paso + imagenes.length) % imagenes.length);
  }
  function manejarTeclado(evento) {
    if (zoomAbierto) return;
    if (!variasImagenes || !['ArrowLeft', 'ArrowRight'].includes(evento.key)) return;
    evento.preventDefault();
    recorrerGaleria(evento.key === 'ArrowRight' ? 1 : -1);
  }
  useEffect(() => {
    if (!zoomAbierto) return;
    botonCerrarZoom.current?.focus();
    function cerrarConEscape(evento) {
      if (evento.key === 'Escape') cambiarZoomAbierto(false);
      if (evento.key === 'ArrowRight' && variasImagenes) recorrerGaleria(1);
      if (evento.key === 'ArrowLeft' && variasImagenes) recorrerGaleria(-1);
    }
    window.addEventListener('keydown', cerrarConEscape);
    return () => {
      window.removeEventListener('keydown', cerrarConEscape);
      botonZoom.current?.focus();
    };
  }, [zoomAbierto, variasImagenes, imagenes.length]);
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
        : <div className="envoltorio-foto-producto">
          <ImagenAdaptable imagen={{ ...imagen, alt: imagen.alt || nombre }} prioritaria onError={() => cambiarImagenFallida(imagen.src)}
            sizes="(min-width: 1680px) 592px, (min-width: 1024px) 37vw, (min-width: 600px) 568px, calc(100vw - 32px)" />
          <button ref={botonZoom} className="boton-zoom-producto" type="button" aria-label={`Ampliar imagen de ${nombre}`} onClick={() => cambiarZoomAbierto(true)}>
            <span aria-hidden="true">⌕</span>
          </button>
        </div>}
      {variasImagenes && <div className="controles-galeria">
        <button type="button" aria-label="Ver imagen anterior" onClick={() => recorrerGaleria(-1)}>‹</button>
        <button type="button" aria-label="Ver siguiente imagen" onClick={() => recorrerGaleria(1)}>›</button>
      </div>}
    </div>
    {zoomAbierto && <div ref={modalZoom} className="modal-zoom-producto" role="dialog" aria-modal="true" aria-label={`Imagen ampliada de ${nombre}`} onClick={evento => { if (evento.target === evento.currentTarget) cambiarZoomAbierto(false); }} onKeyDown={evento => {
      if (evento.key !== 'Tab') return;
      const botones = [...modalZoom.current.querySelectorAll('button')];
      const primero = botones[0];
      const ultimo = botones.at(-1);
      if (evento.shiftKey && document.activeElement === primero) { evento.preventDefault(); ultimo.focus(); }
      else if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero.focus(); }
    }}>
      <button ref={botonCerrarZoom} type="button" className="cerrar-zoom-producto" aria-label="Cerrar imagen ampliada" onClick={() => cambiarZoomAbierto(false)}>×</button>
      {variasImagenes && <div className="controles-galeria controles-zoom">
        <button type="button" aria-label="Ver imagen anterior" onClick={() => recorrerGaleria(-1)}>‹</button>
        <button type="button" aria-label="Ver siguiente imagen" onClick={() => recorrerGaleria(1)}>›</button>
      </div>}
      <ImagenAdaptable imagen={{ ...imagen, alt: imagen.alt || nombre }} sizes="100vw" />
    </div>}
  </section>;
}

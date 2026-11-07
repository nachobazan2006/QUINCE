import { useRef } from 'react';
import TarjetaProducto from '../productos/TarjetaProducto.jsx';
import { obtenerCategoriaPrincipal } from '../../services/catalogo.js';

export default function ProductosDestacados({ datos, categorias, productos, ids }) {
  const lista = useRef(null);
  function avanzar(direccion) {
    // avanzamos una tarjeta, sin duplicar productos ni armar un carrusel infinito
    const ancho = lista.current.firstElementChild?.getBoundingClientRect().width ?? 0;
    const separacion = Number.parseFloat(getComputedStyle(lista.current).columnGap) || 0;
    lista.current.scrollBy({ left: direccion * (ancho + separacion),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <section className="destacados-inicio" aria-labelledby={`titulo-${datos.id}`}>
    <h2 id={`titulo-${datos.id}`}>{datos.heading}</h2>
    <div className="tira-destacados" ref={lista} tabIndex={0} aria-label={datos.heading} onKeyDown={event => {
      if (event.target !== event.currentTarget || !['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault(); avanzar(event.key === 'ArrowRight' ? 1 : -1);
    }}>
      {ids.map(id => productos.find(producto => producto.id === id)).filter(Boolean).map(producto => (
        <TarjetaProducto key={producto.id} producto={producto} categoria={obtenerCategoriaPrincipal(producto, categorias)}
          className="tarjeta-destacado" sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 90vw" />
      ))}
    </div>
  </section>;
}

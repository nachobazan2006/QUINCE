import { useRef } from 'react';
import ImagenAdaptable from '../common/ImagenAdaptable.jsx';

export default function ProductosDestacados({ datos, categorias }) {
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
      {datos.items.map(item => <article className="tarjeta-destacado" key={item.id}>
        <ImagenAdaptable imagen={item.image} sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 90vw" />
        <h3>{item.name}</h3>
        <p>{categorias.find(categoria => categoria.id === item.categoryId)?.name}</p>
      </article>)}
    </div>
  </section>;
}

import { useId, useRef, useState } from 'react';
import ImagenAdaptable from '../common/ImagenAdaptable.jsx';
import EnlaceAccion from '../common/EnlaceAccion.jsx';

export default function PortadaInicio({ categorias, etiqueta = 'Colecciones', principal = false, indicadoresEnTodas = false }) {
  const [activa, setActiva] = useState(0);
  const tira = useRef(null);
  const id = useId();
  function irA(indice) {
    const elemento = tira.current;
    const destino = elemento.children[indice];
    if (!destino) return;
    setActiva(indice);
    // respetamos el movimiento reducido y dejamos el gesto táctil en manos del navegador
    elemento.scrollTo({ left: destino.offsetLeft - elemento.children[0].offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <section className="portada-inicio" aria-label={etiqueta}>
    <div className="tira-portadas" ref={tira} id={id} tabIndex={0} aria-label={etiqueta}
      onScroll={() => {
        const elemento = tira.current;
        const posiciones = [...elemento.children].map(hijo => Math.abs(hijo.offsetLeft - elemento.children[0].offsetLeft - elemento.scrollLeft));
        setActiva(posiciones.indexOf(Math.min(...posiciones)));
      }} onKeyDown={event => {
        if (event.target !== event.currentTarget || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        irA(event.key === 'Home' ? 0 : event.key === 'End' ? categorias.length - 1
          : Math.max(0, Math.min(categorias.length - 1, activa + (event.key === 'ArrowRight' ? 1 : -1))));
      }}>
      {categorias.map((categoria, indice) => <article className="categoria-portada" key={categoria.id}>
        <ImagenAdaptable imagen={categoria.image} prioritaria={principal && indice === 0}
          sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 90vw" />
        <div className="texto-portada">
          <h2>{categoria.name}</h2>
          {categoria.subtitle && <p>{categoria.subtitle}</p>}
          <EnlaceAccion accion={categoria.action} className="accion-portada" />
        </div>
        {(indice === 0 || indicadoresEnTodas) && <div className="indicadores-escritorio" aria-hidden="true">
          {categorias.map((item, posicion) => <span className={posicion === 0 ? 'actual' : ''} key={item.id} />)}
        </div>}
      </article>)}
    </div>
    <div className="indicadores-portada" role="group" aria-label="Cambiar categoría">
      {categorias.map((categoria, indice) => <button key={categoria.id} type="button"
        aria-label={`Ver ${categoria.name}`} aria-current={activa === indice ? 'true' : undefined}
        aria-controls={id} onClick={() => irA(indice)}><span /></button>)}
    </div>
  </section>;
}

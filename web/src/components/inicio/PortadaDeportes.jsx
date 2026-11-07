import { useEffect, useRef, useState } from 'react';
import ImagenAdaptable from '../common/ImagenAdaptable.jsx';
import EnlaceAccion from '../common/EnlaceAccion.jsx';

export default function PortadaDeportes({ categoria, disciplinas, intervalo }) {
  const fotos = [categoria, ...disciplinas];
  const [activa, cambiarActiva] = useState(0);
  const [cargadas, cambiarCargadas] = useState([0]);
  const [conMouse, cambiarMouse] = useState(false);
  const [conFoco, cambiarFoco] = useState(false);
  const [movimientoReducido, cambiarMovimientoReducido] = useState(true);
  const [enPantalla, cambiarEnPantalla] = useState(false);
  const [pestanaVisible, cambiarPestanaVisible] = useState(!document.hidden);
  const tarjeta = useRef(null);

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)');
    const actualizarMovimiento = () => cambiarMovimientoReducido(consulta.matches);
    const actualizarVisibilidad = () => cambiarPestanaVisible(!document.hidden);
    actualizarMovimiento();
    consulta.addEventListener('change', actualizarMovimiento);
    document.addEventListener('visibilitychange', actualizarVisibilidad);
    const observador = new IntersectionObserver(([entrada]) => cambiarEnPantalla(entrada.intersectionRatio >= 0.35), { threshold: 0.35 });
    observador.observe(tarjeta.current);
    return () => {
      consulta.removeEventListener('change', actualizarMovimiento);
      document.removeEventListener('visibilitychange', actualizarVisibilidad);
      observador.disconnect();
    };
  }, []);

  function elegirFoto(indice) {
    cambiarCargadas(anteriores => anteriores.includes(indice) ? anteriores : [...anteriores, indice]);
    cambiarActiva(indice);
  }

  useEffect(() => {
    if (conMouse || conFoco || movimientoReducido || !enPantalla || !pestanaVisible || fotos.length < 2) return;
    // reiniciamos la espera al elegir una foto, sin descargar de entrada toda la secuencia
    const temporizador = window.setTimeout(() => {
      const siguiente = (activa + 1) % fotos.length;
      cambiarCargadas(anteriores => anteriores.includes(siguiente) ? anteriores : [...anteriores, siguiente]);
      cambiarActiva(siguiente);
    }, intervalo);
    return () => window.clearTimeout(temporizador);
  }, [activa, intervalo, conMouse, conFoco, movimientoReducido, enPantalla, pestanaVisible, fotos.length]);

  return <article className="categoria-portada portada-deportes-rotativa" ref={tarjeta}
    aria-label="Deportes" aria-roledescription="carrusel"
    onMouseEnter={() => cambiarMouse(true)} onMouseLeave={() => cambiarMouse(false)}
    onFocus={() => cambiarFoco(true)} onBlur={evento => {
      if (!evento.currentTarget.contains(evento.relatedTarget)) cambiarFoco(false);
    }}>
    <div className="ventana-deportes">
      <div className="fotos-deportes" style={{ transform: `translateX(-${activa * 100}%)` }}>
        {fotos.map((foto, indice) => <div className="foto-deporte" key={foto.id} aria-hidden={indice !== activa}>
          {cargadas.includes(indice) && <ImagenAdaptable imagen={foto.image} prioritaria={indice === 0}
            sizes="(min-width: 1024px) 25vw, (min-width: 600px) 50vw, 90vw" />}
        </div>)}
      </div>
    </div>
    <div className="texto-portada">
      <h2>{categoria.name}</h2>
      {categoria.subtitle && <p>{categoria.subtitle}</p>}
      <EnlaceAccion accion={categoria.action} className="accion-portada" />
    </div>
    <div className="indicadores-rotacion" role="group" aria-label="Elegir fotografía de Deportes">
      {fotos.map((foto, indice) => <button type="button" key={foto.id} aria-label={`Mostrar ${foto.name}`}
        aria-pressed={activa === indice} onClick={() => elegirFoto(indice)}><span /></button>)}
    </div>
  </article>;
}

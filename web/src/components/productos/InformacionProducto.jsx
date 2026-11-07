import { resourceUrl } from '../../services/data.js';

export default function InformacionProducto({ producto, categoria }) {
  const guia = typeof producto.sizeGuide === 'string' ? producto.sizeGuide.trim() : '';
  const guiaValida = guia && !guia.includes('#') && (/^https?:\/\//i.test(guia) || /^(?![a-z]+:|\/\/)[^\s]+$/i.test(guia));
  const caracteristicas = producto.characteristics || [];
  const tieneDescripcion = Boolean(producto.description || caracteristicas.length);
  return <div className="informacion-producto">
    <h1>{producto.name}</h1>
    <p className="categoria-detalle">{categoria?.name}</p>
    {(guiaValida || tieneDescripcion) && <hr />}
    {guiaValida && <div className="guia-talles">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="2" y="7" width="20" height="10" rx="1" />
        <path d="M6 7v5m4-5v3m4-3v5m4-5v3" />
      </svg>{' '}
      <a href={/^https?:\/\//i.test(guia) ? guia : resourceUrl(guia)}>Guía de talles</a>
    </div>}
    {tieneDescripcion && <section className="descripcion-producto" aria-labelledby="titulo-descripcion">
      <h2 id="titulo-descripcion"><span className="titulo-desktop">Descripción</span><span className="titulo-mobile">Características</span></h2>
      {producto.description && <p>{producto.description}</p>}
      {caracteristicas.length > 0 && <ul>{caracteristicas.map((texto, indice) => <li key={indice}>{texto}</li>)}</ul>}
    </section>}
  </div>;
}

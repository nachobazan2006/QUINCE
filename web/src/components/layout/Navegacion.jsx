import { useId, useState } from 'react';
import { NavLink, useMatch } from 'react-router';

function ElementoNavegacion({ item, onNavigate }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const hijos = item.children ?? [];
  const coincidencia = useMatch({ path: item.href ?? '/', end: false });
  const categoriaActiva = item.href && coincidencia !== null;
  const navegar = () => {
    setAbierto(false); onNavigate?.();
  };
  return <li className={`elemento-navegacion${item.id === 'sports' ? ' menu-productos' : ''}`}
    onMouseEnter={() => { if (item.id === 'sports' && window.matchMedia('(min-width: 1024px)').matches) setAbierto(true); }}
    onMouseLeave={() => { if (item.id === 'sports' && window.matchMedia('(min-width: 1024px)').matches) setAbierto(false); }}
    onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape' && abierto) {
      event.preventDefault(); event.stopPropagation(); setAbierto(false);
      event.currentTarget.querySelector('.abrir-submenu').focus();
    }
  }}>
    <div className="fila-navegacion">
      {hijos.length > 0 ? <button type="button"
        className={`abrir-submenu${categoriaActiva ? ' categoria-activa' : ''}`} aria-expanded={abierto}
        aria-controls={id} onClick={() => setAbierto(!abierto)}>
        <span className="etiqueta-submenu">{item.label}</span>
        <span className="icono-submenu" aria-hidden="true">⌄</span>
      </button> : item.href ? <NavLink to={item.href} end onClick={navegar}>{item.label}</NavLink>
        : <span aria-disabled="true" className="enlace-pendiente">{item.label}</span>}
    </div>
    {hijos.length > 0 && <ul id={id} className="subcategorias" hidden={!abierto}>
      {item.href && <li className="elemento-navegacion"><div className="fila-navegacion">
        <NavLink to={item.href} end onClick={navegar}>Ver {item.label}</NavLink>
      </div></li>}
      {hijos.map(hijo => <ElementoNavegacion key={hijo.id} item={hijo} onNavigate={onNavigate} />)}
    </ul>}
  </li>;
}

export default function Navegacion({ items, onNavigate, etiqueta = 'Principal' }) {
  return <nav aria-label={etiqueta}><ul className="lista-navegacion">
    {items.map(item => <ElementoNavegacion key={item.id} item={item} onNavigate={onNavigate} />)}
  </ul></nav>;
}

import { useId, useState } from 'react';
import { NavLink } from 'react-router';

function ElementoNavegacion({ item, onNavigate }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const hijos = item.children ?? [];
  return <li className="elemento-navegacion" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape' && abierto) {
      event.stopPropagation(); setAbierto(false);
      event.currentTarget.querySelector('.abrir-submenu').focus();
    }
  }}>
    <div className="fila-navegacion">
      {item.href ? <NavLink to={item.href} end={hijos.length === 0} onClick={() => {
        setAbierto(false); onNavigate?.();
      }}>{item.label}</NavLink> : <span aria-disabled="true" className="enlace-pendiente"
        title="Destino pendiente de confirmación">{item.label}</span>}
      {hijos.length > 0 && <button type="button" className="abrir-submenu" aria-expanded={abierto}
        aria-controls={id} aria-label={`Subcategorías de ${item.label}`} onClick={() => setAbierto(!abierto)}>
        <span aria-hidden="true">⌄</span>
      </button>}
    </div>
    {hijos.length > 0 && <ul id={id} className="subcategorias" hidden={!abierto}>
      {hijos.map(hijo => <ElementoNavegacion key={hijo.id} item={hijo} onNavigate={onNavigate} />)}
    </ul>}
  </li>;
}

export default function Navegacion({ items, onNavigate, etiqueta = 'Principal' }) {
  return <nav aria-label={etiqueta}><ul className="lista-navegacion">
    {items.map(item => <ElementoNavegacion key={item.id} item={item} onNavigate={onNavigate} />)}
  </ul></nav>;
}
